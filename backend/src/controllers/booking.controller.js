import pool from "../config/db.js";

// POST /bookings -> đặt tour, có trừ so_cho_con_lai (dùng transaction để tránh overbooking)
export const createBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { tour_id, so_nguoi_dat } = req.body;

        if (!tour_id || !so_nguoi_dat || so_nguoi_dat < 1) {
            connection.release();
            return res.status(400).json({ message: "Thiếu tour_id hoặc số người đặt không hợp lệ" });
        }

        await connection.beginTransaction();

        // Khoá dòng tour lại để tránh 2 người đặt cùng lúc vượt quá số chỗ còn lại
        const [tourRows] = await connection.query(
            "SELECT * FROM tours WHERE id = ? FOR UPDATE",
            [tour_id]
        );

        if (tourRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Không tìm thấy tour" });
        }

        const tour = tourRows[0];

        if (tour.so_cho_con_lai < so_nguoi_dat) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: `Chỉ còn ${tour.so_cho_con_lai} chỗ trống` });
        }

        const tong_tien = tour.gia * so_nguoi_dat;

        // --- ĐOẠN ĐÃ THAY ĐỔI THEO YÊU CẦU ---
        await connection.query(
            `INSERT INTO bookings (user_id, tour_id, so_nguoi_dat, tong_tien)
             VALUES (?, ?, ?, ?)`,
            [req.user.id, tour_id, so_nguoi_dat, tong_tien]
        );

        const [[{ bookingId }]] = await connection.query("SELECT LAST_INSERT_ID() AS bookingId");

        await connection.query(
            "UPDATE tours SET so_cho_con_lai = so_cho_con_lai - ? WHERE id = ?",
            [so_nguoi_dat, tour_id]
        );

        await connection.commit();
        connection.release();

        res.json({ message: "Đặt tour thành công", bookingId, tong_tien, tour_id });
        // -------------------------------------

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};

// GET /bookings/my-bookings -> lịch sử đặt tour của user, JOIN sang tours để có tên tour
export const myBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT b.*, t.tieu_de, t.dia_diem
             FROM bookings b
             JOIN tours t ON b.tour_id = t.id
             WHERE b.user_id = ?
             ORDER BY b.ngay_tao DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /bookings (admin) -> toàn bộ booking, JOIN users + tours
export const getAllBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, u.ho_ten, u.email, t.tieu_de
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN tours t ON b.tour_id = t.id
            ORDER BY b.ngay_tao DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /bookings/:id (admin) -> duyệt / huỷ booking
// Nếu huỷ (da_huy) thì trả lại chỗ cho tour
export const updateBookingStatus = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { trang_thai } = req.body;

        await connection.beginTransaction();

        const [rows] = await connection.query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }

        const booking = rows[0];

        // Nếu chuyển từ trạng thái khác sang "đã huỷ" thì trả lại chỗ trống cho tour
        if (trang_thai === "da_huy" && booking.trang_thai !== "da_huy") {
            await connection.query(
                "UPDATE tours SET so_cho_con_lai = so_cho_con_lai + ? WHERE id = ?",
                [booking.so_nguoi_dat, booking.tour_id]
            );
        }

        await connection.query(
            "UPDATE bookings SET trang_thai = ? WHERE id = ?",
            [trang_thai, id]
        );

        await connection.commit();
        connection.release();

        res.json({ message: "Cập nhật thành công" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
}