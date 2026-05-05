import mongoose from "mongoose";

const adherenceLogSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  medName: { type: String, required: true },
  date:    { type: String, required: true },
  taken:   { type: Boolean, default: false },
  missed:  { type: Boolean, default: false },
}, { timestamps: true });

adherenceLogSchema.index({ userId: 1, medId: 1, date: 1 }, { unique: true });

export default mongoose.model("AdherenceLog", adherenceLogSchema);
