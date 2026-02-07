import { Server } from "socket.io";
import { db } from "./db.js";
import { messages, messageReadReceipts, users } from "../database/schema.js";
import { eq } from "drizzle-orm";

let io;

export const initializeSocket = (server) => {
  
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Support both
    allowEIO3: true,
  });


  const userSockets = new Map();

  io.on("connection", (socket) => {

    socket.on("authenticate", (userId) => {
      socket.userId = userId;
      userSockets.set(userId, socket.id);
    });

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, type } = data;

        if (!conversationId || !content) {
          socket.emit("error", { message: "Missing required fields" });
          return;
        }

        const [newMessage] = await db
          .insert(messages)
          .values({
            conversationId,
            senderId: socket.userId,
            content,
            type: type || "text",
          })
          .returning();


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

        io.to(`conversation_${conversationId}`).emit("new_message", messageWithSender);
        
        socket.emit("message_sent", messageWithSender);
      } catch (error) {
        console.error("❌ Error:", error);
        socket.emit("error", { message: error.message });
      }
    });

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

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
