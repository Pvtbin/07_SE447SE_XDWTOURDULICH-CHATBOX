import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LanternMark() {
  return (
    <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
      <line x1="15" y1="0" x2="15" y2="6" stroke="#7A6A57" strokeWidth="1.5" />
      <ellipse cx="15" cy="19" rx="12" ry="15" fill="#D64550" />
      <rect x="3" y="12" width="24" height="3" fill="#241A12" opacity="0.25" />
      <rect x="3" y="24" width="24" height="3" fill="#241A12" opacity="0.25" />
      <circle cx="15" cy="33" r="1.5" fill="#7A6A57" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <nav className="container flex-between" style={{ height: 76 }}>
        <Link to="/" className="flex" style={{ alignItems: "center", gap: 10 }}>
          <LanternMark />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--tile)" }}>
            Hội An Travel
          </span>
        </Link>

        <div className="flex" style={{ gap: 30, alignItems: "center" }}>
          <Link to="/" className="navbar__link">Trang chủ</Link>
          {user && <Link to="/lich-su-dat-tour" className="navbar__link">Tour của tôi</Link>}
          {user?.vai_tro === "admin" && (
            <Link to="/admin" className="navbar__link" style={{ color: "var(--river)" }}>Quản trị</Link>
          )}

          {user ? (
            <div className="flex" style={{ gap: 14, alignItems: "center" }}>
              <span className="text-muted" style={{ fontSize: 14 }}>Xin chào, {user.ho_ten}</span>
              <button className="btn btn-ghost" style={{ padding: "9px 20px" }} onClick={handleLogout}>Đăng xuất</button>
            </div>
          ) : (
            <div className="flex" style={{ gap: 10 }}>
              <Link to="/dang-nhap" className="btn btn-ghost" style={{ padding: "9px 20px" }}>Đăng nhập</Link>
              <Link to="/dang-ky" className="btn btn-primary" style={{ padding: "9px 22px" }}>Đăng ký</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
