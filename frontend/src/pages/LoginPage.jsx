import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.mat_khau);
      navigate(user.vai_tro === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
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
        <h2 style={{ marginBottom: 8, textAlign: "center" }}>Đăng nhập</h2>
        <p className="text-muted" style={{ textAlign: "center", marginBottom: 28 }}>
          Chào mừng trở lại Hội An Travel
        </p>

        {error && (
          <div style={{ background: "#F6DFDB", color: "var(--danger)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

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
            autoComplete="current-password"
            required
            value={form.mat_khau}
            onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-muted" style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          Chưa có tài khoản? <Link to="/dang-ky" style={{ color: "var(--tile)", fontWeight: 600 }}>Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}
