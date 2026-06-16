import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, User, MessageSquare } from 'lucide-react';

const CustomerDashboard = () => (
  <div className="min-h-[70vh] bg-gray-100 p-6">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-2">Customer Dashboard</h1>
      <p className="text-gray-600 mb-6">View your profile, bookings, and reviews.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/profile" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
          <User className="text-primary mb-3" />
          <h2 className="font-semibold">My Profile</h2>
          <p className="text-sm text-gray-500">View and update your profile.</p>
        </Link>
        <Link to="/my-bookings" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
          <CalendarCheck className="text-primary mb-3" />
          <h2 className="font-semibold">My Bookings</h2>
          <p className="text-sm text-gray-500">View your bookings only.</p>
        </Link>
        <Link to="/my-reviews" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
          <MessageSquare className="text-primary mb-3" />
          <h2 className="font-semibold">My Reviews</h2>
          <p className="text-sm text-gray-500">Manage your feedback.</p>
        </Link>
      </div>
    </div>
  </div>
);

export default CustomerDashboard;
