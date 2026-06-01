import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Info, Calendar, Hotel, Car, Users, MapPin, LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't render navbar on admin pages if you prefer a clean admin layout.
  // But if you want to keep it, we'll hide public links.
  // For admin, we show minimal links.
  const publicLinks = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/about', name: 'About', icon: Info },
    { path: '/tours', name: 'Tours', icon: Calendar },
    { path: '/hotels', name: 'Hotels', icon: Hotel },
    { path: '/vehicles', name: 'Vehicles', icon: Car },
    { path: '/guides', name: 'Guides', icon: Users },
    { path: '/plan-tour', name: 'Plan Tour', icon: MapPin },
  ];

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={isAdmin ? '/admin' : '/'} className="text-2xl font-playfair font-bold">
            SerendiGo
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {/* For non-admin users: show all public links */}
            {!isAdmin && (
              <>
                {publicLinks.map(link => (
                  <Link key={link.path} to={link.path} className="hover:text-cta transition flex items-center gap-1">
                    <link.icon size={18}/> {link.name}
                  </Link>
                ))}
              </>
            )}

            {/* For admin: only Admin Dashboard and Logout (no public links) */}
            {user && isAdmin && (
              <>
                <Link to="/admin" className="hover:text-cta transition flex items-center gap-1">
                  <Shield size={18}/> Admin Dashboard
                </Link>
              </>
            )}

            {/* Common user actions */}
            {user ? (
              <>
                {!isAdmin && (
                  <Link to="/my-bookings" className="hover:text-cta transition flex items-center gap-1">
                    <User size={18}/> My Bookings
                  </Link>
                )}
                <button onClick={handleLogout} className="hover:text-cta transition flex items-center gap-1">
                  <LogOut size={18}/> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-cta transition">Login</Link>
                <Link to="/register" className="hover:text-cta transition">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {!isAdmin && (
              <>
                {publicLinks.map(link => (
                  <Link key={link.path} to={link.path} className="block hover:text-cta" onClick={() => setIsOpen(false)}>
                    {link.name}
                  </Link>
                ))}
              </>
            )}
            {user && isAdmin && (
              <Link to="/admin" className="block hover:text-cta" onClick={() => setIsOpen(false)}>
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <>
                {!isAdmin && (
                  <Link to="/my-bookings" className="block hover:text-cta" onClick={() => setIsOpen(false)}>
                    My Bookings
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left hover:text-cta">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-cta" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block hover:text-cta" onClick={() => setIsOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;