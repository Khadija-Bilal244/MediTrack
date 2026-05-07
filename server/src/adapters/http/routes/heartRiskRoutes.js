import express from "express";
import {
  predictHeartRisk,
  getHeartRiskHistory,
  getLatestHeartRisk,
} from "../controllers/HeartRiskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);   // all heart-risk routes require a valid JWT

router.post("/predict", predictHeartRisk);      // run a new prediction
router.get("/history",  getHeartRiskHistory);   // full history
router.get("/latest",   getLatestHeartRisk);    // most recent result only

export default router;
