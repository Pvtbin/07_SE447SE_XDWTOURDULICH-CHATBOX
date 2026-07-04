import pool from "../config/db.js";

// POST /payments -> tạo bản ghi thanh toán cho 1 booking
export const createPayment = async (req, res) => {
    try {
        const { booking_id, phuong_thuc } = req.body;

        const [bookingRows] = await pool.query(
            "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
            [booking_id, req.user.id]
        );
        if (bookingRows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }
        const booking = bookingRows[0];

        const [result] = await pool.query(
            `INSERT INTO payments (booking_id, so_tien, phuong_thuc, trang_thai)
             VALUES (?, ?, ?, 'cho_thanh_toan')`,
            [booking_id, booking.tong_tien, phuong_thuc]
        );

        let qrUrl = null;
        if (phuong_thuc === "chuyen_khoan" || phuong_thuc === "vnpay" || phuong_thuc === "momo") {
            const BANK_ID = "vietcombank";
            const ACCOUNT_NO = "1234567890";
            qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-qr_only.png?amount=${booking.tong_tien}&addInfo=${encodeURIComponent("Thanh toan don " + booking_id)}`;
        }

        res.status(201).json({
            message: "Tạo yêu cầu thanh toán thành công",
            paymentId: result.insertId,
            qrUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /payments/:id/verify (admin) -> xác nhận đã thanh toán
export const verifyPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        const [rows] = await connection.query("SELECT * FROM payments WHERE id = ?", [id]);
        if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Không tìm thấy payment" });
        }

        await connection.query(
            "UPDATE payments SET trang_thai = 'da_thanh_toan', ngay_thanh_toan = CURRENT_TIMESTAMP WHERE id = ?",
            [id]
        );
        await connection.query(
            "UPDATE bookings SET trang_thai = 'da_xac_nhan' WHERE id = ?",
            [rows[0].booking_id]
        );

        await connection.commit();
        connection.release();
        res.json({ message: "Xác nhận thanh toán thành công" });
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};

// GET /payments (admin) -> danh sách toàn bộ thanh toán
export const getAllPayments = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, b.user_id, b.tour_id, u.ho_ten, t.tieu_de
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            JOIN tours t ON b.tour_id = t.id
            ORDER BY p.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};