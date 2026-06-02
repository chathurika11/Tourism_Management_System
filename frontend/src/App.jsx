import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TourProvider } from './context/TourContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="w-12 h-12 border-4 border-primary border-t-cta rounded-full animate-spin"></div>
  </div>
);

// Redirect component for admin users trying to access public routes
const AdminRedirect = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const TourPackages = lazy(() => import('./pages/TourPackages'));
const Hotels = lazy(() => import('./pages/Hotels'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const TourGuides = lazy(() => import('./pages/TourGuides'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const CustomBooking = lazy(() => import('./pages/CustomBooking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Payment = lazy(() => import('./pages/Payment'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetailPage'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminHotels = lazy(() => import('./pages/Admin/AdminHotels'));
const AdminVehicles = lazy(() => import('./pages/Admin/AdminVehicles'));
const AdminGuides = lazy(() => import('./pages/Admin/AdminGuides'));
const AdminBookings = lazy(() => import('./pages/Admin/AdminBookings'));
const ReportsAnalytics = lazy(() => import('./pages/Admin/ReportsAnalytics'));
const CompanyCommission = lazy(() => import('./pages/Admin/CompanyCommission'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <TourProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes – redirect admin to /admin */}
                  <Route path="/" element={<AdminRedirect><LandingPage /></AdminRedirect>} />
                  <Route path="/about" element={<AdminRedirect><AboutUs /></AdminRedirect>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/tours" element={<AdminRedirect><TourPackages /></AdminRedirect>} />
                  <Route path="/tours/:id" element={<AdminRedirect><TourDetailPage /></AdminRedirect>} />
                  <Route path="/hotels" element={<AdminRedirect><Hotels /></AdminRedirect>} />
                  <Route path="/hotels/:id" element={<AdminRedirect><HotelDetailPage /></AdminRedirect>} />
                  <Route path="/vehicles" element={<AdminRedirect><Vehicles /></AdminRedirect>} />
                  <Route path="/vehicles/:id" element={<AdminRedirect><VehicleDetailPage /></AdminRedirect>} />
                  <Route path="/guides" element={<AdminRedirect><TourGuides /></AdminRedirect>} />
                  <Route path="/guides/:id" element={<AdminRedirect><GuideDetailPage /></AdminRedirect>} />
                  <Route path="/plan-tour" element={<AdminRedirect><CustomBooking /></AdminRedirect>} />
                  <Route path="/booking/:id" element={<PrivateRoute><AdminRedirect><BookingForm /></AdminRedirect></PrivateRoute>} />
                  <Route path="/my-bookings" element={<PrivateRoute><AdminRedirect><MyBookings /></AdminRedirect></PrivateRoute>} />
                  <Route path="/payment" element={<PrivateRoute><AdminRedirect><Payment /></AdminRedirect></PrivateRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>}>
                    <Route path="hotels" element={<AdminHotels />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="guides" element={<AdminGuides />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="reports" element={<ReportsAnalytics />} />
                    <Route path="company-commission" element={<CompanyCommission />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </div>
        </TourProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;