import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ho_ten: "", email: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.ho_ten, form.email, form.mat_khau);
      setSuccess(true);
      setTimeout(() => navigate("/dang-nhap"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 76px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          margin: 24,
          padding: 48,
          position: "relative",
          zIndex: 1,
          boxShadow: "var(--shadow-xl), var(--shadow-neon)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 20px",
              borderRadius: "var(--radius-lg)",
              background: "var(--gradient-neon)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-neon)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h2 style={{ marginBottom: 8, fontWeight: 800 }}>Tạo tài khoản</h2>
          <p className="text-muted">Bắt đầu hành trình khám phá Hội An</p>
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
              marginBottom: 20,
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <span style={{ color: "var(--danger)", fontSize: 14 }}>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 14,
              background: "var(--success-bg)",
              borderRadius: "var(--radius-md)",
              marginBottom: 20,
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            <span style={{ color: "var(--success)", fontSize: 14 }}>Đăng ký thành công! Đang chuyển hướng...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Họ và tên</label>
            <div style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                required
                value={form.ho_ten}
                onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                style={{ paddingLeft: 44 }}
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

          <div className="field">
            <label>Email</label>
            <div style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: 44 }}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="field">
            <label>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.mat_khau}
                onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                style={{ paddingLeft: 44 }}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: 8,
              padding: "16px",
              fontSize: 16,
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                <div className="spinner" style={{ width: 20, height: 20 }} />
                Đang xử lý...
              </span>
            ) : (
              <>
                Đăng ký
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
          Đã có tài khoản?{" "}
          <Link
            to="/dang-nhap"
            style={{
              fontWeight: 600,
              background: "var(--gradient-neon)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
