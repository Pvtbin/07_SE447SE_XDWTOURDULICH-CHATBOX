// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";


// 1. Import các tuyến đường (Routes) của bạn
import tourRouter from "./routes/tour.routes.js";
import authRouter from "./routes/auth.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import reviewRouter from "./routes/review.routes.js";
import chatbot from "./routes/chatbot.routes.js";
import PaymentPage from "./routes/payment.routes.js";

const app = express();

// Cấu hình CORS bảo mật và cho phép nhận Cookie từ Front-end (Vite)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Giúp express hiểu và đọc được request body dưới dạng Json
app.use(express.json());
app.use(cookieParser());

// 2. Gắn kết các Router vào ứng dụng với tiền tố /api đúng chuẩn RESTful
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/api/auth", authRouter);
app.use("/api/tours", tourRouter); // Đường dẫn lấy tour của chúng ta sẽ là GET /api/tours
app.use("/api/bookings", bookingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/chatbot", chatbot);
app.use("/api/payments", PaymentPage);


// 3. Dự phòng một Router xử lý lỗi 404 nếu Front-end gọi sai Link API
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy đường dẫn API này!" });
});

export default app;