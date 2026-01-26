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
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // or your frontend port
    credentials: true,
}));
app.use("/uploads", express.static("uploads"));


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/chats', chatsRoutes);
app.use('/api/v1/meta', metaRouter);
app.use('/api/v1/emails', emailsRouter);

app.get('/api/v1/' , (req, res) => res.send("Welcome to Toopz"));

app.listen(PORT, async() => {
    console.log(`server running on http://localhost:${PORT} in ${NODE_ENV} mode`);
    await connectDB();
});