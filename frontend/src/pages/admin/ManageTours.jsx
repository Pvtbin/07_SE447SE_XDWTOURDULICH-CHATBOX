import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getToursApi, createTourApi, updateTourApi, deleteTourApi, uploadTourImageApi, deleteTourImageApi, setThumbnailImageApi } from "../../api/tours";
import { resolveImageUrl } from "../../api/axiosClient";

const EMPTY_FORM = {
  tieu_de: "", mo_ta: "", gia: "", dia_diem: "",
  ngay_bat_dau: "", ngay_ket_thuc: "", so_nguoi_toi_da: "",
  lich_trinh: "",
};

// Default itinerary template
const DEFAULT_ITINERARY = [
  { day: 1, title: "Đón khách & Khởi hành", activities: ["Đón khách tại điểm hẹn", "Di chuyển đến điểm tham quan", "Nghỉ ngơi và ăn trưa"] },
  { day: 2, title: "Tham quan chính", activities: ["Khám phá các điểm đến nổi bật", "Trải nghiệm văn hóa địa phương", "Thưởng thức đặc sản"] },
  { day: 3, title: "Hoạt động tự do & Trả khách", activities: ["Thời gian tự do mua sắm", "Dùng bữa trưa cuối", "Trả khách tại điểm hẹn"] }
];

