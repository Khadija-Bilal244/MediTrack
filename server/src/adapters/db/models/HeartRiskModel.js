import mongoose from "mongoose";

const heartRiskSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ── Clinical inputs ──────────────────────────────────────────────────
    male:            { type: Number, required: true },   // 1 = Male, 0 = Female
    age:             { type: Number, required: true },
    education:       { type: Number, required: true },   // 1–4
    currentSmoker:   { type: Number, required: true },
    cigsPerDay:      { type: Number, required: true },
    BPMeds:          { type: Number, required: true },
    prevalentStroke: { type: Number, required: true },
    prevalentHyp:    { type: Number, required: true },
    diabetes:        { type: Number, required: true },
    totChol:         { type: Number, required: true },
    sysBP:           { type: Number, required: true },
    diaBP:           { type: Number, required: true },
    BMI:             { type: Number, required: true },
    heartRate:       { type: Number, required: true },
    glucose:         { type: Number, required: true },

    // ── Prediction result ─────────────────────────────────────────────────
    risk:            { type: Number, required: true, enum: [0, 1] },
    label:           { type: String, required: true, enum: ["Low Risk", "High Risk"] },
    probability:     { type: Number, default: null },   // 0–100 (%)
  },
  { timestamps: true }   // adds createdAt + updatedAt automatically
);

// Index for fast per-user lookups (descending = newest first)
heartRiskSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("HeartRiskAssessment", heartRiskSchema);
