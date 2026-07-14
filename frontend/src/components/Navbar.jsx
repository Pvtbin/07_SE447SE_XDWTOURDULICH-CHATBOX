import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");

  };

  return (
    <header className="navbar">
      <nav className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 76 }}>
        <Link to="/" className="flex" style={{ alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-neon)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-neon)",
              overflow: "hidden" 
            }}
          >
            {}
            <img 
              src="/logo2.png" 
              alt="VNTravel Logo" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover" 
              }} 
            />
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 800,
            background: "var(--gradient-neon)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            VNTravel
          </span>
        </Link>

        <div className="flex" style={{ gap: 8, alignItems: "center" }}>
          <Link to="/" className="navbar__link">Trang chủ</Link>

          {user && (
            <Link to="/lich-su-dat-tour" className="navbar__link">Tour của tôi</Link>
          )}

          {user?.vai_tro === "admin" && (
            <Link
              to="/admin"
              className="navbar__link"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                color: "var(--accent-purple)",
              }}
            >
              Quản trị
            </Link>
          )}

          {user ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link
                to="/tai-khoan"
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  transition: "background 0.2s",
                }}
                className="user-link"
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--gradient-neon)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user.ho_ten?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-light)" }}>
                  {user.ho_ten}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--cloud)",
                  background: "transparent",
                  color: "var(--ink)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                to="/dang-nhap"
                className="btn btn-ghost"
                style={{ padding: "10px 20px" }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="btn btn-primary"
                style={{ padding: "10px 24px" }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
