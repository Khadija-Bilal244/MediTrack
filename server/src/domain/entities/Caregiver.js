export class Caregiver {
  constructor({ id, patientId, name, email, passwordHash, role }) {
    this.id           = id;
    this.patientId    = patientId;
    this.name         = name;
    this.email        = email;
    this.passwordHash = passwordHash;
    this.role         = role || "Caregiver";
  }
}
