import bcrypt from "bcryptjs";
import { UnauthorizedError, ValidationError } from "../../../domain/errors/DomainErrors.js";

export class LoginUseCase {
  constructor(userRepository, caregiverRepository) {
    this.userRepository      = userRepository;
    this.caregiverRepository = caregiverRepository;
  }

  async execute({ email, password }) {
    if (!email || !password)
      throw new ValidationError("Email and password are required.");

    // Check patient first
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) throw new UnauthorizedError("Invalid email or password.");
      // Return mongoose document with role attached
      return { ...user.toObject(), role: "patient" };
    }

    // Check caregiver
    const caregiver = await this.caregiverRepository.findByEmail(email);
    if (caregiver) {
      const match = await bcrypt.compare(password, caregiver.passwordHash);
      if (!match) throw new UnauthorizedError("Invalid email or password.");
      return { ...caregiver.toObject(), role: "caregiver" };
    }

    throw new UnauthorizedError("Invalid email or password.");
  }
}
