import axiosClient from "./axiosClient";

// Bookings
export const createBookingApi = (data) => axiosClient.post("/bookings", data);
export const getMyBookingsApi = () => axiosClient.get("/bookings/my");
export const getAllBookingsApi = () => axiosClient.get("/bookings");
export const updateBookingStatusApi = (id, trang_thai) =>
  axiosClient.put(`/bookings/${id}/status`, { trang_thai });
export const cancelBookingApi = (id, ly_do) =>
  axiosClient.post(`/bookings/${id}/cancel`, { ly_do });

// Refunds (admin)
export const getRefundsApi = () => axiosClient.get("/bookings/refunds");
export const processRefundApi = (id, status, ghi_chu) =>
  axiosClient.put(`/bookings/refunds/${id}`, { status, ghi_chu });

// Payments
export const createPaymentApi = (data) => axiosClient.post("/payments", data);
export const verifyPaymentApi = (id) => axiosClient.put(`/payments/${id}/verify`);
export const getAllPaymentsApi = () => axiosClient.get("/payments");

// Reviews
export const createReviewApi = (data) => axiosClient.post("/reviews", data);
export const getReviewsByTourApi = (tourId) => axiosClient.get(`/reviews/tour/${tourId}`);

// Dashboard
export const getDashboardApi = () => axiosClient.get("/dashboard");
