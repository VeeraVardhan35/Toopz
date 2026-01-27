import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  console.log("🔌 Connecting to Socket.IO server...");
  
  socket = io("http://localhost:5500", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    console.log("🔌 Transport:", socket.io.engine.transport.name);
    socket.emit("authenticate", userId);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
    console.log("Trying to reconnect...");
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("✅ Reconnected after", attemptNumber, "attempts");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected manually");
  }
};