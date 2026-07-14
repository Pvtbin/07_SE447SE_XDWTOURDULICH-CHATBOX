import pool from "../config/db.js";

export const getDashboard = async (req, res) => {
    try {
        // Tổng người dùng
        const [[users]] = await pool.query(
            "SELECT COUNT(*) as total FROM users WHERE vai_tro = 'user'"
        );

        // Tổng tour
        const [[tours]] = await pool.query(
            "SELECT COUNT(*) as total FROM tours"
        );

        // Tổng booking
        const [[bookings]] = await pool.query(
            "SELECT COUNT(*) as total FROM bookings"
        );

        // Doanh thu (từ booking đã xác nhận hoặc已完成)
        const [[revenue]] = await pool.query(
            "SELECT IFNULL(SUM(tong_tien), 0) as total FROM bookings WHERE trang_thai IN ('da_xac_nhan', 'da_hoan_thanh')"
        );

        // Booking theo trạng thái
        const [bookingByStatus] = await pool.query(`
            SELECT trang_thai, COUNT(*) as count
            FROM bookings
            GROUP BY trang_thai
        `);

        // Doanh thu theo tháng (6 tháng gần nhất)
        const [revenueByMonth] = await pool.query(`
            SELECT
                DATE_FORMAT(ngay_tao, '%Y-%m') as month,
                IFNULL(SUM(tong_tien), 0) as revenue,
                COUNT(*) as bookings
            FROM bookings
            WHERE trang_thai IN ('da_xac_nhan', 'da_hoan_thanh')
            AND ngay_tao >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(ngay_tao, '%Y-%m')
            ORDER BY month ASC
        `);

        // Tour hot (nhiều người đặt nhất)
        const [hotTours] = await pool.query(`
            SELECT
                t.id,
                t.tieu_de,
                t.dia_diem,
                t.gia,
                t.so_cho_con_lai,
                t.so_nguoi_toi_da,
                (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_thumbnail = 1 LIMIT 1) as thumbnail,
                COUNT(b.id) as total_bookings,
                SUM(b.so_nguoi_dat) as total_people,
                IFNULL(SUM(b.tong_tien), 0) as total_revenue
            FROM tours t
            LEFT JOIN bookings b ON t.id = b.tour_id
            GROUP BY t.id
            ORDER BY total_bookings DESC, total_people DESC
            LIMIT 5
        `);

        // Booking gần đây
        const [recentBookings] = await pool.query(`
            SELECT
                b.id,
                b.so_nguoi_dat,
                b.tong_tien,
                b.trang_thai,
                b.ngay_tao,
                u.ho_ten,
                u.email,
                t.tieu_de
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN tours t ON b.tour_id = t.id
            ORDER BY b.ngay_tao DESC
            LIMIT 10
        `);

        res.json({
            tong_user: users.total,
            tong_tour: tours.total,
            tong_booking: bookings.total,
            doanh_thu: revenue.total,
            booking_by_status: bookingByStatus,
            revenue_by_month: revenueByMonth,
            hot_tours: hotTours,
            recent_bookings: recentBookings
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};