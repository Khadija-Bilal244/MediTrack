export class User {
  constructor({ id, firstName, lastName, email, passwordHash, age, gender, role = "patient", createdAt }) {
    this.id           = id;
    this.firstName    = firstName;
    this.lastName     = lastName;
    this.email        = email;
    this.passwordHash = passwordHash;
    this.age          = age;
    this.gender       = gender;
    this.role         = role;  // "patient" | "caregiver"
    this.createdAt    = createdAt || new Date();
  }
}
