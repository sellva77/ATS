import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import {
  createTeamHandler,
  getTeamsHandler,
  updateTeamHandler,
  deleteTeamHandler,
} from "./teams.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("ADMIN"), createTeamHandler);
router.get("/", requireRole("ADMIN", "TEAM_MANAGER"), getTeamsHandler);
router.patch("/:id", requireRole("ADMIN"), updateTeamHandler);
router.delete("/:id", requireRole("ADMIN"), deleteTeamHandler);

export default router;
