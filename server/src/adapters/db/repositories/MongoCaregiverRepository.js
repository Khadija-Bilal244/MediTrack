import CaregiverModel from "../models/CaregiverModel.js";

export class MongoCaregiverRepository {
  async findByPatientId(patientId) {
    return await CaregiverModel.find({ patientId });
  }

  async findByEmail(email) {
    return await CaregiverModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    return await CaregiverModel.findById(id);
  }

  async save(caregiver) {
    return await CaregiverModel.create({
      patientId:    caregiver.patientId,
      name:         caregiver.name,
      email:        caregiver.email,
      passwordHash: caregiver.passwordHash,
      role:         caregiver.role,
    });
  }

  async delete(id) {
    return await CaregiverModel.findByIdAndDelete(id);
  }
}
