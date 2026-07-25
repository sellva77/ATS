import { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { AISearchProvider } from "../providers/ai-search.provider.js";
import { CandidateProfileRepository } from "../repositories/candidate-profile.repository.js";
import { RankingEngine } from "../ranking/ranking-engine.js";
import { minio } from "../config/minio.js";
import axios from "axios";

const aiSearchProvider = new AISearchProvider();
const candidateProfileRepository = new CandidateProfileRepository();
const rankingEngine = new RankingEngine();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/* ── GET /candidates ─────────────────────────────────────── */
export async function listCandidates(req: Request, res: Response) {
  try {
    const candidates = await prisma.candidateProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: {
            originalName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates: candidates.map((c: any) => ({
        id: c.id,
        documentId: c.documentId,
        profile: c.profile,
        version: c.version,
        totalExperienceYears: c.totalExperienceYears,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        document: {
          originalName: c.document.originalName,
          status: c.document.status,
          uploadedAt: c.document.createdAt,
        },
      })),
    });
  } catch (error: any) {
    console.error("List candidates failed:", error.message);
    return res.status(500).json({ success: false, error: "Failed to retrieve candidates" });
  }
}

/* ── POST /search-candidates ─────────────────────────────── */
export async function searchCandidates(req: Request, res: Response) {
  try {
    const { jobDescription, limit = 10, minExperience, maxExperience } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, error: "jobDescription is required" });
    }

    const [semanticCandidates, parsedQuery] = await Promise.all([
      aiSearchProvider.semanticSearch(jobDescription, limit, minExperience, maxExperience),
      aiSearchProvider.parseJobDescription(jobDescription),
    ]);

    if (semanticCandidates.length === 0) {
      return res.status(200).json({ success: true, count: 0, candidates: [] });
    }

    const profiles = await candidateProfileRepository.getProfiles(semanticCandidates);
    const rankedCandidates = rankingEngine.rank(semanticCandidates, profiles, parsedQuery);

    return res.status(200).json({ success: true, count: rankedCandidates.length, candidates: rankedCandidates });
  } catch (error: any) {
    console.error("Candidate search failed:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "Candidate search failed" });
  }
}

/* ── POST /search-by-resume ──────────────────────────────── */
import FormData from "form-data";

export async function searchByResume(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: "A PDF file is required" });
    }

    const limit = Number(req.body.limit) || 10;
    const minExperience = req.body.minExperience ? Number(req.body.minExperience) : undefined;
    const maxExperience = req.body.maxExperience ? Number(req.body.maxExperience) : undefined;

    const form = new FormData();
    form.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
    form.append("limit", String(limit));
    if (minExperience !== undefined) form.append("minExperience", String(minExperience));
    if (maxExperience !== undefined) form.append("maxExperience", String(maxExperience));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/search-by-resume`, form, {
      headers: form.getHeaders(),
    });

    const semanticCandidates = aiResponse.data.candidates || [];

    if (semanticCandidates.length === 0) {
      return res.status(200).json({ success: true, count: 0, candidates: [] });
    }

    const profiles = await candidateProfileRepository.getProfiles(semanticCandidates);
    const parsedQuery = { jobTitle: null, domain: null, requiredSkills: [] as string[], preferredSkills: [] as string[], raw: "" };
    const rankedCandidates = rankingEngine.rank(semanticCandidates, profiles, parsedQuery);

    return res.status(200).json({ success: true, count: rankedCandidates.length, candidates: rankedCandidates });
  } catch (error: any) {
    console.error("Resume search failed:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "Resume search failed" });
  }
}

/* ── DELETE /candidates/:id ──────────────────────────────── */
export async function deleteCandidate(req: Request, res: Response) {
  const id = req.params.id as string;

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }

    const externalTasks: Promise<any>[] = [];
    externalTasks.push(axios.delete(`${AI_SERVICE_URL}/delete-candidate-index/${id}`));

    if (candidate.document) {
      externalTasks.push(minio.removeObject(candidate.document.bucket, candidate.document.objectKey));
    }

    await Promise.all(externalTasks);

    await prisma.$transaction([
      prisma.candidateProfile.delete({ where: { id } }),
      prisma.resumeDocument.delete({ where: { id: candidate.documentId } }),
    ]);

    return res.status(200).json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete candidate failed:", error.message);
    return res.status(500).json({ success: false, error: "Failed to delete candidate" });
  }
}

/* ── GET /candidates/:id/resume ──────────────────────────── */
export async function downloadResume(req: Request, res: Response) {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) {
    return res.status(400).json({ error: "Invalid resume id" });
  }

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!candidate || !candidate.document) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const { bucket, objectKey, originalName, mimeType } = candidate.document;
    const stream = await minio.getObject(bucket, objectKey);

    const isDownload = req.query.download === "true";
    const disposition = isDownload ? "attachment" : "inline";

    res.setHeader("Content-Disposition", `${disposition}; filename="${originalName}"`);
    res.setHeader("Content-Type", mimeType);

    stream.pipe(res);
  } catch (error: any) {
    console.error("Failed to download resume:", error.message);
    res.status(500).json({ error: "Failed to download resume" });
  }
}
