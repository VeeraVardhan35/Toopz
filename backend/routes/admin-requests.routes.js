import express from "express";
import {
  submitAdminRequest,
  getAllPendingRequests,
  getMyRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getRequestById,
  getPendingRequestsCount,
} from "../controllers/admin-requests.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkUniversalAdmin } from "../middleware/universal-admin.middleware.js";
import { redisCache } from "../middleware/redis-cache.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post("/submit", submitAdminRequest);
router.get("/my-requests", redisCache(60), getMyRequests);
router.get("/requests/:requestId", redisCache(120), getRequestById);

// Universal Admin routes
router.get(
  "/pending",
  checkUniversalAdmin,
  redisCache(60),
  getAllPendingRequests
);

router.get(
  "/count",
  checkUniversalAdmin,
  redisCache(30),
  getPendingRequestsCount
);

router.post("/approve/:requestId", checkUniversalAdmin, approveAdminRequest);
router.post("/reject/:requestId", checkUniversalAdmin, rejectAdminRequest);

export default router;
