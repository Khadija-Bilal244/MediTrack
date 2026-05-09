import api from "./axiosInstance";

/** Step 1 — send 6-digit OTP to the given email */
export const sendReminderCodeAPI = (email) =>
  api.post("/auth/send-reminder-code", { email }).then((r) => r.data);

/** Step 2 — verify OTP and save the email */
export const verifyReminderCodeAPI = (email, code) =>
  api.post("/auth/verify-reminder-code", { email, code }).then((r) => r.data);

/** Remove reminder email */
export const updateReminderEmailAPI = (reminderEmail) =>
  api.patch("/auth/reminder-email", { reminderEmail }).then((r) => r.data);
