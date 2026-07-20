import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CallNowButton from "./components/CallNowButton";

import { HelmetProvider } from "react-helmet-async";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Code Split Pages
const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Fleet = React.lazy(() => import("./pages/Fleet"));
const FleetDetail = React.lazy(() => import("./pages/FleetDetail"));
const Services = React.lazy(() => import("./pages/Services"));
const ServiceDetail = React.lazy(() => import("./pages/ServiceDetail"));
const Locations = React.lazy(() => import("./pages/Locations"));
const LocationDetail = React.lazy(() => import("./pages/LocationDetail"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Booking = React.lazy(() => import("./pages/Booking"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Faq = React.lazy(() => import("./pages/Faq"));

const AdminLogin = React.lazy(() => import("./pages/admin/AdminLogin"));
const ForgotPassword = React.lazy(() => import("./pages/admin/ForgotPassword"));
const VerifyOtp = React.lazy(() => import("./pages/admin/VerifyOtp"));
const ResetPassword = React.lazy(() => import("./pages/admin/ResetPassword"));
const AdminLayout = React.lazy(() => import("./layouts/admin/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminVehicles = React.lazy(() => import("./pages/admin/AdminVehicles"));
const AdminBookings = React.lazy(() => import("./pages/admin/AdminBookings"));
const AdminNotifications = React.lazy(() => import("./pages/admin/AdminNotifications"));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <Loader2 className="w-8 h-8 text-gold animate-spin" />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/forgot-password" || location.pathname === "/verify-otp" || location.pathname === "/reset-password";

  return (
    <>
      <Background />
      {!isAdminRoute && <Navbar />}
      
      <main className={isAdminRoute ? "" : "relative"}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/fleet/:slug" element={<FleetDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:slug" element={<LocationDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<div className="text-white text-center py-20">Payment was cancelled. Please contact support if you have any questions.</div>} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          
          {/* Admin Auth Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin-dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="*" element={<div className="text-white text-center py-20 text-xl font-light">Page under construction</div>} />
          </Route>

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CallNowButton />}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}