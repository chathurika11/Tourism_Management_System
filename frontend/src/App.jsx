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

const AdminRedirect = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'staff') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Lazy imports
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
const PartnerRegister = lazy(() => import('./pages/PartnerRegister'));
const SearchResults = lazy(() => import('./pages/SearchResults'));



const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminHotels = lazy(() => import('./pages/Admin/AdminHotels'));
const AdminVehicles = lazy(() => import('./pages/Admin/AdminVehicles'));
const AdminGuides = lazy(() => import('./pages/Admin/AdminGuides'));
const AdminBookings = lazy(() => import('./pages/Admin/AdminBookings'));
const ReportsAnalytics = lazy(() => import('./pages/Admin/ReportsAnalytics'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminFeedbacks = lazy(() => import('./pages/Admin/AdminFeedbacks'));
const AdminTourPackages = lazy(() => import('./pages/Admin/AdminTourPackages'));
const AdminDistricts = lazy(() => import('./pages/Admin/AdminDistricts'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const CustomersManagement = lazy(() => import('./pages/CustomersManagement'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const MyReviews = lazy(() => import('./pages/MyReviews'));
const ProviderRequests = lazy(() => import('./pages/Admin/ProviderRequests'));

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
                  <Route path="/" element={<AdminRedirect><LandingPage /></AdminRedirect>} />
                  <Route path="/about" element={<AdminRedirect><AboutUs /></AdminRedirect>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<AdminRedirect><Register /></AdminRedirect>} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/access-denied" element={<AccessDenied />} />
                  <Route path="/tours" element={<AdminRedirect><TourPackages /></AdminRedirect>} />
                  <Route path="/tours/:id" element={<AdminRedirect><TourDetailPage /></AdminRedirect>} />
                  <Route path="/hotels" element={<AdminRedirect><Hotels /></AdminRedirect>} />
                  <Route path="/hotels/:id" element={<AdminRedirect><HotelDetailPage /></AdminRedirect>} />
                  <Route path="/vehicles" element={<AdminRedirect><Vehicles /></AdminRedirect>} />
                  <Route path="/vehicles/:id" element={<AdminRedirect><VehicleDetailPage /></AdminRedirect>} />
                  <Route path="/guides" element={<AdminRedirect><TourGuides /></AdminRedirect>} />
                  <Route path="/guides/:id" element={<AdminRedirect><GuideDetailPage /></AdminRedirect>} />
                  {/* 👇 Changed from /partner-register to /contact */}
                  <Route path="/contact" element={<AdminRedirect><PartnerRegister /></AdminRedirect>} />
                  <Route path="/plan-tour" element={<AdminRedirect><CustomBooking /></AdminRedirect>} />
                  <Route path="/booking/:id" element={<PrivateRoute><AdminRedirect><BookingForm /></AdminRedirect></PrivateRoute>} />
                  <Route path="/customer/dashboard" element={<PrivateRoute roles={['user']}><CustomerDashboard /></PrivateRoute>} />
                  <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/my-bookings" element={<PrivateRoute roles={['user', 'admin', 'staff']}><AdminRedirect><MyBookings /></AdminRedirect></PrivateRoute>} />
                  <Route path="/payment" element={<PrivateRoute roles={['user', 'admin', 'staff']}><AdminRedirect><Payment /></AdminRedirect></PrivateRoute>} />
                  <Route path="/my-reviews" element={<PrivateRoute><MyReviews /></PrivateRoute>} />
                  <Route path="/staff/dashboard" element={<PrivateRoute roles={['staff', 'admin']}><Navigate to="/admin/dashboard" replace /></PrivateRoute>} />
                  <Route path="/staff/bookings" element={<PrivateRoute roles={['staff', 'admin']}><AdminBookings /></PrivateRoute>} />
                  <Route path="/staff/support" element={<PrivateRoute roles={['staff', 'admin']}><AdminFeedbacks /></PrivateRoute>} />
                  <Route path="/customers" element={<PrivateRoute roles={['staff', 'admin']}><CustomersManagement /></PrivateRoute>} />
                  <Route path="/search" element={<SearchResults />} />
                  
                  <Route path="/admin" element={<PrivateRoute roles={['admin', 'staff']}><AdminDashboard /></PrivateRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={null} />
                    <Route path="hotels" element={<AdminHotels />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="guides" element={<AdminGuides />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="reports" element={<PrivateRoute roles={['admin']}><ReportsAnalytics /></PrivateRoute>} />
                    <Route path="feedbacks" element={<AdminFeedbacks />} />
                    <Route path="users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
                    <Route path="logs" element={<PrivateRoute roles={['admin']}><AuditLogs /></PrivateRoute>} />
                    <Route path="tour-packages" element={<AdminTourPackages />} />
                    <Route path="districts" element={<AdminDistricts />} />
                    <Route path="provider-requests" element={<ProviderRequests />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <FooterWrapper />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </div>
        </TourProvider>
      </AuthProvider>
    </Router>
  );
}

function FooterWrapper() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  if (isAdminRoute || isAuthRoute) return null;
  return <Footer />;
}

export default App;