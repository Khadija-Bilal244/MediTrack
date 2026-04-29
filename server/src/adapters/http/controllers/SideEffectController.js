import { LogSideEffectUseCase }      from "../../../application/usecases/sideEffects/LogSideEffectUseCase.js";
import { MongoSideEffectRepository } from "../../db/repositories/MongoSideEffectRepository.js";

const repo = new MongoSideEffectRepository();

export const getSideEffects = async (req, res) => {
  try {
    const list = await repo.findByUserId(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logSideEffect = async (req, res) => {
  try {
    const useCase = new LogSideEffectUseCase(repo);
    const saved   = await useCase.execute({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const deleteSideEffect = async (req, res) => {
  try {
    await repo.delete(req.params.id);
    res.status(200).json({ success: true, message: "Side effect deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
