import api from "./axiosInstance";

export const getCaregiversAPI = async () => {
  const res = await api.get("/caregivers");
  return res.data;
};

export const addCaregiverAPI = async (data) => {
  const res = await api.post("/caregivers", data);
  return res.data;
};

export const removeCaregiverAPI = async (id) => {
  const res = await api.delete(`/caregivers/${id}`);
  return res.data;
};

export const getPatientDataAPI = async () => {
  const res = await api.get("/caregivers/patient-data");
  return res.data;
};

export const getPatientReportsAPI = async () => {
  const res = await api.get("/caregivers/patient-reports");
  return res.data;
};