import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Home, Info, Package, MapPin, Hotel, Car, Users, Calendar } from 'lucide-react';

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

  const navLinks = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/about', name: 'About Us', icon: Info },
    { path: '/tours', name: 'Packages', icon: Package },
    { path: '/plan-tour', name: 'TourPlan', icon: MapPin },
    { path: '/hotels', name: 'Hotels', icon: Hotel },
    { path: '/vehicles', name: 'Vehicles', icon: Car },
    { path: '/guides', name: 'Guides', icon: Users },
  ];

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center transition-transform duration-300 hover:scale-105">
            <img src="/img/logo.png" alt="SerendiGo" className="h-14 w-auto object-contain" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 transition-all duration-300 hover:text-cta ${isActive(link.path) ? 'text-cta font-semibold border-b-2 border-cta pb-1' : 'hover:scale-105'}`}
              >
                <link.icon size={16} />
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className={`flex items-center gap-1 transition-all duration-300 hover:text-cta ${isActive('/my-bookings') ? 'text-cta font-semibold border-b-2 border-cta pb-1' : 'hover:scale-105'}`}
                >
                  <Calendar size={16} />
                  <span>My Bookings</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-cta text-primary px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-1"
                  >
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-cta transition-all duration-300">
                    <User size={18} />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-dark rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-lg flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="transition-all duration-300 hover:text-cta hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cta text-primary px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 py-2 transition-all duration-300 hover:text-cta hover:translate-x-2 ${isActive(link.path) ? 'text-cta font-semibold' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-2 py-2 transition-all duration-300 hover:text-cta hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar size={18} /> My Bookings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-2 text-cta font-semibold transition-all duration-300 hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Admin Panel
                  </Link>
                )}
                <div className="pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2 py-2">
                    <User size={18} /> {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 w-full text-left transition-all duration-300 hover:text-cta hover:translate-x-2"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 space-y-3">
                <Link
                  to="/login"
                  className="block py-2 transition-all duration-300 hover:text-cta hover:translate-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-cta text-primary px-4 py-2 rounded-lg text-center font-semibold transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;