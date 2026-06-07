// HomePage.jsx — TravelVN · Hội An aesthetic
// Requires: lucide-react
// Google Fonts: Playfair Display + DM Sans (add to index.html)
import "../styles/HomePage.css";
 
import React, { useState, useEffect } from "react";
import { MapPin, Search, Star, ChevronRight, ArrowRight, Users, Shield, Headphones, Menu, X } from "lucide-react";

import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

 
// ── Mock data ──
const DESTINATIONS = [
  { name: "Hội An",     count: "42 tour", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80" },
  { name: "Hà Nội",    count: "38 tour", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80" },
  { name: "Đà Nẵng",   count: "31 tour", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80" },
  { name: "Phú Quốc",  count: "28 tour", img: "https://images.unsplash.com/photo-1548018560-c7196548f4e6?w=600&q=80" },
];
 
const TOURS = [
  {
    id: 1, badge: "HOT", badgeType: "hot",
    name: "Phố Cổ Hội An & Làng Gốm Thanh Hà",
    location: "Hội An, Quảng Nam",
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&q=80",
    days: 3, people: "2-12", rating: 4.9, reviews: 128, price: "1.290.000",
  },
  {
    id: 2, badge: "MỚI", badgeType: "new",
    name: "Vịnh Hạ Long — Thuyền Gỗ Qua Đêm",
    location: "Hạ Long, Quảng Ninh",
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80",
    days: 2, people: "4-15", rating: 4.8, reviews: 96, price: "2.490.000",
  },
  {
    id: 3, badge: "SALE", badgeType: "",
    name: "Sapa Trekking — Bản Cát Cát & Fansipan",
    location: "Sa Pa, Lào Cai",
    img: "https://images.unsplash.com/photo-1598935888738-cd2622bcd437?w=700&q=80",
    days: 4, people: "2-10", rating: 4.7, reviews: 74, price: "1.890.000",
  },
];
 
const WHY = [
  { icon: <Shield size={24} />, title: "An tâm đặt tour", desc: "Mọi tour đều được kiểm duyệt chặt chẽ. Hoàn tiền 100% nếu bị hủy do lỗi của chúng tôi." },
  { icon: <Users size={24} />, title: "Hướng dẫn viên địa phương", desc: "Đội ngũ hướng dẫn viên bản địa am hiểu văn hóa, lịch sử và những góc khuất thú vị nhất." },
  { icon: <Headphones size={24} />, title: "Hỗ trợ 24/7", desc: "Đội ngũ hỗ trợ luôn sẵn sàng trong suốt hành trình của bạn, bất kể ngày hay đêm." },
];
 
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
 
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
 
  return (
    <>
 
      {/* NAV */}
      <nav className={`hp-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="hp-logo">
          <img src="/icon.png" alt="TravelVN" className="hp-logo-image" />
          <span className="hp-logo-text">Travel<em>VN</em></span>
        </a>
 
        <div className="hp-nav-links">
          {["Trang chủ", "Tour", "Ưu đãi", "Blog", "Về chúng tôi"].map(l => (
            <a key={l} href="#">{l}</a>
          ))}
        </div>
 
        <div className="hp-nav-actions">
          <a href="/signin" className="hp-btn-ghost">Đăng nhập</a>
          <a href="/signup" className="hp-btn-fill">Đăng ký</a>
          <button className="hp-hamburger" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
 
      {/* HERO */}
      <section className="hp-hero">
        <img className="hp-hero-bg" src="/home.jpg" alt="Hội An" />
        <div className="hp-hero-overlay" />
        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <MapPin size={11} /> Khám phá Việt Nam
          </div>
          <h1 className="hp-hero-title">
            Hành trình đến<br />
            <em>trái tim Việt Nam</em>
          </h1>
          <p className="hp-hero-sub">
            Mỗi điểm đến không chỉ là một chuyến đi, mà còn là cơ hội để cảm nhận lịch sử, con người và những giá trị văn hóa đặc sắc của Việt Nam.
          </p>
 
          <div className="hp-search-box">
            <Search size={18} className="hp-search-icon" />
            <input className="hp-search-input" placeholder="Tìm điểm đến, tour, trải nghiệm..." />
            <button className="hp-search-btn">Tìm kiếm</button>
          </div>
 
          <div className="hp-hero-stats">
            {[["100+", "Tour độc quyền"], ["23", "Tỉnh thành"], ["30K+", "Du khách"], ["4.9★", "Đánh giá"]].map(([n, l]) => (
              <div key={l}>
                <div className="hp-hero-stat-num">{n}</div>
                <div className="hp-hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* DESTINATIONS */}
      <section className="hp-section hp-dest-section">
        <div className="hp-section-row" style={{ marginBottom: 36 }}>
          <div>
            <div className="hp-section-tag">✦ Điểm đến nổi bật</div>
            <h2 className="hp-section-title">Khám phá <em>những vùng đất</em> đẹp nhất</h2>
          </div>
          <a href="/tours" className="hp-see-all">Xem tất cả <ChevronRight size={14} /></a>
        </div>
        <div className="hp-dest-grid">
          {DESTINATIONS.map(d => (
            <div className="hp-dest-card" key={d.name}>
              <img className="hp-dest-img" src={d.img} alt={d.name} />
              <div className="hp-dest-overlay" />
              <div className="hp-dest-label">
                <div className="hp-dest-name">{d.name}</div>
                <div className="hp-dest-count">{d.count}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* FEATURED TOURS */}
      <section className="hp-section">
        <div className="hp-section-row" style={{ marginBottom: 36 }}>
          <div>
            <div className="hp-section-tag">✦ Tour nổi bật</div>
            <h2 className="hp-section-title">Những hành trình <em>được yêu thích</em> nhất</h2>
            <p className="hp-section-sub">Được chọn lọc kỹ càng từ hàng trăm tour chất lượng cao trên khắp Việt Nam.</p>
          </div>
          <a href="/tours" className="hp-see-all">Xem tất cả <ChevronRight size={14} /></a>
        </div>
        <div className="hp-tours-grid">
          {TOURS.map(t => (
            <div className="hp-tour-card" key={t.id}>
              <div className="hp-tour-img-wrap">
                <img className="hp-tour-img" src={t.img} alt={t.name} />
                <div className={`hp-tour-badge${t.badgeType ? " " + t.badgeType : ""}`}>{t.badge}</div>
              </div>
              <div className="hp-tour-body">
                <div className="hp-tour-loc"><MapPin size={12} /> {t.location}</div>
                <div className="hp-tour-name">{t.name}</div>
                <div className="hp-tour-meta">
                  <span>🗓 {t.days} ngày</span>
                  <span>👥 {t.people} người</span>
                  <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                    <Star size={12} fill="#e8a020" color="#e8a020" /> {t.rating} ({t.reviews})
                  </span>
                </div>
                <div className="hp-tour-footer">
                  <div className="hp-tour-price">
                    <span className="hp-tour-price-from">Từ</span>
                    <span className="hp-tour-price-num">{t.price}</span>
                    <span className="hp-tour-price-unit">đ / người</span>
                  </div>
                  <button className="hp-btn-book">Đặt ngay <ArrowRight size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* WHY US */}
      <section className="hp-section hp-why-section">
        <div className="hp-section-head" style={{ textAlign:"center" }}>
          <div className="hp-section-tag">✦ Tại sao chọn chúng tôi</div>
          <h2 className="hp-section-title">Du lịch <em>đáng tin cậy</em><br />từng hành trình</h2>
        </div>
        <div className="hp-why-grid">
          {WHY.map(w => (
            <div className="hp-why-card" key={w.title}>
              <div className="hp-why-icon">{w.icon}</div>
              <div className="hp-why-title">{w.title}</div>
              <p className="hp-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* CTA */}
      <div className="hp-cta">
        <div className="hp-cta-text">
          <h2>Sẵn sàng cho <em>chuyến đi tiếp theo?</em></h2>
          <p>Đăng ký ngay để nhận ưu đãi độc quyền và khám phá hàng trăm tour hấp dẫn trên khắp Việt Nam.</p>
        </div>
        <a href="/signup" className="hp-cta-btn">
          Bắt đầu hành trình <ArrowRight size={16} />
        </a>
      </div>
 
      {/* FOOTER */}
      <footer className="hp-footer-section">
          <div className="hp-footer">
        <div className="hp-footer-brand">
          <a href="/" className="hp-footer-logo">
            <img
              src="/icon.png"
              alt="TravelVN"
              className="hp-footer-logo-image"
            />

            <div>
              <span className="hp-footer-logo-text">
                Travel<em>VN</em>
              </span>

              <p className="hp-footer-slogan">
                Khám phá văn hóa Việt Nam
              </p>
            </div>
          </a>

          <p className="hp-footer-desc">
            Nền tảng đặt tour du lịch uy tín, kết nối du khách với những
            trải nghiệm văn hóa, thiên nhiên và con người Việt Nam.
          </p>

          <div className="hp-socials">
            <h4>Theo dõi chúng tôi</h4>

            <div className="hp-social-links">
              <a href="#" className="hp-social-item">
                <FaFacebookF />
              </a>

              <a href="#" className="hp-social-item">
                <FaInstagram />
              </a>

              <a href="#" className="hp-social-item">
                <FaTiktok />
              </a>

              <a href="#" className="hp-social-item">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="hp-footer-col">
          <h4>Khám phá</h4>
          <a href="#">Tour trong nước</a>
          <a href="#">Tour nước ngoài</a>
          <a href="#">Tour văn hóa</a>
          <a href="#">Ưu đãi hot</a>
        </div>

        <div className="hp-footer-col">
          <h4>Hỗ trợ</h4>
          <a href="#">Hướng dẫn đặt tour</a>
          <a href="#">Chính sách hoàn tiền</a>
          <a href="#">Câu hỏi thường gặp</a>
          <a href="#">Liên hệ</a>
        </div>

        <div className="hp-footer-col">
          <h4>Công ty</h4>
          <a href="#">Về chúng tôi</a>
          <a href="#">Blog du lịch</a>
          <a href="#">Tuyển dụng</a>
          <a href="#">Điều khoản & Bảo mật</a>
        </div>
          </div>

          <div className="hp-footer-bottom">
            <span>
              © 2026 TravelVN. All rights reserved.
            </span>
        <span>
          Made with ♥ in Việt Nam
        </span>
          </div>
        </footer>
    </>
  );
}