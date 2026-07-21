import { Request, Response } from "express";
import axios from "axios";

import { prisma } from "../config/prisma.js";
import { minio } from "../config/minio.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function deleteCandidate(
  req: Request,
  res: Response
) {
  const id = req.params.id as string;

  try {
    // 1. Check candidate exists
    const candidate =
      await prisma.candidateProfile.findUnique({
        where: { id },
        include: { document: true },
      });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    // 2. Delete from external services concurrently (Qdrant & MinIO)
    // If any of these fail, it throws and aborts the DB deletion to keep everything in sync
    const externalTasks: Promise<any>[] = [];

    externalTasks.push(
      axios.delete(`${AI_SERVICE_URL}/delete-candidate-index/${id}`)
    );

    if (candidate.document) {
      externalTasks.push(
        minio.removeObject(
          candidate.document.bucket,
          candidate.document.objectKey
        )
      );
    }

    await Promise.all(externalTasks);

    // 3. Delete from Postgres in a transaction
    await prisma.$transaction([
      prisma.candidateProfile.delete({ where: { id } }),
      prisma.resumeDocument.delete({ where: { id: candidate.documentId } }),
    ]);

    return res.status(200).json({
      success: true,
      deletedId: id,
    });
  } catch (error: any) {
    console.error(
      "Delete candidate failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      error: "Failed to delete candidate",
    });
  }
}
