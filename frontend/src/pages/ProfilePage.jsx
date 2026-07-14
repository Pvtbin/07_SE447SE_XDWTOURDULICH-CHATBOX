import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMeApi, updateProfileApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau_cu: "",
    mat_khau_moi: "",
    xac_nhan_mat_khau: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMeApi();
      const user = res.data.user;
      setForm({
        ho_ten: user.ho_ten || "",
        email: user.email || "",
        so_dien_thoai: user.so_dien_thoai || "",
        mat_khau_cu: "",
        mat_khau_moi: "",
        xac_nhan_mat_khau: "",
      });
    } catch (err) {
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.ho_ten.trim()) {
      setError("Họ tên không được để trống");
      return;
    }

    if (showPasswordForm) {
      if (!form.mat_khau_cu) {
        setError("Vui lòng nhập mật khẩu cũ");
        return;
      }
      if (!form.mat_khau_moi || form.mat_khau_moi.length < 6) {
        setError("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }
      if (form.mat_khau_moi !== form.xac_nhan_mat_khau) {
        setError("Xác nhận mật khẩu không khớp");
        return;
      }
    }

    setSaving(true);
    try {
      const data = {
        ho_ten: form.ho_ten,
        so_dien_thoai: form.so_dien_thoai,
      };

      if (showPasswordForm) {
        data.mat_khau_cu = form.mat_khau_cu;
        data.mat_khau_moi = form.mat_khau_moi;
      }

      const res = await updateProfileApi(data);
      setUser(res.data.user);
      setSuccess("Cập nhật thông tin thành công!");
      setShowPasswordForm(false);
      setForm((prev) => ({
        ...prev,
        mat_khau_cu: "",
        mat_khau_moi: "",
        xac_nhan_mat_khau: "",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div>
            <div className="profile-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Tài khoản</span>
            </div>
            <h1>Thông tin cá nhân</h1>
            <p className="text-muted">Quản lý thông tin và bảo mật tài khoản</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Quay lại
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-grid">
          {/* Main Form */}
          <div className="profile-card main">
            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar">
                  {form.ho_ten?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="avatar-info">
                  <h2>{form.ho_ten || "Người dùng"}</h2>
                  <p>{form.email}</p>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="alert error">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                  {success}
                </div>
              )}

              {/* Basic Info */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    value={form.ho_ten}
                    onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    style={{ background: "var(--ocean-mist)", cursor: "not-allowed" }}
                  />
                  <span className="hint">Email không thể thay đổi</span>
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={form.so_dien_thoai}
                    onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Đổi mật khẩu</h3>
                  {!showPasswordForm && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Đổi mật khẩu
                    </button>
                  )}
                </div>

                {showPasswordForm && (
                  <div className="password-form">
                    <div className="form-group">
                      <label>Mật khẩu cũ *</label>
                      <input
                        type="password"
                        value={form.mat_khau_cu}
                        onChange={(e) => setForm({ ...form, mat_khau_cu: e.target.value })}
                        placeholder="Nhập mật khẩu cũ"
                      />
                    </div>

                    <div className="form-group">
                      <label>Mật khẩu mới *</label>
                      <input
                        type="password"
                        value={form.mat_khau_moi}
                        onChange={(e) => setForm({ ...form, mat_khau_moi: e.target.value })}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Xác nhận mật khẩu mới *</label>
                      <input
                        type="password"
                        value={form.xac_nhan_mat_khau}
                        onChange={(e) => setForm({ ...form, xac_nhan_mat_khau: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost cancel-btn"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setForm((prev) => ({
                          ...prev,
                          mat_khau_cu: "",
                          mat_khau_moi: "",
                          xac_nhan_mat_khau: "",
                        }));
                      }}
                    >
                      Hủy đổi mật khẩu
                    </button>
                  </div>
                )}

                {!showPasswordForm && (
                  <p className="password-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    Mật khẩu của bạn được bảo mật và mã hóa
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16 }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,21 7,13 17,13 17,21"/>
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="profile-card sidebar">
            <div className="sidebar-section">
              <h3>Liên kết nhanh</h3>
              <div className="quick-links">
                <button onClick={() => navigate("/lich-su-dat-tour")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  Lịch sử đặt tour
                </button>
                <button onClick={() => navigate("/")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Khám phá tour
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Bảo mật</h3>
              <div className="security-tips">
                <div className="tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Mật khẩu được mã hóa an toàn</span>
                </div>
                <div className="tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Thông tin cá nhân được bảo vệ</span>
                </div>
                <div className="tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Đăng nhập qua cookie bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: calc(100vh - 76px);
          background: var(--ocean-mist);
          padding: 32px 24px 80px;
        }

        .profile-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .profile-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .profile-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--ocean-light);
          border-radius: var(--radius-full);
          margin-bottom: 12px;
        }

        .profile-badge span {
          font-size: 13px;
          font-weight: 600;
          color: var(--ocean-mid);
        }

        .profile-header h1 {
          font-size: 28px;
          margin: 0 0 8px;
          background: var(--gradient-neon);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .profile-card.main {
          min-width: 0;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--cloud);
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--gradient-neon);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
        }

        .avatar-info h2 {
          margin: 0 0 4px;
          font-size: 20px;
          color: var(--slate);
        }

        .avatar-info p {
          margin: 0;
          color: var(--silver);
          font-size: 14px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          font-size: 14px;
        }

        .alert.error {
          background: var(--danger-bg);
          color: var(--danger);
        }

        .alert.success {
          background: var(--success-bg);
          color: var(--success);
        }

        .form-section {
          margin-bottom: 28px;
        }

        .form-section h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--slate);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 16px;
          color: var(--slate);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--slate);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--cloud);
          border-radius: var(--radius-md);
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--neon-cyan);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .form-group .hint {
          display: block;
          font-size: 12px;
          color: var(--silver);
          margin-top: 4px;
        }

        .password-form {
          animation: fadeInUp 0.3s ease;
        }

        .password-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--silver);
          font-size: 13px;
          margin: 0;
          padding: 12px;
          background: var(--ocean-mist);
          border-radius: var(--radius-sm);
        }

        .cancel-btn {
          margin-top: 12px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid var(--cloud);
        }

        .form-actions .btn {
          min-width: 120px;
          justify-content: center;
        }

        /* Sidebar */
        .sidebar-section {
          margin-bottom: 24px;
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .sidebar-section h3 {
          margin: 0 0 16px;
          font-size: 14px;
          color: var(--slate);
        }

        .quick-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-links button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--ocean-mist);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 14px;
          color: var(--slate);
          text-align: left;
          transition: all 0.2s;
        }

        .quick-links button:hover {
          background: var(--ocean-light);
          color: var(--neon-cyan);
        }

        .security-tips {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tip {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--slate);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            order: -1;
          }

          .profile-card {
            padding: 20px;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
