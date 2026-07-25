import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import {
  listCandidates,
  searchCandidates,
  searchByResume,
  deleteCandidate,
  downloadResume,
} from "./candidate.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Read-only routes (all authenticated roles) ──────────────

router.get("/candidates", listCandidates);

router.post("/search-candidates", searchCandidates);

router.post("/search-by-resume", upload.single("file"), searchByResume);

router.get("/candidates/:id/resume", downloadResume);

// ── Mutating routes (RECRUITER and ADMIN only) ──────────────

router.delete(
  "/candidates/:id",
  authorize(Role.RECRUITER, Role.ADMIN),
  deleteCandidate
);

export default router;
