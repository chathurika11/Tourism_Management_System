import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AtSign, Lock } from 'lucide-react';
import loginBg from '../images/login.jpeg';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      if (loggedInUser.mustChangePassword) {
        navigate('/change-password');
      } else if (loggedInUser.role === 'admin' || loggedInUser.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
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
        
        {/* Demo admin hint removed */}
        
        <p className="text-center mt-6 text-gray-600">
          Don't have a customer account?{' '}
          <Link to="/register" className="text-secondary font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
