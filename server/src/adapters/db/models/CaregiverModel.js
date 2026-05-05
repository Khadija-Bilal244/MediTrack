import mongoose from "mongoose";

const caregiverSchema = new mongoose.Schema({
  patientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, default: "Caregiver" },
}, { timestamps: true });

export default mongoose.model("Caregiver", caregiverSchema);