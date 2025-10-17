//server.js

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (err) {
        console.error("Startup error", err);
    }
})();
