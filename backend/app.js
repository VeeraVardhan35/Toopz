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
import adminRequestsRoutes from "./routes/admin-requests.routes.js";
import universalAdminRoutes from "./routes/universal-admin.routes.js";
import universityRequestsRoutes from "./routes/university-requests.routes.js";
import usersRoutes from "./routes/users.routes.js";
import http from "http";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const server = http.createServer(app);

console.log("🔌 Initializing Socket.IO...");
initializeSocket(server);
console.log("✅ Socket.IO initialized");

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/chats', chatsRoutes);
app.use('/api/v1/meta', metaRouter);
app.use('/api/v1/emails', emailsRouter);
app.use("/api/v1/messages", messagesRoutes);
app.use("/api/v1/admin-requests", adminRequestsRoutes);
app.use("/api/v1/admin", universalAdminRoutes);
app.use("/api/v1/university-requests", universityRequestsRoutes);
app.use("/api/v1/users", usersRoutes);

app.get('/api/v1/' , (req, res) => res.send("Welcome to Toopz"));

server.listen(PORT, async() => {
    await connectDB();
    console.log(`🚀 Server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
    console.log(`🔌 Socket.IO listening on ws://localhost:${PORT}`);
});
