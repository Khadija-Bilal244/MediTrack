import cron              from "node-cron";
import MedicationModel   from "../adapters/db/models/MedicationModel.js";
import AdherenceLogModel from "../adapters/db/models/AdherenceLogModel.js";
import UserModel         from "../adapters/db/models/UserModel.js";
import { sendReminderEmail } from "./emailService.js";

/** Return "YYYY-MM-DD" for a Date object in Karachi local time */
const toKarachiDateStr = (date) => {
  const local = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  return (
    local.getFullYear() + "-" +
    String(local.getMonth() + 1).padStart(2, "0") + "-" +
    String(local.getDate()).padStart(2, "0")
  );
};

const parseMedTimeKarachi = (timeStr) => {
  if (!timeStr) return new Date();
  const [timePart, period] = timeStr.trim().split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const nowKarachi = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  const pad = (n) => String(n).padStart(2, "0");
  const isoStr = `${nowKarachi.getFullYear()}-${pad(nowKarachi.getMonth() + 1)}-${pad(nowKarachi.getDate())}T${pad(hours)}:${pad(minutes)}:00+05:00`;
  return new Date(isoStr);
};

// In-memory set to track which meds have already had an email sent today
// Key: "<medId>-<YYYY-MM-DD>"  — cleared automatically at midnight reset
const emailSentToday = new Set();

// ─────────────────────────────────────────────────────────────────────────────
// Every minute — mark overdue meds as missed + send email reminders
// ─────────────────────────────────────────────────────────────────────────────
const markOverdueMissed = async () => {
  try {
    const now      = new Date();
    const todayStr = toKarachiDateStr(now);

    const meds = await MedicationModel.find({ taken: false, missed: false });

    console.log(`🔍 Scheduler tick — ${meds.length} active med(s) found`);

    // Group meds that are due (0–5 min window) and haven't been emailed yet
    const emailBatch = {};  // { userId: [med, ...] }

    for (const med of meds) {
      const dueAt   = parseMedTimeKarachi(med.time);
      const diffMin = (now - dueAt) / 60000;

      console.log(`  💊 ${med.name} | due: ${med.time} | diffMin: ${diffMin.toFixed(2)}`);

      // ── Email window: 0 to 5 minutes past due ──────────────────────────
      const sentKey = `${med._id}-${todayStr}`;
      if (diffMin >= 0 && diffMin < 5 && !emailSentToday.has(sentKey)) {
        if (!emailBatch[med.userId]) emailBatch[med.userId] = [];
        emailBatch[med.userId].push({ med, sentKey });
      }

      // ── Mark missed after 30 min ────────────────────────────────────────
      if (diffMin < 30) continue;

      await MedicationModel.findByIdAndUpdate(med._id, { missed: true });

      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: todayStr },
          { userId: med.userId, medId: med._id, medName: med.name, date: todayStr, taken: false, missed: true },
          { upsert: true, new: true }
        );
      } catch (e) {}

      console.log(`💊 Marked missed: ${med.name} for user ${med.userId}`);
    }

    // ── Send batched reminder emails ──────────────────────────────────────
    for (const [userId, entries] of Object.entries(emailBatch)) {
      try {
        const user = await UserModel.findById(userId).lean();

        console.log(`📬 Checking user ${userId} — reminderEmail: ${user?.reminderEmail || "NOT SET"}`);

        if (!user?.reminderEmail) {
          console.log(`⚠️  Skipping email — no reminderEmail set for user ${userId}`);
          continue;
        }

        await sendReminderEmail(
          user.reminderEmail,
          user.firstName,
          entries.map(({ med }) => ({ name: med.name, dosage: med.dosage, time: med.time }))
        );

        // Mark all these meds as emailed so we don't send again this minute cycle
        entries.forEach(({ sentKey }) => emailSentToday.add(sentKey));

      } catch (emailErr) {
        console.error(`📧 Email failed for user ${userId}:`, emailErr.message);
      }
    }

  } catch (err) {
    console.error("markOverdueMissed error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Midnight — log yesterday, reset meds, delete expired, clear email sent set
// ─────────────────────────────────────────────────────────────────────────────
const midnightReset = async () => {
  console.log("⏰ Midnight reset running...");

  // Clear the email-sent tracker for the new day
  emailSentToday.clear();
  console.log("📧 Email sent tracker cleared for new day");

  try {
    const nowKarachi   = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const todayStr     = toKarachiDateStr(nowKarachi);
    const yestKarachi  = new Date(nowKarachi);
    yestKarachi.setDate(yestKarachi.getDate() - 1);
    const yesterdayStr = toKarachiDateStr(yestKarachi);
    const today        = new Date(); today.setHours(0, 0, 0, 0);

    const allMeds = await MedicationModel.find({});

    for (const med of allMeds) {
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: yesterdayStr },
          { userId: med.userId, medId: med._id, medName: med.name, date: yesterdayStr, taken: med.taken, missed: !med.taken },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    const resetResult = await MedicationModel.updateMany({}, { $set: { taken: false, missed: false } });
    console.log(`✅ Reset ${resetResult.modifiedCount} medications`);

    const nonOngoing = await MedicationModel.find({ ongoing: false, durationDays: { $ne: null } });
    const expired    = nonOngoing.filter((med) => {
      const start = new Date(med.startDate); start.setHours(0, 0, 0, 0);
      const expiry = new Date(start); expiry.setDate(expiry.getDate() + med.durationDays);
      return today >= expiry;
    });

    for (const med of expired) {
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: todayStr },
          { userId: med.userId, medId: med._id, medName: med.name, date: todayStr, taken: med.taken, missed: !med.taken },
          { upsert: true, new: true }
        );
      } catch (e) {}
      await MedicationModel.findByIdAndDelete(med._id);
      console.log(`🗑 Expired: ${med.name}`);
    }

    console.log(`✅ Reset ${allMeds.length} meds, removed ${expired.length} expired`);
  } catch (err) {
    console.error("Midnight reset error:", err.message);
  }
};

export const startScheduler = () => {
  cron.schedule("* * * * *", markOverdueMissed);
  cron.schedule("0 0 * * *", midnightReset, { timezone: "Asia/Karachi" });
  console.log("📅 Scheduler started — overdue checker + email reminders every minute, midnight reset at 00:00 Asia/Karachi");
};
