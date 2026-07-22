import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { CandidateProfileRepository } from "../repositories/candidate-profile.repository.js";
import { RankingEngine } from "../ranking/ranking-engine.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const candidateProfileRepository = new CandidateProfileRepository();
const rankingEngine = new RankingEngine();

export async function searchByResume(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "A PDF file is required",
      });
    }

    const limit = Number(req.body.limit) || 10;
    const minExperience = req.body.minExperience
      ? Number(req.body.minExperience)
      : undefined;
    const maxExperience = req.body.maxExperience
      ? Number(req.body.maxExperience)
      : undefined;

    // Forward the PDF to the AI service
    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    form.append("limit", String(limit));
    if (minExperience !== undefined) {
      form.append("minExperience", String(minExperience));
    }
    if (maxExperience !== undefined) {
      form.append("maxExperience", String(maxExperience));
    }

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/search-by-resume`,
      form,
      { headers: form.getHeaders() }
    );

    const semanticCandidates = aiResponse.data.candidates || [];

    if (semanticCandidates.length === 0) {
      return res
        .status(200)
        .json({ success: true, count: 0, candidates: [] });
    }

    const profiles =
      await candidateProfileRepository.getProfiles(semanticCandidates);

    // Build a minimal parsed query from the resume context for ranking
    const parsedQuery = {
      title: null,
      domain: null,
      skills: [] as string[],
      raw: "",
    };

    const rankedCandidates = rankingEngine.rank(
      semanticCandidates,
      profiles,
      parsedQuery
    );

    return res.status(200).json({
      success: true,
      count: rankedCandidates.length,
      candidates: rankedCandidates,
    });
  } catch (error: any) {
    console.error(
      "Resume search failed:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: "Resume search failed",
    });
  }
}
