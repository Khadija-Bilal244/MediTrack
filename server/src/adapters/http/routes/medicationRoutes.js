import express from "express";
import {
  getMedications,
  addMedication,
  removeMedication,
  markTaken,
  deleteExpired,
  autoMarkMissed,
  getPatientReports,
} from "../controllers/MedicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/",            getMedications);
router.get("/reports",     getPatientReports);
router.post("/",           addMedication);
router.post("/auto-miss",  autoMarkMissed);
router.delete("/expired",  deleteExpired);
router.delete("/:id",      removeMedication);
router.patch("/:id/taken", markTaken);

export default router;