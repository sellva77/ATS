import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes.js";
import candidateRoutes from "./candidate/candidate.routes.js";
import resumeRoutes from "./resume/resume.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ── Auth routes (public + protected inside) ─────────────────
app.use("/api/v1/auth", authRoutes);

// ── Feature routes (all protected inside via authenticate) ──
app.use("/api/v1", candidateRoutes);
app.use("/api/v1", resumeRoutes);

export default app;