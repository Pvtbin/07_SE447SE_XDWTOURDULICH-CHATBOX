import { useEffect, useState } from "react";
import { getMyBookingsApi } from "../api/bookings";

const STATUS_LABEL = {
  cho_xac_nhan: { text: "Chờ xác nhận", cls: "badge-pending" },
  da_xac_nhan: { text: "Đã xác nhận", cls: "badge-confirmed" },
  da_huy: { text: "Đã hủy", cls: "badge-cancelled" },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookingsApi()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 style={{ marginBottom: 24 }}>Tour của tôi</h1>

      {loading && <p className="text-muted">Đang tải...</p>}
      {!loading && bookings.length === 0 && (
        <p className="text-muted">Bạn chưa đặt tour nào.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bookings.map((b) => {
          const status = STATUS_LABEL[b.trang_thai] || {};
          return (
            <div key={b.id} className="card flex-between" style={{ padding: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{b.tieu_de}</h3>
                <p className="text-muted" style={{ fontSize: 14 }}>📍 {b.dia_diem}</p>
                <p className="text-muted" style={{ fontSize: 14 }}>
                  {b.so_nguoi_dat} người · Đặt ngày {b.ngay_tao?.substring(0, 10)}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "var(--tile)", marginBottom: 8 }}>
                  {Number(b.tong_tien).toLocaleString("vi-VN")} đ
                </div>
                <span className={`badge ${status.cls}`}>{status.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
