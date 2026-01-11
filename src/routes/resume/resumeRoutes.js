import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";
import { uploadResume } from "../../controllers/resumeController.js";
import { matchResumeWithJD } from "../../controllers/resumeController.js";
import { getMatchHistory } from "../../controllers/resumeController.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.post(
    "/match",
    authMiddleware,
    matchResumeWithJD
);  

router.get(
    "/matches",
    authMiddleware,
    getMatchHistory
);
  

export default router;
