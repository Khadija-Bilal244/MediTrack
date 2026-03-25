import api from "./axiosInstance";

export const registerAPI = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginAPI = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
