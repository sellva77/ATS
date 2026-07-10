import { Router } from "express";
import documentRoutes from "../modules/document/document.routes";

const router = Router();

router.use("/documents", documentRoutes);

export default router;
