import { Router } from "express";
import { upload } from "../../middlewares/upload";
import { uploadDocument } from "./document.controller";

const router = Router();

router.post(
  "/",
  upload.single("file"),
  uploadDocument
);

export default router;
