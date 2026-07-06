import pool from "../config/db.js";

export const getFeaturedToursFromDB = async () => {
  const query = `
    SELECT
        t.id,
        t.tieu_de,
        t.dia_diem,
        t.gia,
        t.mo_ta,
        (DATEDIFF(t.ngay_ket_thuc, t.ngay_bat_dau) + 1) AS days,
        t.so_nguoi_toi_da AS people,
        t.so_cho_con_lai,
        t.lich_trinh,
        IFNULL(ti.image_url, '/home.jpg') AS thumbnail,
        IFNULL(ROUND(AVG(r.so_sao), 1), 0) AS rating,
        COUNT(r.id) AS reviews,
        CASE
            WHEN t.gia > 4000000 THEN 'Premium'
            WHEN COUNT(r.id) >= 2 THEN 'Bán chạy'
            ELSE 'Mới'
        END AS badge,
        CASE
            WHEN t.gia > 4000000 THEN 'premium'
            WHEN COUNT(r.id) >= 2 THEN 'hot'
            ELSE 'new'
        END AS badgeType
    FROM tours t
    LEFT JOIN tour_images ti ON t.id = ti.tour_id AND ti.is_thumbnail = TRUE
    LEFT JOIN reviews r ON t.id = r.tour_id
    GROUP BY t.id, ti.image_url
    ORDER BY t.ngay_tao DESC;
  `;

  const [rows] = await pool.execute(query);

  // Get all images for each tour
  for (const tour of rows) {
    const [images] = await pool.execute(
      "SELECT id, image_url, is_thumbnail FROM tour_images WHERE tour_id = ?",
      [tour.id]
    );
    tour.images = images;
  }

  return rows;
};
