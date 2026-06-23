import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { LogIn, AtSign, Lock } from 'lucide-react';
import loginBg from '../images/login.jpeg';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isRestoring = sessionStorage.getItem('intendedBooking') ||
                      sessionStorage.getItem('pendingCustomBooking') ||
                      sessionStorage.getItem('pendingBooking');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    const loggedInUser = await login(username, password);
    setLoading(false);
    if (loggedInUser) {
      // Debug log
      console.log('🔍 SessionStorage after login:', {
        pendingBooking: sessionStorage.getItem('pendingBooking'),
        pendingCustom: sessionStorage.getItem('pendingCustomBooking'),
        intended: sessionStorage.getItem('intendedBooking'),
      });

      // 1. MUST change password
      if (loggedInUser.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      // 2. Check booking restoration FIRST (before admin/staff)
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      const pendingCustom = sessionStorage.getItem('pendingCustomBooking');
      const intended = sessionStorage.getItem('intendedBooking');

      if (pendingBooking) {
        navigate('/payment');
        return;
      }
      if (pendingCustom) {
        navigate('/plan-tour');
        return;
      }
      if (intended) {
        try {
          const obj = JSON.parse(intended);
          // Compute endDate from startDate and duration
          const start = new Date(obj.startDate);
          const durationDays = parseInt(obj.duration) || 1;
          const end = new Date(start);
          end.setDate(end.getDate() + durationDays - 1);
          const numberOfDays = durationDays;
          const payload = {
            type: 'Tour Package',
            packageName: obj.packageName,
            startDate: obj.startDate,
            endDate: end.toISOString().split('T')[0],
            numberOfDays: numberOfDays,
            passengers: parseInt(obj.passengers) || 1,
            totalAmount: parseFloat((obj.price || 0) * (obj.passengers || 1)),
            status: 'pending',
            paymentStatus: 'unpaid',
          };
          const res = await API.post('/bookings', payload);
          sessionStorage.setItem('pendingBooking', JSON.stringify(res.data));
          sessionStorage.removeItem('intendedBooking');
          navigate('/payment');
          return;
        } catch (e) {
          console.error('Resume intended booking failed', e);
        }
      }

      // 3. Admin / staff (only if no booking to restore)
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'staff') {
        navigate('/admin/dashboard');
        return;
      }

      // 4. Default: customer dashboard
      navigate('/customer/dashboard');
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${loginBg})` }} />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl max-w-md w-full p-8 border border-white/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Welcome to SerendiGo</h2>
          <p className="text-gray-700 mt-2">Sign in with your username and password</p>
        </div>

        {isRestoring && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-4 text-sm">
            🔄 You were in the middle of a booking. Please log in to continue.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email / Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your email or username"
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
          Don't have a customer account?{' '}
          <Link to="/register" className="text-secondary font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;