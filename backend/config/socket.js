import { Server } from "socket.io";
import { db } from "./db.js";
import { messages, messageReadReceipts, users } from "../database/schema.js";
import { eq } from "drizzle-orm";

let io;

export const initializeSocket = (server) => {
  console.log("🔌 Creating Socket.IO server...");
  
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Support both
    allowEIO3: true,
  });

  console.log("✅ Socket.IO server created");

  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("✅ New socket connection:", socket.id);

    // Authenticate user
    socket.on("authenticate", (userId) => {
      socket.userId = userId;
      userSockets.set(userId, socket.id);
      console.log(`✅ User ${userId} authenticated with socket ${socket.id}`);
    });

    // Join conversation
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`✅ User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`✅ User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        console.log("📩 Received message:", data);
        const { conversationId, content, type } = data;

        if (!conversationId || !content) {
          console.error("❌ Missing required fields");
          socket.emit("error", { message: "Missing required fields" });
          return;
        }

        // Save to database
        const [newMessage] = await db
          .insert(messages)
          .values({
            conversationId,
            senderId: socket.userId,
            content,
            type: type || "text",
          })
          .returning();

        console.log("✅ Message saved:", newMessage.id);

        // Get sender info
        const [sender] = await db
          .select({
            id: users.id,
            name: users.name,
            profileUrl: users.profileUrl,
          })
          .from(users)
          .where(eq(users.id, socket.userId));

        const messageWithSender = {
          ...newMessage,
          sender,
        };

        // Broadcast to room
        console.log("📤 Broadcasting to conversation_" + conversationId);
        io.to(`conversation_${conversationId}`).emit("new_message", messageWithSender);
        
        // Confirm to sender
        socket.emit("message_sent", messageWithSender);
        console.log("✅ Message broadcast complete");
      } catch (error) {
        console.error("❌ Send message error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    // Typing indicators
    socket.on("typing_start", ({ conversationId, userName }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId: socket.userId,
        userName,
      });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("user_stopped_typing", {
        userId: socket.userId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        console.log(`❌ User ${socket.userId} disconnected`);
      }
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  console.log("✅ Socket.IO event handlers registered");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};