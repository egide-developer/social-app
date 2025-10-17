import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ===== Socket.IO Setup =====
export const io = new SocketIO(httpServer, {
    cors: { origin: true, credentials: true },
});

io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });

    // Example: handle custom events
    socket.on("chat-message", (msg) => {
        console.log("Message received:", msg);
        io.emit("chat-message", msg); // broadcast to all clients
    });
});

// ===== Middleware =====
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 })); // global rate limiter

// ===== Routes =====
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

// ===== Start Server =====
const PORT = process.env.PORT || 4000;
(async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error("Startup error", err);
    }
})();
