import { Request, Response } from "express";

import { prisma } from "../config/prisma.js";

export async function listCandidates(
  req: Request,
  res: Response
) {
  try {
    const candidates =
      await prisma.candidateProfile.findMany({
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
      candidates: candidates.map((c) => ({
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
    console.error(
      "List candidates failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve candidates",
    });
  }
}
