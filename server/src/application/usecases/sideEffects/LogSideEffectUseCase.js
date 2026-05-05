import { SideEffect } from "../../../domain/entities/SideEffect.js";
import { ValidationError } from "../../../domain/errors/DomainErrors.js";

export class LogSideEffectUseCase {
  constructor(sideEffectRepository) {
    this.sideEffectRepository = sideEffectRepository;
  }

  async execute({ userId, med, effect, severity }) {
    if (!med || !effect || !severity)
      throw new ValidationError("Medication, effect, and severity are required.");

    const validSeverities = ["Mild", "Moderate", "Severe"];
    if (!validSeverities.includes(severity))
      throw new ValidationError("Severity must be Mild, Moderate, or Severe.");

    const sideEffect = new SideEffect({ userId, med, effect, severity, date: new Date() });
    return await this.sideEffectRepository.save(sideEffect);
  }
}
