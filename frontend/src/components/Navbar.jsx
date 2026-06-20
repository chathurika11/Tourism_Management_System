import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Info, Calendar, Hotel, Car, Users, MapPin, LogOut, Shield, User, MessageSquare, Handshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const dashboardPath = user?.role === 'admin' || user?.role === 'staff' ? '/admin/dashboard' : '/customer/dashboard';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    scrollToTop();
  };

  const handleNavigation = (path) => {
    navigate(path);
    scrollToTop();
    setIsOpen(false);
  };

  const getActiveClass = (path) => {
    return location.pathname === path
      ? 'text-cta font-semibold border-b-2 border-cta pb-1'
      : 'hover:text-cta';
  };

  const publicLinks = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/about', name: 'About', icon: Info },
    { path: '/tours', name: 'Tours', icon: Calendar },
    { path: '/hotels', name: 'Hotels', icon: Hotel },
    { path: '/vehicles', name: 'Vehicles', icon: Car },
    { path: '/guides', name: 'Guides', icon: Users },
    { path: '/plan-tour', name: 'Plan Tour', icon: MapPin },
    { path: '/partner-register', name: 'Partner', icon: Handshake },
  ];

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigation(user ? dashboardPath : '/')}
            className="text-2xl font-playfair font-bold hover:text-cta transition"
          >
            SerendiGo
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {!isAdmin &&
              publicLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className={`flex items-center gap-1 transition ${getActiveClass(link.path)}`}
                >
                  <link.icon size={18} /> {link.name}
                </button>
              ))}

            {user && isAdmin && (
              <button
                onClick={() => handleNavigation(dashboardPath)}
                className={`flex items-center gap-1 transition ${getActiveClass(dashboardPath)}`}
              >
                <Shield size={18} /> {user.role === 'staff' ? 'Staff Dashboard' : 'Admin Dashboard'}
              </button>
            )}

            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <button
                      onClick={() => handleNavigation('/customer/dashboard')}
                      className={`flex items-center gap-1 transition ${getActiveClass('/customer/dashboard')}`}
                    >
                      <User size={18} /> Dashboard
                    </button>
                    <button
                      onClick={() => handleNavigation('/my-bookings')}
                      className={`flex items-center gap-1 transition ${getActiveClass('/my-bookings')}`}
                    >
                      <User size={18} /> My Bookings
                    </button>
                    <button
                      onClick={() => handleNavigation('/my-reviews')}
                      className={`flex items-center gap-1 transition ${getActiveClass('/my-reviews')}`}
                    >
                      <MessageSquare size={18} /> My Reviews
                    </button>
                  </>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1 hover:text-cta transition">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNavigation('/login')} className="hover:text-cta transition">
                  Login
                </button>
                <button onClick={() => handleNavigation('/register')} className="hover:text-cta transition">
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {!isAdmin &&
              publicLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className={`block w-full text-left transition ${location.pathname === link.path ? 'text-cta font-semibold' : 'hover:text-cta'}`}
                >
                  {link.name}
                </button>
              ))}
            {user && isAdmin && (
              <button
                onClick={() => handleNavigation(dashboardPath)}
                className={`block w-full text-left transition ${location.pathname === dashboardPath ? 'text-cta font-semibold' : 'hover:text-cta'}`}
              >
                {user.role === 'staff' ? 'Staff Dashboard' : 'Admin Dashboard'}
              </button>
            )}
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <button
                      onClick={() => handleNavigation('/customer/dashboard')}
                      className={`block w-full text-left transition ${location.pathname === '/customer/dashboard' ? 'text-cta font-semibold' : 'hover:text-cta'}`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNavigation('/my-bookings')}
                      className={`block w-full text-left transition ${location.pathname === '/my-bookings' ? 'text-cta font-semibold' : 'hover:text-cta'}`}
                    >
                      My Bookings
                    </button>
                    <button
                      onClick={() => handleNavigation('/my-reviews')}
                      className={`block w-full text-left transition ${location.pathname === '/my-reviews' ? 'text-cta font-semibold' : 'hover:text-cta'}`}
                    >
                      My Reviews
                    </button>
                  </>
                )}
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left hover:text-cta">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNavigation('/login')} className="block w-full text-left hover:text-cta">
                  Login
                </button>
                <button onClick={() => handleNavigation('/register')} className="block w-full text-left hover:text-cta">
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
