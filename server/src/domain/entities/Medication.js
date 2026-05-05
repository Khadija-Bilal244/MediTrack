export class Medication {
  constructor({ id, userId, name, dosage, time, durationDays, ongoing, startDate, notes, taken, missed, color }) {
    this.id          = id;
    this.userId      = userId;
    this.name        = name;
    this.dosage      = dosage;
    this.time        = time;
    this.durationDays = durationDays || null;
    this.ongoing     = ongoing || false;
    this.startDate   = startDate || new Date();
    this.notes       = notes || "";
    this.taken       = taken || false;
    this.missed      = missed || false;
    this.color       = color || "#0f9b8e";
  }
}
