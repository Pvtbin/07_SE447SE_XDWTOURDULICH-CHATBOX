import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const login = async (req, res) => {
    try {
        const { email, mat_khau } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                message: "Sai email hoặc mật khẩu"
            });
        }

        const user = rows[0];

        const checkPass = mat_khau === user.mat_khau;

        if (!checkPass) {
            return res.status(400).json({
                message: "Sai email hoặc mật khẩu"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.vai_tro
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Đăng nhập thành công",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { ho_ten, email, mat_khau } = req.body;

        const [exist] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (exist.length > 0) {
            return res.status(400).json({
                message: "Email đã tồn tại"
            });
        }

        await pool.query(
            `INSERT INTO users
            (ho_ten, email, mat_khau)
            VALUES (?, ?, ?)`,
            [ho_ten, email, mat_khau]
        );

        res.json({
            message: "Đăng ký thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};