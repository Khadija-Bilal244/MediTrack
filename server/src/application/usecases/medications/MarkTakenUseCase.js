import { NotFoundError, UnauthorizedError } from "../../../domain/errors/DomainErrors.js";

export class MarkTakenUseCase {
  constructor(medicationRepository) {
    this.medicationRepository = medicationRepository;
  }

  async execute({ medicationId, userId, taken }) {
    const med = await this.medicationRepository.findById(medicationId);
    if (!med) throw new NotFoundError("Medication not found.");
    if (med.userId.toString() !== userId.toString())
      throw new UnauthorizedError("Not authorized.");

    return await this.medicationRepository.update(medicationId, {
      taken,
      missed: taken ? false : med.missed,
    });
  }
}