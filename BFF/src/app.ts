import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes.js";
import candidateRoutes from "./candidate/candidate.routes.js";
import resumeRoutes from "./resume/resume.routes.js";
import organizationRoutes from "./organization/organization.routes.js";
import teamsRoutes from "./teams/teams.routes.js";
import usersRoutes from "./users/users.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ── Auth routes (public + protected inside) ─────────────────
app.use("/api/v1/auth", authRoutes);

// ── Feature routes (all protected inside via authenticate) ──
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/teams", teamsRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1", candidateRoutes);
app.use("/api/v1", resumeRoutes);

export default app;