import { Router } from "express";
import { upload } from "../../middlewares/upload.js";
import { uploadResume } from "./document.controller.js";

const router = Router();

router.post(
  "/",
  upload.single("file"),
  uploadResume
);

export default router;
