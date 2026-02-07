import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (userId) => {
  if (socket && socket.connected) {
    return socket;
  }

<<<<<<< HEAD
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.MODE === "development"
      ? "http://localhost:5500"
      : window.location.origin);

  socket = io(socketUrl, {
=======
  
  socket = io("http://localhost:5500", {
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
