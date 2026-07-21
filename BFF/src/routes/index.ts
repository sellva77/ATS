import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { uploadResume } from "../controllers/uploadeDoc.js";
import { searchCandidates } from "../controllers/searchCandidate.js";
import { listCandidates } from "../controllers/listCandidates.js";
import { deleteCandidate } from "../controllers/deleteCandidate.js";
import { downloadResume } from "../controllers/downloadResume.js";

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

router.get(
  "/candidates",
  listCandidates
);

router.delete(
  "/candidates/:id",
  deleteCandidate
);

router.get(
  "/candidates/:id/resume",
  downloadResume
);

export default router;