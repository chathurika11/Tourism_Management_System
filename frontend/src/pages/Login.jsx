import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import loginBg from '../images/login.jpeg';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addBooking } = useTour();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      // Check if there is a pending booking stored
      const pending = sessionStorage.getItem('pendingBooking');
      if (pending) {
        try {
          const bookingData = JSON.parse(pending);
          // For package booking, create the booking now
          if (bookingData.type === 'package') {
            const user = JSON.parse(localStorage.getItem('user'));
            const newBooking = {
              id: Date.now(),
              type: 'Package',
              packageName: bookingData.tourName,
              packageId: bookingData.tourId,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              passengers: 1,
              totalAmount: bookingData.price,
              status: 'pending',
              paymentStatus: 'unpaid',
              bookingDate: new Date().toISOString().split('T')[0],
              userId: user.id,
            };
            addBooking(newBooking);
            toast.success('Booking created! Please complete payment.');
          }
          sessionStorage.removeItem('pendingBooking');
          navigate('/my-bookings');
          return;
        } catch (err) {
          console.error('Failed to restore pending booking', err);
        }
      }
      // Default redirect for non‑admin users
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl max-w-md w-full p-8 border border-white/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Welcome to SerendiGo</h2>
          <p className="text-gray-700 mt-2">Sign in to plan your Sri Lankan adventure</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email / Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="admin or user@example.com"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-accent hover:underline text-sm">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;