import crypto from "crypto";
import { prisma } from "../../config/prisma.js";
import { minio } from "../../config/minio.js";

export async function uploadResume(file: Express.Multer.File) {
  const bucket = process.env.MINIO_BUCKET || "ats-resumes";
  const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
  const objectKey = `resumes/${crypto.randomUUID()}${ext}`;

  // Upload to MinIO
  await minio.putObject(bucket, objectKey, file.buffer, file.size, {
    "Content-Type": file.mimetype,
  });

  try {
    // Save metadata to PostgreSQL
    const document = await prisma.resumeDocument.create({
      data: {
        bucket,
        objectKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        status: "UPLOADED",
      },
    });

    return document;
  } catch (error) {
    // Clean up MinIO if database insert fails
    console.error("DB insert failed, cleaning up MinIO object:", objectKey);
    await minio.removeObject(bucket, objectKey).catch(console.error);
    throw error;
  }
}

