import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTourByIdApi } from "../api/tours";
import { resolveImageUrl } from "../api/axiosClient";
import { createBookingApi, getReviewsByTourApi } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [soNguoi, setSoNguoi] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTour();
    fetchReviews();
  }, [id]);

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
    } catch {
      // im lặng nếu chưa có đánh giá
    }
  };

  const handleBooking = async () => {
    if (!user) return navigate("/dang-nhap");
    setError("");
    setSubmitting(true);
    try {
      const res = await createBookingApi({ tour_id: id, so_nguoi_dat: soNguoi });
      // backend trả { bookingId, tong_tien, tour_id } sau khi thêm LAST_INSERT_ID()
      navigate(`/thanh-toan/${res.data.bookingId}`, {
        state: {
          tongTien: res.data.tong_tien,
          tenTour: tour.tieu_de,
          soNguoiDat: soNguoi,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Đặt tour thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 60 }}>Đang tải...</div>;
  if (error && !tour) return <div className="container" style={{ padding: 60, color: "var(--danger)" }}>{error}</div>;

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <div
        style={{
          height: 360,
          borderRadius: "var(--radius-lg)",
          background: tour.images?.[0]
            ? `url(${resolveImageUrl(tour.images[0].image_url)}) center/cover`
            : "linear-gradient(135deg, var(--tile), var(--wall))",
          marginBottom: 32,
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>{tour.tieu_de}</h1>
          <p className="text-muted" style={{ marginBottom: 20 }}>📍 {tour.dia_diem}</p>
          <p style={{ lineHeight: 1.7, marginBottom: 32 }}>{tour.mo_ta}</p>

          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="text-muted">Ngày khởi hành</span>
              <strong>{tour.ngay_bat_dau?.substring(0, 10) || "—"}</strong>
            </div>
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="text-muted">Ngày kết thúc</span>
              <strong>{tour.ngay_ket_thuc?.substring(0, 10) || "—"}</strong>
            </div>
            <div className="flex-between">
              <span className="text-muted">Số chỗ còn lại</span>
              <strong>{tour.so_cho_con_lai} / {tour.so_nguoi_toi_da}</strong>
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>Đánh giá ({reviews.length})</h3>
          {reviews.length === 0 && <p className="text-muted">Chưa có đánh giá nào.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div className="flex-between">
                <strong>{r.ho_ten}</strong>
                <span>{"⭐".repeat(r.so_sao)}</span>
              </div>
              <p className="text-muted" style={{ marginTop: 8 }}>{r.binh_luan}</p>
            </div>
          ))}
        </div>

        {/* SIDEBAR ĐẶT TOUR */}
        <div className="card" style={{ padding: 24, height: "fit-content", position: "sticky", top: 90 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--tile)", marginBottom: 16 }}>
            {Number(tour.gia).toLocaleString("vi-VN")} đ <span className="text-muted" style={{ fontSize: 14, fontWeight: 400 }}>/ người</span>
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: 14, marginBottom: 12 }}>{error}</p>}

          <div className="field">
            <label>Số người</label>
            <input
              type="number"
              min={1}
              max={tour.so_cho_con_lai}
              value={soNguoi}
              onChange={(e) => setSoNguoi(Number(e.target.value))}
            />
          </div>

          <div className="flex-between" style={{ marginBottom: 16, fontSize: 14 }}>
            <span className="text-muted">Tạm tính</span>
            <strong>{Number(tour.gia * soNguoi).toLocaleString("vi-VN")} đ</strong>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleBooking}
            disabled={submitting || tour.so_cho_con_lai < 1}
          >
            {tour.so_cho_con_lai < 1 ? "Đã hết chỗ" : submitting ? "Đang xử lý..." : "Đặt tour ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}