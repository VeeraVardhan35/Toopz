import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    return socket;
  }

  
  socket = io("http://localhost:5500", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    socket.emit("authenticate", userId);
  });

  socket.on("disconnect", (reason) => {
  });

  socket.on("error", (error) => {
  });

  socket.on("connect_error", (error) => {
  });

  socket.on("reconnect", (attemptNumber) => {
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
  }
};