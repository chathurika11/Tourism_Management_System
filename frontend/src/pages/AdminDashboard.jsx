import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hotel, 
  Car, 
  Users, 
  CalendarCheck, 
  LogOut,
  Menu,
  X,
  Bell,
  User,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only Admin menu items - NO tourist links
  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hotels', name: 'Manage Hotels', icon: Hotel },
    { path: '/admin/vehicles', name: 'Manage Vehicles', icon: Car },
    { path: '/admin/guides', name: 'Manage Guides', icon: Users },
    { path: '/admin/bookings', name: 'Manage Bookings', icon: CalendarCheck },
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

  const stats = {
    totalBookings: 245,
    totalRevenue: 12450,
    totalUsers: 189,
    availableVehicles: 12
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white transition-all duration-300 fixed h-full z-20 shadow-xl`}>
        <div className="p-4 flex justify-between items-center border-b border-white/20">
          <div className={`${!isSidebarOpen && 'hidden'} transition-all`}>
            <h1 className="font-playfair text-xl font-bold">SerendiGo</h1>
            <p className="text-xs text-cta">Admin Panel</p>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-white/20 transition-all duration-200 ${isActive(item.path) ? 'bg-white/20 border-l-4 border-cta' : ''}`}
            >
              <item.icon size={20} />
              <span className={`${!isSidebarOpen && 'hidden'} transition-all text-sm`}>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-white/20">
          <div className={`flex items-center gap-3 px-2 py-2 mb-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="bg-cta/20 rounded-full p-2">
              <User size={18} className="text-cta" />
            </div>
            <div className={`${!isSidebarOpen && 'hidden'} transition-all`}>
              <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-cta">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={18} />
            <span className={`${!isSidebarOpen && 'hidden'} transition-all text-sm`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-primary">
                {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}!</p>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {location.pathname === '/admin' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-primary">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-primary/10 p-3 rounded-full"><CalendarCheck className="text-primary" size={24} /></div>
                    <span className="text-2xl font-bold text-primary">{stats.totalBookings}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">Total Bookings</h3>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-secondary">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-secondary/10 p-3 rounded-full"><DollarSign className="text-secondary" size={24} /></div>
                    <span className="text-2xl font-bold text-primary">${stats.totalRevenue}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-100 p-3 rounded-full"><Users className="text-blue-600" size={24} /></div>
                    <span className="text-2xl font-bold text-primary">{stats.totalUsers}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-orange-100 p-3 rounded-full"><Car className="text-orange-600" size={24} /></div>
                    <span className="text-2xl font-bold text-primary">{stats.availableVehicles}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium">Available Vehicles</h3>
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800">Pending Actions</h4>
                    <p className="text-yellow-700 text-sm">• 3 guide verifications pending • 2 vehicles due for maintenance • 5 new booking requests</p>
                  </div>
                  <Link to="/admin/guides" className="bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-yellow-700 transition">Review Now</Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/hotels" className="bg-primary text-white text-center py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2"><Hotel size={18} /> Manage Hotels</Link>
                <Link to="/admin/vehicles" className="bg-secondary text-white text-center py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2"><Car size={18} /> Manage Vehicles</Link>
                <Link to="/admin/guides" className="bg-dark text-white text-center py-3 rounded-xl hover:bg-opacity-90 transition flex items-center justify-center gap-2"><Users size={18} /> Manage Guides</Link>
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