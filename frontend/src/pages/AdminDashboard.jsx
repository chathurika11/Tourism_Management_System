import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, Car, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const stats = {
        totalBookings: 245,
        totalRevenue: 12450,
        totalUsers: 189,
        availableVehicles: 12
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">SerendiGo Admin Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome back! Manage your tourism business here.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Calendar className="text-primary" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-primary">{stats.totalBookings}</span>
                    </div>
                    <h3 className="text-gray-600">Total Bookings</h3>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-secondary/10 p-3 rounded-full">
                            <DollarSign className="text-secondary" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-primary">${stats.totalRevenue}</span>
                    </div>
                    <h3 className="text-gray-600">Total Revenue</h3>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-primary">{stats.totalUsers}</span>
                    </div>
                    <h3 className="text-gray-600">Total Users</h3>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                            <Car className="text-orange-600" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-primary">{stats.availableVehicles}</span>
                    </div>
                    <h3 className="text-gray-600">Available Vehicles</h3>
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-yellow-600" size={24} />
                    <div>
                        <h4 className="font-semibold text-yellow-800">Pending Actions</h4>
                        <p className="text-yellow-700 text-sm">3 guide verifications pending • 2 vehicles due for maintenance</p>
                    </div>
                    <Link to="/admin/guides" className="ml-auto btn-outline text-sm py-1">
                        Review Now
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/tours" className="bg-primary text-white text-center py-3 rounded-lg hover:bg-opacity-90 transition">
                    Manage Tour Packages
                </Link>
                <Link to="/admin/vehicles" className="bg-secondary text-dark text-center py-3 rounded-lg hover:bg-opacity-90 transition">
                    Manage Vehicle Fleet
                </Link>
                <Link to="/admin/guides" className="bg-dark text-white text-center py-3 rounded-lg hover:bg-opacity-90 transition">
                    Manage Tour Guides
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;