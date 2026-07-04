// src/controllers/tour.controller.js
import pool from "../config/db.js";
import { getFeaturedToursFromDB } from "../services/tour.service.js";

// GET /tours  -> danh sách tour (kèm ảnh đại diện nếu có trong tour_images)
export const getFeaturedTours = async (req, res) => {
  try {
    const tours = await getFeaturedToursFromDB();
    res.status(200).json(tours);
  } catch (error) {
    console.error("Lỗi tại getFeaturedTours controller:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách tour" });
  }
};

// GET /tours/:id  -> chi tiết 1 tour (MỚI - cần thêm route)
export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    // Lấy thêm ảnh của tour nếu có
    const [images] = await pool.query(
      "SELECT id, image_url, is_thumbnail FROM tour_images WHERE tour_id = ?",
      [id]
    );

    res.status(200).json({ ...rows[0], images });
  } catch (error) {
    console.error("Lỗi tại getTourById:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết tour" });
  }
};

// POST /tours (admin) -> tạo tour mới
export const createTour = async (req, res) => {
  try {
    const {
      tieu_de, mo_ta, gia, dia_diem,
      ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da
    } = req.body;

    if (!tieu_de || !gia || !dia_diem || !so_nguoi_toi_da) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (tên, giá, địa điểm, số người tối đa)" });
    }

    const [result] = await pool.query(
      `INSERT INTO tours
        (tieu_de, mo_ta, gia, dia_diem, ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da, so_cho_con_lai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tieu_de, mo_ta || null, gia, dia_diem, ngay_bat_dau || null, ngay_ket_thuc || null, so_nguoi_toi_da, so_nguoi_toi_da]
      // so_cho_con_lai khởi tạo bằng so_nguoi_toi_da lúc mới tạo
    );

    res.status(201).json({ message: "Tạo tour thành công", id: result.insertId });
  } catch (error) {
    console.error("Lỗi tại createTour controller:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi tạo tour" });
  }
};

// PUT /tours/:id (admin) -> cập nhật tour (MỚI - cần thêm route)
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tieu_de, mo_ta, gia, dia_diem,
      ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da
    } = req.body;

    await pool.query(
      `UPDATE tours SET
        tieu_de = ?, mo_ta = ?, gia = ?, dia_diem = ?,
        ngay_bat_dau = ?, ngay_ket_thuc = ?, so_nguoi_toi_da = ?
       WHERE id = ?`,
      [tieu_de, mo_ta || null, gia, dia_diem, ngay_bat_dau || null, ngay_ket_thuc || null, so_nguoi_toi_da, id]
    );

    res.status(200).json({ message: "Cập nhật tour thành công" });
  } catch (error) {
    console.error("Lỗi tại updateTour controller:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật tour" });
  }
};

// DELETE /tours/:id (admin) -> xoá tour (MỚI - cần thêm route)
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tours WHERE id = ?", [id]);
    res.status(200).json({ message: "Xoá tour thành công" });
  } catch (error) {
    console.error("Lỗi tại deleteTour controller:", error);
    // Lỗi phổ biến: tour đang có booking liên kết (FOREIGN KEY constraint)
    res.status(500).json({ message: "Không thể xoá tour này (có thể đang có booking liên kết)" });
  }
};
