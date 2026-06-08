import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Hotel, Car, Users, CalendarCheck, LogOut,
  Menu, X, User, BarChart3, TrendingUp, UserPlus, MessageSquare, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, totalCommission: 0 });
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadStats = () => {
      const stored = localStorage.getItem('bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
        const revenue = confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        setStats({
          totalBookings: bookings.length,
          totalRevenue: revenue,
          totalCommission: Math.round(revenue * 0.22)
        });
      }
    };
    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hotels', name: 'Manage Hotels', icon: Hotel },
    { path: '/admin/vehicles', name: 'Manage Vehicles', icon: Car },
    { path: '/admin/guides', name: 'Manage Guides', icon: Users },
    { path: '/admin/users', name: 'Registered Users', icon: UserPlus },
    { path: '/admin/bookings', name: 'Manage Bookings', icon: CalendarCheck },
    { path: '/admin/reports', name: 'Reports & Analytics', icon: BarChart3 },
    { path: '/admin/company-commission', name: 'Company Commission', icon: TrendingUp },
    { path: '/admin/feedbacks', name: 'Manage Feedbacks', icon: MessageSquare },
    { path: '/admin/tour-packages', name: 'Manage Tour Packages', icon: Package },

  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white transition-all duration-300 fixed h-full z-20 shadow-xl`}>
        <div className="p-4 flex justify-between items-center border-b border-white/20">
          <div className={`${!isSidebarOpen && 'hidden'}`}>
            <h1 className="font-playfair text-xl font-bold">SerendiGo</h1>
            <p className="text-xs text-cta">Admin Panel</p>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/20 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-white/20 transition ${isActive(item.path) ? 'bg-white/20 border-l-4 border-cta' : ''}`}>
              <item.icon size={20} />
              <span className={`${!isSidebarOpen && 'hidden'} text-sm`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* "Customer Pages" section removed */}

        <div className="absolute bottom-0 w-full p-4 border-t border-white/20">
          <div className={`flex items-center gap-3 px-2 py-2 mb-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="bg-cta/20 rounded-full p-2"><User size={18} className="text-cta" /></div>
            <div className={`${!isSidebarOpen && 'hidden'}`}>
              <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-cta">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/20 ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={18} /><span className={`${!isSidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4">
          <h1 className="text-xl font-semibold text-primary">{menuItems.find(i => isActive(i.path))?.name || 'Dashboard'}</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}!</p>
        </div>
        <div className="p-6">
          {location.pathname === '/admin' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalBookings}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-secondary">
                  <p className="text-gray-500 text-sm">Total Revenue (Rs)</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cta">
                  <p className="text-gray-500 text-sm">Company Commission (Rs)</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalCommission.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Link to="/admin/hotels" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#37353E' }}>Manage Hotels</Link>
                <Link to="/admin/vehicles" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#44444E' }}>Manage Vehicles</Link>
                <Link to="/admin/guides" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#715A5A' }}>Manage Guides</Link>
                <Link to="/admin/users" className="text-center py-3 rounded-xl transition hover:opacity-90 font-medium" style={{ backgroundColor: '#D3DAD9', color: '#1F2A3A' }}>View Users</Link>
                <Link to="/admin/feedbacks" className="text-white text-center py-3 rounded-xl transition hover:opacity-90" style={{ backgroundColor: '#2C5F8A' }}>Manage Feedbacks</Link>
              </div>
            </>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;