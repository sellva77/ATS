import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware.js";
import {
  createOrganizationHandler,
  getOrganizationsHandler,
  updateOrganizationHandler,
  deleteOrganizationHandler,
} from "./organization.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("ADMIN"), createOrganizationHandler);
router.get("/", requireRole("ADMIN"), getOrganizationsHandler);
router.patch("/:id", requireRole("ADMIN"), updateOrganizationHandler);
router.delete("/:id", requireRole("ADMIN"), deleteOrganizationHandler);

export default router;
