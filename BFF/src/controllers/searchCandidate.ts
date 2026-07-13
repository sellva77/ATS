import { Request, Response } from "express";
import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

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

    const response = await axios.post(
      `${AI_SERVICE_URL}/search-candidates`,
      {
        jobDescription,
        limit,
      }
    );

    return res.status(200).json(response.data);
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