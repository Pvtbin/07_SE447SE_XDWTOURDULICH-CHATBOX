import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTourByIdApi } from "../api/tours";
import { resolveImageUrl } from "../api/axiosClient";
import { createBookingApi, getReviewsByTourApi, createReviewApi, getMyBookingsApi } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

// Image Slider Component
function ImageSlider({ images, tieu_de }) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const goTo = (idx) => {
    if (idx >= 0 && idx < images.length) setCurrent(idx);
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientX - startXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current - 1);
      else goTo(current + 1);
    }
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current - 1);
      else goTo(current + 1);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div style={{
        height: 400, borderRadius: "var(--radius-xl)",
        background: "linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16,
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isDraggingRef.current = false}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative", height: 450, borderRadius: "var(--radius-xl)",
          overflow: "hidden", cursor: "grab", boxShadow: "var(--shadow-xl)",
        }}
      >
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            style={{
              position: "absolute", inset: 0,
              opacity: idx === current ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <img
              src={resolveImageUrl(img.image_url)}
              alt={`${tieu_de} - ${idx + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", userSelect: "none", pointerEvents: "none" }}
              draggable={false}
            />
            {img.is_thumbnail === 1 && (
              <div style={{
                position: "absolute", top: 16, left: 16, padding: "6px 14px",
                background: "var(--gradient-neon)", color: "white",
                borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 700,
              }}>Ảnh chính</div>
            )}
          </div>
        ))}

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.95)", cursor: current === 0 ? "not-allowed" : "pointer",
                opacity: current === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => goTo(current + 1)}
              disabled={current === images.length - 1}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.95)", cursor: current === images.length - 1 ? "not-allowed" : "pointer",
                opacity: current === images.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}

        {/* Counter */}
        <div style={{
          position: "absolute", bottom: 16, right: 16, padding: "8px 16px",
          background: "rgba(0,51,102,0.85)", color: "white", borderRadius: "var(--radius-full)",
          fontSize: 14, fontWeight: 600, backdropFilter: "blur(8px)",
        }}>{current + 1} / {images.length}</div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: 72, height: 54, borderRadius: "var(--radius-md)", border: "none",
                padding: 0, overflow: "hidden", cursor: "pointer",
                boxShadow: idx === current ? "var(--shadow-neon)" : "var(--shadow-sm)",
                outline: idx === current ? "3px solid var(--neon-cyan)" : "2px solid transparent",
                transform: idx === current ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s",
              }}
            >
              <img src={resolveImageUrl(img.image_url)} alt={`Thumb ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Review Form Component
function ReviewForm({ tourId, onSuccess, existingReview }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createReviewApi({ tour_id: tourId, so_sao: rating, binh_luan: comment });
      setComment("");
      setRating(5);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gửi đánh giá thất bại. Có thể bạn chưa tham gia tour này.");
    } finally {
      setLoading(false);
    }
  };

  if (existingReview) {
    return (
      <div className="card" style={{ padding: 20, background: "var(--ocean-mist)", borderColor: "var(--neon-cyan)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <span style={{ fontWeight: 600 }}>Bạn đã đánh giá tour này rồi</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
      <h4 style={{ marginBottom: 16 }}>Viết đánh giá của bạn</h4>
      {error && <div style={{ padding: 10, background: "var(--danger-bg)", borderRadius: 8, color: "var(--danger)", marginBottom: 12, fontSize: 14 }}>{error}</div>}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)", display: "block", marginBottom: 8 }}>Đánh giá sao</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill={s <= rating ? "#FFB800" : "#E2E8F0"} stroke={s <= rating ? "#FFB800" : "#E2E8F0"} strokeWidth="1.5">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Nhận xét của bạn</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}

// Default itinerary templates
const DEFAULT_ITINERARY = [
  { day: 1, title: "Đón khách & Khởi hành", activities: ["Đón khách tại điểm hẹn", "Di chuyển đến điểm tham quan", "Nghỉ ngơi và ăn trưa"] },
  { day: 2, title: "Tham quan chính", activities: ["Khám phá các điểm đến nổi bật", "Trải nghiệm văn hóa địa phương", "Thưởng thức đặc sản"] },
  { day: 3, title: "Hoạt động tự do & Trả khách", activities: ["Thời gian tự do mua sắm", "Dùng bữa trưa cuối", "Trả khách tại điểm hẹn"] },
];

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [soNguoi, setSoNguoi] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    fetchTour();
    fetchReviews();
    if (user) fetchUserBookings();
  }, [id, user]);

  const fetchTour = async () => {
    try {
      const res = await getTourByIdApi(id);
      setTour(res.data);
    } catch {
      setError("Không tìm thấy tour này");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await getReviewsByTourApi(id);
      setReviews(res.data);
    } catch {}
  };

  const fetchUserBookings = async () => {
    try {
      const res = await getMyBookingsApi();
      setUserBookings(res.data);
    } catch {}
  };

  const handleBooking = async () => {
    if (!user) return navigate("/dang-nhap");
    setError("");
    setSubmitting(true);
    try {
      const res = await createBookingApi({ tour_id: id, so_nguoi_dat: soNguoi });
      navigate(`/thanh-toan/${res.data.bookingId}`, {
        state: { tongTien: res.data.tong_tien, tenTour: tour.tieu_de, soNguoiDat: soNguoi },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Đặt tour thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user has booked this tour and can review
  const canReview = user && userBookings.some(b => b.tour_id === parseInt(id) && b.trang_thai === "da_xac_nhan");
  const userReviewed = user && reviews.some(r => r.user_id === user.id);

  if (loading) {
    return <div className="flex-center" style={{ minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" />
      <span className="text-muted">Đang tải...</span>
    </div>;
  }

  if (error && !tour) {
    return <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h2 style={{ marginBottom: 12 }}>{error}</h2>
      <button onClick={() => navigate("/")} className="btn btn-primary">Về trang chủ</button>
    </div>;
  }

  const days = tour.ngay_ket_thuc && tour.ngay_bat_dau
    ? Math.ceil((new Date(tour.ngay_ket_thuc) - new Date(tour.ngay_bat_dau)) / (1000 * 60 * 60 * 24)) + 1
    : null;

  // Use tour's itinerary if available, otherwise generate default
  const itinerary = tour.lich_trinh ? JSON.parse(tour.lich_trinh) : DEFAULT_ITINERARY.slice(0, days || 3);

  return (
    <div style={{ minHeight: "100vh", background: "var(--snow)" }}>
      <div style={{ background: "linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))", padding: "16px 0" }}>
        <div className="container">
          <button onClick={() => navigate(-1)} className="flex" style={{
            alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "none",
            padding: "10px 20px", borderRadius: "var(--radius-full)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Quay lại
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>
          <div>
            <ImageSlider images={tour.images} tieu_de={tour.tieu_de} />

            <div style={{ marginTop: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--ocean-light)", borderRadius: "var(--radius-full)", marginBottom: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ocean-mid)" }}>{tour.dia_diem}</span>
              </div>
              <h1 style={{ fontSize: 32, marginBottom: 12 }}>{tour.tieu_de}</h1>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
                {days && <div className="flex" style={{ alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </div>
                  <div><div style={{ fontSize: 11, color: "var(--slate)" }}>Thời gian</div><div style={{ fontWeight: 600 }}>{days} ngày</div></div>
                </div>}
                <div className="flex" style={{ alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div><div style={{ fontSize: 11, color: "var(--slate)" }}>Còn chỗ</div><div style={{ fontWeight: 600 }}>{tour.so_cho_con_lai}/{tour.so_nguoi_toi_da}</div></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--cloud)", marginBottom: 20 }}>
              {[
                { key: "info", label: "Thông tin" },
                { key: "schedule", label: "Lịch trình" },
                { key: "reviews", label: `Đánh giá (${reviews.length})` },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: "12px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.key ? "3px solid var(--neon-cyan)" : "3px solid transparent",
                  marginBottom: -2, cursor: "pointer", fontSize: 15, fontWeight: 600,
                  color: activeTab === tab.key ? "var(--ink)" : "var(--slate)", transition: "all 0.2s",
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Info Tab */}
            {activeTab === "info" && (
              <div>
                <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 12 }}>Mô tả tour</h3>
                  <p style={{ lineHeight: 1.8, color: "var(--ink-light)" }}>{tour.mo_ta || "Chưa có mô tả chi tiết."}</p>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 16 }}>Thông tin chi tiết</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="flex-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--cloud)" }}>
                      <span className="text-muted">Khởi hành</span>
                      <strong>{tour.ngay_bat_dau ? new Date(tour.ngay_bat_dau).toLocaleDateString("vi-VN") : "—"}</strong>
                    </div>
                    <div className="flex-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--cloud)" }}>
                      <span className="text-muted">Kết thúc</span>
                      <strong>{tour.ngay_ket_thuc ? new Date(tour.ngay_ket_thuc).toLocaleDateString("vi-VN") : "—"}</strong>
                    </div>
                    <div className="flex-between" style={{ padding: "10px 0" }}>
                      <span className="text-muted">Số người tối đa</span>
                      <strong>{tour.so_nguoi_toi_da} người</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {itinerary.map((item, idx) => (
                  <div key={idx} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-neon)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700,
                      }}>Ngày {item.day}</div>
                      <h4 style={{ margin: 0 }}>{item.title}</h4>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {item.activities.map((act, i) => (
                        <li key={i} style={{ marginBottom: 6, color: "var(--ink-light)" }}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {user && canReview && !userReviewed && (
                  <ReviewForm tourId={id} onSuccess={fetchReviews} />
                )}
                {user && canReview && userReviewed && (
                  <div className="card" style={{ padding: 20, marginBottom: 20, background: "var(--success-bg)" }}>
                    <div className="flex" style={{ alignItems: "center", gap: 8, color: "var(--success)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      <span style={{ fontWeight: 600 }}>Bạn đã đánh giá tour này</span>
                    </div>
                  </div>
                )}
                {user && !canReview && (
                  <div className="card" style={{ padding: 20, marginBottom: 20, background: "var(--warning-bg)" }}>
                    <p style={{ color: "var(--warning)", fontSize: 14, margin: 0 }}>
                      Bạn cần tham gia tour này và hoàn thành chuyến đi trước khi có thể đánh giá.
                    </p>
                  </div>
                )}
                {!user && (
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <p className="text-muted" style={{ margin: 0 }}>
                      <span style={{ fontWeight: 600, color: "var(--neon-cyan)", cursor: "pointer" }} onClick={() => navigate("/dang-nhap")}>
                        Đăng nhập
                      </span> để viết đánh giá.
                    </p>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="card" style={{ padding: 40, textAlign: "center" }}>
                    <p className="text-muted">Chưa có đánh giá nào.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviews.map((r) => (
                      <div key={r.id} className="card" style={{ padding: 16 }}>
                        <div className="flex-between" style={{ marginBottom: 8 }}>
                          <div className="flex" style={{ alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-neon)",
                              display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700,
                            }}>{r.ho_ten?.charAt(0).toUpperCase()}</div>
                            <strong>{r.ho_ten}</strong>
                          </div>
                          <div className="flex" style={{ gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= r.so_sao ? "#FFB800" : "#E2E8F0"} stroke={s <= r.so_sao ? "#FFB800" : "#E2E8F0"}>
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p style={{ color: "var(--ink-light)", lineHeight: 1.6, margin: 0 }}>{r.binh_luan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 24, position: "sticky", top: 90 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--slate)" }}>Giá từ</div>
                <div style={{
                  fontSize: 32, fontWeight: 800, background: "var(--gradient-neon)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{Number(tour.gia).toLocaleString("vi-VN")} đ</div>
                <div style={{ fontSize: 13, color: "var(--slate)" }}>/ người</div>
              </div>

              {error && <div style={{ padding: 10, background: "var(--danger-bg)", borderRadius: 8, color: "var(--danger)", marginBottom: 12, fontSize: 13 }}>{error}</div>}

              <div className="field">
                <label>Số người</label>
                <div className="flex" style={{ alignItems: "center", gap: 10 }}>
                  <button onClick={() => setSoNguoi(s => Math.max(1, s - 1))} disabled={soNguoi <= 1}
                    style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", border: "1px solid var(--cloud)", background: "white", cursor: soNguoi <= 1 ? "not-allowed" : "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
                  </button>
                  <input type="number" min={1} max={tour.so_cho_con_lai} value={soNguoi}
                    onChange={(e) => setSoNguoi(Math.min(Math.max(1, Number(e.target.value)), tour.so_cho_con_lai))}
                    style={{ width: 70, textAlign: "center", padding: "8px 0" }} />
                  <button onClick={() => setSoNguoi(s => Math.min(tour.so_cho_con_lai, s + 1))} disabled={soNguoi >= tour.so_cho_con_lai}
                    style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", border: "1px solid var(--cloud)", background: "white", cursor: soNguoi >= tour.so_cho_con_lai ? "not-allowed" : "pointer" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>

              <div style={{ padding: 16, background: "var(--ocean-mist)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span className="text-muted">{soNguoi} x tour</span>
                  <span>{Number(tour.gia * soNguoi).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex-between" style={{ paddingTop: 10, borderTop: "1px dashed var(--cloud)" }}>
                  <strong>Tạm tính</strong>
                  <strong style={{
                    fontSize: 18, background: "var(--gradient-neon)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{Number(tour.gia * soNguoi).toLocaleString("vi-VN")} đ</strong>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}
                onClick={handleBooking} disabled={submitting || tour.so_cho_con_lai < 1}>
                {tour.so_cho_con_lai < 1 ? "Hết chỗ" : submitting ? "Đang xử lý..." : "Đặt tour ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
