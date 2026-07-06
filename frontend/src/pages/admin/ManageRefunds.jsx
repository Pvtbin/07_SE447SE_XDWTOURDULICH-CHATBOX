import { useState, useEffect } from "react";
import { getRefundsApi, processRefundApi } from "../../api/bookings";

const STATUS_CONFIG = {
  cho_xu_ly: { label: "Chờ xử lý", class: "pending", color: "#f59e0b" },
  da_hoan_tien: { label: "Đã hoàn tiền", class: "approved", color: "#10b981" },
  tu_choi: { label: "Từ chối", class: "rejected", color: "#ef4444" },
};

function ManageRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [modal, setModal] = useState({ show: false, refund: null, action: null });
  const [ghiChu, setGhiChu] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await getRefundsApi();
      setRefunds(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách hoàn tiền:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!modal.refund || !modal.action) return;
    setProcessingId(modal.refund.id);
    try {
      await processRefundApi(modal.refund.id, modal.action, ghiChu);
      await fetchRefunds();
      setModal({ show: false, refund: null, action: null });
      setGhiChu("");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xử lý hoàn tiền");
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (refund, action) => {
    setModal({ show: true, refund, action });
    setGhiChu("");
  };

  const filteredRefunds = refunds.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const stats = {
    total: refunds.length,
    pending: refunds.filter((r) => r.status === "cho_xu_ly").length,
    completed: refunds.filter((r) => r.status === "da_hoan_tien").length,
    rejected: refunds.filter((r) => r.status === "tu_choi").length,
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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Quản lý hoàn tiền</h1>
          <p>Xử lý các yêu cầu hoàn tiền từ khách hàng hủy tour</p>
        </div>
      </div>

      <div className="refund-stats">
        <div className="stat-card" onClick={() => setFilter("all")}>
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng yêu cầu</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter("cho_xu_ly")}>
          <div className="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Chờ xử lý</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter("da_hoan_tien")}>
          <div className="stat-icon approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Đã hoàn</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setFilter("tu_choi")}>
          <div className="stat-icon rejected">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Từ chối</span>
          </div>
        </div>
      </div>

      <div className="refund-filter">
        <span>Lọc theo trạng thái:</span>
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          Tất cả
        </button>
        <button className={filter === "cho_xu_ly" ? "active" : ""} onClick={() => setFilter("cho_xu_ly")}>
          Chờ xử lý
        </button>
        <button className={filter === "da_hoan_tien" ? "active" : ""} onClick={() => setFilter("da_hoan_tien")}>
          Đã hoàn tiền
        </button>
        <button className={filter === "tu_choi" ? "active" : ""} onClick={() => setFilter("tu_choi")}>
          Từ chối
        </button>
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <p>Không có yêu cầu hoàn tiền nào</p>
        </div>
      ) : (
        <div className="refund-list">
          {filteredRefunds.map((refund) => (
            <div key={refund.id} className={`refund-card ${refund.status}`}>
              <div className="refund-header">
                <div className="refund-id">#{refund.id}</div>
                <span
                  className="refund-status"
                  style={{ backgroundColor: STATUS_CONFIG[refund.status]?.color + "20", color: STATUS_CONFIG[refund.status]?.color }}
                >
                  {STATUS_CONFIG[refund.status]?.label}
                </span>
              </div>

              <div className="refund-body">
                <div className="refund-info">
                  <div className="info-row">
                    <span className="label">Khách hàng:</span>
                    <span className="value">{refund.ho_ten} ({refund.email})</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tour:</span>
                    <span className="value tour-name">{refund.tour_title}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Booking:</span>
                    <span className="value">#{refund.booking_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số tiền:</span>
                    <span className="value amount">{formatCurrency(refund.amount)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Lý do:</span>
                    <span className="value reason">{refund.reason || "Không có lý do"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày yêu cầu:</span>
                    <span className="value">{formatDate(refund.created_at)}</span>
                  </div>
                  {refund.ghi_chu && (
                    <div className="info-row">
                      <span className="label">Ghi chú:</span>
                      <span className="value">{refund.ghi_chu}</span>
                    </div>
                  )}
                </div>

                {refund.status === "cho_xu_ly" && (
                  <div className="refund-actions">
                    <button
                      className="btn-approve"
                      onClick={() => openModal(refund, "da_hoan_tien")}
                      disabled={processingId === refund.id}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4L12 14.01l-3-3" />
                      </svg>
                      Hoàn tiền
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => openModal(refund, "tu_choi")}
                      disabled={processingId === refund.id}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.show && (
        <div className="modal-overlay" onClick={() => setModal({ show: false, refund: null, action: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header ${modal.action}`}>
              {modal.action === "da_hoan_tien" ? (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <h2>Xác nhận hoàn tiền</h2>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  <h2>Xác nhận từ chối</h2>
                </>
              )}
            </div>

            <div className="modal-body">
              <p className="modal-info">
                Khách hàng: <strong>{modal.refund?.ho_ten}</strong><br />
                Tour: <strong>{modal.refund?.tour_title}</strong><br />
                Số tiền: <strong>{formatCurrency(modal.refund?.amount)}</strong>
              </p>

              <div className="form-group">
                <label>Ghi chú (tùy chọn)</label>
                <textarea
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder={modal.action === "da_hoan_tien" ? "Ghi chú về việc hoàn tiền..." : "Lý do từ chối hoàn tiền..."}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal({ show: false, refund: null, action: null })}>
                Hủy
              </button>
              <button
                className={`btn-confirm ${modal.action}`}
                onClick={handleProcess}
                disabled={processingId === modal.refund?.id}
              >
                {processingId === modal.refund?.id ? "Đang xử lý..." : modal.action === "da_hoan_tien" ? "Xác nhận hoàn tiền" : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header {
          margin-bottom: 32px;
        }

        .admin-header h1 {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }

        .admin-header p {
          color: #64748b;
          margin: 0;
        }

        .refund-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
          color: white;
        }

        .stat-icon.pending {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-icon.approved {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-icon.rejected {
          background: #fee2e2;
          color: #ef4444;
        }

        .stat-info {
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
        }

        .refund-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .refund-filter span {
          color: #64748b;
          font-size: 14px;
        }

        .refund-filter button {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .refund-filter button:hover {
          border-color: #00D4FF;
          color: #00D4FF;
        }

        .refund-filter button.active {
          background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
          color: white;
          border-color: transparent;
        }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
          background: white;
          border-radius: 16px;
          color: #94a3b8;
        }

        .empty-state svg {
          margin-bottom: 16px;
        }

        .empty-state p {
          margin: 0;
          font-size: 16px;
        }

        .refund-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .refund-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-left: 4px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .refund-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .refund-card.cho_xu_ly {
          border-left-color: #f59e0b;
        }

        .refund-card.da_hoan_tien {
          border-left-color: #10b981;
        }

        .refund-card.tu_choi {
          border-left-color: #ef4444;
        }

        .refund-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .refund-id {
          font-weight: 600;
          color: #1e293b;
        }

        .refund-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .refund-body {
          padding: 20px;
        }

        .refund-info {
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .info-row .label {
          color: #64748b;
          min-width: 120px;
        }

        .info-row .value {
          color: #1e293b;
          font-weight: 500;
        }

        .info-row .value.tour-name {
          color: #0099FF;
        }

        .info-row .value.amount {
          color: #10b981;
          font-size: 16px;
        }

        .info-row .value.reason {
          font-style: italic;
          color: #475569;
        }

        .refund-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-approve, .btn-reject {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 14px;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-approve:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-reject {
          background: #fee2e2;
          color: #ef4444;
        }

        .btn-reject:hover {
          background: #fecaca;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 480px;
          width: 100%;
          overflow: hidden;
          animation: modalIn 0.2s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .modal-header.da_hoan_tien {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #059669;
        }

        .modal-header.tu_choi {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-info {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          resize: none;
          font-family: inherit;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #00D4FF;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 20px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
        }

        .btn-cancel:hover {
          background: #f8fafc;
        }

        .btn-confirm {
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: white;
          border: none;
        }

        .btn-confirm.da_hoan_tien {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-confirm.tu_choi {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .btn-confirm:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .btn-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .refund-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .refund-actions {
            flex-direction: column;
          }

          .info-row {
            flex-direction: column;
            gap: 4px;
          }

          .info-row .label {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default ManageRefunds;
