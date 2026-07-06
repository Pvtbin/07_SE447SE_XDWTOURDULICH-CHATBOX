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
      e.target.value = ""; // cho phép chọn lại cùng 1 file nếu cần
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
    <div className="card" style={{ padding: 20, marginBottom: 32 }}>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16 }}>Ảnh của tour</h3>
        <label className="btn btn-ghost" style={{ padding: "8px 16px", cursor: "pointer" }}>
          {uploading ? "Đang tải..." : "+ Thêm ảnh"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {images.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 14 }}>Chưa có ảnh nào. Ảnh đầu tiên tải lên sẽ tự làm ảnh đại diện.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
          {images.map((img) => (
            <div key={img.id}>
              <div style={{ position: "relative" }}>
                <img
                  src={resolveImageUrl(img.image_url)}
                  alt="Ảnh tour"
                  style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }}
                />
                {img.is_thumbnail === 1 && (
                  <span
                    className="badge badge-confirmed"
                    style={{ position: "absolute", top: 4, left: 4, fontSize: 10, padding: "2px 8px" }}
                  >
                    Đại diện
                  </span>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(36,26,18,0.7)",
                    color: "var(--white)",
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              {img.is_thumbnail !== 1 && (
                <button
                  onClick={() => handleSetThumbnail(img.id)}
                  className="btn btn-ghost"
                  style={{ width: "100%", padding: "5px 0", fontSize: 11, marginTop: 6 }}
                >
                  Đặt làm đại diện
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}