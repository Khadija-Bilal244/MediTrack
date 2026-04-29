import { AddMedicationUseCase }      from "../../../application/usecases/medications/AddMedicationUseCase.js";
import { RemoveMedicationUseCase }   from "../../../application/usecases/medications/RemoveMedicationUseCase.js";
import { MarkTakenUseCase }          from "../../../application/usecases/medications/MarkTakenUseCase.js";
import { MongoMedicationRepository } from "../../db/repositories/MongoMedicationRepository.js";
import { MongoSideEffectRepository } from "../../db/repositories/MongoSideEffectRepository.js";
import MedicationModel   from "../../db/models/MedicationModel.js";
import AdherenceLogModel from "../../db/models/AdherenceLogModel.js";

const repo        = new MongoMedicationRepository();
const sideEffRepo = new MongoSideEffectRepository();

const parseMedTime = (timeStr) => {
  if (!timeStr) return new Date();
  const parts  = timeStr.trim().split(" ");
  const [timePart, period] = parts;
  let [hours, minutes] = timePart.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const getMedications = async (req, res) => {
  try {
    const meds = await repo.findByUserId(req.user.id);
    res.status(200).json({ success: true, data: meds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addMedication = async (req, res) => {
  try {
    const useCase = new AddMedicationUseCase(repo);
    const med     = await useCase.execute({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: med });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const removeMedication = async (req, res) => {
  try {
    const useCase = new RemoveMedicationUseCase(repo);
    const result  = await useCase.execute({ medicationId: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const markTaken = async (req, res) => {
  try {
    const useCase = new MarkTakenUseCase(repo);
    const updated = await useCase.execute({
      medicationId: req.params.id,
      userId:       req.user.id,
      taken:        req.body.taken,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const deleteExpired = async (req, res) => {
  try {
    const removed = await repo.deleteExpired();
    res.status(200).json({ success: true, removed: removed.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Called once on app load — marks overdue meds as missed in DB
export const autoMarkMissed = async (req, res) => {
  try {
    const userId = req.user.id;
    const now    = new Date();

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayStr = todayMidnight.toISOString().split("T")[0];

    // Only meds not yet marked as taken or missed
    const meds   = await MedicationModel.find({ userId, taken: false, missed: false });
    const toMiss = meds.filter(med => {
      const dueAt   = parseMedTime(med.time);
      const diffMin = (now - dueAt) / 60000;
      // Only miss if 30+ min overdue AND due time hasn't crossed midnight
      // i.e. dueAt is earlier today, not a future time
      return diffMin >= 30 && dueAt <= now;
    });

    for (const med of toMiss) {
      await MedicationModel.findByIdAndUpdate(med._id, { missed: true });
      try {
        await AdherenceLogModel.findOneAndUpdate(
          { userId, medId: med._id, date: todayStr },
          { userId, medId: med._id, medName: med.name, date: todayStr, taken: false, missed: true },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    const updatedMeds = await MedicationModel.find({ userId });
    res.status(200).json({ success: true, missed: toMiss.length, data: updatedMeds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const userId      = req.user.id;
    const meds        = await repo.findByUserId(userId);
    const sideEffects = await sideEffRepo.findByUserId(userId);
    const last7Days   = await repo.getAdherenceLast7Days(userId);

    const todayTaken  = meds.filter(m => m.taken).length;
    const todayMissed = meds.filter(m => m.missed).length;
    const todayTotal  = meds.length;
    const todayRate   = todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0;

    const weekTaken  = last7Days.reduce((s, d) => s + d.taken,  0);
    const weekMissed = last7Days.reduce((s, d) => s + d.missed, 0);
    const weekTotal  = weekTaken + weekMissed;
    const weekRate   = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;

    res.status(200).json({
      success: true,
      reports: {
        todayRate, todayTaken, todayMissed, todayTotal,
        weekRate, weekTaken, weekMissed,
        last7Days, sideEffects,
        totalMeds:       meds.length,
        ongoingMeds:     meds.filter(m => m.ongoing).length,
        sideEffectCount: sideEffects.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};