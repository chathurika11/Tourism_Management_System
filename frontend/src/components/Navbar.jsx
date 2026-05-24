import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <img src="/img/logo.png" alt="SerendiGo" className="h-16 w-auto object-contain mb-1" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>Home</Link>
            <Link to="/about" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/about') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>About Us</Link>
            <Link to="/tours" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/tours') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>Packages</Link>
            <Link to="/plan-tour" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/plan-tour') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>TourPlan</Link>
            <Link to="/hotels" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/hotels') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>Hotels</Link>
            <Link to="/vehicles" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/vehicles') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>Vehicles</Link>
            <Link to="/guides" className={`transition-all duration-300 transform hover:scale-110 ${isActive('/guides') ? 'text-cta font-bold border-b-2 border-cta' : 'hover:text-cta'}`}>Guides</Link>
            
            {user ? (
              <>
                <Link to="/my-bookings" className="hover:text-cta transition">My Bookings</Link>
                {isAdmin && (
                  <Link to="/admin" className="bg-cta text-primary px-3 py-1 rounded-lg hover:bg-opacity-90 transition">
                    Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-cta transition">
                    👤 {user.name}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-dark rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-lg">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="transition-all duration-300 transform hover:scale-110 hover:text-cta">Login</Link>
                <Link to="/register" className="bg-cta text-primary px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            <Link to="/" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/about') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/tours" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/tours') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>Packages</Link>
            <Link to="/plan-tour" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/plan-tour') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>TourPlan</Link>
            <Link to="/hotels" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/hotels') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>Hotels</Link>
            <Link to="/vehicles" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/vehicles') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>Vehicles</Link>
            <Link to="/guides" className={`block transition-all duration-300 transform hover:translate-x-2 ${isActive('/guides') ? 'text-cta font-bold' : 'hover:text-cta'}`} onClick={() => setIsMenuOpen(false)}>Guides</Link>
            {user ? (
              <>
                <Link to="/my-bookings" className="block hover:text-cta transition" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
                {isAdmin && <Link to="/admin" className="block hover:text-cta transition" onClick={() => setIsMenuOpen(false)}>Admin</Link>}
                <button onClick={handleLogout} className="block w-full text-left hover:text-cta transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-cta transition" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block bg-cta text-primary px-4 py-2 rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;