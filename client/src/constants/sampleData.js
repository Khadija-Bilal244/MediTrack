export const sampleMeds = [
  { id: 1, name: "Metformin",    dosage: "500mg", time: "08:00 AM", taken: true,  color: "#0f9b8e" },
  { id: 2, name: "Lisinopril",   dosage: "10mg",  time: "12:00 PM", taken: false, color: "#6366f1" },
  { id: 3, name: "Atorvastatin", dosage: "20mg",  time: "09:00 PM", taken: false, color: "#f97316" },
];

export const sampleSideEffects = [
  { id: 1, med: "Metformin",  effect: "Nausea",    severity: "Mild",     date: "Feb 27" },
  { id: 2, med: "Lisinopril", effect: "Dizziness", severity: "Moderate", date: "Feb 25" },
];

export const adherenceData = [
  { day: "Mon", taken: 3, missed: 0 },
  { day: "Tue", taken: 2, missed: 1 },
  { day: "Wed", taken: 3, missed: 0 },
  { day: "Thu", taken: 1, missed: 2 },
  { day: "Fri", taken: 3, missed: 0 },
  { day: "Sat", taken: 2, missed: 1 },
  { day: "Sun", taken: 3, missed: 0 },
];

export const DEMO_CAREGIVERS = [
  { id: 1, name: "Sarah Johnson",   email: "sarah.johnson@email.com", role: "Primary Caregiver" },
  { id: 2, name: "Dr. Michael Lee", email: "dr.lee@clinic.com",       role: "Physician" },
];

export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export const severityColor = (s) =>
  s === "Mild"     ? { bg: "#dcfce7", color: "#166534" } :
  s === "Moderate" ? { bg: "#fef3c7", color: "#92400e" } :
                     { bg: "#fee2e2", color: "#991b1b" };