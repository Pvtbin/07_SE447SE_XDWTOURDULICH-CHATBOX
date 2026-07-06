import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { createPaymentApi } from "../api/bookings";

const METHODS = [
  {
    value: "tien_mat",
    label: "Tiền mặt",
    desc: "Thanh toán trực tiếp khi khởi hành",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M6 12h.01M18 12h.01"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #10B981, #14B8A6)",
  },
  {
    value: "chuyen_khoan",
    label: "Chuyển khoản",
    desc: "Quét mã QR ngân hàng",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #0099FF, #00D4FF)",
  },
  {
    value: "momo",
    label: "Ví MoMo",
    desc: "Thanh toán qua ứng dụng MoMo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
  },
  {
    value: "vnpay",
    label: "VNPay",
    desc: "Cổng thanh toán VNPay",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
  },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("tien_mat");
  const [qrUrl, setQrUrl] = useState(null);
  const [status, setStatus] = useState("idle");
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
      <div className="container" style={{ maxWidth: 600, padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 100,
            height: 100,
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "var(--gradient-neon)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-neon-lg)",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Đã ghi nhận thanh toán</h1>
        <p className="text-muted" style={{ marginBottom: 8, maxWidth: 400, margin: "0 auto" }}>
          Đơn đặt tour <strong style={{ color: "var(--ink)" }}>#{bookingId}</strong> đang ở trạng thái chờ xác nhận.
        </p>
        <p className="text-muted" style={{ marginBottom: 32, maxWidth: 400, margin: "16px auto 0" }}>
          {method === "tien_mat"
            ? "Vui lòng thanh toán tiền mặt khi khởi hành. Đơn sẽ được xác nhận sau khi ban quản trị duyệt."
            : "Sau khi chuyển khoản/thanh toán, ban quản trị sẽ đối soát và xác nhận đơn trong thời gian sớm nhất."}
        </p>

        {qrUrl && (
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 32,
              display: "inline-block",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <img src={qrUrl} alt="Mã QR thanh toán" style={{ width: 240, borderRadius: "var(--radius-md)" }} />
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
    <div className="container" style={{ maxWidth: 700, padding: "48px 24px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            background: "var(--ocean-light)",
            borderRadius: "var(--radius-full)",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 14 }}>💳</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ocean-mid)" }}>Bước 2 / 2</span>
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Thanh toán</h1>
        <p className="text-muted">Chọn phương thức thanh toán phù hợp với bạn</p>
      </div>

      {/* Booking Summary */}
      <div
        className="card"
        style={{
          padding: 28,
          marginBottom: 32,
          background: "linear-gradient(135deg, var(--ocean-mist), var(--white))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-neon)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)" }}>Mã đơn hàng</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>#{bookingId}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {state?.tenTour && (
            <div className="flex-between" style={{ padding: "8px 0" }}>
              <span className="text-muted">Tour</span>
              <strong>{state.tenTour}</strong>
            </div>
          )}
          {state?.soNguoiDat && (
            <div className="flex-between" style={{ padding: "8px 0" }}>
              <span className="text-muted">Số người</span>
              <strong>{state.soNguoiDat}</strong>
            </div>
          )}
          <div
            className="flex-between"
            style={{
              paddingTop: 16,
              borderTop: "2px dashed var(--cloud)",
            }}
          >
            <span style={{ fontWeight: 600 }}>Tổng tiền</span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                background: "var(--gradient-neon)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {tongTien ? `${Number(tongTien).toLocaleString("vi-VN")} đ` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <h3 style={{ marginBottom: 16, fontSize: 18 }}>Phương thức thanh toán</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            className="card"
            style={{
              padding: 24,
              textAlign: "left",
              border: method === m.value ? "2px solid var(--neon-cyan)" : "2px solid transparent",
              background: method === m.value
                ? "linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(139, 92, 246, 0.05))"
                : "var(--white)",
              boxShadow: method === m.value ? "var(--shadow-neon)" : "var(--shadow-sm)",
              transition: "all 0.3s var(--ease-smooth)",
              transform: method === m.value ? "scale(1.02)" : "scale(1)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "var(--radius-md)",
                background: m.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                marginBottom: 12,
                boxShadow: method === m.value
                  ? "0 8px 16px rgba(0, 0, 0, 0.2)"
                  : "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {m.icon}
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>{m.label}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 14,
            background: "var(--danger-bg)",
            borderRadius: "var(--radius-md)",
            marginBottom: 16,
            color: "var(--danger)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%", padding: 16, fontSize: 16 }}
        onClick={handleConfirm}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <div className="spinner" style={{ width: 20, height: 20 }} />
            Đang xử lý...
          </span>
        ) : (
          <>
            Xác nhận thanh toán
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
