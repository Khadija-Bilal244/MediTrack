import mongoose from "mongoose";

const sideEffectSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  med:      { type: String, required: true },
  effect:   { type: String, required: true },
  severity: { type: String, required: true, enum: ["Mild", "Moderate", "Severe"] },
  date:     { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("SideEffect", sideEffectSchema);