import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const CancellationPolicy = React.lazy(() => import("./pages/CancellationPolicy"));
const Faq = React.lazy(() => import("./pages/Faq"));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <Loader2 className="w-8 h-8 text-gold animate-spin" />
  </div>
);

function AppContent() {
  return (
    <>
      <Background />
      <Navbar />
      
      <main className="relative">
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
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CallNowButton />
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