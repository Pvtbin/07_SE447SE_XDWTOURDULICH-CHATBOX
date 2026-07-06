import { useEffect, useState } from "react";
import { getTourByIdApi, uploadTourImageApi, deleteTourImageApi, setThumbnailImageApi } from "../api/tours";
import { resolveImageUrl } from "../api/axiosClient";

export default function TourImageManager({ tourId }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tourId) fetchImages();
  }, [tourId]);

  const fetchImages = async () => {
    const res = await getTourByIdApi(tourId);
    setImages(res.data.images || []);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadTourImageApi(tourId, file);
      await fetchImages();
    } catch (err) {
      setError(err.response?.data?.message || "Tải ảnh lên thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Xoá ảnh này?")) return;
    await deleteTourImageApi(imageId);
    fetchImages();
  };

  const handleSetThumbnail = async (imageId) => {
    await setThumbnailImageApi(imageId);
    fetchImages();
  };

  return (
    <div className="card" style={{ padding: 24, marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-aurora)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 16, margin: 0 }}>Quản lý ảnh tour</h3>
        </div>
        <label
          className="btn btn-primary"
          style={{ padding: "10px 20px", cursor: "pointer", fontSize: 13 }}
        >
          {uploading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="spinner" style={{ width: 16, height: 16 }} />
              Đang tải...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Thêm ảnh
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 12,
            background: "var(--danger-bg)",
            borderRadius: "var(--radius-md)",
            marginBottom: 16,
            color: "var(--danger)",
            fontSize: 13,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            background: "var(--ocean-mist)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--silver)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <p className="text-muted" style={{ fontSize: 14 }}>
            Chưa có ảnh nào. Ảnh đầu tiên sẽ tự động làm ảnh đại diện.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16 }}>
          {images.map((img) => (
            <div key={img.id}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: img.is_thumbnail === 1 ? "3px solid var(--neon-cyan)" : "2px solid var(--cloud)",
                  boxShadow: img.is_thumbnail === 1 ? "var(--shadow-neon)" : "var(--shadow-sm)",
                }}
              >
                <img
                  src={resolveImageUrl(img.image_url)}
                  alt="Ảnh tour"
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                  }}
                />
                {img.is_thumbnail === 1 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      padding: "4px 10px",
                      background: "var(--gradient-neon)",
                      color: "white",
                      borderRadius: "var(--radius-full)",
                      fontSize: 10,
                      fontWeight: 700,
                      boxShadow: "var(--shadow-neon)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4 }}>
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    Ảnh chính
                  </span>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "none",
                    background: "var(--danger)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: 0.9,
                    transition: "opacity 0.2s",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              {img.is_thumbnail !== 1 && (
                <button
                  onClick={() => handleSetThumbnail(img.id)}
                  className="btn btn-ghost"
                  style={{ width: "100%", padding: "8px 0", fontSize: 12, marginTop: 8 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  Đặt làm ảnh chính
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
