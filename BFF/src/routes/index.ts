import { Router } from "express";
import { upload } from "../middlewares/upload.js";
import { uploadResumes } from "../controllers/uploadeDoc.js";
import { searchCandidates } from "../controllers/searchCandidate.js";
import { listCandidates } from "../controllers/listCandidates.js";
import { deleteCandidate } from "../controllers/deleteCandidate.js";
import { downloadResume } from "../controllers/downloadResume.js";
import { searchByResume } from "../controllers/searchByResume.js";

const router = Router();

router.post(
  "/resume-pipeline",
  upload.array("files", 10),
  uploadResumes
);

router.post(
  "/search-candidates",
  searchCandidates
);

router.post(
  "/search-by-resume",
  upload.single("file"),
  searchByResume
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