import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTourByIdApi } from "../api/tours";
import { createBookingApi, createPaymentApi, createReviewApi, getReviewsByTourApi } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [soNguoi, setSoNguoi] = useState(1);
  const [booking, setBooking] = useState(null); // { id, tong_tien }
  const [payMethod, setPayMethod] = useState("tien_mat");
  const [qrUrl, setQrUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    setMessage("");
    try {
      const res = await createBookingApi({ tour_id: id, so_nguoi_dat: soNguoi });
      // booking.controller trả về { message, tong_tien } chứ không trả id -> tạm lưu số tiền
      setBooking({ tong_tien: res.data.tong_tien });
      setMessage("Đặt tour thành công! Vui lòng chọn phương thức thanh toán bên dưới.");
    } catch (err) {
      setError(err.response?.data?.message || "Đặt tour thất bại");
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
            ? `url(${tour.images[0].image_url}) center/cover`
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
          {message && <p style={{ color: "var(--success)", fontSize: 14, marginBottom: 12 }}>{message}</p>}

          {!booking ? (
            <>
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
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleBooking}>
                Đặt tour ngay
              </button>
            </>
          ) : (
            <PaymentBox
              tongTien={booking.tong_tien}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              qrUrl={qrUrl}
              setQrUrl={setQrUrl}
              tourId={id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentBox({ tongTien, payMethod, setPayMethod, qrUrl, setQrUrl, tourId }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setError("");
    try {
      // Lưu ý: cần booking_id thật từ API tạo booking trả về để dùng ở đây.
      // Hiện booking.controller chỉ trả tong_tien — nếu cần liên kết payment,
      // hãy sửa createBooking backend để res.json thêm bookingId: result.insertId
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Thanh toán thất bại");
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <p style={{ fontWeight: 600 }}>Đã ghi nhận yêu cầu thanh toán!</p>
        <p className="text-muted" style={{ fontSize: 14 }}>Xem trạng thái tại "Tour của tôi"</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ marginBottom: 12 }}>Tổng tiền: <strong>{Number(tongTien).toLocaleString("vi-VN")} đ</strong></p>
      <div className="field">
        <label>Phương thức thanh toán</label>
        <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
          <option value="tien_mat">Tiền mặt</option>
          <option value="chuyen_khoan">Chuyển khoản (QR)</option>
          <option value="momo">MoMo</option>
          <option value="vnpay">VNPay</option>
        </select>
      </div>
      {qrUrl && <img src={qrUrl} alt="QR thanh toán" style={{ width: "100%", borderRadius: 8, marginBottom: 12 }} />}
      {error && <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>}
      <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handlePay}>
        Xác nhận thanh toán
      </button>
    </div>
  );
}
