import { NotFoundError, UnauthorizedError } from "../../../domain/errors/DomainErrors.js";

export class RemoveMedicationUseCase {
  constructor(medicationRepository) {
    this.medicationRepository = medicationRepository;
  }

  async execute({ medicationId, userId }) {
    const med = await this.medicationRepository.findById(medicationId);
    if (!med) throw new NotFoundError("Medication not found.");
    if (med.userId.toString() !== userId.toString())
      throw new UnauthorizedError("Not authorized to delete this medication.");

    await this.medicationRepository.delete(medicationId);
    return { message: "Medication removed successfully." };
  }
}