import express from "express";
import {
  composeEmail,
  getEmails,
  getEmailById,
  markAsRead,
  markAsUnread,
  toggleStar,
  toggleImportant,
  deleteEmail,
  replyToEmail,
  getEmailsByType,
  searchEmails,
  getUnreadCount,
  getGroupsForEmail
} from "../controllers/emails.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload  from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Compose email with attachments
router.post("/compose", upload.array("attachments", 5), composeEmail);

// Get all emails
router.get("/", getEmails);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Search emails
router.get("/search", searchEmails);

// Get emails by type
router.get("/type/:type", getEmailsByType);

// Get email by ID
router.get("/:id", getEmailById);

// Mark as read/unread
router.put("/:id/read", markAsRead);
router.put("/:id/unread", markAsUnread);

// Toggle star
router.put("/:id/star", toggleStar);

// Toggle important
router.put("/:id/important", toggleImportant);

// Reply to email
router.post("/:id/reply", replyToEmail);

// Delete email
router.delete("/:id", deleteEmail);

// Get all groups for email compose
router.get("/groups-list", getGroupsForEmail);

export default router;