export default function ManageTours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tourImages, setTourImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Itinerary editor state
  const [itinerary, setItinerary] = useState([]);
  // Selected files preview
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => { fetchTours(); }, []);

  const fetchTours = async () => {
    const res = await getToursApi();
    setTours(res.data);
  };

  const parseItinerary = (lichTrinh) => {
    if (!lichTrinh) return [];
    try {
      const parsed = JSON.parse(lichTrinh);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setTourImages([]);
    setShowForm(false);
    setItinerary([]);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUpload = async (tourId, files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await uploadTourImageApi(tourId, file);
      }
      // Refresh images
      const res = await getToursApi();
      const updatedTour = res.data.find(t => t.id === tourId);
      if (updatedTour && updatedTour.images) {
        setTourImages(updatedTour.images);
      }
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err.response?.data?.message || "Tải ảnh lên thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Prepare itinerary - convert to JSON string
      const itineraryData = itinerary.length > 0 ? JSON.stringify(itinerary) : JSON.stringify(DEFAULT_ITINERARY);

      if (editingId) {
        await updateTourApi(editingId, { ...form, lich_trinh: itineraryData });
        // Upload new images if any
        if (selectedFiles.length > 0) {
          await handleImageUpload(editingId, selectedFiles);
        }
      } else {
        const res = await createTourApi({ ...form, lich_trinh: itineraryData });
        const newTourId = res.data.id;

        // If creating new tour and user selected images, upload them
        if (selectedFiles.length > 0) {
          await handleImageUpload(newTourId, selectedFiles);
        }
      }
      resetForm();
      fetchTours();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (tour) => {
    setEditingId(tour.id);
    setForm({
      tieu_de: tour.tieu_de || "",
      mo_ta: tour.mo_ta || "",
      gia: tour.gia || "",
      dia_diem: tour.dia_diem || "",
      ngay_bat_dau: tour.ngay_bat_dau?.substring(0, 10) || "",
      ngay_ket_thuc: tour.ngay_ket_thuc?.substring(0, 10) || "",
      so_nguoi_toi_da: tour.so_nguoi_toi_da || "",
      lich_trinh: tour.lich_trinh || "",
    });
    setTourImages(tour.images || []);
    setItinerary(parseItinerary(tour.lich_trinh));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tour này? Không thể khôi phục.")) return;
    try {
      await deleteTourApi(id);
      fetchTours();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tour");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      await deleteTourImageApi(imageId);
      const res = await getToursApi();
      const updatedTour = res.data.find(t => t.id === editingId);
      if (updatedTour) setTourImages(updatedTour.images || []);
    } catch (err) {
      alert("Không thể xóa ảnh");
    }
  };

  const handleSetThumbnail = async (imageId) => {
    try {
      await setThumbnailImageApi(imageId);
      const res = await getToursApi();
      const updatedTour = res.data.find(t => t.id === editingId);
      if (updatedTour) setTourImages(updatedTour.images || []);
    } catch (err) {
      alert("Không thể đặt ảnh đại diện");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Quản lý Tour</h1>
          <p className="text-muted">Tạo và quản lý các tour du lịch</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm && editingId === null) setShowForm(false);
            else { resetForm(); setShowForm(true); }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {showForm ? "Đóng form" : "Thêm tour mới"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 32, animation: "fadeInUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: editingId ? "var(--warning)" : "var(--gradient-neon)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {editingId
                  ? <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  : <path d="M12 5v14M5 12h14"/>}
              </svg>
            </div>
            <h3 style={{ margin: 0 }}>{editingId ? "Cập nhật tour" : "Thêm tour mới"}</h3>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: 14,
              background: "var(--danger-bg)", borderRadius: "var(--radius-md)", marginBottom: 20, color: "var(--danger)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div className="field">
                <label>Tiêu đề *</label>
                <input required value={form.tieu_de} onChange={(e) => setForm({ ...form, tieu_de: e.target.value })} />
              </div>
              <div className="field">
                <label>Địa điểm *</label>
                <input required value={form.dia_diem} onChange={(e) => setForm({ ...form, dia_diem: e.target.value })} />
              </div>
              <div className="field">
                <label>Giá (VNĐ) *</label>
                <input type="number" required value={form.gia} onChange={(e) => setForm({ ...form, gia: e.target.value })} />
              </div>
              <div className="field">
                <label>Số người tối đa *</label>
                <input type="number" required value={form.so_nguoi_toi_da} onChange={(e) => setForm({ ...form, so_nguoi_toi_da: e.target.value })} />
              </div>
              <div className="field">
                <label>Ngày bắt đầu</label>
                <input type="date" value={form.ngay_bat_dau} onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })} />
              </div>
              <div className="field">
                <label>Ngày kết thúc</label>
                <input type="date" value={form.ngay_ket_thuc} onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Mô tả</label>
              <textarea rows={3} value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })} />
            </div>

            {/* Itinerary Editor */}
            <div className="field">
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Lịch trình tour</span>
                <button
                  type="button"
                  onClick={() => {
                    const newDay = itinerary.length + 1;
                    setItinerary([...itinerary, { day: newDay, title: `Day ${newDay}`, activities: [] }]);
                  }}
                  style={{
                    padding: "6px 14px",
                    background: "var(--gradient-neon)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Thêm ngày
                </button>
              </label>

              {itinerary.length === 0 && (
                <div style={{
                  padding: 24,
                  textAlign: "center",
                  background: "var(--ocean-mist)",
                  borderRadius: "var(--radius-md)",
                  border: "2px dashed var(--cloud)",
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="1" style={{ marginBottom: 12 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p style={{ color: "var(--slate)", margin: 0, marginBottom: 12 }}>Chưa có lịch trình</p>
                  <button
                    type="button"
                    onClick={() => setItinerary(DEFAULT_ITINERARY)}
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      border: "1px solid var(--cloud)",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Sử dụng mẫu mặc định
                  </button>
                </div>
              )}

              {itinerary.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                  {itinerary.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      style={{
                        background: "white",
                        border: "1px solid var(--cloud)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Day Header */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "var(--ocean-mist)",
                        borderBottom: "1px solid var(--cloud)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--gradient-neon)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                          }}>
                            {day.day}
                          </span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => {
                              const updated = [...itinerary];
                              updated[dayIndex].title = e.target.value;
                              setItinerary(updated);
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              fontWeight: 600,
                              fontSize: 15,
                              color: "var(--slate)",
                              outline: "none",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setItinerary(itinerary.filter((_, i) => i !== dayIndex));
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "var(--radius-sm)",
                            border: "none",
                            background: "var(--danger-bg)",
                            color: "var(--danger)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>

                      {/* Activities */}
                      <div style={{ padding: 12 }}>
                        {day.activities.length === 0 && (
                          <p style={{ color: "var(--silver)", fontSize: 13, margin: 0, padding: 8 }}>
                            Chưa có hoạt động nào
                          </p>
                        )}

                        {day.activities.map((activity, actIndex) => (
                          <div
                            key={actIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px",
                              background: "var(--ocean-mist)",
                              borderRadius: "var(--radius-sm)",
                              marginBottom: 8,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => {
                                const updated = [...itinerary];
                                updated[dayIndex].activities[actIndex] = e.target.value;
                                setItinerary(updated);
                              }}
                              style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                fontSize: 14,
                                color: "var(--slate)",
                                outline: "none",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...itinerary];
                                updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== actIndex);
                                setItinerary(updated);
                              }}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "var(--radius-sm)",
                                border: "none",
                                background: "transparent",
                                color: "var(--silver)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        ))}

                        {/* Add Activity Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...itinerary];
                            updated[dayIndex].activities.push("Hoạt động mới");
                            setItinerary(updated);
                          }}
                          style={{
                            width: "100%",
                            padding: 10,
                            border: "1px dashed var(--cloud)",
                            background: "transparent",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--slate)",
                            cursor: "pointer",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Thêm hoạt động
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload - Available for both create and edit */}
            <div className="field">
              <label>Hình ảnh tour</label>
              <div style={{
                border: "2px dashed var(--cloud)", borderRadius: "var(--radius-md)", padding: 20,
                textAlign: "center", background: "var(--ocean-mist)", cursor: "pointer",
              }} onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setSelectedFiles(files);
                    }
                  }}
                  style={{ display: "none" }}
                />
                {uploading ? (
                  <div className="flex-center" style={{ gap: 8 }}>
                    <div className="spinner" style={{ width: 20, height: 20 }} />
                    <span>Đang tải ảnh...</span>
                  </div>
                ) : (
                  <>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <p style={{ color: "var(--slate)", margin: 0 }}>Klik để chọn ảnh hoặc kéo thả vào đây</p>
                    <p style={{ color: "var(--silver)", fontSize: 12, marginTop: 4 }}>PNG, JPG, WEBP - Tối đa 5MB</p>
                  </>
                )}
              </div>

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>
                      Ảnh đã chọn ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      style={{
                        padding: "4px 12px",
                        background: "var(--danger-bg)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--danger)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        position: "relative",
                        width: 100,
                        height: 80,
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        border: "1px solid var(--cloud)",
                      }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                          }}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "none",
                            background: "var(--danger)",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Show existing images for editing */}
            {editingId && tourImages.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)", display: "block", marginBottom: 8 }}>
                  Ảnh hiện có ({tourImages.length})
                </label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {tourImages.map((img) => (
                    <div key={img.id} style={{
                      position: "relative", width: 100, height: 80, borderRadius: "var(--radius-sm)", overflow: "hidden",
                      border: img.is_thumbnail === 1 ? "2px solid var(--neon-cyan)" : "1px solid var(--cloud)",
                    }}>
                      <img src={resolveImageUrl(img.image_url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {img.is_thumbnail === 1 && (
                        <span style={{
                          position: "absolute", top: 4, left: 4, padding: "2px 8px",
                          background: "var(--gradient-neon)", color: "white", fontSize: 10, borderRadius: "var(--radius-sm)",
                        }}>Chính</span>
                      )}
                      <button type="button" onClick={() => handleDeleteImage(img.id)} style={{
                        position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
                        border: "none", background: "var(--danger)", color: "white", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                      }}>×</button>
                      {img.is_thumbnail !== 1 && (
                        <button type="button" onClick={() => handleSetThumbnail(img.id)} style={{
                          position: "absolute", bottom: 4, left: 4, right: 4, padding: 4,
                          background: "rgba(0,0,0,0.7)", color: "white", border: "none",
                          fontSize: 10, cursor: "pointer", borderRadius: 4,
                        }}>Đặt làm chính</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    {editingId ? "Cập nhật tour" : "Tạo tour mới"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Hủy</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tour List */}
      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ocean-mist)", textAlign: "left" }}>
              <th style={{ padding: 16 }}>Tiêu đề</th>
              <th style={{ padding: 16 }}>Địa điểm</th>
              <th style={{ padding: 16 }}>Giá</th>
              <th style={{ padding: 16 }}>Chỗ còn</th>
              <th style={{ padding: 16 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid var(--cloud)" }}>
                <td style={{ padding: 16 }}><strong>{t.tieu_de}</strong></td>
                <td style={{ padding: 16 }}>{t.dia_diem}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    background: "var(--gradient-neon)", WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent", fontWeight: 700,
                  }}>{Number(t.gia).toLocaleString("vi-VN")} đ</span>
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "var(--radius-full)",
                    background: t.so_cho_con_lai > 0 ? "var(--success-bg)" : "var(--danger-bg)",
                    color: t.so_cho_con_lai > 0 ? "var(--success)" : "var(--danger)",
                    fontWeight: 600, fontSize: 13,
                  }}>{t.so_cho_con_lai}/{t.so_nguoi_toi_da}</span>
                </td>
                <td style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => handleEdit(t)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Sửa
                    </button>
                    <button className="btn btn-danger" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => handleDelete(t.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
