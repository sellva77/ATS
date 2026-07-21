import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { minio } from "../config/minio.js";

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
    
    // Use inline to display in browser if possible, or attachment to force download
    res.setHeader("Content-Disposition", `${disposition}; filename="${originalName}"`);
    res.setHeader("Content-Type", mimeType);
    
    stream.pipe(res);
  } catch (error: any) {
    console.error("Failed to download resume:", error.message);
    res.status(500).json({ error: "Failed to download resume" });
  }
}
