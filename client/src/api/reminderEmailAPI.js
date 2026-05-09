import api from "./axiosInstance";

/**
 * PATCH /api/auth/reminder-email
 * Pass empty string to clear the reminder email.
 */
export const updateReminderEmailAPI = (reminderEmail) =>
  api.patch("/auth/reminder-email", { reminderEmail }).then((r) => r.data);
