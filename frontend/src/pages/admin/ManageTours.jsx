import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getToursApi, createTourApi, updateTourApi, deleteTourApi } from "../../api/tours";

const EMPTY_FORM = {
  tieu_de: "", mo_ta: "", gia: "", dia_diem: "",
  ngay_bat_dau: "", ngay_ket_thuc: "", so_nguoi_toi_da: "",
};

export default function ManageTours() {
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTours(); }, []);

  const fetchTours = async () => {
    const res = await getToursApi();
    setTours(res.data);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        await updateTourApi(editingId, form);
      } else {
        await createTourApi(form);
      }
      resetForm();
      fetchTours();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tour) => {
    setEditingId(tour.id);
    setForm({
      tieu_de: tour.tieu_de || "",
      mo_ta: tour.mo_ta || "",
      gia: tour.gia || "",
      dia_diem: tour.dia_diem || "",
      ngay_bat_dau: tour.ngay_bat_dau?.substring(0, 10) || "",
      ngay_ket_thuc: tour.ngay_ket_thuc?.substring(0, 10) || "",
      so_nguoi_toi_da: tour.so_nguoi_toi_da || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tour này? Hành động không thể hoàn tác.")) return;
    try {
      await deleteTourApi(id);
      fetchTours();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tour");
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Quản lý Tour</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? "Cập nhật tour" : "Thêm tour mới"}</h3>
        {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label>Tiêu đề</label>
            <input required value={form.tieu_de} onChange={(e) => setForm({ ...form, tieu_de: e.target.value })} />
          </div>
          <div className="field">
            <label>Địa điểm</label>
            <input required value={form.dia_diem} onChange={(e) => setForm({ ...form, dia_diem: e.target.value })} />
          </div>
          <div className="field">
            <label>Giá (VNĐ)</label>
            <input type="number" required value={form.gia} onChange={(e) => setForm({ ...form, gia: e.target.value })} />
          </div>
          <div className="field">
            <label>Số người tối đa</label>
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

        <div className="flex" style={{ gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {editingId ? "Cập nhật" : "Thêm tour"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Hủy</button>
          )}
        </div>
      </form>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-deep)", textAlign: "left" }}>
              <th style={{ padding: 14 }}>Tiêu đề</th>
              <th style={{ padding: 14 }}>Địa điểm</th>
              <th style={{ padding: 14 }}>Giá</th>
              <th style={{ padding: 14 }}>Chỗ còn lại</th>
              <th style={{ padding: 14 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid var(--wall-soft)" }}>
                <td style={{ padding: 14 }}>{t.tieu_de}</td>
                <td style={{ padding: 14 }}>{t.dia_diem}</td>
                <td style={{ padding: 14 }}>{Number(t.gia).toLocaleString("vi-VN")} đ</td>
                <td style={{ padding: 14 }}>{t.so_cho_con_lai}/{t.so_nguoi_toi_da}</td>
                <td style={{ padding: 14 }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 14px", marginRight: 8 }} onClick={() => handleEdit(t)}>Sửa</button>
                  <button className="btn btn-danger" style={{ padding: "6px 14px" }} onClick={() => handleDelete(t.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
