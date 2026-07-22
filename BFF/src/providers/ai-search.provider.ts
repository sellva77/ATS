import axios from "axios";
import { CandidateSearchProvider, SemanticCandidate } from "../types/ranking.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export class AISearchProvider implements CandidateSearchProvider {
  public async semanticSearch(query: string, limit: number = 10, minExperience?: number, maxExperience?: number): Promise<SemanticCandidate[]> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/search-candidates`,
        {
          jobDescription: query,
          limit,
          minExperience,
          maxExperience,
        }
      );
      
      return response.data.candidates || [];
    } catch (error: any) {
      console.error("AI Search Provider error:", error.response?.data || error.message);
      throw new Error("Failed to perform semantic search");
    }
  }
  
  public async parseJobDescription(query: string): Promise<any> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/parse-job-description`,
        {
          jobDescription: query
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error("AI Parse JD error:", error.response?.data || error.message);
      throw new Error("Failed to parse job description");
    }
  }
}
