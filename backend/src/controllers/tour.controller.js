import pool from "../config/db.js";
import { getFeaturedToursFromDB } from "../services/tour.service.js";
import fs from "fs";
import path from "path";

// GET /tours
export const getFeaturedTours = async (req, res) => {
  try {
    const tours = await getFeaturedToursFromDB();
    res.status(200).json(tours);
  } catch (error) {
    console.error("Lỗi getFeaturedTours:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// GET /tours/:id
export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    const [images] = await pool.query(
      "SELECT id, image_url, is_thumbnail FROM tour_images WHERE tour_id = ?",
      [id]
    );

    res.status(200).json({ ...rows[0], images });
  } catch (error) {
    console.error("Lỗi getTourById:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// POST /tours
export const createTour = async (req, res) => {
  try {
    const { tieu_de, mo_ta, gia, dia_diem, ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da, lich_trinh } = req.body;

    if (!tieu_de || !gia || !dia_diem || !so_nguoi_toi_da) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const [result] = await pool.query(
      `INSERT INTO tours (tieu_de, mo_ta, gia, dia_diem, ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da, so_cho_con_lai, lich_trinh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tieu_de, mo_ta || null, gia, dia_diem, ngay_bat_dau || null, ngay_ket_thuc || null, so_nguoi_toi_da, so_nguoi_toi_da, lich_trinh || null]
    );

    res.status(201).json({ message: "Tạo tour thành công", id: result.insertId });
  } catch (error) {
    console.error("Lỗi createTour:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// PUT /tours/:id
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { tieu_de, mo_ta, gia, dia_diem, ngay_bat_dau, ngay_ket_thuc, so_nguoi_toi_da, lich_trinh } = req.body;

    await pool.query(
      `UPDATE tours SET
        tieu_de = ?, mo_ta = ?, gia = ?, dia_diem = ?,
        ngay_bat_dau = ?, ngay_ket_thuc = ?, so_nguoi_toi_da = ?, lich_trinh = ?
       WHERE id = ?`,
      [tieu_de, mo_ta || null, gia, dia_diem, ngay_bat_dau || null, ngay_ket_thuc || null, so_nguoi_toi_da, lich_trinh || null, id]
    );

    res.status(200).json({ message: "Cập nhật tour thành công" });
  } catch (error) {
    console.error("Lỗi updateTour:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// DELETE /tours/:id
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tours WHERE id = ?", [id]);
    res.status(200).json({ message: "Xoá tour thành công" });
  } catch (error) {
    res.status(500).json({ message: "Không thể xoá tour (có booking liên kết)" });
  }
};

// POST /tours/:id/images
export const uploadTourImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Chưa chọn file ảnh" });
    }

    const imageUrl = `/uploads/tours/${req.file.filename}`;

    const [existing] = await pool.query("SELECT id FROM tour_images WHERE tour_id = ?", [id]);
    const isThumbnail = existing.length === 0;

    const [result] = await pool.query(
      "INSERT INTO tour_images (tour_id, image_url, is_thumbnail) VALUES (?, ?, ?)",
      [id, imageUrl, isThumbnail]
    );

    res.status(201).json({
      message: "Tải ảnh lên thành công",
      id: result.insertId,
      image_url: imageUrl,
      is_thumbnail: isThumbnail,
    });
  } catch (error) {
    console.error("Lỗi uploadTourImage:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// PUT /tours/images/:imageId/thumbnail
export const setThumbnailImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const [rows] = await pool.query("SELECT tour_id FROM tour_images WHERE id = ?", [imageId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy ảnh" });
    }
    const { tour_id } = rows[0];

    await pool.query("UPDATE tour_images SET is_thumbnail = 0 WHERE tour_id = ?", [tour_id]);
    await pool.query("UPDATE tour_images SET is_thumbnail = 1 WHERE id = ?", [imageId]);

    res.json({ message: "Đã đặt làm ảnh đại diện" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// DELETE /tours/images/:imageId
export const deleteTourImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const [rows] = await pool.query("SELECT * FROM tour_images WHERE id = ?", [imageId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy ảnh" });
    }

    const filePath = path.join(process.cwd(), "public", rows[0].image_url);
    fs.unlink(filePath, () => {});

    const wasThumbnail = rows[0].is_thumbnail === 1;
    const { tour_id } = rows[0];

    await pool.query("DELETE FROM tour_images WHERE id = ?", [imageId]);

    if (wasThumbnail) {
      const [remaining] = await pool.query(
        "SELECT id FROM tour_images WHERE tour_id = ? ORDER BY ngay_tao ASC LIMIT 1",
        [tour_id]
      );
      if (remaining.length > 0) {
        await pool.query("UPDATE tour_images SET is_thumbnail = 1 WHERE id = ?", [remaining[0].id]);
      }
    }

    res.json({ message: "Xoá ảnh thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
