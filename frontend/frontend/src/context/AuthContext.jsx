import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt:', { email, password }); // Debug log
    
    // Input validation
    if (!email || !password) {
      toast.error('Please enter both email/username and password');
      return false;
    }

    try {
      // ADMIN LOGIN - Case insensitive check
      if (email.toLowerCase() === 'admin' && password === 'admin1234') {
        const adminUser = {
          id: 'admin',
          name: 'Administrator',
          email: 'admin@serendigo.com',
          role: 'admin',
          isAdmin: true
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        toast.success('Welcome Admin! 👋');
        console.log('Admin login successful'); // Debug log
        return true;
      }
      
      // Regular user login (demo - accepts any email with password length >= 1)
      if (email && password && password.length >= 1) {
        const mockUser = {
          id: Date.now(),
          name: email.split('@')[0] || email,
          email: email,
          role: 'user',
          isAdmin: false
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        toast.success(`Welcome back, ${mockUser.name}! ✨`);
        return true;
      }
      
      toast.error('Invalid credentials. Please try again.');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (userData) => {
    if (!userData.name || !userData.email || !userData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    try {
      const mockUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        country: userData.country || '',
        role: 'user',
        isAdmin: false
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      toast.success(`Welcome to SerendiGo, ${userData.name}! 🎉`);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully. See you soon! 👋');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@serendigo.com' || user?.name === 'Administrator';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};