import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/tours", label: "Quản lý Tour" },
  { to: "/admin/bookings", label: "Đơn đặt tour" },
  { to: "/admin/payments", label: "Thanh toán" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="container" style={{ padding: "32px 24px 80px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>
      <aside>
        <h3 style={{ marginBottom: 20, color: "var(--river)" }}>Bảng quản trị</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                padding: "10px 14px",
                borderRadius: 8,
                fontWeight: 600,
                background: isActive ? "var(--river)" : "transparent",
                color: isActive ? "var(--white)" : "var(--ink)",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
