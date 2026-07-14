import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingByIdApi, sendInvoiceApi } from "../api/bookings";
import { resolveImageUrl } from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  cho_xac_nhan: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7", icon: "clock" },
  da_xac_nhan: { label: "Đã xác nhận", color: "#10b981", bg: "#d1fae5", icon: "check" },
  da_huy: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2", icon: "x" },
  da_hoan_thanh: { label: "Hoàn thành", color: "#0099FF", bg: "#dbeafe", icon: "star" },
};

export default function TourInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await getBookingByIdApi(id);
      setBooking(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const res = await sendInvoiceApi(id);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể gửi email");
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-loading">
          <div className="spinner"></div>
          <p>Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="invoice-page">
        <div className="invoice-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
          <h2>Không tìm thấy hóa đơn</h2>
          <p>{error || "Hóa đơn không tồn tại hoặc bạn không có quyền truy cập."}</p>
          <button className="btn btn-primary" onClick={() => navigate("/lich-su-dat-tour")}>
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[booking.trang_thai] || STATUS_CONFIG.cho_xac_nhan;
  const tourImage = booking.tour_images?.find((img) => img.is_thumbnail === 1)?.image_url
    || booking.tour_images?.[0]?.image_url;
  const itinerary = booking.lich_trinh ? JSON.parse(booking.lich_trinh) : [];

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            <div>
              <h1>Tour Travel</h1>
              <p>Kiểm tra và in hóa đơn</p>
            </div>
          </div>
          <div className="invoice-actions">
            <button className="btn btn-ghost" onClick={() => navigate(user?.vai_tro === "admin" ? "/admin/bookings" : "/lich-su-dat-tour")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Quay lại
            </button>
            {user?.vai_tro === "admin" && (
              <>
                <button className="btn btn-outline" onClick={handleSendEmail} disabled={sending}>
                  {sending ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Gửi email
                    </>
                  )}
                </button>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2V9a2 2 0 012-2h16a2 2 0 012 2v7a2 2 0 01-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  In hóa đơn
                </button>
              </>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="invoice-card">
          {/* Invoice Number */}
          <div className="invoice-title-row">
            <div>
              <h2>Hóa đơn đặt tour</h2>
              <p className="invoice-number">#{booking.id}</p>
            </div>
            <div
              className="invoice-status"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
            >
              {statusInfo.label}
            </div>
          </div>

          {/* Booking Date */}
          <div className="invoice-date-row">
            <span>Ngày đặt:</span>
            <strong>{formatDateTime(booking.ngay_tao)}</strong>
          </div>

          {/* Main Content Grid */}
          <div className="invoice-grid">
            {/* Customer Info */}
            <div className="invoice-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Thông tin khách hàng
              </h3>
              <div className="info-list">
                <div className="info-item">
                  <span>Họ tên:</span>
                  <strong>{booking.user_info?.ho_ten || "-"}</strong>
                </div>
                <div className="info-item">
                  <span>Email:</span>
                  <strong>{booking.user_info?.email || "-"}</strong>
                </div>
                <div className="info-item">
                  <span>SĐT:</span>
                  <strong>{booking.user_info?.so_dien_thoai || "Chưa cập nhật"}</strong>
                </div>
              </div>
            </div>

            {/* Tour Info */}
            <div className="invoice-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                </svg>
                Thông tin tour
              </h3>
              <div className="info-list">
                <div className="info-item">
                  <span>Tên tour:</span>
                  <strong>{booking.tieu_de}</strong>
                </div>
                <div className="info-item">
                  <span>Địa điểm:</span>
                  <strong>{booking.dia_diem}</strong>
                </div>
                <div className="info-item">
                  <span>Thời gian:</span>
                  <strong>
                    {formatDate(booking.ngay_bat_dau)} - {formatDate(booking.ngay_ket_thuc)}
                  </strong>
                </div>
                <div className="info-item">
                  <span>Số người:</span>
                  <strong>{booking.so_nguoi_dat} người</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Image */}
          {tourImage && (
            <div className="invoice-image">
              <img src={resolveImageUrl(tourImage)} alt={booking.tieu_de} />
            </div>
          )}

          {/* Tour Description */}
          {booking.mo_ta && (
            <div className="invoice-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Mô tả tour
              </h3>
              <p className="invoice-description">{booking.mo_ta}</p>
            </div>
          )}

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div className="invoice-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Lịch trình tour
              </h3>
              <div className="itinerary-list">
                {itinerary.map((day, index) => (
                  <div key={index} className="itinerary-day">
                    <div className="day-header">
                      <span className="day-badge">Ngày {day.day}</span>
                      <span className="day-title">{day.title}</span>
                    </div>
                    <ul className="activity-list">
                      {day.activities?.map((activity, actIndex) => (
                        <li key={actIndex}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="invoice-summary">
            <div className="summary-row">
              <span>Giá tour / người:</span>
              <span>{formatCurrency(booking.gia)}</span>
            </div>
            <div className="summary-row">
              <span>Số người:</span>
              <span>{booking.so_nguoi_dat} người</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(booking.tong_tien)}</span>
            </div>
          </div>

          {/* Cancel Reason */}
          {booking.trang_thai === "da_huy" && booking.ly_do_huy && (
            <div className="invoice-cancel-reason">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <strong>Lý do hủy:</strong>
                <p>{booking.ly_do_huy}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Tour Travel!</p>
          <p>Mọi thắc mắc vui lòng liên hệ hotline: <strong>1900-xxxx</strong></p>
        </div>
      </div>

      <style>{`
        .invoice-page {
          min-height: calc(100vh - 76px);
          background: var(--ocean-mist);
          padding: 32px 24px;
        }

        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .invoice-loading, .invoice-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          gap: 16px;
        }

        .invoice-error svg {
          color: var(--silver);
        }

        .invoice-error h2 {
          margin: 0;
          color: var(--slate);
        }

        .invoice-error p {
          color: var(--silver);
          margin: 0;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .invoice-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .invoice-logo h1 {
          margin: 0;
          font-size: 24px;
          background: var(--gradient-neon);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .invoice-logo p {
          margin: 0;
          color: var(--slate);
          font-size: 13px;
        }

        .invoice-actions {
          display: flex;
          gap: 12px;
        }

        .invoice-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .invoice-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .invoice-title-row h2 {
          margin: 0;
          font-size: 20px;
          color: var(--slate);
        }

        .invoice-number {
          margin: 4px 0 0;
          color: var(--silver);
          font-size: 14px;
        }

        .invoice-status {
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .invoice-date-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--ocean-mist);
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          color: var(--slate);
        }

        .invoice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .invoice-section {
          margin-bottom: 24px;
        }

        .invoice-section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--slate);
        }

        .invoice-section h3 svg {
          color: var(--neon-cyan);
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--cloud);
          font-size: 14px;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-item span {
          color: var(--silver);
        }

        .info-item strong {
          color: var(--slate);
        }

        .invoice-image {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .invoice-image img {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .invoice-description {
          color: var(--slate);
          line-height: 1.6;
          font-size: 14px;
          margin: 0;
          padding: 16px;
          background: var(--ocean-mist);
          border-radius: 8px;
        }

        .itinerary-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .itinerary-day {
          background: var(--ocean-mist);
          border-radius: 12px;
          overflow: hidden;
        }

        .day-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 255, 0.1) 100%);
        }

        .day-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--gradient-neon);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }

        .day-title {
          font-weight: 600;
          color: var(--slate);
          font-size: 14px;
        }

        .activity-list {
          list-style: none;
          padding: 12px 16px;
          margin: 0;
        }

        .activity-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 14px;
          color: var(--slate);
        }

        .invoice-summary {
          background: var(--ocean-mist);
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
          color: var(--slate);
        }

        .summary-divider {
          height: 1px;
          background: var(--cloud);
          margin: 12px 0;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
        }

        .summary-row.total span:last-child {
          background: var(--gradient-neon);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 24px;
        }

        .invoice-cancel-reason {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--danger-bg);
          border-radius: 8px;
          margin-top: 24px;
          color: var(--danger);
        }

        .invoice-cancel-reason svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .invoice-cancel-reason strong {
          display: block;
          margin-bottom: 4px;
        }

        .invoice-cancel-reason p {
          margin: 0;
          font-size: 14px;
        }

        .invoice-footer {
          text-align: center;
          margin-top: 24px;
          color: var(--slate);
          font-size: 14px;
        }

        .invoice-footer p {
          margin: 0 0 4px;
        }

        @media (max-width: 768px) {
          .invoice-grid {
            grid-template-columns: 1fr;
          }

          .invoice-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .invoice-actions {
            width: 100%;
          }

          .invoice-actions .btn {
            flex: 1;
            justify-content: center;
          }

          .invoice-card {
            padding: 20px;
          }
        }

        @media print {
          .invoice-page {
            background: white;
            padding: 20px;
          }

          .invoice-header {
            display: block;
          }

          .invoice-actions {
            display: none;
          }

          .invoice-card {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
