import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';

// Static components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="w-12 h-12 border-4 border-primary border-t-cta rounded-full animate-spin"></div>
  </div>
);

// Lazy load pages
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
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetailPage'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminHotels = lazy(() => import('./pages/Admin/AdminHotels'));
const AdminVehicles = lazy(() => import('./pages/Admin/AdminVehicles'));
const AdminGuides = lazy(() => import('./pages/Admin/AdminGuides'));
const AdminBookings = lazy(() => import('./pages/Admin/AdminBookings'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <TourProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/tours" element={<TourPackages />} />
                  <Route path="/tours/:id" element={<TourDetailPage />} />
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/hotels/:id" element={<HotelDetailPage />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
                  <Route path="/guides" element={<TourGuides />} />
                  <Route path="/guides/:id" element={<GuideDetailPage />} />
                  <Route path="/plan-tour" element={<CustomBooking />} />
                  <Route path="/booking/:id" element={<PrivateRoute><BookingForm /></PrivateRoute>} />
                  <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>}>
                    <Route index element={<AdminBookings />} />
                    <Route path="hotels" element={<AdminHotels />} />
                    <Route path="vehicles" element={<AdminVehicles />} />
                    <Route path="guides" element={<AdminGuides />} />
                    <Route path="bookings" element={<AdminBookings />} />
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