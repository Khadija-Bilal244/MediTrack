import express from "express";
import { register, login, updateReminderEmail } from "../controllers/AuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",       register);
router.post("/login",          login);
router.patch("/reminder-email", protect, updateReminderEmail);  // ← NEW

export default router;
