import pool from "../config/db.js";

export const createBooking = async (req, res) => {
    try {
        const { tour_id, so_nguoi_dat } = req.body;

        const [tourRows] = await pool.query(
            "SELECT * FROM tours WHERE id = ?",
            [tour_id]
        );

        if (tourRows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy tour"
            });
        }

        const tour = tourRows[0];

        const tong_tien = tour.gia * so_nguoi_dat;

        await pool.query(
            `INSERT INTO bookings
            (user_id, tour_id, so_nguoi_dat, tong_tien)
            VALUES (?, ?, ?, ?)`,
            [
                req.user.id,
                tour_id,
                so_nguoi_dat,
                tong_tien
            ]
        );

        res.json({
            message: "Đặt tour thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const myBookings = async (req, res) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM bookings
         WHERE user_id = ?`,
        [req.user.id]
    );

    res.json(rows);
};
export const getAllBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *
            FROM bookings
        `);

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        await pool.query(
            `
            UPDATE bookings
            SET trang_thai = ?
            WHERE id = ?
            `,
            [trang_thai, id]
        );

        res.json({
            message: "Cập nhật thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};