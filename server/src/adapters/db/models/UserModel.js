import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  age:          { type: Number, required: true },
  gender:       { type: String, required: true, enum: ["Male", "Female", "Non-binary", "Prefer not to say"] },
  role:         { type: String, default: "patient", enum: ["patient", "caregiver"] },
}, { timestamps: true });

export default mongoose.model("User", userSchema);