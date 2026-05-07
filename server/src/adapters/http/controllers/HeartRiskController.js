import { PredictHeartRiskUseCase }    from "../../../application/usecases/heartRisk/PredictHeartRiskUseCase.js";
import { GetHeartRiskHistoryUseCase } from "../../../application/usecases/heartRisk/GetHeartRiskHistoryUseCase.js";
import { MongoHeartRiskRepository }   from "../../db/repositories/MongoHeartRiskRepository.js";
import { HeartRiskMLService }         from "../middleware/HeartRiskMLService.js";

const repo      = new MongoHeartRiskRepository();
const mlService = new HeartRiskMLService();

/**
 * POST /api/heart-risk/predict
 *
 * Body: all 15 clinical inputs (see PredictHeartRiskUseCase for full list)
 * Returns the saved HeartRiskAssessment document.
 */
export const predictHeartRisk = async (req, res) => {
  try {
    const useCase = new PredictHeartRiskUseCase(repo, mlService);
    const result  = await useCase.execute({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    const status = err.statusCode || (err.message.includes("unreachable") ? 503 : 500);
    res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/heart-risk/history
 *
 * Returns all past assessments for the authenticated user, newest first.
 */
export const getHeartRiskHistory = async (req, res) => {
  try {
    const useCase = new GetHeartRiskHistoryUseCase(repo);
    const history = await useCase.execute({ userId: req.user.id });

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/heart-risk/latest
 *
 * Returns only the most-recent assessment (or null).
 * Useful for the Reports page summary card.
 */
export const getLatestHeartRisk = async (req, res) => {
  try {
    const latest = await repo.findLatestByUserId(req.user.id);
    res.status(200).json({ success: true, data: latest || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
