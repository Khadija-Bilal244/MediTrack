import { HeartRiskAssessment } from "../../../domain/entities/HeartRiskAssessment.js";
import { ValidationError }      from "../../../domain/errors/DomainErrors.js";

const REQUIRED_FIELDS = [
  "male", "age", "education", "currentSmoker",
  "cigsPerDay", "BPMeds", "prevalentStroke",
  "prevalentHyp", "diabetes", "totChol",
  "sysBP", "diaBP", "BMI", "heartRate", "glucose",
];

/**
 * PredictHeartRiskUseCase
 *
 * Orchestrates:
 *  1. Input validation
 *  2. Forwarding the payload to the ML microservice via heartRiskService
 *  3. Persisting the result via heartRiskRepository
 *  4. Returning the saved assessment to the controller
 */
export class PredictHeartRiskUseCase {
  /**
   * @param {IHeartRiskRepository} heartRiskRepository
   * @param {object} heartRiskService  — adapter wrapping the Python microservice
   */
  constructor(heartRiskRepository, heartRiskService) {
    this.heartRiskRepository = heartRiskRepository;
    this.heartRiskService    = heartRiskService;
  }

  async execute({ userId, ...inputs }) {
    // ── Validation ──────────────────────────────────────────────────────────
    const missing = REQUIRED_FIELDS.filter(
      f => inputs[f] === undefined || inputs[f] === null || inputs[f] === ""
    );
    if (missing.length)
      throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);

    const numeric = {};
    for (const field of REQUIRED_FIELDS) {
      const val = Number(inputs[field]);
      if (isNaN(val))
        throw new ValidationError(`Field '${field}' must be a number.`);
      numeric[field] = val;
    }

    // ── Call ML service ──────────────────────────────────────────────────────
    const prediction = await this.heartRiskService.predict(numeric);

    // ── Build + persist entity ───────────────────────────────────────────────
    const assessment = new HeartRiskAssessment({
      userId,
      ...numeric,
      risk:        prediction.risk,
      label:       prediction.label,
      probability: prediction.probability ?? null,
      createdAt:   new Date(),
    });

    return await this.heartRiskRepository.save(assessment);
  }
}
