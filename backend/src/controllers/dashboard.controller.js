import pool from "../config/db.js";

export const getDashboard = async (req, res) => {
    try {
        const [[users]] = await pool.query(
            "SELECT COUNT(*) as total FROM users"
        );

        const [[tours]] = await pool.query(
            "SELECT COUNT(*) as total FROM tours"
        );

        const [[bookings]] = await pool.query(
            "SELECT COUNT(*) as total FROM bookings"
        );

        const [[revenue]] = await pool.query(
            "SELECT IFNULL(SUM(tong_tien),0) as total FROM bookings WHERE trang_thai='da_xac_nhan'"
        );

        res.json({
            tong_user: users.total,
            tong_tour: tours.total,
            tong_booking: bookings.total,
            doanh_thu: revenue.total
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};