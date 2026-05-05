import bcrypt from "bcryptjs";
import { User } from "../../../domain/entities/User.js";
import { ConflictError, ValidationError } from "../../../domain/errors/DomainErrors.js";

export class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ firstName, lastName, email, password, age, gender }) {
    if (!firstName || !lastName || !email || !password || !age || !gender)
      throw new ValidationError("All fields are required.");

    if (!email.includes("@"))
      throw new ValidationError("Invalid email address.");

    if (password.length < 6)
      throw new ValidationError("Password must be at least 6 characters.");

    const existing = await this.userRepository.findByEmail(email);
    if (existing)
      throw new ConflictError("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({ firstName, lastName, email, passwordHash, age, gender, role: "patient" });
    const saved = await this.userRepository.save(user);
    return saved;
  }
}