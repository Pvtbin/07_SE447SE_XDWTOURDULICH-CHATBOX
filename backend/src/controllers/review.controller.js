import pool from "../config/db.js";

export const createReview = async (req, res) => {
    try {
        const { tour_id, so_sao, binh_luan } = req.body;

        await pool.query(
            `
            INSERT INTO reviews
            (user_id, tour_id, so_sao, binh_luan)
            VALUES (?, ?, ?, ?)
            `,
            [
                req.user.id,
                tour_id,
                so_sao,
                binh_luan
            ]
        );

        res.json({
            message: "Đánh giá thành công"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getReviewsByTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                r.*,
                u.ho_ten
            FROM reviews r
            JOIN users u
                ON r.user_id = u.id
            WHERE r.tour_id = ?
            `,
            [tourId]
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};