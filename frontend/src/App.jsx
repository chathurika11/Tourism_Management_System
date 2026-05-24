import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import TourPackages from './pages/TourPackages';
import Hotels from './pages/Hotels';
import Vehicles from './pages/Vehicles';
import TourGuides from './pages/TourGuides';
import BookingForm from './pages/BookingForm';
import CustomBooking from './pages/CustomBooking';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

// Import Detail Pages
import VehicleDetailPage from './pages/VehicleDetailPage';
import HotelDetailPage from './pages/HotelDetailPage';
import TourDetailPage from './pages/TourDetailPage';
import GuideDetailPage from './pages/GuideDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TourProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
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
                
                {/* Protected Routes (Require Login) */}
                <Route path="/booking/:id" element={<PrivateRoute><BookingForm /></PrivateRoute>} />
                <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </TourProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;