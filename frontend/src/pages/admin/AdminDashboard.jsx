import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getDashboardApi } from "../../api/bookings";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardApi().then((res) => setStats(res.data));
  }, []);

  const cards = [
    { label: "Tổng người dùng", value: stats?.tong_user, color: "var(--river)" },
    { label: "Tổng số tour", value: stats?.tong_tour, color: "var(--tile)" },
    { label: "Tổng đơn đặt", value: stats?.tong_booking, color: "var(--wall)" },
    {
      label: "Doanh thu (đã xác nhận)",
      value: stats ? `${Number(stats.doanh_thu).toLocaleString("vi-VN")} đ` : "...",
      color: "var(--success)",
    },
  ];

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Tổng quan</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 24, borderTop: `4px solid ${c.color}` }}>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 8 }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{c.value ?? "..."}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
