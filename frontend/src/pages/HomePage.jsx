import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToursApi } from "../api/tours";
import LanternRow from "../components/LanternRow";
import TileDivider from "../components/TileDivider";

const REASONS = [
  {
    icon: "🏮",
    title: "Trải nghiệm bản địa thật",
    desc: "Không phải tour đóng gói sẵn — mỗi lịch trình được dựng theo nhịp sống của người Hội An, từ chợ sớm đến đèn lồng đêm rằm.",
  },
  {
    icon: "🛶",
    title: "Đối tác uy tín tại chỗ",
    desc: "Toàn bộ tour do các hộ kinh doanh và hướng dẫn viên địa phương trực tiếp vận hành, được kiểm duyệt kỹ trước khi lên hệ thống.",
  },
  {
    icon: "💳",
    title: "Đặt & thanh toán trong 1 phút",
    desc: "Giữ chỗ tức thì, thanh toán qua chuyển khoản QR hoặc ví điện tử, theo dõi trạng thái đơn ngay trong tài khoản.",
  },
];

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await getToursApi();
      setTours(res.data);
    } catch {
      setError("Không tải được danh sách tour. Kiểm tra backend đã chạy chưa.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = tours.filter(
    (t) =>
      t.tieu_de?.toLowerCase().includes(search.toLowerCase()) ||
      t.dia_diem?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--ink)' }}>
      {/* ============ HERO ============ */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--wall-soft) 0%, rgba(255,255,255,0.9) 100%)",
          paddingTop: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LanternRow count={7} />

        <div className="container" style={{ textAlign: "center", paddingBottom: 80, paddingTop: 40, maxWidth: "1200px", margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
          <span className="eyebrow" style={{ 
            display: "inline-flex",
            justifyContent: "center", 
            alignItems: "center",
            background: "rgba(234, 88, 12, 0.08)",
            color: "var(--tile, #ea580c)",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "24px"
          }}>
            Di sản văn hoá thế giới &nbsp;·&nbsp; Quảng Nam
          </span>
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              lineHeight: 1.15,
              fontWeight: "800",
              margin: "0 0 24px",
              letterSpacing: "-0.02em",
              color: "#1e293b"
            }}
          >
            Hội An, đi chậm lại
            <br />
            để <span style={{ color: "var(--tile, #ea580c)", position: "relative", display: "inline-block" }}>thấy nhiều hơn</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "19px", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.65, color: "#64748b" }}>
            Từ ánh đèn lồng bên sông Hoài đến những làng nghề trăm năm tuổi —
            chọn tour, giữ chỗ và thanh toán chỉ trong một trang.
          </p>

          <div
            className="card flex"
            style={{ 
              maxWidth: "620px", 
              margin: "0 auto", 
              padding: "10px", 
              display: "flex",
              alignItems: "center",
              gap: "12px", 
              borderRadius: "999px",
              background: "#ffffff",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.06)"
            }}
          >
            <input
              type="text"
              placeholder="Tìm theo tên tour hoặc địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "14px 24px",
                fontSize: "16px",
                background: "transparent",
                width: "100%"
              }}
            />
            <button className="btn btn-primary" style={{
              background: "var(--tile, #ea580c)",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)"
            }}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      <TileDivider color="var(--tile)" background="var(--paper)" />

      {/* ============ DANH SÁCH TOUR ============ */}
      <section className="container" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="flex-between" style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className="eyebrow" style={{ color: "#64748b", textTransform: "uppercase", fontSize: "13px", fontWeight: "600", letterSpacing: "0.05em" }}>
              Được chọn lọc kỹ
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "700", marginTop: "8px", color: "#1e293b", letterSpacing: "-0.01em" }}>
              Tour nổi bật
            </h2>
          </div>
        </div>

        {loading && <p className="text-muted" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Đang tải tour...</p>}
        {error && <p style={{ color: "var(--danger, #ef4444)", textAlign: "center", padding: "40px", fontWeight: "500" }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-muted" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Chưa có tour nào phù hợp.</p>
        )}

        <div className="grid-tours" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "32px" 
        }}>
          {filtered.map((tour) => (
            <Link 
              to={`/tour/${tour.id}`} 
              key={tour.id} 
              className="card tour-card"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03)",
                border: "1px solid #f1f5f9",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "rgba(234, 88, 12, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03)";
                e.currentTarget.style.borderColor = "#f1f5f9";
              }}
            >
              <div className="tour-card__media" style={{ position: "relative", height: "240px", width: "100%", overflow: "hidden", background: "#f8fafc" }}>
                {tour.thumbnail ? (
                  <img src={tour.thumbnail} alt={tour.tieu_de} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div
                    className="fallback"
                    style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--tile, #ea580c), #fdba74)" }}
                  />
                )}
                <span className="tour-card__badge" style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(4px)",
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.02em"
                }}>
                  {tour.dia_diem}
                </span>
              </div>
              <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "19px", fontWeight: "600", lineHeight: "1.4", margin: "0 0 16px", color: "#1e293b" }}>{tour.tieu_de}</h3>
                <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontWeight: "700", color: "var(--tile, #ea580c)", fontSize: "21px", letterSpacing: "-0.02em" }}>
                    {Number(tour.gia).toLocaleString("vi-VN")} đ
                  </span>
                  {tour.diem_danh_gia && (
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px" }} className="text-muted">
                      ⭐ {tour.diem_danh_gia}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <TileDivider color="var(--wall)" background="var(--paper)" />

      {/* ============ VÌ SAO CHỌN CHÚNG TÔI ============ */}
      <section style={{ background: "var(--paper, #f8fafc)", padding: "80px 24px" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="eyebrow" style={{ color: "var(--tile, #ea580c)", textTransform: "uppercase", fontSize: "13px", fontWeight: "600", letterSpacing: "0.05em" }}>Cam kết</span>
            <h2 style={{ fontSize: "36px", fontWeight: "700", marginTop: "8px", color: "#1e293b" }}>Vì sao chọn Hội An Travel</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            {REASONS.map((r) => (
              <div key={r.title} className="card" style={{ 
                padding: "36px", 
                background: "#ffffff", 
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.02)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -4px rgba(0,0,0,0.02)"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>{r.icon}</div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#1e293b" }}>{r.title}</h3>
                <p className="text-muted" style={{ lineHeight: "1.65", fontSize: "15px", color: "#64748b", margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA — SÔNG HOÀI VỀ ĐÊM ============ */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--river-deep, #0f172a), var(--river, #1e293b))",
          padding: "80px 24px",
        }}
      >
        <div
          className="container flex-between"
          style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "32px" }}
        >
          <div>
            <h2 style={{ color: "#ffffff", fontSize: "32px", fontWeight: "700", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", maxWidth: "480px", lineHeight: "1.6", margin: 0 }}>
              Tạo tài khoản miễn phí để lưu tour yêu thích và theo dõi lịch sử đặt chỗ.
            </p>
          </div>
          <Link to="/dang-ky" className="btn" style={{ 
            background: "#ffffff", 
            color: "var(--river-deep, #0f172a)", 
            padding: "16px 36px", 
            borderRadius: "999px",
            fontWeight: "600",
            fontSize: "16px",
            textDecoration: "none",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Đăng ký ngay
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: "var(--ink, #0f172a)", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container flex-between" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            © 2026 Hội An Travel — Đồ án CDIO4
          </span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
            Làm bằng React · Node.js · MySQL
          </span>
        </div>
      </footer>
    </div>
  );
}