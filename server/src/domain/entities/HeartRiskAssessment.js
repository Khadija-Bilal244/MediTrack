/**
 * Domain Entity — HeartRiskAssessment
 *
 * Represents one completed heart-disease risk evaluation for a patient.
 * Keeps raw inputs + the prediction result together so they can be
 * persisted and shown in the Reports section.
 */
export class HeartRiskAssessment {
  constructor({
    userId,
    // ── inputs ──────────────────────────────────
    male,
    age,
    education,
    currentSmoker,
    cigsPerDay,
    BPMeds,
    prevalentStroke,
    prevalentHyp,
    diabetes,
    totChol,
    sysBP,
    diaBP,
    BMI,
    heartRate,
    glucose,
    // ── result ──────────────────────────────────
    risk,          // 0 | 1
    label,         // "Low Risk" | "High Risk"
    probability,   // number | null  (0–100 %)
    createdAt,
  }) {
    this.userId          = userId;
    this.male            = male;
    this.age             = age;
    this.education       = education;
    this.currentSmoker   = currentSmoker;
    this.cigsPerDay      = cigsPerDay;
    this.BPMeds          = BPMeds;
    this.prevalentStroke = prevalentStroke;
    this.prevalentHyp    = prevalentHyp;
    this.diabetes        = diabetes;
    this.totChol         = totChol;
    this.sysBP           = sysBP;
    this.diaBP           = diaBP;
    this.BMI             = BMI;
    this.heartRate       = heartRate;
    this.glucose         = glucose;
    this.risk            = risk;
    this.label           = label;
    this.probability     = probability ?? null;
    this.createdAt       = createdAt ?? new Date();
  }
}
