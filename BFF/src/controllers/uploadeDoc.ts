import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";

import { prisma } from "../config/prisma.js";
import { minio } from "../config/minio.js";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function uploadResume(
  req: Request,
  res: Response
) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: "Resume file is required",
    });
  }

  const bucket =
    process.env.MINIO_BUCKET || "ats-resumes";

  const ext = file.originalname.substring(
    file.originalname.lastIndexOf(".")
  );

  const objectKey =
    `resumes/${crypto.randomUUID()}${ext}`;

  let documentId: string | null = null;

  try {
    // 1. Upload resume to MinIO
    await minio.putObject(
      bucket,
      objectKey,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    // 2. Store document metadata
    const document =
      await prisma.resumeDocument.create({
        data: {
          bucket,
          objectKey,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          status: "PROCESSING",
        },
      });

    documentId = document.id;

    // 3. Profile resume
    const profileResponse = await axios.post(
      `${AI_SERVICE_URL}/parse-resume`,
      {
        objectKey,
      }
    );

    const profileResult = profileResponse.data as {
      success: boolean;
      profile: any;
      rawText: string;
    };

    // 4. Detect duplicate candidate by name + email
    const candidateName =
      profileResult.profile?.candidate?.name?.trim() || null;
    const candidateEmail =
      profileResult.profile?.candidate?.email?.trim() || null;

    let existingCandidate = null;

    if (candidateName) {
      // Search by name match in the JSON profile
      const matches = await prisma.candidateProfile.findMany({
        where: {
          profile: {
            path: ["candidate", "name"],
            equals: candidateName,
          },
        },
      });

      // If email is available, prefer an exact name+email match
      if (matches.length > 0 && candidateEmail) {
        existingCandidate =
          matches.find((m: any) => {
            const email =
              (m.profile as any)?.candidate?.email?.trim();
            return email === candidateEmail;
          }) || matches[0];
      } else if (matches.length > 0) {
        existingCandidate = matches[0];
      }
    }

    let candidate;
    let isUpdate = false;

    if (existingCandidate) {
      // Update existing candidate profile
      const oldDocumentId = existingCandidate.documentId;

      // Fetch old document to delete from MinIO later
      const oldDocument = await prisma.resumeDocument.findUnique({
        where: { id: oldDocumentId },
      });

      candidate =
        await prisma.candidateProfile.update({
          where: { id: existingCandidate.id },
          data: {
            documentId: document.id,
            profile: profileResult.profile,
            rawText: profileResult.rawText,
            version: { increment: 1 },
          },
        });

      // Delete the old document from MinIO and Postgres
      if (oldDocument) {
        try {
          await minio.removeObject(oldDocument.bucket, oldDocument.objectKey);
        } catch (err: any) {
          console.warn(
            "MinIO delete failed for old document (continuing):",
            err.message
          );
        }

        await prisma.resumeDocument.delete({
          where: { id: oldDocumentId },
        });
      }

      isUpdate = true;
    } else {
      // Create new candidate profile
      candidate =
        await prisma.candidateProfile.create({
          data: {
            documentId: document.id,
            profile: profileResult.profile,
            rawText: profileResult.rawText,
          },
        });
    }

    // 5. Build embedding and store in Qdrant
    //    (upserts by candidateId, so updates work automatically)
    await axios.post(
      `${AI_SERVICE_URL}/build-candidate-index`,
      {
        candidateId: candidate.id,
        profile: profileResult.profile,
      }
    );

    // 6. Mark pipeline complete
    await prisma.resumeDocument.update({
      where: {
        id: document.id,
      },
      data: {
        status: "PARSED",
      },
    });

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      documentId: document.id,
      candidateId: candidate.id,
      status: "PARSED",
      indexed: true,
      updated: isUpdate,
    });
  } catch (error: any) {
    if (documentId) {
      await prisma.resumeDocument.update({
        where: {
          id: documentId,
        },
        data: {
          status: "FAILED",
        },
      });
    }

    console.error(
      "Resume pipeline failed:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message,
    });
  }
}