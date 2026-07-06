import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { createPaymentApi } from "../api/bookings";

const METHODS = [
  { value: "tien_mat", label: "Tiền mặt", desc: "Thanh toán trực tiếp khi khởi hành", icon: "💵" },
  { value: "chuyen_khoan", label: "Chuyển khoản", desc: "Quét mã QR ngân hàng", icon: "🏦" },
  { value: "momo", label: "Ví MoMo", desc: "Thanh toán qua ứng dụng MoMo", icon: "📱" },
  { value: "vnpay", label: "VNPay", desc: "Cổng thanh toán VNPay", icon: "💳" },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const { state } = useLocation(); // { tongTien, tenTour, soNguoiDat } — có thể rỗng nếu F5 trang
  const navigate = useNavigate();

  const [method, setMethod] = useState("tien_mat");
  const [qrUrl, setQrUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  const tongTien = state?.tongTien;

  const handleConfirm = async () => {
    setError("");
    setStatus("loading");
    try {
      const res = await createPaymentApi({ booking_id: bookingId, phuong_thuc: method });
      if (res.data.qrUrl) setQrUrl(res.data.qrUrl);
      setStatus("done");
    } catch (err) {
      setError(err.response?.data?.message || "Tạo yêu cầu thanh toán thất bại");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="container" style={{ maxWidth: 560, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏮</div>
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>Đã ghi nhận yêu cầu thanh toán</h1>
        <p className="text-muted" style={{ marginBottom: 8 }}>
          Đơn đặt tour <strong>#{bookingId}</strong> đang ở trạng thái <em>chờ xác nhận</em>.
        </p>
        <p className="text-muted" style={{ marginBottom: 28 }}>
          {method === "tien_mat"
            ? "Vui lòng thanh toán tiền mặt khi khởi hành. Đơn sẽ được xác nhận sau khi ban quản trị duyệt."
            : "Sau khi chuyển khoản/thanh toán, ban quản trị sẽ đối soát và xác nhận đơn trong thời gian sớm nhất."}
        </p>

        {qrUrl && (
          <div className="card" style={{ padding: 20, marginBottom: 28, display: "inline-block" }}>
            <img src={qrUrl} alt="Mã QR thanh toán" style={{ width: 220, borderRadius: 8 }} />
          </div>
        )}

        <div className="flex" style={{ justifyContent: "center", gap: 12 }}>
          <Link to="/lich-su-dat-tour" className="btn btn-primary">Xem đơn của tôi</Link>
          <Link to="/" className="btn btn-ghost">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 640, padding: "48px 24px 80px" }}>
      <span className="eyebrow">Bước 2 / 2</span>
      <h1 style={{ fontSize: 30, margin: "10px 0 28px" }}>Thanh toán đơn đặt tour</h1>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <span className="text-muted">Mã đơn</span>
          <strong>#{bookingId}</strong>
        </div>
        {state?.tenTour && (
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <span className="text-muted">Tour</span>
            <strong>{state.tenTour}</strong>
          </div>
        )}
        {state?.soNguoiDat && (
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <span className="text-muted">Số người</span>
            <strong>{state.soNguoiDat}</strong>
          </div>
        )}
        <div className="flex-between" style={{ paddingTop: 12, borderTop: "1px dashed var(--wall-soft)" }}>
          <span className="text-muted">Tổng tiền</span>
          <strong style={{ fontSize: 20, color: "var(--tile)" }}>
            {tongTien ? `${Number(tongTien).toLocaleString("vi-VN")} đ` : "Xem chi tiết trong đơn"}
          </strong>
        </div>
      </div>

      <h3 style={{ marginBottom: 14 }}>Chọn phương thức thanh toán</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            className="card"
            style={{
              padding: 18,
              textAlign: "left",
              border: method === m.value ? "2px solid var(--tile)" : "1px solid rgba(185,78,44,0.07)",
              background: method === m.value ? "rgba(185,78,44,0.05)" : "var(--white)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</p>}

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        onClick={handleConfirm}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Đang xử lý..." : "Xác nhận thanh toán"}
      </button>
    </div>
  );
}
