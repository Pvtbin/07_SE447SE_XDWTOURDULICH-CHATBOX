import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getDashboardApi } from "../../api/bookings";
import { resolveImageUrl } from "../../api/axiosClient";

const STATUS_CONFIG = {
  cho_xac_nhan: { label: "Chờ xác nhận", color: "#f59e0b" },
  da_xac_nhan: { label: "Đã xác nhận", color: "#10b981" },
  da_huy: { label: "Đã hủy", color: "#ef4444" },
  da_hoan_thanh: { label: "Hoàn thành", color: "#0099FF" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardApi();
      setStats(res.data);
    } finally {
      setLoading(false);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    return months[parseInt(month) - 1];
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    );
  }

  const statusStats = stats?.booking_by_status || [];

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Tổng quan</h1>
          <button className="btn btn-ghost" onClick={fetchDashboard}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Làm mới
          </button>
        </div>

        {/* Main Stats */}
        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.tong_user || 0}</span>
              <span className="stat-label">Người dùng</span>
            </div>
          </div>

          <div className="stat-card tours">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.tong_tour || 0}</span>
              <span className="stat-label">Tour du lịch</span>
            </div>
          </div>

          <div className="stat-card bookings">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats?.tong_booking || 0}</span>
              <span className="stat-label">Đơn đặt tour</span>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats?.doanh_thu || 0)}</span>
              <span className="stat-label">Doanh thu</span>
            </div>
          </div>
        </div>

        {/* Booking Status & Revenue Chart */}
        <div className="charts-row">
          {/* Booking by Status */}
          <div className="chart-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
              Trạng thái đơn hàng
            </h3>
            <div className="status-bars">
              {statusStats.map((item) => (
                <div key={item.trang_thai} className="status-bar-row">
                  <div className="status-bar-header">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: STATUS_CONFIG[item.trang_thai]?.color }}
                    ></span>
                    <span className="status-name">{STATUS_CONFIG[item.trang_thai]?.label || item.trang_thai}</span>
                  </div>
                  <div className="status-bar-wrapper">
                    <div
                      className="status-bar-fill"
                      style={{
                        width: `${(item.count / Math.max(...statusStats.map((s) => s.count), 1)) * 100}%`,
                        backgroundColor: STATUS_CONFIG[item.trang_thai]?.color,
                      }}
                    ></div>
                  </div>
                  <span className="status-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Month */}
          <div className="chart-card wide">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Doanh thu 6 tháng gần nhất
            </h3>
            <div className="bar-chart">
              {(stats?.revenue_by_month || []).map((item) => {
                const maxRevenue = Math.max(...(stats?.revenue_by_month || []).map((r) => r.revenue), 1);
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={item.month} className="bar-item">
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        <span className="bar-tooltip">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>
                    <span className="bar-label">{getMonthName(item.month)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hot Tours & Recent Bookings */}
        <div className="data-row">
          {/* Hot Tours */}
          <div className="data-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
              </svg>
              Tour hot
            </h3>
            <div className="hot-tours">
              {(stats?.hot_tours || []).map((tour, index) => (
                <div key={tour.id} className="hot-tour-item">
                  <div className="tour-rank">#{index + 1}</div>
                  <div className="tour-image">
                    {tour.thumbnail ? (
                      <img src={resolveImageUrl(tour.thumbnail)} alt={tour.tieu_de} />
                    ) : (
                      <div className="no-image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="tour-info">
                    <h4>{tour.tieu_de}</h4>
                    <p className="tour-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {tour.dia_diem}
                    </p>
                  </div>
                  <div className="tour-stats">
                    <div className="tour-stat">
                      <span className="stat-num">{tour.total_bookings || 0}</span>
                      <span className="stat-label">Đơn</span>
                    </div>
                    <div className="tour-stat">
                      <span className="stat-num">{tour.total_people || 0}</span>
                      <span className="stat-label">Người</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.hot_tours || stats.hot_tours.length === 0) && (
                <div className="no-data">
                  <p>Chưa có dữ liệu tour</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="data-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Đơn hàng gần đây
            </h3>
            <div className="recent-bookings">
              {(stats?.recent_bookings || []).map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-main">
                    <div className="booking-id">#{booking.id}</div>
                    <div className="booking-customer">{booking.ho_ten}</div>
                    <div
                      className="booking-status"
                      style={{ backgroundColor: STATUS_CONFIG[booking.trang_thai]?.color + "20", color: STATUS_CONFIG[booking.trang_thai]?.color }}
                    >
                      {STATUS_CONFIG[booking.trang_thai]?.label || booking.trang_thai}
                    </div>
                  </div>
                  <div className="booking-details">
                    <span className="booking-tour">{booking.tieu_de}</span>
                    <span className="booking-amount">{formatCurrency(booking.tong_tien)}</span>
                  </div>
                  <div className="booking-date">{formatDate(booking.ngay_tao)}</div>
                </div>
              ))}
              {(!stats?.recent_bookings || stats.recent_bookings.length === 0) && (
                <div className="no-data">
                  <p>Chưa có đơn hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
          -webkit-background-clip: text;
          -webkit-background-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card.users .stat-icon {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
        }

        .stat-card.tours .stat-icon {
          background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
          color: white;
        }

        .stat-card.bookings .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card.revenue .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        /* Charts Row */
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .chart-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          font-size: 16px;
          color: #1e293b;
        }

        .chart-card h3 svg {
          color: #0099FF;
        }

        /* Status Bars */
        .status-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-bar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-name {
          font-size: 13px;
          color: #475569;
        }

        .status-bar-wrapper {
          flex: 1;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .status-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .status-count {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          min-width: 40px;
          text-align: right;
        }

        /* Bar Chart */
        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          padding-top: 20px;
        }

        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar-wrapper {
          height: 160px;
          width: 40px;
          background: #f1f5f9;
          border-radius: 6px 6px 0 0;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          background: linear-gradient(to top, #0099FF, #00D4FF);
          border-radius: 6px 6px 0 0;
          position: relative;
          min-height: 4px;
          transition: height 0.5s ease;
        }

        .bar-tooltip {
          position: absolute;
          top: -28px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }

        .bar-fill:hover .bar-tooltip {
          opacity: 1;
        }

        .bar-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        /* Data Row */
        .data-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .data-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          font-size: 16px;
          color: #1e293b;
        }

        .data-card h3 svg {
          color: #f59e0b;
        }

        /* Hot Tours */
        .hot-tours {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hot-tour-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .hot-tour-item:hover {
          background: #f1f5f9;
        }

        .tour-rank {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
        }

        .tour-image {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .tour-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .tour-info {
          flex: 1;
          min-width: 0;
        }

        .tour-info h4 {
          margin: 0;
          font-size: 14px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tour-location {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .tour-stats {
          display: flex;
          gap: 12px;
        }

        .tour-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
        }

        .tour-stat .stat-num {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .tour-stat .stat-label {
          font-size: 10px;
          color: #64748b;
        }

        /* Recent Bookings */
        .recent-bookings {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .booking-item {
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .booking-item:hover {
          background: #f1f5f9;
        }

        .booking-main {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .booking-id {
          font-weight: 600;
          color: #64748b;
          font-size: 12px;
        }

        .booking-customer {
          flex: 1;
          font-weight: 500;
          color: #1e293b;
          font-size: 14px;
        }

        .booking-status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .booking-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .booking-tour {
          font-size: 13px;
          color: #475569;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 12px;
        }

        .booking-amount {
          font-weight: 600;
          color: #10b981;
          font-size: 14px;
          white-space: nowrap;
        }

        .booking-date {
          font-size: 11px;
          color: #94a3b8;
        }

        .no-data {
          text-align: center;
          padding: 24px;
          color: #94a3b8;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-row {
            grid-template-columns: 1fr;
          }

          .data-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .bar-chart {
            height: 150px;
          }

          .bar-wrapper {
            width: 30px;
            height: 120px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
