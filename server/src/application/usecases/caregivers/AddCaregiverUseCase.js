import bcrypt from "bcryptjs";
import { Caregiver } from "../../../domain/entities/Caregiver.js";
import { ValidationError, ConflictError } from "../../../domain/errors/DomainErrors.js";

export class AddCaregiverUseCase {
  constructor(caregiverRepository) {
    this.caregiverRepository = caregiverRepository;
  }

  async execute({ patientId, name, email, password, role }) {
    if (!name || !email || !password)
      throw new ValidationError("Name, email, and password are required.");

    if (password.length < 6)
      throw new ValidationError("Password must be at least 6 characters.");

    const existing = await this.caregiverRepository.findByEmail(email);
    if (existing) throw new ConflictError("A caregiver with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    const caregiver    = new Caregiver({ patientId, name, email, passwordHash, role: role || "Caregiver" });
    return await this.caregiverRepository.save(caregiver);
  }
}
