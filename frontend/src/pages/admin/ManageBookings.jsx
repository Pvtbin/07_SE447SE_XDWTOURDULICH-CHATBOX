import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAllBookingsApi, updateBookingStatusApi } from "../../api/bookings";

const STATUS_LABEL = {
  cho_xac_nhan: { text: "Chờ xác nhận", cls: "badge-pending" },
  da_xac_nhan: { text: "Đã xác nhận", cls: "badge-confirmed" },
  da_huy: { text: "Đã hủy", cls: "badge-cancelled" },
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const res = await getAllBookingsApi();
    setBookings(res.data);
  };

  const handleStatusChange = async (id, trang_thai) => {
    await updateBookingStatusApi(id, trang_thai);
    fetchBookings();
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
                  <td style={{ padding: 14 }}>{b.ho_ten}<br /><span className="text-muted" style={{ fontSize: 12 }}>{b.email}</span></td>
                  <td style={{ padding: 14 }}>{b.tieu_de}</td>
                  <td style={{ padding: 14 }}>{b.so_nguoi_dat}</td>
                  <td style={{ padding: 14 }}>{Number(b.tong_tien).toLocaleString("vi-VN")} đ</td>
                  <td style={{ padding: 14 }}><span className={`badge ${status.cls}`}>{status.text}</span></td>
                  <td style={{ padding: 14 }}>
                    {b.trang_thai === "cho_xac_nhan" && (
                      <>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", marginRight: 8 }} onClick={() => handleStatusChange(b.id, "da_xac_nhan")}>Duyệt</button>
                        <button className="btn btn-danger" style={{ padding: "6px 12px" }} onClick={() => handleStatusChange(b.id, "da_huy")}>Hủy</button>
                      </>
                    )}
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
