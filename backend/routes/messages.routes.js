import express from "express";
import {
  getConversations,
  getOrCreateConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  editMessage,
  searchConversations,
} from "../controllers/messages.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(authenticate);

// Get all conversations for user
router.get("/conversations", getConversations);

// Search conversations
router.get("/conversations/search", searchConversations);

// Get or create direct conversation
router.post("/conversations/direct", getOrCreateConversation);

// Create or get group conversation
router.post("/conversations/group", createGroupConversation);

// Get messages in a conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Send message
router.post("/conversations/:conversationId/messages", upload.single("file"), sendMessage);

// Mark messages as read
router.put("/conversations/:conversationId/read", markAsRead);

// Edit message
router.put("/messages/:messageId", editMessage);

// Delete message
router.delete("/messages/:messageId", deleteMessage);

// Create group conversation
router.post("/conversations/group", createGroupConversation);

export default router;