import { Request, Response } from "express";
import * as documentService from "./document.service.js";

export async function uploadResume(
  req: Request,
  res: Response
): Promise<any> {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    });
  }

  try {
    const document = await documentService.uploadResume(req.file);

    console.log(`Successfully uploaded document: ${document.originalName} (ID: ${document.id})`);

    return res.status(201).json({
      success: true,
      data: {
        ...document,
        fileSize: document.fileSize.toString(),
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the upload",
    });
  }
}
