import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/customer/Home";
import TourList from "./pages/customer/TourList";
import TourDetail from "./pages/customer/TourDetail";
import MyBookings from "./pages/customer/MyBookings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import ManageTours from "./pages/admin/ManageTours";
import ManageBookings from "./pages/admin/ManageBookings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<TourList />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer (cần đăng nhập) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tours" element={<ManageTours />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}