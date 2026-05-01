import cron            from "node-cron";
import MedicationModel   from "../adapters/db/models/MedicationModel.js";
import AdherenceLogModel from "../adapters/db/models/AdherenceLogModel.js";

/** Return "YYYY-MM-DD" for a Date object in Karachi local time */
const toKarachiDateStr = (date) => {
  const local = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  return (
    local.getFullYear() + "-" +
    String(local.getMonth() + 1).padStart(2, "0") + "-" +
    String(local.getDate()).padStart(2, "0")
  );
};

/**
 * Parse a time string like "02:00 PM" and return a Date representing
 * that time TODAY in Karachi timezone.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// Every minute — mark overdue meds as missed directly in DB (server-side)
// This runs regardless of whether any user is logged in.
// ─────────────────────────────────────────────────────────────────────────────
const markOverdueMissed = async () => {
  try {
    const now      = new Date();
    const todayStr = toKarachiDateStr(now);

    const meds = await MedicationModel.find({ taken: false, missed: false });

    for (const med of meds) {
      const dueAt   = parseMedTimeKarachi(med.time);
      const diffMin = (now - dueAt) / 60000;

      if (diffMin < 30) continue;

      await MedicationModel.findByIdAndUpdate(med._id, { missed: true });

      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: todayStr },
          {
            userId:  med.userId,
            medId:   med._id,
            medName: med.name,
            date:    todayStr,
            taken:   false,
            missed:  true,
          },
          { upsert: true, new: true }
        );
      } catch (e) {}

      console.log(`💊 Marked missed (server-side): ${med.name} for user ${med.userId}`);
    }
  } catch (err) {
    console.error("markOverdueMissed error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Midnight — log yesterday, reset meds for new day, delete expired
// ─────────────────────────────────────────────────────────────────────────────
const midnightReset = async () => {
  console.log("⏰ Midnight reset running...");
  try {
    const nowKarachi  = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
    const todayStr    = toKarachiDateStr(nowKarachi);

    const yestKarachi = new Date(nowKarachi);
    yestKarachi.setDate(yestKarachi.getDate() - 1);
    const yesterdayStr = toKarachiDateStr(yestKarachi);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allMeds = await MedicationModel.find({});

    // Log yesterday for every med — taken as-is, not taken = missed
    for (const med of allMeds) {
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: yesterdayStr },
          {
            userId:  med.userId,
            medId:   med._id,
            medName: med.name,
            date:    yesterdayStr,
            taken:   med.taken,
            missed:  !med.taken,
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    // Reset ALL medications for the new day
    const resetResult = await MedicationModel.updateMany(
      {},
      { $set: { taken: false, missed: false } }
    );
    console.log(`✅ Reset ${resetResult.modifiedCount} medications`);

    // Delete expired meds
    const nonOngoing = await MedicationModel.find({
      ongoing:      false,
      durationDays: { $ne: null },
    });

    const expired = nonOngoing.filter(med => {
      const start = new Date(med.startDate);
      start.setHours(0, 0, 0, 0);
      const expiry = new Date(start);
      expiry.setDate(expiry.getDate() + med.durationDays);
      return today >= expiry;
    });

    for (const med of expired) {
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: med.userId, medId: med._id, date: todayStr },
          {
            userId:  med.userId,
            medId:   med._id,
            medName: med.name,
            date:    todayStr,
            taken:   med.taken,
            missed:  !med.taken,
          },
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
  // Every minute — mark any overdue meds as missed server-side (no client needed)
  cron.schedule("* * * * *", markOverdueMissed);

  // Midnight Karachi — log yesterday, reset for new day
  cron.schedule("0 0 * * *", midnightReset, {
    timezone: "Asia/Karachi",
  });

  console.log("📅 Scheduler started — overdue checker every minute, midnight reset at 00:00 Asia/Karachi");
};