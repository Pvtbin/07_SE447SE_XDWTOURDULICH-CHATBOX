import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

// ==================== CHỨC NĂNG ĐĂNG KÝ ====================
export const register = async (req, res) => {
    try {
        const { ho_ten, email, mat_khau } = req.body;

        // 1. Kiểm tra xem người dùng có nhập thiếu trường nào không
        if (!ho_ten || !email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu!"
            });
        }

        // 2. Kiểm tra xem Email này đã có ai đăng ký chưa
        const [exist] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (exist.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email này đã tồn tại trên hệ thống!"
            });
        }

        // 3. BẢO MẬT: Mã hóa mật khẩu trước khi nạp vào Database
        const saltRows = 10; // Độ an toàn tiêu chuẩn
        const hashedPassword = await bcrypt.hash(mat_khau, saltRows);

        // 4. Tiến hành lưu tài khoản mới vào DB
        await pool.query(
            `INSERT INTO users (ho_ten, email, mat_khau, vai_tro) VALUES (?, ?, ?, ?)`,
            [ho_ten, email, hashedPassword, "user"] // Mặc định tài khoản mới là user
        );

        // 5. Trả về phản hồi thành công
        return res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!"
        });

    } catch (error) {
        console.error("Lỗi Đăng ký:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi hệ thống khi đăng ký!",
            error: error.message
        });
    }
};

// ==================== CHỨC NĂNG ĐĂNG NHẬP ====================
export const login = async (req, res) => {
    try {
        const { email, mat_khau } = req.body;

        // 🛠️ ĐIỂM CẦN SỬA 1: Điền lại logic kiểm tra nhập liệu đăng nhập
        if (!email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ email và mật khẩu!"
            });
        }

        // 🛠️ ĐIỂM CẦN SỬA 2: Tìm user trong database và so sánh mật khẩu thực tế
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        const user = rows[0]; // Gán dữ liệu cơ sở dữ liệu vào biến user để dùng phía dưới

        // So sánh mật khẩu mã hóa
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        // --- ĐOẠN ĐÚT COOKIE BẢO MẬT CỦA BẠN SẼ CHẠY SAU KHI ĐÃ CHECK USER THÀNH CÔNG ---
        const secretKey = process.env.JWT_SECRET || "chuoi_bi_mat_du_phong_sieu_bao_mat_123";
        
        // 1. Tạo Token chứa id và vai_tro
        const token = jwt.sign(
            { id: user.id, vai_tro: user.vai_tro },
            secretKey,
            { expiresIn: "1d" }
        );

        // 2. BẢO MẬT: Đút token vào HttpOnly Cookie gửi về trình duyệt
        res.cookie("accessToken", token, {
            httpOnly: true,     // 🔒 Chống mã độc XSS ăn cắp token
            secure: false,      // Chạy localhost thì để false (khi deploy HTTPS thì để true)
            sameSite: "strict", // Chống tấn công CSRF
            maxAge: 24 * 60 * 60 * 1000 // Hết hạn sau 1 ngày
        });

        // 3. Trả về thông tin user thành công (Không chứa token lộ ra ngoài)
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công bằng Cookie bảo mật!",
            user: {
                id: user.id,
                ho_ten: user.ho_ten,
                email: user.email,
                vai_tro: user.vai_tro
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== CHỨC NĂNG ĐĂNG XUẤT ====================
export const logout = async (req, res) => {
    // Thêm các thuộc tính cấu hình giống y hệt lúc tạo để trình duyệt định vị và xóa sạch cookie
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false, // Để false giống bên hàm login đang chạy localhost
        sameSite: "strict"
    });
    
    return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công!"
    });
};