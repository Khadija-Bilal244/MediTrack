import jwt from "jsonwebtoken";
import { RegisterUseCase } from "../../../application/usecases/auth/RegisterUseCase.js";
import { LoginUseCase }    from "../../../application/usecases/auth/LoginUseCase.js";
import { MongoUserRepository }      from "../../db/repositories/MongoUserRepository.js";
import { MongoCaregiverRepository } from "../../db/repositories/MongoCaregiverRepository.js";

const userRepo      = new MongoUserRepository();
const caregiverRepo = new MongoCaregiverRepository();

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res) => {
  try {
    const useCase = new RegisterUseCase(userRepo);
    const user    = await useCase.execute(req.body);
    const token   = signToken({ id: user._id, email: user.email, role: "patient" });
    res.status(201).json({
      success: true,
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        age:       user.age,
        gender:    user.gender,
        role:      "patient",
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const useCase = new LoginUseCase(userRepo, caregiverRepo);
    const account = await useCase.execute(req.body);
    const token   = signToken({ id: account._id, email: account.email, role: account.role });

    // Patient login — return full profile
    if (account.role === "patient") {
      return res.status(200).json({
        success: true,
        token,
        user: {
          id:        account._id,
          firstName: account.firstName,
          lastName:  account.lastName,
          email:     account.email,
          age:       account.age,
          gender:    account.gender,
          role:      "patient",
        },
      });
    }

    // Caregiver login
    return res.status(200).json({
      success: true,
      token,
      user: {
        id:        account._id,
        name:      account.name,
        email:     account.email,
        role:      "caregiver",
        patientId: account.patientId,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
