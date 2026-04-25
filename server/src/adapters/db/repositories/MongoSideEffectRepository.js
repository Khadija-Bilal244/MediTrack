import SideEffectModel from "../models/SideEffectModel.js";

export class MongoSideEffectRepository {
  async findByUserId(userId) {
    return await SideEffectModel.find({ userId }).sort({ createdAt: -1 });
  }

  async save(sideEffect) {
    return await SideEffectModel.create({
      userId:   sideEffect.userId,
      med:      sideEffect.med,
      effect:   sideEffect.effect,
      severity: sideEffect.severity,
      date:     sideEffect.date,
    });
  }

  async delete(id) {
    return await SideEffectModel.findByIdAndDelete(id);
  }
}