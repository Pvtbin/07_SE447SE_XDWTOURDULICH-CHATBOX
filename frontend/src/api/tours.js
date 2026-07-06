import axios from "axios";
import axiosClient, { BACKEND_ORIGIN } from "./axiosClient";

export const getToursApi = () => axiosClient.get("/tours");
export const getTourByIdApi = (id) => axiosClient.get(`/tours/${id}`);
export const createTourApi = (data) => axiosClient.post("/tours", data);
export const updateTourApi = (id, data) => axiosClient.put(`/tours/${id}`, data);
export const deleteTourApi = (id) => axiosClient.delete(`/tours/${id}`);

// Upload ảnh: dùng axios gốc (không phải axiosClient) để tránh bị ép Content-Type: application/json
// làm hỏng boundary của multipart/form-data
export const uploadTourImageApi = (tourId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axios.post(`${BACKEND_ORIGIN}/api/tours/${tourId}/images`, formData, {
    withCredentials: true,
  });
};

export const deleteTourImageApi = (imageId) => axiosClient.delete(`/tours/images/${imageId}`);
export const setThumbnailImageApi = (imageId) => axiosClient.put(`/tours/images/${imageId}/thumbnail`);