import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import {
  getUsersHandler,
  inviteUserHandler,
  updateUserRoleHandler,
  updateUserTeamHandler,
  deleteUserHandler,
} from "./users.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("ADMIN", "TEAM_MANAGER"), getUsersHandler);
router.post("/invite", requireRole("ADMIN", "TEAM_MANAGER"), inviteUserHandler);
router.patch("/:id/role", requireRole("ADMIN"), updateUserRoleHandler);
router.patch("/:id/team", requireRole("ADMIN"), updateUserTeamHandler);
router.delete("/:id", requireRole("ADMIN", "TEAM_MANAGER"), deleteUserHandler);

export default router;
