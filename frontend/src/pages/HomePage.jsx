import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToursApi } from "../api/tours";
import { resolveImageUrl } from "../api/axiosClient";
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
    <div>
      {/* ============ HERO ============ */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--wall-soft) 0%, var(--paper) 78%)",
          paddingTop: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <LanternRow count={7} />

        <div className="container" style={{ textAlign: "center", paddingBottom: 64, paddingTop: 8 }}>
          <span className="eyebrow" style={{ justifyContent: "center", width: "100%" }}>
            Di sản văn hoá thế giới &nbsp;·&nbsp; Quảng Nam
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 1.1,
              margin: "20px 0 18px",
            }}
          >
            Hội An, đi chậm lại
            <br />
            để <span style={{ color: "var(--tile)" }}>thấy nhiều hơn</span>
          </h1>
          <p className="text-muted" style={{ fontSize: 18, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Từ ánh đèn lồng bên sông Hoài đến những làng nghề trăm năm tuổi —
            chọn tour, giữ chỗ và thanh toán chỉ trong một trang.
          </p>

          <div
            className="card flex"
            style={{ maxWidth: 580, margin: "0 auto", padding: 8, gap: 8, borderRadius: 999 }}
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
                padding: "13px 20px",
                fontSize: 15,
                background: "transparent",
              }}
            />
            <button className="btn btn-primary">Tìm kiếm</button>
          </div>
        </div>
      </section>

      <TileDivider color="var(--tile)" background="var(--paper)" />

      {/* ============ DANH SÁCH TOUR ============ */}
      <section className="container" style={{ padding: "56px 24px 64px" }}>
        <div className="flex-between" style={{ marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="eyebrow">Được chọn lọc kỹ</span>
            <h2 style={{ fontSize: 30, marginTop: 8 }}>Tour nổi bật</h2>
          </div>
        </div>

        {loading && <p className="text-muted">Đang tải tour...</p>}
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-muted">Chưa có tour nào phù hợp.</p>
        )}

        <div className="grid-tours">
          {filtered.map((tour) => (
            <Link to={`/tour/${tour.id}`} key={tour.id} className="card tour-card">
              <div className="tour-card__media">
                {tour.thumbnail ? (
                  <img src={resolveImageUrl(tour.thumbnail)} alt={tour.tieu_de} />
                ) : (
                  <div
                    className="fallback"
                    style={{ background: "linear-gradient(135deg, var(--tile), var(--wall))" }}
                  />
                )}
                <span className="tour-card__badge">{tour.dia_diem}</span>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{tour.tieu_de}</h3>
                <div className="flex-between">
                  <span style={{ fontWeight: 700, color: "var(--tile)", fontSize: 19 }}>
                    {Number(tour.gia).toLocaleString("vi-VN")} đ
                  </span>
                  {tour.diem_danh_gia && (
                    <span style={{ fontSize: 14 }} className="text-muted">⭐ {tour.diem_danh_gia}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <TileDivider color="var(--wall)" background="var(--paper)" />

      {/* ============ VÌ SAO CHỌN CHÚNG TÔI ============ */}
      <section style={{ background: "var(--paper)", padding: "64px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="eyebrow" style={{ justifyContent: "center", width: "100%" }}>Cam kết</span>
            <h2 style={{ fontSize: 30, marginTop: 8 }}>Vì sao chọn Hội An Travel</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            {REASONS.map((r) => (
              <div key={r.title} className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 34, marginBottom: 16 }}>{r.icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{r.title}</h3>
                <p className="text-muted" style={{ lineHeight: 1.6, fontSize: 15 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA — SÔNG HOÀI VỀ ĐÊM ============ */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--river-deep), var(--river))",
          padding: "64px 0",
        }}
      >
        <div
          className="container flex-between"
          style={{ flexWrap: "wrap", gap: 24 }}
        >
          <div>
            <h2 style={{ color: "var(--white)", fontSize: 28, marginBottom: 10 }}>
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, maxWidth: 440 }}>
              Tạo tài khoản miễn phí để lưu tour yêu thích và theo dõi lịch sử đặt chỗ.
            </p>
          </div>
          <Link to="/dang-ky" className="btn" style={{ background: "var(--white)", color: "var(--river-deep)", padding: "15px 32px" }}>
            Đăng ký ngay
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: "var(--ink)", padding: "28px 0" }}>
        <div className="container flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            © 2026 Hội An Travel — Đồ án CDIO4
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Làm bằng React · Node.js · MySQL
          </span>
        </div>
      </footer>
    </div>
  );
}