import express   from "express";
import cors      from "cors";
import dotenv    from "dotenv";
import connectDB from "./config/db.js";
import { startScheduler } from "./scheduler.js";

import authRoutes       from "../adapters/http/routes/authRoutes.js";
import medicationRoutes from "../adapters/http/routes/medicationRoutes.js";
import sideEffectRoutes from "../adapters/http/routes/sideEffectRoutes.js";
import caregiverRoutes  from "../adapters/http/routes/caregiverRoutes.js";
import heartRiskRoutes  from "../adapters/http/routes/heartRiskRoutes.js";  // ← NEW

dotenv.config();
connectDB();
startScheduler();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth",        authRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/sideeffects", sideEffectRoutes);
app.use("/api/caregivers",  caregiverRoutes);
app.use("/api/heart-risk",  heartRiskRoutes);   // ← NEW

app.get("/", (req, res) => res.json({ message: "MediTrack API running" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
