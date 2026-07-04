import axiosClient from "./axiosClient";

export const getToursApi = () => axiosClient.get("/tours");
export const getTourByIdApi = (id) => axiosClient.get(`/tours/${id}`);
export const createTourApi = (data) => axiosClient.post("/tours", data);
export const updateTourApi = (id, data) => axiosClient.put(`/tours/${id}`, data);
export const deleteTourApi = (id) => axiosClient.delete(`/tours/${id}`);
