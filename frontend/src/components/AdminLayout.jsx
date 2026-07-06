import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Tổng quan", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ), end: true },
  { to: "/admin/tours", label: "Quản lý Tour", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )},
  { to: "/admin/bookings", label: "Đơn đặt tour", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { to: "/admin/payments", label: "Thanh toán", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )},
  { to: "/admin/refunds", label: "Hoàn tiền", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  )},
];

export default function AdminLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 76px)",
        background: "var(--ocean-mist)",
      }}
    >
      <div className="container" style={{ padding: "32px 24px 80px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }}>
        <aside>
          <div
            className="card"
            style={{
              padding: 24,
              position: "sticky",
              top: 100,
            }}
          >
            {/* Admin Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
                padding: "12px 16px",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--accent-purple)" }}>Bảng quản trị</div>
                <div style={{ fontSize: 12, color: "var(--slate)" }}>Quyền admin</div>
              </div>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: 14,
                    background: isActive ? "var(--gradient-neon)" : "transparent",
                    color: isActive ? "var(--white)" : "var(--ink-light)",
                    transition: "all 0.2s",
                    boxShadow: isActive ? "var(--shadow-neon)" : "none",
                  })}
                >
                  {l.icon}
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
