import UserModel from "../models/UserModel.js";

export class MongoUserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    return await UserModel.findById(id);
  }

  async save(user) {
    const created = await UserModel.create({
      firstName:    user.firstName,
      lastName:     user.lastName,
      email:        user.email,
      passwordHash: user.passwordHash,
      age:          user.age,
      gender:       user.gender,
      role:         user.role,
    });
    return created;
  }

  async update(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}