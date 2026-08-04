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
  const user = (req as any).user;
  try {
    let whereClause: any = {};
    if (user.role.name !== "ADMIN") {
      if (user.teamId) {
        const teamUsers = await prisma.user.findMany({ where: { teamId: user.teamId }, select: { id: true } });
        const teamUserIds = teamUsers.map((u: any) => u.id);
        whereClause = {
          OR: [
            { assignedManagerId: { in: teamUserIds } },
            { createdById: { in: teamUserIds } }
          ]
        };
      } else {
        whereClause = {
          OR: [
            { assignedManagerId: user.id },
            { createdById: user.id }
          ]
        };
      }
    }

    const candidates = await prisma.candidateProfile.findMany({
      where: whereClause,
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
        status: c.status,
        assignedManagerId: c.assignedManagerId,
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

    const user = (req as any).user;
    const [semanticCandidates, parsedQuery] = await Promise.all([
      aiSearchProvider.semanticSearch(jobDescription, limit, minExperience, maxExperience, user.role.name === "ADMIN" ? null : user.organizationId),
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

    const user = (req as any).user;
    if (user.role.name !== "ADMIN" && user.organizationId) {
      form.append("organizationId", user.organizationId);
    }

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

  const user = (req as any).user;

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }

    if (user.role.name !== "ADMIN") {
      let isSameTeam = false;
      if (user.teamId) {
        if (candidate.createdById) {
          const creator = await prisma.user.findUnique({ where: { id: candidate.createdById } });
          if (creator?.teamId === user.teamId) isSameTeam = true;
        }
        if (candidate.assignedManagerId) {
          const manager = await prisma.user.findUnique({ where: { id: candidate.assignedManagerId } });
          if (manager?.teamId === user.teamId) isSameTeam = true;
        }
      }
      
      if (candidate.createdById !== user.id && candidate.assignedManagerId !== user.id && !isSameTeam) {
        return res.status(403).json({ success: false, error: "Forbidden: You do not own this candidate" });
      }
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

  const user = (req as any).user;

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!candidate || !candidate.document) {
      return res.status(404).json({ error: "Resume not found" });
    }

    if (user.role.name !== "ADMIN") {
      let isSameTeam = false;
      if (user.teamId) {
        if (candidate.createdById) {
          const creator = await prisma.user.findUnique({ where: { id: candidate.createdById } });
          if (creator?.teamId === user.teamId) isSameTeam = true;
        }
        if (candidate.assignedManagerId) {
          const manager = await prisma.user.findUnique({ where: { id: candidate.assignedManagerId } });
          if (manager?.teamId === user.teamId) isSameTeam = true;
        }
      }
      
      if (candidate.createdById !== user.id && candidate.assignedManagerId !== user.id && !isSameTeam) {
        return res.status(403).json({ error: "Forbidden: You do not own this candidate" });
      }
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

/* ── PATCH /candidates/:id/assign ────────────────────────── */
export async function assignCandidate(req: Request, res: Response) {
  const { id } = req.params;
  const { managerId } = req.body;
  const user = (req as any).user;

  if (!managerId) {
    return res.status(400).json({ success: false, error: "managerId is required" });
  }

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }

    if (user.role.name !== "ADMIN") {
      let isSameTeam = false;
      if (user.teamId) {
        if (candidate.createdById) {
          const creator = await prisma.user.findUnique({ where: { id: candidate.createdById } });
          if (creator?.teamId === user.teamId) isSameTeam = true;
        }
        if (candidate.assignedManagerId) {
          const manager = await prisma.user.findUnique({ where: { id: candidate.assignedManagerId } });
          if (manager?.teamId === user.teamId) isSameTeam = true;
        }
      }
      
      if (candidate.createdById !== user.id && candidate.assignedManagerId !== user.id && !isSameTeam) {
        return res.status(403).json({ success: false, error: "Forbidden: You do not own this candidate" });
      }
    }

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      return res.status(404).json({ success: false, error: "Manager not found" });
    }

    if (user.role.name !== "ADMIN" && manager.organizationId !== user.organizationId) {
      return res.status(403).json({ success: false, error: "Forbidden: Manager belongs to another organization" });
    }

    const updated = await prisma.candidateProfile.update({
      where: { id },
      data: { assignedManagerId: managerId },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Assign candidate failed:", error.message);
    return res.status(500).json({ success: false, error: "Failed to assign candidate" });
  }
}

/* ── PATCH /candidates/:id/status ────────────────────────── */
const VALID_STATUSES = ["NEW", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "HIRED"];

export async function updateCandidateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  const user = (req as any).user;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id },
    });

    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }

    if (user.role.name !== "ADMIN") {
      let isSameTeam = false;
      if (user.teamId) {
        if (candidate.createdById) {
          const creator = await prisma.user.findUnique({ where: { id: candidate.createdById } });
          if (creator?.teamId === user.teamId) isSameTeam = true;
        }
        if (candidate.assignedManagerId) {
          const manager = await prisma.user.findUnique({ where: { id: candidate.assignedManagerId } });
          if (manager?.teamId === user.teamId) isSameTeam = true;
        }
      }
      
      if (candidate.createdById !== user.id && candidate.assignedManagerId !== user.id && !isSameTeam) {
        return res.status(403).json({ success: false, error: "Forbidden: You do not own this candidate" });
      }
    }

    const updated = await prisma.candidateProfile.update({
      where: { id },
      data: { status: status as any },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Update candidate status failed:", error.message);
    return res.status(500).json({ success: false, error: "Failed to update candidate status" });
  }
}
