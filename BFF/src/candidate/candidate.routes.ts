import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import {
  listCandidates,
  searchCandidates,
  searchByResume,
  deleteCandidate,
  downloadResume,
  assignCandidate,
  updateCandidateStatus,
} from "./candidate.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Read-only routes ──────────────

router.get("/candidates", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), listCandidates);

router.post("/search-candidates", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), searchCandidates);

router.post("/search-by-resume", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), upload.single("file"), searchByResume);

router.get("/candidates/:id/resume", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), downloadResume);

// ── Mutating routes ──────────────

router.delete(
  "/candidates/:id",
  requireRole("ADMIN", "TEAM_MANAGER"),
  deleteCandidate
);

router.patch(
  "/candidates/:id/assign",
  requireRole("ADMIN", "TEAM_MANAGER"),
  assignCandidate
);

router.patch(
  "/candidates/:id/status",
  requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"),
  updateCandidateStatus
);

export default router;
