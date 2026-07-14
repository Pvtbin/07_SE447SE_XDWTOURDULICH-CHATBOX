import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getAllBookingsApi, updateBookingStatusApi, sendInvoiceApi } from "../../api/bookings";

const STATUS_LABEL = {
  cho_xac_nhan: { text: "Chờ xác nhận", cls: "badge-pending" },
  da_xac_nhan: { text: "Đã xác nhận", cls: "badge-confirmed" },
  da_huy: { text: "Đã hủy", cls: "badge-cancelled" },
  da_hoan_thanh: { text: "Hoàn thành", cls: "badge-confirmed" },
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [sendingId, setSendingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const res = await getAllBookingsApi();
    setBookings(res.data);
  };

  const handleStatusChange = async (id, trang_thai) => {
    await updateBookingStatusApi(id, trang_thai);
    fetchBookings();
  };

  const handleSendEmail = async (id, email) => {
    setSendingId(id);
    try {
      const res = await sendInvoiceApi(id);
      alert(`Đã gửi hóa đơn đến email: ${email}`);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể gửi email");
    } finally {
      setSendingId(null);
    }
  };

  const handlePrint = (id) => {
    navigate(`/admin/hoa-don/${id}`);
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Đơn đặt tour</h1>
      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-deep)", textAlign: "left" }}>
              <th style={{ padding: 14 }}>Khách hàng</th>
              <th style={{ padding: 14 }}>Tour</th>
              <th style={{ padding: 14 }}>Số người</th>
              <th style={{ padding: 14 }}>Tổng tiền</th>
              <th style={{ padding: 14 }}>Trạng thái</th>
              <th style={{ padding: 14 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const status = STATUS_LABEL[b.trang_thai] || {};
              return (
                <tr key={b.id} style={{ borderTop: "1px solid var(--wall-soft)" }}>
                  <td style={{ padding: 14 }}>
                    {b.ho_ten}
                    <br />
                    <span className="text-muted" style={{ fontSize: 12 }}>{b.email}</span>
                  </td>
                  <td style={{ padding: 14 }}>{b.tieu_de}</td>
                  <td style={{ padding: 14 }}>{b.so_nguoi_dat}</td>
                  <td style={{ padding: 14 }}>{Number(b.tong_tien).toLocaleString("vi-VN")} đ</td>
                  <td style={{ padding: 14 }}>
                    <span className={`badge ${status.cls}`}>{status.text}</span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      
                      {/* 1. TRẠNG THÁI: CHỜ XÁC NHẬN */}
                      {b.trang_thai === "cho_xac_nhan" && (
                        <>
                          {/* Đổi btn-secondary thành btn-success nếu theme của bạn hỗ trợ để nút Duyệt có màu xanh lá cây */}
                          <button 
                            className="btn btn-success" 
                            style={{ padding: "6px 12px", background: "#2e7d32", color: "#fff" }} 
                            onClick={() => handleStatusChange(b.id, "da_xac_nhan")}
                          >
                            Duyệt
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: "6px 12px" }} 
                            onClick={() => handleStatusChange(b.id, "da_huy")}
                          >
                            Hủy
                          </button>
                        </>
                      )}

                      {/* 2. TRẠNG THÁI: ĐÃ XÁC NHẬN HOẶC HOÀN THÀNH */}
                      {(b.trang_thai === "da_xac_nhan" || b.trang_thai === "da_hoan_thanh") && (
                        <>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 12px" }}
                            onClick={() => handleSendEmail(b.id, b.email)}
                            disabled={sendingId === b.id}
                          >
                            {sendingId === b.id ? "Đang gửi..." : "Gửi email"}
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "6px 12px" }}
                            onClick={() => handlePrint(b.id)}
                          >
                            In hóa đơn
                          </button>
                        </>
                      )}

                      {/* 3. TRẠNG THÁI: ĐÃ HỦY */}
                      {b.trang_thai === "da_huy" && (
                        <span style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
                          Không có hành động
                        </span>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}