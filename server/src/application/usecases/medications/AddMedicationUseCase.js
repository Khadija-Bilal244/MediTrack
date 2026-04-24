import { Medication } from "../../../domain/entities/Medication.js";
import { ValidationError } from "../../../domain/errors/DomainErrors.js";

export class AddMedicationUseCase {
  constructor(medicationRepository) {
    this.medicationRepository = medicationRepository;
  }

  async execute({ userId, name, dosage, time, durationDays, ongoing, notes, color }) {
    if (!name || !dosage || !time)
      throw new ValidationError("Name, dosage, and time are required.");

    if (!ongoing && !durationDays)
      throw new ValidationError("Provide duration in days or set ongoing to true.");

    const medication = new Medication({
      userId, name, dosage, time,
      durationDays: ongoing ? null : Number(durationDays),
      ongoing: ongoing || false,
      startDate: new Date(),
      notes: notes || "",
      taken: false,
      missed: false,
      color: color || "#0f9b8e",
    });

    return await this.medicationRepository.save(medication);
  }
}
