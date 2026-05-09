import jwt from "jsonwebtoken";
import { RegisterUseCase }         from "../../../application/usecases/auth/RegisterUseCase.js";
import { LoginUseCase }            from "../../../application/usecases/auth/LoginUseCase.js";
import { MongoUserRepository }     from "../../db/repositories/MongoUserRepository.js";
import { MongoCaregiverRepository} from "../../db/repositories/MongoCaregiverRepository.js";
import UserModel                   from "../../db/models/UserModel.js";
import { createOTP, verifyOTP }    from "../../../infrastructure/otpStore.js";
import { sendOTPEmail }            from "../../../infrastructure/emailService.js";

const userRepo      = new MongoUserRepository();
const caregiverRepo = new MongoCaregiverRepository();

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res) => {
  try {
    const useCase = new RegisterUseCase(userRepo);
    const user    = await useCase.execute(req.body);
    const token   = signToken({ id: user._id, email: user.email, role: "patient" });
    res.status(201).json({
      success: true, token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, age: user.age, gender: user.gender,
        role: "patient", reminderEmail: user.reminderEmail || null,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const useCase = new LoginUseCase(userRepo, caregiverRepo);
    const account = await useCase.execute(req.body);
    const token   = signToken({ id: account._id, email: account.email, role: account.role });

    if (account.role === "patient") {
      return res.status(200).json({
        success: true, token,
        user: {
          id: account._id, firstName: account.firstName, lastName: account.lastName,
          email: account.email, age: account.age, gender: account.gender,
          role: "patient", reminderEmail: account.reminderEmail || null,
        },
      });
    }
    return res.status(200).json({
      success: true, token,
      user: { id: account._id, name: account.name, email: account.email, role: "caregiver", patientId: account.patientId },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/send-reminder-code ─────────────────────────────────────
export const sendReminderCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@"))
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const code = createOTP(req.user.id, email);
    await sendOTPEmail(email, user.firstName, code);

    res.status(200).json({ success: true, message: `Verification code sent to ${email}` });
  } catch (err) {
    console.error("sendReminderCode error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send code. Check your server email config." });
  }
};

// ── POST /api/auth/verify-reminder-code ───────────────────────────────────
export const verifyReminderCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ success: false, message: "Email and code are required." });

    const result = verifyOTP(req.user.id, email, code);
    if (!result.valid)
      return res.status(400).json({ success: false, message: result.reason });

    // Code is valid — save reminderEmail
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { reminderEmail: email.trim().toLowerCase() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      reminderEmail: user.reminderEmail,
      message: "Email verified and saved successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/auth/reminder-email (remove only) ──────────────────────────
export const updateReminderEmail = async (req, res) => {
  try {
    const { reminderEmail } = req.body;
    const value = reminderEmail ? reminderEmail.trim().toLowerCase() : null;
    const user  = await UserModel.findByIdAndUpdate(req.user.id, { reminderEmail: value }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, reminderEmail: user.reminderEmail, message: value ? "Reminder email saved." : "Reminder email removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
