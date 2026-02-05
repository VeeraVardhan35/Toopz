import express from "express";
import {
  getUserProfile,
  getUserPosts,
  getUserGroups,
  updateUserProfile,
} from "../controllers/users.controller.js";
import upload from "../middleware/upload.js"; 
import { authenticate } from "../middleware/auth.middleware.js";
import { redisCache } from "../middleware/redis-cache.middleware.js";

const router = express.Router();

router.get("/:userId/profile", authenticate, redisCache(120), getUserProfile);
router.get("/:userId/posts", authenticate, redisCache(120), getUserPosts);
router.get("/:userId/groups", authenticate, redisCache(120), getUserGroups);
router.put("/profile", authenticate, updateUserProfile);

// Add this route
router.post("/upload-profile", authenticate, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const profileUrl = req.file.path; 

    res.json({
      success: true,
      profileUrl,
    });
  } catch (error) {
    console.error("Profile upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload profile image" });
  }
});

export default router;
