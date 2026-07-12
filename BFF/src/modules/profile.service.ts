import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

if (!AI_SERVICE_URL) {
  throw new Error("AI_SERVICE_URL is not configured");
}


type AIProfileResponse = {
  success: boolean;
  profile: Prisma.InputJsonValue;
  rawText: string;
};

export async function profileResume(
  documentId: string,
  objectKey: string
) {
  await prisma.resumeDocument.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  try {
    
const response = await fetch(
  `${AI_SERVICE_URL}/parse-resume`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      objectKey,
    }),
  }
);
    if (!response.ok) {
      throw new Error(
        `AI service failed with status ${response.status}`
      );
    }

    const result = (await response.json()) as AIProfileResponse;

    const candidateProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.candidateProfile.upsert({
        where: {
          documentId,
        },
        create: {
          documentId,
          profile: result.profile,
          rawText: result.rawText,
        },
        update: {
          profile: result.profile,
          rawText: result.rawText,
          version: {
            increment: 1,
          },
        },
      });

      await tx.resumeDocument.update({
        where: {
          id: documentId,
        },
        data: {
          status: "PARSED",
        },
      });

      return profile;
    });

    return candidateProfile;
  } catch (error) {
    await prisma.resumeDocument.update({
      where: {
        id: documentId,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
}