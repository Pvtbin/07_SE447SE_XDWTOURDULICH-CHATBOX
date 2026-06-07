// SignUpPage.jsx — TravelVN · Hội An aesthetic
// Requires: react-hook-form, zod, @hookform/resolvers, lucide-react
// Google Fonts: Playfair Display + DM Sans (add to index.html)
 
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MapPin } from "lucide-react";
 
 import "../styles/SignUpPage.css";
// ── Schema ─────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});
 
// ── Component ──────────────────────────────────────────────────
export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
 
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
 
  const onSubmit = async (data) => {
    // TODO: call API
    console.log(data);
  };
 
  return (
    <>
      <div className="su-page">
 
        {/* ── LEFT ── */}
        <div className="su-left">
          <a href="/" className="su-logo">
            <div className="su-logo-icon">
              <MapPin size={17} strokeWidth={2.5} />
            </div>
            <span className="su-logo-text">Travel<em>VN</em></span>
          </a>
 
          <div className="su-form-wrap">
            <div className="su-form-inner">
 
              <div className="su-heading">
                <h1>Tạo tài khoản</h1>
                <p>Khám phá Việt Nam cùng chúng tôi — điền thông tin bên dưới để bắt đầu hành trình.</p>
              </div>
 
              <div className="su-divider"><div className="su-divider-dot" /></div>
 
              <form onSubmit={handleSubmit(onSubmit)}>
 
                {/* Name */}
                <div className="su-field">
                  <label className="su-label">Họ và tên</label>
                  <input
                    {...register("name")}
                    className={`su-input${errors.name ? " err" : ""}`}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.name
                    ? <p className="su-error-msg">{errors.name.message}</p>
                    : null}
                </div>
 
                {/* Email */}
                <div className="su-field">
                  <label className="su-label">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    className={`su-input${errors.email ? " err" : ""}`}
                    placeholder="name@example.com"
                  />
                  {errors.email
                    ? <p className="su-error-msg">{errors.email.message}</p>
                    : <p className="su-hint">Chúng tôi cam kết không chia sẻ email với bất kỳ ai.</p>}
                </div>
 
                {/* Password */}
                <div className="su-field">
                  <label className="su-label">Mật khẩu</label>
                  <div className="su-input-wrap">
                    <input
                      {...register("password")}
                      type={showPw ? "text" : "password"}
                      className={`su-input${errors.password ? " err" : ""}`}
                      placeholder="••••••••"
                      style={{ paddingRight: 38 }}
                    />
                    <button type="button" className="su-pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password
                    ? <p className="su-error-msg">{errors.password.message}</p>
                    : <p className="su-hint">Ít nhất 8 ký tự.</p>}
                </div>
 
                {/* Confirm Password */}
                <div className="su-field">
                  <label className="su-label">Nhập lại mật khẩu</label>
                  <div className="su-input-wrap">
                    <input
                      {...register("confirmPassword")}
                      type={showCpw ? "text" : "password"}
                      className={`su-input${errors.confirmPassword ? " err" : ""}`}
                      placeholder="••••••••"
                      style={{ paddingRight: 38 }}
                    />
                    <button type="button" className="su-pw-toggle" onClick={() => setShowCpw(v => !v)}>
                      {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="su-error-msg">{errors.confirmPassword.message}</p>
                  )}
                </div>
 
                {/* Actions */}
                <div className="su-actions">
                  <button className="su-btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </button>
 
                  <div className="su-sep"><span>Hoặc tiếp tục với</span></div>
 
                  <button className="su-btn-google" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Đăng ký bằng Google
                  </button>
 
                  <div className="su-signin">
                    Đã có tài khoản?{" "}
                    <a href="/signin">Đăng nhập</a>
                  </div>
                </div>
 
              </form>
            </div>
          </div>
        </div>
 
        {/* ── RIGHT — background image ── */}
        <div className="su-right">
          {/* Replace src with your /signup.jpg or the uploaded Hội An image */}
          <img
            className="su-bg-img"
            src="/signup.jpg"
            alt="Hội An phố cổ"
          />
          <div className="su-overlay" />
          <div className="su-panel-content">
            <div className="su-badge">
              <MapPin size={11} />
              Khám phá Việt Nam
            </div>
            <div className="su-panel-title">
              Hành trình của bạn<br />bắt đầu từ đây
            </div>
            <p className="su-panel-desc">
              Từ phố cổ Hội An đến vịnh Hạ Long — hàng nghìn tour độc quyền đang chờ bạn.
            </p>
            <div className="su-stats">
              {[["500+", "Tour độc quyền"], ["63", "Tỉnh thành"], ["4.9★", "Đánh giá TB"]].map(([num, lbl]) => (
                <div key={lbl}>
                  <div className="su-stat-num">{num}</div>
                  <div className="su-stat-label">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
 
      </div>
    </>
  );
}
 