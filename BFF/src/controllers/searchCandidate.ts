import { Request, Response } from "express";
import { AISearchProvider } from "../providers/ai-search.provider.js";
import { CandidateProfileRepository } from "../repositories/candidate-profile.repository.js";
import { RankingEngine } from "../ranking/ranking-engine.js";

const aiSearchProvider = new AISearchProvider();
const candidateProfileRepository = new CandidateProfileRepository();
const rankingEngine = new RankingEngine();

export async function searchCandidates(
  req: Request,
  res: Response
) {
  try {
    const { jobDescription, limit = 10 } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: "jobDescription is required",
      });
    }

    const semanticCandidates = await aiSearchProvider.semanticSearch(jobDescription, limit);
    
    if (semanticCandidates.length === 0) {
      return res.status(200).json({ success: true, count: 0, candidates: [] });
    }

    const parsedQuery = await aiSearchProvider.parseJobDescription(jobDescription);
    parsedQuery.raw = jobDescription; // Add the raw text for highlighting if needed

    const profiles = await candidateProfileRepository.getProfiles(semanticCandidates);
    const rankedCandidates = rankingEngine.rank(semanticCandidates, profiles, parsedQuery);

    return res.status(200).json({ success: true, count: rankedCandidates.length, candidates: rankedCandidates });
  } catch (error: any) {
    console.error(
      "Candidate search failed:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: "Candidate search failed",
    });
  }
}