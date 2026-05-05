import api from "./axiosInstance";

export const getMedicationsAPI    = async ()          => (await api.get("/medications")).data;
export const addMedicationAPI     = async (data)      => (await api.post("/medications", data)).data;
export const removeMedicationAPI  = async (id)        => (await api.delete(`/medications/${id}`)).data;
export const markTakenAPI         = async (id, taken) => (await api.patch(`/medications/${id}/taken`, { taken })).data;
export const autoMarkMissedAPI    = async ()          => (await api.post("/medications/auto-miss")).data;
export const getPatientReportsAPI = async ()          => (await api.get("/medications/reports")).data;