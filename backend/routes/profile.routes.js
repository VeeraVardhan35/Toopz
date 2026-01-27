import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserGroups,
  toggleFollow,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  toggleSavePost,
  getSavedPosts,
} from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get("/:userId/profile", getUserProfile);
router.put(
  "/:userId/profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateUserProfile
);

// User content routes
router.get("/:userId/posts", getUserPosts);
router.get("/:userId/groups", getUserGroups);
router.get("/:userId/saved-posts", getSavedPosts);

// Follow routes
router.post("/:userId/follow", toggleFollow);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);
router.get("/:userId/follow-status", checkFollowStatus);

// Save post routes
router.post("/posts/:postId/save", toggleSavePost);

export default router;