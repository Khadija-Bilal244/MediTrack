import express from "express";
import {
  register,
  login,
  sendReminderCode,
  verifyReminderCode,
  updateReminderEmail,
} from "../controllers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",              register);
router.post("/login",                 login);
router.post("/send-reminder-code",    protect, sendReminderCode);    // step 1: send OTP
router.post("/verify-reminder-code",  protect, verifyReminderCode);  // step 2: verify + save
router.patch("/reminder-email",       protect, updateReminderEmail); // remove email

export default router;
