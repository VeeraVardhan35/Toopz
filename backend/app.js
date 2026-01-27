import express from 'express';
import {PORT, NODE_ENV} from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import {connectDB} from "./database/test.js";
import cookieParser from 'cookie-parser';
import postRouter from './routes/posts.route.js'
import groupRoutes from "./routes/groups.routes.js";
import {chatsRoutes} from "./routes/chats.routes.js";
import {metaRouter} from "./routes/meta.routes.js";
import emailsRouter from "./routes/emails.routes.js";
import { initializeSocket } from './config/socket.js';
import messagesRoutes from "./routes/messages.routes.js";
import http from "http";
import cors from "cors";

const app = express();

// CORS must be before creating server
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
console.log("🔌 Initializing Socket.IO...");
initializeSocket(server);
console.log("✅ Socket.IO initialized");

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/chats', chatsRoutes);
app.use('/api/v1/meta', metaRouter);
app.use('/api/v1/emails', emailsRouter);
app.use("/api/v1/messages", messagesRoutes);

app.get('/api/v1/' , (req, res) => res.send("Welcome to Toopz"));

// IMPORTANT: Use server.listen() NOT app.listen()
server.listen(PORT, async() => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
    console.log(`🔌 Socket.IO listening on ws://localhost:${PORT}`);
    await connectDB();
});