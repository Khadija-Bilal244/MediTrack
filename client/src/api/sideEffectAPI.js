import api from "./axiosInstance";

export const getSideEffectsAPI = async () => {
  const res = await api.get("/sideeffects");
  return res.data;
};

export const logSideEffectAPI = async (data) => {
  const res = await api.post("/sideeffects", data);
  return res.data;
};

export const deleteSideEffectAPI = async (id) => {
  const res = await api.delete(`/sideeffects/${id}`);
  return res.data;
};