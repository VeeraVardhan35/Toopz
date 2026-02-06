import express from "express";
import {
  submitUniversityRequest,
  getMyUniversityRequests,
  getAllUniversityRequests,
  approveUniversityRequest,
  rejectUniversityRequest,
  uploadUniversityLogo,
} from "../controllers/university-requests.controller.js";
import upload from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkUniversalAdmin } from "../middleware/universal-admin.middleware.js";
import { redisCache } from "../middleware/redis-cache.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/submit", submitUniversityRequest);
router.post("/upload-logo", upload.single("logo"), uploadUniversityLogo);
router.get("/my-requests", redisCache(60), getMyUniversityRequests);

router.get(
  "/pending",
  checkUniversalAdmin,
  redisCache(60),
  getAllUniversityRequests
);

router.post("/approve/:requestId", checkUniversalAdmin, approveUniversityRequest);
router.post("/reject/:requestId", checkUniversalAdmin, rejectUniversityRequest);

export default router;
