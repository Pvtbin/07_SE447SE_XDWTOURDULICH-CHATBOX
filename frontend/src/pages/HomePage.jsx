import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToursApi } from "../api/tours";
import { resolveImageUrl } from "../api/axiosClient";

const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "Đặt tour tức thì",
    desc: "Chỉ mất 60 giây để chọn tour, nhập số người và xác nhận. Không cần tải app, không cần gọi điện.",
    gradient: "linear-gradient(135deg, #00D4FF, #0099FF)",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Thanh toán an toàn",
    desc: "Hỗ trợ QR ngân hàng, MoMo, VNPay và tiền mặt. Mọi giao dịch đều được ghi nhận rõ ràng.",
    gradient: "linear-gradient(135deg, #14B8A6, #00D4FF)",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
      </svg>
    ),
    title: "Hỗ trợ 24/7",
    desc: "Chatbot AI sẵn sàng giải đáp mọi thắc mắc về tour, lịch trình và phương thức thanh toán.",
    gradient: "linear-gradient(135deg, #8B5CF6, #EC4899)",
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

  // Backend trả về field image_url từ tour_images table
  const getTourImage = (tour) => {
    // Backend query trả về image_url (từ tour_images.is_thumbnail = TRUE)
    const imageUrl = tour.image_url || tour.thumbnail;
    return imageUrl ? resolveImageUrl(imageUrl) : null;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ============ HERO SECTION - Neon Ocean Style ============ */}
      <section
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 100% 80% at 50% -20%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 50% at 100% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 60% 50% at 0% 80%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
              var(--snow)
            `,
          }}
        />

        {/* Floating Orbs */}
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
            animationDelay: "-1.5s",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                borderRadius: "var(--radius-full)",
                marginBottom: 24,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--neon-cyan)" }}>
                Di sản văn hóa thế giới UNESCO
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 24,
                background: "linear-gradient(135deg, #0F172A 0%, #003366 50%, #00D4FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Khám phá Hội An
              <br />
              <span style={{
                background: "var(--gradient-neon)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Theo cách của bạn
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
                color: "var(--slate)",
                lineHeight: 1.7,
                maxWidth: 600,
                margin: "0 auto 40px",
              }}
            >
              Từ phố cổ vàng rực rỡ đến biển An Bàng xanh ngát —
              chọn tour, đặt chỗ và thanh toán chỉ trong vài chạm.
            </p>

            {/* Search Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: 600,
                margin: "0 auto",
                padding: 12,
                background: "var(--white)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl), var(--shadow-neon)",
                border: "1px solid rgba(0, 212, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, padding: "0 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm tour theo tên hoặc địa điểm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 16,
                    background: "transparent",
                    color: "var(--ink)",
                  }}
                />
              </div>
              <button className="btn btn-primary" style={{ padding: "14px 32px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                Tìm tour
              </button>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 48,
                marginTop: 60,
                flexWrap: "wrap",
              }}
            >
              {[
                { number: "50+", label: "Tour chất lượng" },
                { number: "10K+", label: "Khách hài lòng" },
                { number: "4.9", label: "Đánh giá TB" },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      background: "var(--gradient-neon)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.number}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--slate)", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave decoration at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 120" style={{ width: "100%", height: 80 }}>
            <path
              d="M0,64 C288,120 576,0 864,64 C1152,128 1440,32 1440,64 L1440,120 L0,120 Z"
              fill="var(--snow)"
            />
          </svg>
        </div>
      </section>

      {/* ============ FEATURED TOURS ============ */}
      <section className="container" style={{ padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "var(--ocean-light)",
              borderRadius: "var(--radius-full)",
              marginBottom: 16,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ocean-mid)" }}>Curated Collection</span>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", marginBottom: 12 }}>
            Tour <span className="text-gradient">nổi bật</span> tuần này
          </h2>
          <p className="text-muted" style={{ maxWidth: 500, margin: "0 auto", fontSize: 16 }}>
            Những trải nghiệm được khách hàng yêu thích nhất, từ phố cổ đến biển đảo.
          </p>
        </div>

        {loading && (
          <div className="flex-center" style={{ padding: 60 }}>
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              background: "var(--danger-bg)",
              borderRadius: "var(--radius-lg)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--slate)" }}>
            Không tìm thấy tour phù hợp với từ khóa "{search}"
          </div>
        )}

        <div className="grid-tours">
          {filtered.map((tour, index) => {
            const imageUrl = getTourImage(tour);
            return (
              <Link
                to={`/tour/${tour.id}`}
                key={tour.id}
                className="card tour-card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: "fadeInUp 0.6s var(--ease-smooth) forwards",
                  opacity: 0,
                }}
              >
                <div className="tour-card__media">
                  {imageUrl ? (
                    <img src={imageUrl} alt={tour.tieu_de} loading="lazy" />
                  ) : (
                    <div
                      className="fallback"
                      style={{
                        background: "linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                  <span className="tour-card__badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {tour.dia_diem}
                  </span>
                  {tour.rating > 0 && (
                    <span className="tour-card__rating">
                      ⭐ {tour.rating}
                    </span>
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 12, fontWeight: 700 }}>{tour.tieu_de}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--slate)", fontSize: 14 }}>
                    {tour.days && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{tour.days} ngày</span>
                        <span>·</span>
                      </>
                    )}
                    {tour.people && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>Tối đa {tour.people} người</span>
                      </>
                    )}
                  </div>
                  <div className="flex-between">
                    <div>
                      <span style={{ fontSize: 12, color: "var(--slate)" }}>Từ</span>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          background: "var(--gradient-neon)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {Number(tour.gia).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--neon-cyan)",
                      }}
                    >
                      Xem chi tiết
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--ocean-mist) 0%, var(--snow) 100%)",
          padding: "100px 0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                background: "rgba(0, 212, 255, 0.1)",
                borderRadius: "var(--radius-full)",
                marginBottom: 16,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--neon-cyan)" }}>Tại sao chọn chúng tôi?</span>
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}>
              Trải nghiệm đặt tour <span className="text-gradient">hoàn toàn mới</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 32,
            }}
          >
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="card"
                style={{
                  padding: 32,
                  textAlign: "center",
                  animationDelay: `${index * 0.1}s`,
                  animation: "fadeInUp 0.6s var(--ease-smooth) forwards",
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    margin: "0 auto 20px",
                    borderRadius: "var(--radius-lg)",
                    background: feature.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--white)",
                    boxShadow: "var(--shadow-neon)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{feature.title}</h3>
                <p className="text-muted" style={{ lineHeight: 1.7 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section
        style={{
          position: "relative",
          padding: "120px 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 50%, var(--neon-cyan) 100%)
            `,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--white)", marginBottom: 20 }}>
              Sẵn sàng cho chuyến phiêu lưu tiếp theo?
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40, lineHeight: 1.7 }}>
              Tạo tài khoản miễn phí để lưu tour yêu thích, theo dõi lịch sử đặt chỗ và nhận ưu đãi độc quyền.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/dang-ky"
                className="btn"
                style={{
                  background: "var(--white)",
                  color: "var(--ocean-deep)",
                  padding: "16px 40px",
                  fontSize: 16,
                  boxShadow: "var(--shadow-xl)",
                }}
              >
                Đăng ký miễn phí
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                to="/"
                className="btn"
                style={{
                  background: "transparent",
                  color: "var(--white)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  padding: "16px 40px",
                  fontSize: 16,
                }}
              >
                Khám phá tất cả tour
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        style={{
          background: "var(--ink)",
          padding: "60px 0 30px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 40,
              marginBottom: 40,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background: "var(--gradient-neon)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
                  </svg>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--white)" }}>Hội An Travel</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                Khám phá vẻ đẹp phố cổ Hội An qua những tour du lịch được chọn lọc kỹ càng.
              </p>
            </div>

            <div>
              <h4 style={{ color: "var(--white)", marginBottom: 16, fontSize: 16 }}>Liên kết nhanh</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Trang chủ", "Danh sách tour", "Về chúng tôi", "Liên hệ"].map((link) => (
                  <a key={link} href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, transition: "color 0.2s" }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "var(--white)", marginBottom: 16, fontSize: 16 }}>Hỗ trợ</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Câu hỏi thường gặp", "Chính sách hủy tour", "Điều khoản sử dụng", "Bảo mật"].map((link) => (
                  <a key={link} href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "var(--white)", marginBottom: 16, fontSize: 16 }}>Liên hệ</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  0900-000-000
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  support@hoiantravel.vn
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 30,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              © 2026 Hội An Travel — Đồ án CDIO4. All rights reserved.
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              Made with React · Node.js · MySQL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
