// src/services/tour.service.js
import pool from "../config/db.js";

export const getFeaturedToursFromDB = async () => {
  const query = `
    SELECT 
        t.id,
        t.tieu_de,
        t.dia_diem,
        t.gia,
        (DATEDIFF(t.ngay_ket_thuc, t.ngay_bat_dau) + 1) AS days,
        t.so_nguoi_toi_da AS people,
        IFNULL(ti.image_url, '/home.jpg') AS image_url,
        IFNULL(ROUND(AVG(r.so_sao), 1), 5.0) AS rating,
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
    GROUP BY t.id, ti.image_url;
  `;

  // Thực thi lệnh SQL và trả về mảng kết quả
  const [rows] = await pool.execute(query);
  return rows;
};