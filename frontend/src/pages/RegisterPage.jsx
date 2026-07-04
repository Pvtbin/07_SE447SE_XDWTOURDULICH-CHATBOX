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
      className="flex"
      style={{
        minHeight: "calc(100vh - 72px)",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper-deep)",
      }}
    >
      <form onSubmit={handleSubmit} className="card" style={{ padding: 40, width: 400 }}>
        <h2 style={{ marginBottom: 8, textAlign: "center" }}>Tạo tài khoản</h2>
        <p className="text-muted" style={{ textAlign: "center", marginBottom: 28 }}>
          Bắt đầu hành trình khám phá Hội An
        </p>

        {error && (
          <div style={{ background: "#F6DFDB", color: "var(--danger)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#DFF0E1", color: "var(--success)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            Đăng ký thành công! Đang chuyển đến trang đăng nhập...
          </div>
        )}

        <div className="field">
          <label>Họ và tên</label>
          <input
            type="text"
            required
            value={form.ho_ten}
            onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Mật khẩu</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.mat_khau}
            onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-muted" style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          Đã có tài khoản? <Link to="/dang-nhap" style={{ color: "var(--tile)", fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
