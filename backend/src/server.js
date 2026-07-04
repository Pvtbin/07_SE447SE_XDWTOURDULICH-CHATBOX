import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8080;

// Khởi động kết nối DB trước, thành công mới mở cổng lắng nghe
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server đang vận hành mượt mà trên cổng: ${PORT}`);
    });
}).catch(error => {
    console.error("Thất bại khi khởi động hệ thống do lỗi DB:", error);
});