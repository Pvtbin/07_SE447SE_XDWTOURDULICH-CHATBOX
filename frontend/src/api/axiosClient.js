import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // bắt buộc để gửi cookie httpOnly accessToken
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động chuyển về trang login nếu bị 401 (token hết hạn/không hợp lệ)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/dang-nhap") {
      window.location.href = "/dang-nhap";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
