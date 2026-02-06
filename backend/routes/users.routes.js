import express from "express";
import {
  getUserProfile,
  getUserPosts,
  getUserGroups,
  updateUserProfile,
  uploadProfileImage,
} from "../controllers/users.controller.js";
import upload from "../middleware/upload.js"; 
import { authenticate } from "../middleware/auth.middleware.js";
import { redisCache } from "../middleware/redis-cache.middleware.js";

const router = express.Router();

router.get("/:userId/profile", authenticate, redisCache(120), getUserProfile);
router.get("/:userId/posts", authenticate, redisCache(120), getUserPosts);
router.get("/:userId/groups", authenticate, redisCache(120), getUserGroups);
router.put("/profile", authenticate, updateUserProfile);

router.post(
  "/upload-profile",
  authenticate,
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;
