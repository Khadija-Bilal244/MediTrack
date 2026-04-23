export class SideEffect {
  constructor({ id, userId, med, effect, severity, date }) {
    this.id       = id;
    this.userId   = userId;
    this.med      = med;
    this.effect   = effect;
    this.severity = severity; // "Mild" | "Moderate" | "Severe"
    this.date     = date || new Date();
  }
}
