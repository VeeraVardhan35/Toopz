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

router.get("/conversations", getConversations);

router.get("/conversations/search", searchConversations);

router.post("/conversations/direct", getOrCreateConversation);

router.post("/conversations/group", createGroupConversation);

router.get("/conversations/:conversationId/messages", getMessages);

router.post("/conversations/:conversationId/messages", upload.single("file"), sendMessage);

router.put("/conversations/:conversationId/read", markAsRead);

router.put("/messages/:messageId", editMessage);

router.delete("/messages/:messageId", deleteMessage);

router.post("/conversations/group", createGroupConversation);

export default router;