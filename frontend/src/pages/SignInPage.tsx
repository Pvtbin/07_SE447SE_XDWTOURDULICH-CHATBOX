// SignInPage.jsx — TravelVN · Hội An aesthetic
// Requires: react-hook-form, zod, @hookform/resolvers, lucide-react

import "../styles/SignInPage.css"
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, MapPin } from "lucide-react";
 
const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
 
export default function SignInPage() {
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const onSubmit = async (data) => { console.log(data); };
 
  return (
    <>
      <div className="si-page">
 
        {/* LEFT — image */}
        <div className="si-left">
          <img className="si-bg-img" src="/signin.jpg" alt="Quảng Ninh" />
          <div className="si-overlay" />
          <div className="si-panel-content">
            <div className="si-badge"><MapPin size={11} /> Khám phá Việt Nam</div>
            <div className="si-panel-title">Chào mừng<br />trở lại!</div>
            <p className="si-panel-desc">Tiếp tục hành trình khám phá những điểm đến tuyệt vời của Việt Nam.</p>
            <div className="si-stats">
              {[["500+", "Tour độc quyền"], ["63", "Tỉnh thành"], ["4.9★", "Đánh giá TB"]].map(([n, l]) => (
                <div key={l}><div className="si-stat-num">{n}</div><div className="si-stat-label">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
 
        {/* RIGHT — form */}
        <div className="si-right">
          <a href="/" className="si-logo">
            <div className="si-logo-icon"><MapPin size={17} strokeWidth={2.5} /></div>
            <span className="si-logo-text">Travel<em>VN</em></span>
          </a>
 
          <div className="si-form-wrap">
            <div className="si-form-inner">
              <div className="si-heading">
                <h1>Đăng nhập</h1>
                <p>Chào mừng trở lại — nhập thông tin của bạn để tiếp tục.</p>
              </div>
              <div className="si-divider"><div className="si-divider-dot" /></div>
 
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="si-field">
                  <label className="si-label">Email</label>
                  <input {...register("email")} type="email" className={`si-input${errors.email ? " err" : ""}`} placeholder="name@example.com" />
                  {errors.email && <p className="si-error-msg">{errors.email.message}</p>}
                </div>
 
                <div className="si-field">
                  <div className="si-label-row">
                    <span className="si-label">Mật khẩu</span>
                    <a href="/forgot-password" className="si-forgot">Quên mật khẩu?</a>
                  </div>
                  <div className="si-input-wrap">
                    <input {...register("password")} type={showPw ? "text" : "password"} className={`si-input${errors.password ? " err" : ""}`} placeholder="••••••••" style={{ paddingRight: 38 }} />
                    <button type="button" className="si-pw-toggle" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="si-error-msg">{errors.password.message}</p>}
                </div>
 
                <button className="si-btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
 
                <div className="si-sep"><span>Hoặc tiếp tục với</span></div>
 
                <button className="si-btn-google" type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Đăng nhập bằng Google
                </button>
 
                <div className="si-signup">Chưa có tài khoản? <a href="/signup">Đăng ký ngay</a></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}