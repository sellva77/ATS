import { Request, Response } from "express";

export async function uploadDocument(
  req: Request,
  res: Response
): Promise<any> {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
}
