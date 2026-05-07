import api from "./axiosInstance";

/**
 * POST /api/heart-risk/predict
 * @param {object} inputs  — all 15 clinical fields
 */
export const predictHeartRiskAPI = (inputs) =>
  api.post("/heart-risk/predict", inputs).then((r) => r.data);

/**
 * GET /api/heart-risk/history
 * Returns all past assessments for the current user, newest first.
 */
export const getHeartRiskHistoryAPI = () =>
  api.get("/heart-risk/history").then((r) => r.data);

/**
 * GET /api/heart-risk/latest
 * Returns the single most-recent assessment (or null).
 */
export const getLatestHeartRiskAPI = () =>
  api.get("/heart-risk/latest").then((r) => r.data);
