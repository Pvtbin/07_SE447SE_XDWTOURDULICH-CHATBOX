import pool from "../config/db.js";
import { sendInvoiceEmail } from "../services/email.service.js";

// POST /bookings -> đặt tour
export const createBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { tour_id, so_nguoi_dat } = req.body;

        if (!tour_id || !so_nguoi_dat || so_nguoi_dat < 1) {
            connection.release();
            return res.status(400).json({ message: "Thiếu tour_id hoặc số người đặt không hợp lệ" });
        }

        await connection.beginTransaction();

        const [tourRows] = await connection.query("SELECT * FROM tours WHERE id = ? FOR UPDATE", [tour_id]);

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

        await connection.query(
            `INSERT INTO bookings (user_id, tour_id, so_nguoi_dat, tong_tien) VALUES (?, ?, ?, ?)`,
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

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};

// GET /bookings/my -> lịch sử đặt tour của user
export const myBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT b.*, t.tieu_de, t.dia_diem, t.gia,
                    (SELECT image_url FROM tour_images WHERE tour_id = b.tour_id AND is_thumbnail = 1 LIMIT 1) as thumbnail
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

// GET /bookings/:id -> chi tiết booking (admin xem mọi đơn, user chỉ xem đơn của mình)
export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.vai_tro === "admin";

        const query = isAdmin
            ? `SELECT b.*, t.tieu_de, t.dia_diem, t.gia, t.mo_ta, t.lich_trinh, t.ngay_bat_dau, t.ngay_ket_thuc, t.so_nguoi_toi_da
               FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.id = ?`
            : `SELECT b.*, t.tieu_de, t.dia_diem, t.gia, t.mo_ta, t.lich_trinh, t.ngay_bat_dau, t.ngay_ket_thuc, t.so_nguoi_toi_da
               FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.id = ? AND b.user_id = ?`;
        const params = isAdmin ? [id] : [id, req.user.id];

        const [bookings] = await pool.query(query, params);

        if (bookings.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
        }

        const booking = bookings[0];

        const [images] = await pool.query(
            "SELECT id, image_url, is_thumbnail FROM tour_images WHERE tour_id = ?",
            [booking.tour_id]
        );

        const [users] = await pool.query(
            "SELECT id, ho_ten, email, so_dien_thoai FROM users WHERE id = ?",
            [booking.user_id]
        );

        booking.tour_images = images;
        booking.user_info = users[0] || null;

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /bookings/:id/send-invoice -> Gửi hóa đơn qua email
export const sendInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const [bookings] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
        }

        const result = await sendInvoiceEmail(id);

        if (result.success) {
            res.json({ message: "Hóa đơn đã được gửi đến email khách hàng" });
        } else {
            res.status(500).json({ message: result.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /bookings (admin)
export const getAllBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, u.ho_ten, u.email, t.tieu_de, t.dia_diem
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

// POST /bookings/:id/cancel -> Khách hàng tự hủy tour (yêu cầu admin xử lý hoàn tiền)
export const cancelBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { ly_do } = req.body;

        await connection.beginTransaction();

        // Lấy thông tin booking, chỉ cho phép hủy booking của chính mình
        const [rows] = await connection.query(
            "SELECT b.*, t.tieu_de FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.id = ? AND b.user_id = ?",
            [id, req.user.id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Không tìm thấy đơn đặt tour" });
        }

        const booking = rows[0];

        // Chỉ cho phép hủy nếu đang ở trạng thái chờ xác nhận hoặc đã xác nhận
        if (booking.trang_thai === "da_huy") {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Đơn này đã bị hủy rồi" });
        }

        if (booking.trang_thai === "da_hoan_thanh") {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Không thể hủy tour đã hoàn thành" });
        }

        // Trả lại chỗ cho tour
        await connection.query(
            "UPDATE tours SET so_cho_con_lai = so_cho_con_lai + ? WHERE id = ?",
            [booking.so_nguoi_dat, booking.tour_id]
        );

        // Cập nhật trạng thái booking thành đã hủy
        await connection.query(
            "UPDATE bookings SET trang_thai = 'da_huy', ly_do_huy = ? WHERE id = ?",
            [ly_do || "Khách hàng yêu cầu hủy", id]
        );

        // Tạo bản ghi yêu cầu hoàn tiền (nếu đã thanh toán)
        const [payments] = await connection.query(
            "SELECT * FROM payments WHERE booking_id = ? AND trang_thai = 'da_thanh_toan'",
            [id]
        );

        let refundRequested = false;
        if (payments.length > 0) {
            // Tạo yêu cầu hoàn tiền (admin cần xử lý)
            await connection.query(
                `INSERT INTO refunds (booking_id, amount, status, reason) VALUES (?, ?, 'cho_xu_ly', ?)`,
                [id, booking.tong_tien, ly_do || "Khách hàng yêu cầu hủy tour"]
            );
            refundRequested = true;
        }

        await connection.commit();
        connection.release();

        res.json({
            message: "Hủy tour thành công",
            refundRequested,
            refundMessage: refundRequested
                ? "Yêu cầu hoàn tiền đã được ghi nhận. Admin sẽ xử lý trong 3-5 ngày làm việc."
                : "Vì bạn chưa thanh toán, không cần hoàn tiền."
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};

// PUT /bookings/:id/status (admin) -> duyệt / huỷ booking
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

        // Nếu chuyển sang "đã huỷ" thì trả lại chỗ
        if (trang_thai === "da_huy" && booking.trang_thai !== "da_huy") {
            await connection.query(
                "UPDATE tours SET so_cho_con_lai = so_cho_con_lai + ? WHERE id = ?",
                [booking.so_nguoi_dat, booking.tour_id]
            );
        }

        // Nếu chuyển sang "đã hoàn thành"
        if (trang_thai === "da_hoan_thanh") {
            await connection.query(
                "UPDATE bookings SET trang_thai = ?, ngay_hoan_thanh = CURRENT_TIMESTAMP WHERE id = ?",
                [trang_thai, id]
            );
        } else {
            await connection.query("UPDATE bookings SET trang_thai = ? WHERE id = ?", [trang_thai, id]);
        }

        await connection.commit();
        connection.release();

        res.json({ message: "Cập nhật thành công" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};

// GET /refunds (admin) -> danh sách yêu cầu hoàn tiền
export const getRefunds = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, b.user_id, u.ho_ten, u.email, t.tieu_de as tour_title
            FROM refunds r
            JOIN bookings b ON r.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            JOIN tours t ON b.tour_id = t.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /refunds/:id (admin) -> xử lý hoàn tiền
export const processRefund = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { status, ghi_chu } = req.body;

        await connection.beginTransaction();

        const [rows] = await connection.query("SELECT * FROM refunds WHERE id = ?", [id]);
        if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: "Không tìm thấy yêu cầu hoàn tiền" });
        }

        await connection.query(
            "UPDATE refunds SET status = ?, ghi_chu = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?",
            [status, ghi_chu || null, id]
        );

        // Nếu hoàn tiền thành công, cập nhật trạng thái payment
        if (status === "da_hoan_tien") {
            const refund = rows[0];
            await connection.query(
                "UPDATE payments SET trang_thai = 'da_hoan_tien' WHERE booking_id = ?",
                [refund.booking_id]
            );
        }

        await connection.commit();
        connection.release();

        res.json({ message: "Cập nhật trạng thái hoàn tiền thành công" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ message: error.message });
    }
};
