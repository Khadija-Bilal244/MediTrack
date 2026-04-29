import express from "express";
import {
  getCaregivers,
  addCaregiver,
  removeCaregiver,
  getPatientData,
  getPatientReports,
} from "../controllers/CaregiverController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/",              getCaregivers);
router.get("/patient-data",  getPatientData);
router.get("/patient-reports", getPatientReports);
router.post("/",             addCaregiver);
router.delete("/:id",        removeCaregiver);

export default router;