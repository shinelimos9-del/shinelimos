import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/admin/ForgotPassword";
import VerifyOtp from "./pages/admin/VerifyOtp";
import ResetPassword from "./pages/admin/ResetPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Root and Admin Dashboard Protected Layout */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="admin-dashboard/vehicles" element={<AdminVehicles />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="admin-dashboard/bookings" element={<AdminBookings />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="admin-dashboard/notifications" element={<AdminNotifications />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
