import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { uploadResume } from "../controllers/uploadeDoc.js";
import { searchCandidates } from "../controllers/searchCandidate.js";

const router = Router();

router.post(
  "/resume-pipeline",
  upload.single("file"),
  uploadResume
);

router.post(
  "/search-candidates",
  searchCandidates
);

export default router;