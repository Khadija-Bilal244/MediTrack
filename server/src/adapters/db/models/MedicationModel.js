import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:         { type: String, required: true, trim: true },
  dosage:       { type: String, required: true },
  time:         { type: String, required: true },
  durationDays: { type: Number, default: null },
  ongoing:      { type: Boolean, default: false },
  startDate:    { type: Date, default: Date.now },
  notes:        { type: String, default: "" },
  taken:        { type: Boolean, default: false },
  missed:       { type: Boolean, default: false },
  color:        { type: String, default: "#0f9b8e" },
}, { timestamps: true });

export default mongoose.model("Medication", medicationSchema);