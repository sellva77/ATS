import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import { uploadResumes } from "./resume.controller.js";

const router = Router();

// POST /resume-pipeline
router.post(
  "/resume-pipeline",
  authenticate,
  requireRole("ADMIN", "TEAM_MANAGER"),
  upload.array("files", 10),
  uploadResumes
);

export default router;
