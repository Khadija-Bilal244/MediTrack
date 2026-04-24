export class IMedicationRepository {
  async findByUserId(userId)  { throw new Error("Not implemented"); }
  async findById(id)          { throw new Error("Not implemented"); }
  async save(medication)      { throw new Error("Not implemented"); }
  async update(id, data)      { throw new Error("Not implemented"); }
  async delete(id)            { throw new Error("Not implemented"); }
  async deleteExpired()       { throw new Error("Not implemented"); }
}