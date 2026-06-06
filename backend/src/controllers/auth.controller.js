import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

// ==================== CHỨC NĂNG ĐĂNG KÝ ====================
export const register = async (req, res) => {
    try {
        const { ho_ten, email, mat_khau, vai_tro } = req.body;

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
            [ho_ten, email, hashedPassword, vai_tro] // Mặc định tài khoản mới 
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

        // 1. Kiểm tra đầu vào
        if (!email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ email và mật khẩu!"
            });
        }

        // 2. Tìm người dùng trong DB bằng email
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // Nếu mảng rỗng nghĩa là không tìm thấy email này
        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        const user = rows[0];

        // 3. BẢO MẬT: So sánh mật khẩu thô vừa gõ với mật khẩu đã mã hóa trong DB
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Email hoặc mật khẩu không chính xác!"
            });
        }

        // 4. QUẢN LÝ PHIÊN: Tạo token thông hành JWT (Hạn dùng 1 ngày)
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(
            {
                id: user.id,
                vai_tro: user.vai_tro // Lưu vai trò vào token để sau này phân quyền (admin/user)
            },
            secretKey,
            { expiresIn: "1d" }
        );

        // 5. Đăng nhập thành công, trả về token và thông tin cơ bản (giấu mật khẩu đi)
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.id,
                ho_ten: user.ho_ten,
                email: user.email,
                vai_tro: user.vai_tro
            }
        });

    } catch (error) {
        console.error("Lỗi Đăng nhập:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi hệ thống khi đăng nhập!",
            error: error.message
        });
    }
};