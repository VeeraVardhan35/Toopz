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

router.use(authenticate);

router.post("/compose", upload.array("attachments", 5), composeEmail);

router.get("/", getEmails);

router.get("/unread-count", getUnreadCount);

router.get("/search", searchEmails);

router.get("/type", getEmailsByType);
router.get("/type/:type", getEmailsByType);

router.get("/:id", getEmailById);

router.put("/:id/read", markAsRead);
router.put("/:id/unread", markAsUnread);

router.put("/:id/star", toggleStar);

router.put("/:id/important", toggleImportant);

router.post("/:id/reply", replyToEmail);

router.delete("/:id", deleteEmail);

router.get("/groups-list", getGroupsForEmail);

export default router;
