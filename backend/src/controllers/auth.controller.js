import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

// ==================== ĐĂNG KÝ ====================
export const register = async (req, res) => {
    try {
        const { ho_ten, email, mat_khau } = req.body;

        if (!ho_ten || !email || !mat_khau) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu!"
            });
        }

        const [exist] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (exist.length > 0) {
            return res.status(400).json({ success: false, message: "Email này đã tồn tại trên hệ thống!" });
        }

        const hashedPassword = await bcrypt.hash(mat_khau, 10);

        await pool.query(
            `INSERT INTO users (ho_ten, email, mat_khau, vai_tro) VALUES (?, ?, ?, ?)`,
            [ho_ten, email, hashedPassword, "user"]
        );

        return res.status(201).json({ success: true, message: "Đăng ký tài khoản thành công!" });

    } catch (error) {
        console.error("Lỗi Đăng ký:", error);
        return res.status(500).json({ success: false, message: "Đã xảy ra lỗi hệ thống khi đăng ký!", error: error.message });
    }
};

// ==================== ĐĂNG NHẬP ====================
export const login = async (req, res) => {
    try {
        const { email, mat_khau } = req.body;

        if (!email || !mat_khau) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ email và mật khẩu!" });
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác!" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác!" });
        }

        const secretKey = process.env.JWT_SECRET || "chuoi_bi_mat_du_phong_sieu_bao_mat_123";
        const token = jwt.sign({ id: user.id, vai_tro: user.vai_tro }, secretKey, { expiresIn: "1d" });

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

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

// ==================== LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP (MỚI) ====================
// Cần authMiddleware chạy trước để có req.user (đọc từ cookie accessToken)
export const getMe = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, ho_ten, email, vai_tro FROM users WHERE id = ?",
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json({ success: true, user: rows[0] });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ĐĂNG XUẤT ====================
export const logout = async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    });

    return res.status(200).json({ success: true, message: "Đăng xuất thành công!" });
};
