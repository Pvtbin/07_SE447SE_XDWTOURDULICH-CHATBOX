import nodemailer from "nodemailer";
import pool from "../config/db.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendInvoiceEmail = async (bookingId) => {
  try {
    // Get booking details
    const [bookings] = await pool.query(
      `SELECT b.*, t.tieu_de, t.dia_diem, t.mo_ta, t.lich_trinh, t.ngay_bat_dau, t.ngay_ket_thuc,
              u.ho_ten, u.email, u.so_dien_thoai
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      throw new Error("Không tìm thấy booking");
    }

    const booking = bookings[0];

    // Get tour images
    const [images] = await pool.query(
      "SELECT image_url, is_thumbnail FROM tour_images WHERE tour_id = ?",
      [booking.tour_id]
    );

    const thumbnail = images.find((img) => img.is_thumbnail === 1)?.image_url || images[0]?.image_url;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    const itinerary = booking.lich_trinh ? JSON.parse(booking.lich_trinh) : [];

    // Build itinerary HTML
    let itineraryHtml = "";
    if (itinerary.length > 0) {
      itineraryHtml = `
        <div style="margin-top: 24px;">
          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 12px;">Lịch trình tour</h3>
          ${itinerary.map((day) => `
            <div style="margin-bottom: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
              <div style="font-weight: 600; color: #0099FF; margin-bottom: 8px;">
                Ngày ${day.day}: ${day.title}
              </div>
              <ul style="margin: 0; padding-left: 20px;">
                ${(day.activities || []).map((act) => `<li style="color: #475569; font-size: 14px;">${act}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      `;
    }

    const statusLabels = {
      cho_xac_nhan: "Chờ xác nhận",
      da_xac_nhan: "Đã xác nhận",
      da_huy: "Đã hủy",
      da_hoan_thanh: "Hoàn thành",
    };

    const statusColors = {
      cho_xac_nhan: "#f59e0b",
      da_xac_nhan: "#10b981",
      da_huy: "#ef4444",
      da_hoan_thanh: "#0099FF",
    };

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hóa đơn tour - ${booking.tieu_de}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
            <div style="display: inline-flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00D4FF, #0099FF); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px;">✈</span>
              </div>
              <span style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #00D4FF, #0099FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tour Travel</span>
            </div>
            <h1 style="font-size: 20px; color: #1e293b; margin: 16px 0 8px;">Hóa đơn đặt tour</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Mã đơn: #${booking.id}</p>
          </div>

          <!-- Status -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; padding: 8px 24px; background: ${statusColors[booking.trang_thai]}20; color: ${statusColors[booking.trang_thai]}; border-radius: 24px; font-weight: 600;">
              ${statusLabels[booking.trang_thai] || booking.trang_thai}
            </span>
          </div>

          <!-- Tour Info -->
          <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px;">${booking.tieu_de}</h2>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">Địa điểm:</span>
                <span style="color: #1e293b; font-weight: 500;">${booking.dia_diem}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">Thời gian:</span>
                <span style="color: #1e293b; font-weight: 500;">${formatDate(booking.ngay_bat_dau)} - ${formatDate(booking.ngay_ket_thuc)}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">Số người:</span>
                <span style="color: #1e293b; font-weight: 500;">${booking.so_nguoi_dat} người</span>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div style="margin-bottom: 24px;">
            <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px;">Thông tin khách hàng</h3>
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">Họ tên:</span>
                <span style="color: #1e293b; font-weight: 500;">${booking.ho_ten}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">Email:</span>
                <span style="color: #1e293b; font-weight: 500;">${booking.email}</span>
              </div>
              <div style="display: flex; gap: 12px;">
                <span style="color: #64748b; min-width: 100px;">SĐT:</span>
                <span style="color: #1e293b; font-weight: 500;">${booking.so_dien_thoai || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>

          <!-- Itinerary -->
          ${itineraryHtml}

          <!-- Price Summary -->
          <div style="background: linear-gradient(135deg, #00D4FF20, #0099FF20); border-radius: 16px; padding: 24px; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #64748b;">Giá tour / người:</span>
              <span style="color: #1e293b;">${formatCurrency(booking.gia)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <span style="color: #64748b;">Số người:</span>
              <span style="color: #1e293b;">${booking.so_nguoi_dat} người</span>
            </div>
            <div style="border-top: 2px dashed #cbd5e1; padding-top: 16px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #1e293b; font-size: 16px; font-weight: 600;">Tổng cộng:</span>
                <span style="background: linear-gradient(135deg, #00D4FF, #0099FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 700;">${formatCurrency(booking.tong_tien)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center;">
            <p style="color: #1e293b; font-weight: 600; margin: 0 0 8px;">Cảm ơn bạn đã tin tưởng Tour Travel!</p>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Mọi thắc mắc vui lòng liên hệ hotline: <strong>1900-xxxx</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Tour Travel" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Hóa đơn tour #${booking.id} - ${booking.tieu_de}`,
      html,
    });

    console.log(`Invoice email sent to ${booking.email} for booking #${bookingId}`);
    return { success: true, message: "Email đã được gửi thành công" };

  } catch (error) {
    console.error("Error sending invoice email:", error);
    return { success: false, message: error.message };
  }
};
