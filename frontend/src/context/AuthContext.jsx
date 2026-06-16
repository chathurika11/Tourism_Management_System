import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // REGISTER - sends data to backend
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success(`Welcome ${res.data.user.name}!`);
      return res.data.user;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const res = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid username or password');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.put('/auth/change-password', { currentPassword, newPassword });
      const updatedUser = { ...user, ...res.data.user, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Password changed successfully');
      return updatedUser;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
      return null;
    }
  };

  // Forgot Password - Send OTP
const forgotPassword = async (username) => {
  try {
    const res = await API.post('/auth/forgot-password', { username });
    return { 
      success: true, 
      email: res.data.email, 
      devMode: res.data.devMode || false 
      };
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
      return null;
    }
  };

  // Reset Password - Verify OTP and set new password
  const resetPassword = async (username, otp, newPassword) => {
    try {
      await API.post('/auth/reset-password', { username, otp, newPassword });
      toast.success('Password reset successful! Please login.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Invalid or expired OTP.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isMainAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, loading, register, login, 
      forgotPassword, resetPassword, changePassword, logout, isAdmin, isMainAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
