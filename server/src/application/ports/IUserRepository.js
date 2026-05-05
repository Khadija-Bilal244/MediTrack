// Interface — MongoUserRepository must implement all these methods
export class IUserRepository {
  async findByEmail(email)    { throw new Error("Not implemented"); }
  async findById(id)          { throw new Error("Not implemented"); }
  async save(user)            { throw new Error("Not implemented"); }
  async update(id, data)      { throw new Error("Not implemented"); }
}