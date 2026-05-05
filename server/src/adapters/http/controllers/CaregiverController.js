import { AddCaregiverUseCase }    from "../../../application/usecases/caregivers/AddCaregiverUseCase.js";
import { RemoveCaregiverUseCase } from "../../../application/usecases/caregivers/RemoveCaregiverUseCase.js";
import { MongoCaregiverRepository }  from "../../db/repositories/MongoCaregiverRepository.js";
import { MongoUserRepository }       from "../../db/repositories/MongoUserRepository.js";
import { MongoMedicationRepository } from "../../db/repositories/MongoMedicationRepository.js";
import { MongoSideEffectRepository } from "../../db/repositories/MongoSideEffectRepository.js";

const repo        = new MongoCaregiverRepository();
const userRepo    = new MongoUserRepository();
const medsRepo    = new MongoMedicationRepository();
const sideEffRepo = new MongoSideEffectRepository();

export const getCaregivers = async (req, res) => {
  try {
    const list = await repo.findByPatientId(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPatientData = async (req, res) => {
  try {
    const caregiver = await repo.findById(req.user.id);
    if (!caregiver)
      return res.status(404).json({ success: false, message: "Caregiver not found." });

    const patient = await userRepo.findById(caregiver.patientId);
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found." });

    const meds = await medsRepo.findByUserId(caregiver.patientId);

    res.status(200).json({
      success: true,
      patient: {
        id:        patient._id,
        firstName: patient.firstName,
        lastName:  patient.lastName,
        email:     patient.email,
        age:       patient.age,
        gender:    patient.gender,
      },
      medications: meds,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const caregiver = await repo.findById(req.user.id);
    if (!caregiver)
      return res.status(404).json({ success: false, message: "Caregiver not found." });

    const patientId = caregiver.patientId;

    const meds        = await medsRepo.findByUserId(patientId);
    const sideEffects = await sideEffRepo.findByUserId(patientId);

    // ── Same AdherenceLog-based calculation as patient dashboard ──
    const last7Days = await medsRepo.getAdherenceLast7Days(patientId);

    const todayTaken  = meds.filter(m => m.taken).length;
    const todayMissed = meds.filter(m => m.missed).length;
    const todayTotal  = meds.length;
    const todayRate   = todayTotal > 0
      ? Math.round((todayTaken / todayTotal) * 100)
      : 0;

    const weekTaken  = last7Days.reduce((s, d) => s + d.taken,  0);
    const weekMissed = last7Days.reduce((s, d) => s + d.missed, 0);
    const weekTotal  = weekTaken + weekMissed;
    const weekRate   = weekTotal > 0
      ? Math.round((weekTaken / weekTotal) * 100)
      : 0;

    res.status(200).json({
      success: true,
      reports: {
        todayRate,
        todayTaken,
        todayMissed,
        todayTotal,
        weekRate,
        weekTaken,
        weekMissed,
        last7Days,
        sideEffects,
        totalMeds:       meds.length,
        ongoingMeds:     meds.filter(m => m.ongoing).length,
        sideEffectCount: sideEffects.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCaregiver = async (req, res) => {
  try {
    const useCase   = new AddCaregiverUseCase(repo);
    const caregiver = await useCase.execute({ ...req.body, patientId: req.user.id });
    res.status(201).json({ success: true, data: caregiver });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const removeCaregiver = async (req, res) => {
  try {
    const useCase = new RemoveCaregiverUseCase(repo);
    const result  = await useCase.execute({ caregiverId: req.params.id });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};