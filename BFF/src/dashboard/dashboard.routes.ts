import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import {
  getSummaryHandler,
  getManagersHandler,
  getTeamsHandler,
  getActivityHandler,
} from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

// Both ADMIN, TEAM_MANAGER, and TEAM_MEMBER get a summary (scoped by role)
router.get("/summary", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), getSummaryHandler);

// Admin-only endpoints
router.get("/managers", requireRole("ADMIN"), getManagersHandler);
router.get("/teams", requireRole("ADMIN"), getTeamsHandler);

// Both roles get activity (scoped by role)
router.get("/activity", requireRole("ADMIN", "TEAM_MANAGER", "TEAM_MEMBER"), getActivityHandler);

export default router;
