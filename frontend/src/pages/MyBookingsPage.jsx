import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookingsApi, cancelBookingApi } from "../api/bookings";
import { resolveImageUrl } from "../api/axiosClient";

const STATUS_CONFIG = {
  cho_xac_nhan: { text: "Chờ xác nhận", cls: "badge-pending", canCancel: true },
  da_xac_nhan: { text: "Đã xác nhận", cls: "badge-confirmed", canCancel: true },
  da_huy: { text: "Đã hủy", cls: "badge-cancelled", canCancel: false },
  da_hoan_thanh: { text: "Hoàn thành", cls: "badge-confirmed", canCancel: false },
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookingsApi();
      setBookings(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelling(selectedBooking.id);
    try {
      const res = await cancelBookingApi(selectedBooking.id, cancelReason);
      alert(res.data.message + (res.data.refundMessage ? `\n${res.data.refundMessage}` : ""));
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Hủy tour thất bại");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="container" style={{ padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
          background: "var(--ocean-light)", borderRadius: "var(--radius-full)", marginBottom: 16,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ocean-mid)" }}>Lịch sử đặt tour</span>
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Tour của tôi</h1>
        <p className="text-muted">Xem và quản lý các tour bạn đã đặt</p>
      </div>

      {loading && (
        <div className="flex-center" style={{ padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, margin: "0 auto 24px", borderRadius: "50%",
            background: "var(--ocean-light)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 style={{ marginBottom: 8 }}>Chưa có tour nào</h3>
          <p className="text-muted" style={{ maxWidth: 300, margin: "0 auto" }}>
            Bạn chưa đặt tour nào. Hãy khám phá danh sách tour và bắt đầu hành trình!
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {bookings.map((b) => {
          const status = STATUS_CONFIG[b.trang_thai] || { text: b.trang_thai, cls: "", canCancel: false };
          return (
            <div key={b.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, padding: 24 }}>
                {/* Tour Image */}
                <div style={{
                  width: 100, height: 80, borderRadius: "var(--radius-md)", overflow: "hidden",
                  background: "var(--ocean-mist)",
                }}>
                  {b.thumbnail ? (
                    <img src={resolveImageUrl(b.thumbnail)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))",
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18 }}>{b.tieu_de}</h3>
                    <span className={`badge ${status.cls}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {status.text}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--slate)", fontSize: 14 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {b.dia_diem}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                      {b.so_nguoi_dat} người
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      {b.ngay_tao?.substring(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Price & Action */}
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Tổng tiền</div>
                    <div style={{
                      fontSize: 24, fontWeight: 800, background: "var(--gradient-neon)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                      {Number(b.tong_tien).toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => navigate(`/hoa-don/${b.id}`)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      Hóa đơn
                    </button>
                    {status.canCancel && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "8px 16px", fontSize: 13 }}
                        onClick={() => handleCancelClick(b)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? "Đang hủy..." : "Hủy tour"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 24px", background: "var(--ocean-mist)", borderTop: "1px solid var(--cloud)",
                fontSize: 13, color: "var(--slate)", display: "flex", justifyContent: "space-between",
              }}>
                <span>Mã đơn: <strong style={{ color: "var(--ocean-mid)" }}>#{b.id}</strong></span>
                {b.ly_do_huy && <span style={{ color: "var(--danger)" }}>Lý do hủy: {b.ly_do_huy}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Modal */}
      {showModal && selectedBooking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{
            width: "100%", maxWidth: 480, margin: 24, padding: 28,
            animation: "fadeInUp 0.3s ease",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Xác nhận hủy tour</h3>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              Bạn đang muốn hủy tour <strong>{selectedBooking.tieu_de}</strong>
            </p>

            <div className="field">
              <label>Lý do hủy (tùy chọn)</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy tour..."
              />
            </div>

            <div style={{
              padding: 14, background: "var(--warning-bg)", borderRadius: "var(--radius-md)",
              marginBottom: 20, fontSize: 14, color: "var(--warning)",
            }}>
              {selectedBooking.trang_thai === "da_xac_nhan"
                ? "Lưu ý: Bạn đã thanh toán tour này. Sau khi hủy, admin sẽ xử lý hoàn tiền trong 3-5 ngày làm việc."
                : "Sau khi hủy, bạn sẽ không thể khôi phục lại đơn này."}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                Giữ đơn
              </button>
              <button className="btn btn-danger" onClick={handleConfirmCancel} style={{ flex: 1 }}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
