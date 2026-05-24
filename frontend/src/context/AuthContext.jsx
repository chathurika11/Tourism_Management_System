import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Wrapped fetchUser in useCallback to stabilize its identity
  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Auth fetch error:", error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]); // Re-create fetchUser only if token changes

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]); // fetchUser is now a safe dependency

  const login = async (email, password) => {
    try {
      // For demo purposes, simulate login
      if (email === 'admin@serendigo.com' && password === 'admin123') {
        const mockUser = { name: 'Admin User', email: 'admin@serendigo.com', role: 'admin' };
        localStorage.setItem('token', 'mock-token');
        setToken('mock-token');
        setUser(mockUser);
        toast.success('Welcome to SerendiGo!');
        return true;
      } else if (email && password) {
        const mockUser = { name: 'Guest User', email: email, role: 'user' };
        localStorage.setItem('token', 'mock-token');
        setToken('mock-token');
        setUser(mockUser);
        toast.success('Welcome to SerendiGo!');
        return true;
      }
      toast.error('Invalid credentials');
      return false;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const mockUser = { name: userData.name, email: userData.email, role: 'user' };
      localStorage.setItem('token', 'mock-token');
      setToken('mock-token');
      setUser(mockUser);
      toast.success('Account created! Welcome to SerendiGo');
      return true;
    } catch (error) {
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out from SerendiGo');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};