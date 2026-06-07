import jwt from "jsonwebtoken";
import pool from "../config/db.js"; // Import cấu hình pool MySQL của bạn

// authorization - xác minh user là ai
export const verifyToken = async (req, res, next) => {
    try {
        // 1. LẤY TOKEN TỪ COOKIE (Thay vì lấy từ headers như bài mẫu)
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!"
            });
        }

        // 2. XÁC NHẬN TOKEN HỢP LỆ (Dùng biến mã bí mật của bạn)
        const secretKey = process.env.JWT_SECRET || "chuoi_bi_mat_du_phong_sieu_bao_mat_123";
        
        // Giải mã token (hàm jwt.verify dạng đồng bộ hoặc bọc trong Promise)
        const decodedUser = jwt.verify(token, secretKey);

        // 3. TÌM USER TRONG DATABASE MYSQL (Thay vì dùng User.findById của MongoDB)
        // Lưu ý: Lúc login bạn giấu user.id vào token, nên giờ ta lấy decodedUser.id để truy vấn
        const [rows] = await pool.query(
            "SELECT id, ho_ten, email, vai_tro FROM users WHERE id = ?", 
            [decodedUser.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại trên hệ thống!"
            });
        }

        const user = rows[0];

        // 4. TRẢ USER VỀ TRONG REQ để các hàm sau (như kiểm tra Admin, viết Review) sử dụng
        req.user = user;
        
        next(); // Cho qua cửa!

    } catch (error) {
        console.error("Lỗi khi xác minh JWT trong authMiddleware:", error);
        
        // Bắt lỗi nếu token hết hạn hoặc bị sửa đổi
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ success: false, message: "Access token hết hạn!" });
        }
        
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc không đúng!"
        });
    }
};