import express        from "express";
import cors           from "cors";
import dotenv         from "dotenv";
import helmet         from "helmet";
import mongoSanitize  from "express-mongo-sanitize";
import rateLimit      from "express-rate-limit";
import connectDB      from "./config/db.js";
import { startScheduler } from "./scheduler.js";

import authRoutes       from "../adapters/http/routes/authRoutes.js";
import medicationRoutes from "../adapters/http/routes/medicationRoutes.js";
import sideEffectRoutes from "../adapters/http/routes/sideEffectRoutes.js";
import caregiverRoutes  from "../adapters/http/routes/caregiverRoutes.js";
import heartRiskRoutes  from "../adapters/http/routes/heartRiskRoutes.js";

dotenv.config();
connectDB();
startScheduler();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// ── Body parser ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── NoSQL injection sanitization ────────────────────────────────────────────
// Strips keys containing $ or . from req.body, req.params, req.query
app.use(mongoSanitize());

// ── Rate limiting ───────────────────────────────────────────────────────────
// General API limiter — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Stricter limiter for auth routes — 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later." },
});

app.use("/api/",      apiLimiter);
app.use("/api/auth",  authLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/sideeffects", sideEffectRoutes);
app.use("/api/caregivers",  caregiverRoutes);
app.use("/api/heart-risk",  heartRiskRoutes);

app.get("/", (req, res) => res.json({ message: "MediTrack API running" }));

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
