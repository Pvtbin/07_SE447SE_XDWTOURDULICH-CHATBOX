import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TourDetailPage from "./pages/TourDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTours from "./pages/admin/ManageTours";
import ManageBookings from "./pages/admin/ManageBookings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/tour/:id" element={<TourDetailPage />} />

          <Route
            path="/lich-su-dat-tour"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tours"
            element={
              <ProtectedRoute requireRole="admin">
                <ManageTours />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute requireRole="admin">
                <ManageBookings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
