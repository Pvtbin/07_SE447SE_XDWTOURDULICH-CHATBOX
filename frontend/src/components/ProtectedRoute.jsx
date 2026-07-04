import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// requireRole="admin" -> chỉ admin vào được; không truyền -> chỉ cần đăng nhập
export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (requireRole && user.vai_tro !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
