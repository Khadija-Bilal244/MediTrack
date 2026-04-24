export class ISideEffectRepository {
  async findByUserId(userId)  { throw new Error("Not implemented"); }
  async save(sideEffect)      { throw new Error("Not implemented"); }
  async delete(id)            { throw new Error("Not implemented"); }
}