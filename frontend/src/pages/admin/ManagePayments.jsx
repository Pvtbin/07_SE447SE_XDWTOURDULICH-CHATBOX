import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getAllPaymentsApi, verifyPaymentApi } from "../../api/bookings";

const STATUS_LABEL = {
  cho_thanh_toan: { text: "Chờ thanh toán", cls: "badge-pending" },
  da_thanh_toan: { text: "Đã thanh toán", cls: "badge-confirmed" },
  that_bai: { text: "Thất bại", cls: "badge-cancelled" },
};

const METHOD_LABEL = {
  tien_mat: "Tiền mặt",
  chuyen_khoan: "Chuyển khoản",
  momo: "MoMo",
  vnpay: "VNPay",
};

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await getAllPaymentsApi();
      setPayments(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Xác nhận đã nhận được thanh toán này?")) return;
    await verifyPaymentApi(id);
    fetchPayments();
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Thanh toán</h1>

      {loading && <p className="text-muted">Đang tải...</p>}

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-deep)", textAlign: "left" }}>
              <th style={{ padding: 14 }}>Khách hàng</th>
              <th style={{ padding: 14 }}>Tour</th>
              <th style={{ padding: 14 }}>Số tiền</th>
              <th style={{ padding: 14 }}>Phương thức</th>
              <th style={{ padding: 14 }}>Trạng thái</th>
              <th style={{ padding: 14 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const status = STATUS_LABEL[p.trang_thai] || {};
              return (
                <tr key={p.id} style={{ borderTop: "1px solid var(--wall-soft)" }}>
                  <td style={{ padding: 14 }}>{p.ho_ten}</td>
                  <td style={{ padding: 14 }}>{p.tieu_de}</td>
                  <td style={{ padding: 14 }}>{Number(p.so_tien).toLocaleString("vi-VN")} đ</td>
                  <td style={{ padding: 14 }}>{METHOD_LABEL[p.phuong_thuc] || p.phuong_thuc}</td>
                  <td style={{ padding: 14 }}><span className={`badge ${status.cls}`}>{status.text}</span></td>
                  <td style={{ padding: 14 }}>
                    {p.trang_thai === "cho_thanh_toan" && (
                      <button className="btn btn-secondary" style={{ padding: "6px 14px" }} onClick={() => handleVerify(p.id)}>
                        Xác nhận đã nhận tiền
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && payments.length === 0 && (
          <p className="text-muted" style={{ padding: 20 }}>Chưa có giao dịch nào.</p>
        )}
      </div>
    </AdminLayout>
  );
}
