import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Users, MessageSquare } from 'lucide-react';

const StaffDashboard = () => {
  return (
    <div className="min-h-[70vh] bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">Staff Dashboard</h1>
        <p className="text-gray-600 mb-6">View customers and manage booking/support operations.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link to="/customers" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
            <Users className="text-primary mb-3" />
            <h2 className="font-semibold">Customers</h2>
            <p className="text-sm text-gray-500">View customer records.</p>
          </Link>
          <Link to="/staff/bookings" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
            <CalendarCheck className="text-primary mb-3" />
            <h2 className="font-semibold">Bookings</h2>
            <p className="text-sm text-gray-500">Manage bookings and orders.</p>
          </Link>
          <Link to="/staff/support" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
            <MessageSquare className="text-primary mb-3" />
            <h2 className="font-semibold">Support</h2>
            <p className="text-sm text-gray-500">Handle customer feedback and support.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
