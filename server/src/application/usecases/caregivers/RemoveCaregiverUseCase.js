import { NotFoundError } from "../../../domain/errors/DomainErrors.js";

export class RemoveCaregiverUseCase {
  constructor(caregiverRepository) {
    this.caregiverRepository = caregiverRepository;
  }

  async execute({ caregiverId }) {
    const existing = await this.caregiverRepository.findById(caregiverId);
    if (!existing) throw new NotFoundError("Caregiver not found.");
    await this.caregiverRepository.delete(caregiverId);
    return { message: "Caregiver removed successfully." };
  }
}