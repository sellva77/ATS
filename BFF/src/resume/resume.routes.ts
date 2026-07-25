import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import { uploadResumes } from "./resume.controller.js";

const router = Router();

// POST /resume-pipeline — RECRUITER and ADMIN only
router.post(
  "/resume-pipeline",
  authenticate,
  authorize(Role.RECRUITER, Role.ADMIN),
  upload.array("files", 10),
  uploadResumes
);

export default router;
