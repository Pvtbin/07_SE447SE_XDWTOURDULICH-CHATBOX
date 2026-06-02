import pool from "../config/db.js";

export const getTours = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM tours");
    res.json(rows);
};
export const createTour = async (req, res) => {
    const { tieu_de, gia, dia_diem, mo_ta } = req.body;

    await pool.query(
        "INSERT INTO tours (tieu_de, gia, dia_diem, mo_ta) VALUES (?, ?, ?, ?)",
        [tieu_de, gia, dia_diem, mo_ta]
    );

    res.json({ message: "Tạo tour thành công" });
};