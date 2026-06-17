import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Hotel, Car, Users, LogOut,
  Menu, X, User, BarChart3, UserPlus, MessageSquare, Package,
  MapPin, ChevronRight, ScrollText, CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import Footer from '../components/Footer'; // 👈 import Footer

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user, isMainAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch stats from API
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const [reportsRes, commissionRes] = await Promise.all([
        API.get(`/analytics/reports?year=${year}`),
        API.get(`/analytics/commission-summary?year=${year}`)
      ]);
      return {
        totalBookings: reportsRes.data.total || 0,
        totalRevenue: reportsRes.data.totalRevenue || 0,
        totalCommission: commissionRes.data.totalCommission || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = reportsData || { totalBookings: 0, totalRevenue: 0, totalCommission: 0 };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hotels', name: 'Manage Hotels', icon: Hotel },
    { path: '/admin/vehicles', name: 'Manage Vehicles', icon: Car },
    { path: '/admin/guides', name: 'Manage Guides', icon: Users },
    { path: '/admin/tour-packages', name: 'Manage Tour Packages', icon: Package },
    { path: '/admin/bookings', name: 'Manage Bookings', icon: CalendarCheck },
    { path: '/admin/feedbacks', name: 'Manage Feedbacks', icon: MessageSquare },
    { path: '/admin/districts', name: 'Destinations', icon: MapPin },
    ...(isMainAdmin ? [{ path: '/admin/users', name: 'Registered Users', icon: UserPlus }] : []),
    ...(isMainAdmin ? [{ path: '/admin/logs', name: 'Audit Logs', icon: ScrollText }] : []),
    ...(isMainAdmin ? [{ path: '/admin/reports', name: 'Reports & Analytics', icon: BarChart3 }] : []),
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary to-secondary text-white transition-all duration-300 fixed h-full z-20 shadow-2xl flex flex-col`}>
          {/* ... sidebar content (unchanged) ... */}
          <div className="p-4 flex justify-between items-center border-b border-white/20">
            <div className={`${!isSidebarOpen && 'hidden'}`}>
              <h1 className="font-playfair text-xl font-bold tracking-wide">SerendiGo</h1>
              <p className="text-xs text-cta opacity-80">{isMainAdmin ? 'Admin Panel' : 'Staff Panel'}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-white/20 border-l-4 border-cta shadow-md'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className={`${!isSidebarOpen && 'hidden'} text-sm font-medium`}>{item.name}</span>
                </div>
                {isActive(item.path) && isSidebarOpen && (
                  <ChevronRight size={16} className="text-cta" />
                )}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/20 p-4 space-y-3">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="bg-cta/20 rounded-full p-2">
                <User size={18} className="text-cta" />
              </div>
              <div className={`${!isSidebarOpen && 'hidden'}`}>
                <p className="text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-cta/80">{isMainAdmin ? 'Admin' : 'Staff Member'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/20 transition ${
                !isSidebarOpen && 'justify-center'
              }`}
            >
              <LogOut size={18} />
              <span className={`${!isSidebarOpen && 'hidden'} text-sm`}>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 flex flex-col min-h-screen`}>
          <div className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-primary">
              {menuItems.find(i => isActive(i.path))?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}!</p>
          </div>
          <div className="p-6 flex-1">
            {/* Dashboard content */}
            {(location.pathname === '/admin' || location.pathname === '/admin/dashboard') && (
              <>
                {isMainAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary transition hover:shadow-lg">
                      <p className="text-gray-500 text-sm">Total Bookings</p>
                      <p className="text-3xl font-bold text-primary">
                        {reportsLoading ? '...' : stats.totalBookings}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-secondary transition hover:shadow-lg">
                      <p className="text-gray-500 text-sm">Total Revenue (Rs)</p>
                      <p className="text-3xl font-bold text-primary">
                        {reportsLoading ? '...' : stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cta transition hover:shadow-lg">
                      <p className="text-gray-500 text-sm">Company Commission (Rs)</p>
                      <p className="text-3xl font-bold text-primary">
                        {reportsLoading ? '...' : stats.totalCommission.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Link to="/admin/hotels" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#37353E' }}>Manage Hotels</Link>
                  <Link to="/admin/vehicles" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#44444E' }}>Manage Vehicles</Link>
                  <Link to="/admin/guides" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#715A5A' }}>Manage Guides</Link>
                  <Link to="/admin/tour-packages" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#2F5D50' }}>Manage Packages</Link>
                  <Link to="/admin/bookings" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#1A4A6B' }}>Manage Bookings</Link>
                  <Link to="/admin/districts" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#5F4B8B' }}>Destinations</Link>
                  {isMainAdmin && <Link to="/admin/users" className="text-center py-3 rounded-xl transition hover:opacity-90 font-medium" style={{ backgroundColor: '#D3DAD9', color: '#1F2A3A' }}>View Users</Link>}
                  <Link to="/admin/feedbacks" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#2C5F8A' }}>Manage Feedbacks</Link>
                  {isMainAdmin && <Link to="/admin/reports" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#6B4E71' }}>Reports & Commission</Link>}
                </div>
              </>
            )}
            <Outlet />
          </div>
          {/* 👇 Footer appears at the bottom of admin pages */}
          <Footer />
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;