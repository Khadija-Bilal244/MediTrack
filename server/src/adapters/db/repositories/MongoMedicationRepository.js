import MedicationModel   from "../models/MedicationModel.js";
import AdherenceLogModel from "../models/AdherenceLogModel.js";

/** Always produce "YYYY-MM-DD" in Karachi local time — same as the scheduler */
const toKarachiDateStr = (date = new Date()) => {
  const local = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
  return (
    local.getFullYear() + "-" +
    String(local.getMonth() + 1).padStart(2, "0") + "-" +
    String(local.getDate()).padStart(2, "0")
  );
};

export class MongoMedicationRepository {

  async findByUserId(userId) {
    return await MedicationModel.find({ userId });
  }

  async findById(id) {
    return await MedicationModel.findById(id);
  }

  async save(medication) {
    return await MedicationModel.create({
      userId:       medication.userId,
      name:         medication.name,
      dosage:       medication.dosage,
      time:         medication.time,
      durationDays: medication.durationDays,
      ongoing:      medication.ongoing,
      startDate:    medication.startDate,
      notes:        medication.notes,
      taken:        medication.taken,
      missed:       medication.missed,
      color:        medication.color,
    });
  }

  async update(id, data) {
    const updated = await MedicationModel.findByIdAndUpdate(id, data, { new: true });

    // When marking as taken — update the adherence log for today (Karachi date)
    if (updated && data.taken !== undefined) {
      const todayStr = toKarachiDateStr();
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId: updated.userId, medId: updated._id, date: todayStr },
          {
            userId:  updated.userId,
            medId:   updated._id,
            medName: updated.name,
            date:    todayStr,
            taken:   updated.taken,
            missed:  updated.taken ? false : updated.missed,
          },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.error("Adherence log update error:", e.message);
      }
    }

    return updated;
  }

  async delete(id) {
    return await MedicationModel.findByIdAndDelete(id);
  }

  async deleteExpired() {
    const todayStr = toKarachiDateStr();

    // For expiry comparison we still need a plain midnight Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meds    = await MedicationModel.find({ ongoing: false, durationDays: { $ne: null } });
    const expired = meds.filter(med => {
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
    }

    return expired;
  }

  // Past 7 days — today excluded, all dates in Karachi time
  async getAdherenceLast7Days(userId) {
    // Build the 7 date strings in Karachi time so they match stored log dates
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      // Go back (7 - i) days: gives offsets -7, -6, -5, -4, -3, -2, -1
      d.setDate(d.getDate() - (7 - i));
      const dateStr = toKarachiDateStr(d);
      return {
        day:    new Date(d.toLocaleString("en-US", { timeZone: "Asia/Karachi" }))
                  .toLocaleDateString("en-US", { weekday: "short" }),
        date:   dateStr,
        taken:  0,
        missed: 0,
      };
    });

    const oldestDateStr    = past7Days[0].date;
    const yesterdayDateStr = past7Days[6].date;

    // Fetch logs whose date string falls in [oldest, yesterday] — today excluded
    const logs = await AdherenceLogModel.find({
      userId,
      date: { $gte: oldestDateStr, $lte: yesterdayDateStr },
    });

    logs.forEach(log => {
      const entry = past7Days.find(d => d.date === log.date);
      if (entry) {
        if (log.taken)  entry.taken  += 1;
        if (log.missed) entry.missed += 1;
      }
    });

    return past7Days;
  }
}
