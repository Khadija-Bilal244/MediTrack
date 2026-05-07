import HeartRiskModel from "../models/HeartRiskModel.js";

export class MongoHeartRiskRepository {
  async save(assessment) {
    return await HeartRiskModel.create({
      userId:          assessment.userId,
      male:            assessment.male,
      age:             assessment.age,
      education:       assessment.education,
      currentSmoker:   assessment.currentSmoker,
      cigsPerDay:      assessment.cigsPerDay,
      BPMeds:          assessment.BPMeds,
      prevalentStroke: assessment.prevalentStroke,
      prevalentHyp:    assessment.prevalentHyp,
      diabetes:        assessment.diabetes,
      totChol:         assessment.totChol,
      sysBP:           assessment.sysBP,
      diaBP:           assessment.diaBP,
      BMI:             assessment.BMI,
      heartRate:       assessment.heartRate,
      glucose:         assessment.glucose,
      risk:            assessment.risk,
      label:           assessment.label,
      probability:     assessment.probability,
    });
  }

  async findByUserId(userId) {
    return await HeartRiskModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findLatestByUserId(userId) {
    return await HeartRiskModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}
