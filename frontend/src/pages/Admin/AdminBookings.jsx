import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Send, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookings as initialBookings, getDashboardStats } from '../../data/tourismData';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, totalUsers: 0, availableVehicles: 0 });

  // Load bookings from localStorage or use initial data
  useEffect(() => {
    loadBookings();
    loadStats();
  }, []);

  const loadBookings = () => {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      setBookings(initialBookings);
      localStorage.setItem('bookings', JSON.stringify(initialBookings));
    }
  };

  const loadStats = () => {
    const currentStats = getDashboardStats();
    setStats(currentStats);
  };

  const saveBookings = (updatedBookings) => {
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    loadStats();
  };

  // Simulate sending SMS
  const sendSMS = (phoneNumber, message, type = 'info') => {
    console.log(`📱 Sending SMS to ${phoneNumber}: ${message}`);
    if (type === 'success') {
      toast.success(`✓ SMS sent to ${phoneNumber}`);
    } else if (type === 'error') {
      toast.error(`✗ Failed to send SMS to ${phoneNumber}`);
    } else {
      toast.success(`SMS sent to ${phoneNumber}`);
    }
    return true;
  };

  const handleConfirmBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed', paymentStatus: 'paid' } : b
      );
      saveBookings(updatedBookings);
      
      const message = `🎉 Dear ${booking.customerName}, your booking for ${booking.packageName} has been CONFIRMED! Travel dates: ${booking.startDate} to ${booking.endDate}. Total: Rs ${booking.totalAmount.toLocaleString()}. Thank you for choosing SerendiGo! ✨`;
      sendSMS(booking.customerPhone, message, 'success');
      toast.success(`✅ Booking #${bookingId} confirmed!`);
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const updatedBookings = bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'unpaid' } : b
        );
        saveBookings(updatedBookings);
        
        const message = `⚠️ Dear ${booking.customerName}, your booking for ${booking.packageName} has been CANCELLED. For any inquiries, please contact our support team at +94 11 234 5678. - SerendiGo`;
        sendSMS(booking.customerPhone, message, 'error');
        toast.error(`❌ Booking #${bookingId} cancelled`);
      }
    }
  };

  const handleSendReminder = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const message = `🌟 REMINDER: Dear ${booking.customerName}, your ${booking.packageName} tour starts on ${booking.startDate}. Please be ready for an amazing experience with SerendiGo! Contact us at +94 11 234 5678 for assistance.`;
      sendSMS(booking.customerPhone, message, 'info');
    }
  };

  const handleSendPaymentReminder = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const message = `💰 PAYMENT REMINDER: Dear ${booking.customerName}, please complete your payment of Rs ${booking.totalAmount.toLocaleString()} for ${booking.packageName} to confirm your booking. - SerendiGo`;
      sendSMS(booking.customerPhone, message, 'info');
    }
  };

  const getStatusBadge = (status) => {
    const styles = { 
      pending: 'bg-yellow-100 text-yellow-800', 
      confirmed: 'bg-green-100 text-green-800', 
      cancelled: 'bg-red-100 text-red-800', 
      completed: 'bg-blue-100 text-blue-800' 
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>{status}</span>;
  };

  const getPaymentBadge = (status) => {
    const styles = { 
      unpaid: 'bg-red-100 text-red-800', 
      paid: 'bg-green-100 text-green-800', 
      partial: 'bg-orange-100 text-orange-800' 
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.unpaid}`}>{status}</span>;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.customerPhone?.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Total Bookings: {stats.totalBookings} | Revenue: ${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, package, or phone..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="input-field pl-10" 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="input-field w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{booking.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{booking.packageName}</td>
                  <td className="px-4 py-3 text-sm">{booking.startDate} to {booking.endDate}</td>
                  <td className="px-4 py-3 text-sm font-medium">Rs {booking.totalAmount?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                  <td className="px-4 py-3">{getPaymentBadge(booking.paymentStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedBooking(booking); setShowDetailsModal(true); }} className="text-blue-600 hover:text-blue-800" title="View Details"><Eye size={18} /></button>
                      {booking.status === 'pending' && <button onClick={() => handleConfirmBooking(booking.id)} className="text-green-600 hover:text-green-800" title="Confirm Booking"><CheckCircle size={18} /></button>}
                      {booking.status === 'pending' && <button onClick={() => handleCancelBooking(booking.id)} className="text-red-600 hover:text-red-800" title="Cancel Booking"><XCircle size={18} /></button>}
                      <button onClick={() => handleSendReminder(booking.id)} className="text-cta hover:text-secondary" title="Send Reminder SMS"><Send size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found matching your search.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-primary">Booking Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700"><XCircle size={24} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <p className="font-semibold">Booking ID:</p><p>#{selectedBooking.id}</p>
                <p className="font-semibold">Customer Name:</p><p>{selectedBooking.customerName}</p>
                <p className="font-semibold">Email:</p><p>{selectedBooking.customerEmail}</p>
                <p className="font-semibold">Phone:</p><p className="flex items-center gap-1">{selectedBooking.customerPhone} <button onClick={() => handleSendReminder(selectedBooking.id)} className="text-cta"><Send size={14} /></button></p>
                <p className="font-semibold">Package:</p><p>{selectedBooking.packageName}</p>
                <p className="font-semibold">Travel Dates:</p><p>{selectedBooking.startDate} - {selectedBooking.endDate}</p>
                <p className="font-semibold">Total Amount:</p><p className="font-bold text-primary">Rs {selectedBooking.totalAmount?.toLocaleString() || 0}</p>
                <p className="font-semibold">Booking Date:</p><p>{selectedBooking.bookingDate}</p>
                <p className="font-semibold">Status:</p><p>{getStatusBadge(selectedBooking.status)}</p>
                <p className="font-semibold">Payment:</p><p>{getPaymentBadge(selectedBooking.paymentStatus)}</p>
              </div>
              <div className="border-t pt-4 mt-2 flex gap-3">
                {selectedBooking.status === 'pending' && <button onClick={() => { handleConfirmBooking(selectedBooking.id); setShowDetailsModal(false); }} className="btn-primary flex-1 flex items-center justify-center gap-2"><CheckCircle size={16} /> Confirm Booking</button>}
                <button onClick={() => handleSendPaymentReminder(selectedBooking.id)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><Send size={16} /> Payment Reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;