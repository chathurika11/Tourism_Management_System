import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, Edit2, Trash2, Save, X, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'read', 'unread'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Fetch bookings (no relation)
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['bookings-admin', page, limit],
    queryFn: () => API.get(`/bookings?page=${page}&limit=${limit}`).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  const bookings = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Client‑side filters (read/unread, search)
  const filteredBookings = bookings.filter(b => {
    // Read filter
    if (filterRead === 'read' && !b.isRead) return false;
    if (filterRead === 'unread' && b.isRead) return false;
    // Search filter
    const customerName = b.user?.name || b.customerName || '';
    const email = b.user?.email || '';
    const type = b.type || '';
    const id = b.id || '';
    const term = searchTerm.toLowerCase();
    return customerName.toLowerCase().includes(term) ||
           email.toLowerCase().includes(term) ||
           type.toLowerCase().includes(term) ||
           id.toLowerCase().includes(term);
  });

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: ({ id }) => API.put(`/bookings/${id}/confirm`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings-admin']);
      toast.success('Booking confirmed');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Confirmation failed'),
  });

  const markReadMutation = useMutation({
    mutationFn: ({ id, isRead }) => API.put(`/bookings/${id}/mark-read`, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings-admin']);
      toast.success('Status updated');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => API.put(`/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings-admin']);
      toast.success('Booking updated');
      setIsEditing(false);
      setShowModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const deleteBookingPermanent = async (id) => {
    if (!window.confirm('Permanently delete this booking? This cannot be undone.')) return;
    try {
      await API.delete(`/bookings/${id}`);
      queryClient.invalidateQueries(['bookings-admin']);
      toast.success('Booking permanently deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const cancelBookingWithReason = async (id) => {
    const reason = window.prompt('Enter cancellation reason (optional):', 'Cancelled by admin');
    if (reason === null) return;
    try {
      await API.put(`/bookings/${id}/cancel`, { reason });
      queryClient.invalidateQueries(['bookings-admin']);
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancellation failed');
    }
  };

  // Handlers
  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setEditData(booking);
    setIsEditing(false);
    setShowModal(true);
  };

  const startEdit = () => setIsEditing(true);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = () => {
    updateMutation.mutate({
      id: editData.id,
      data: {
        startDate: editData.startDate,
        endDate: editData.endDate,
        passengers: editData.passengers,
      },
    });
  };

  const confirmBooking = (booking) => confirmMutation.mutate({ id: booking.id });

  const markAsRead = (booking) => {
    markReadMutation.mutate({ id: booking.id, isRead: !booking.isRead });
  };

  if (isLoading && page === 1) {
    return <div className="text-center py-20">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error loading bookings: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary">Manage Bookings</h1>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer, email, type or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-48 md:w-64"
            />
          </div>
          {/* Read/Unread Filter */}
          <div className="relative">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="input-field pl-10 w-40"
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (Rs)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || filterRead !== 'all' ? 'No bookings match your filters.' : 'No bookings found.'}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">{booking.id.slice(-6)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{booking.user?.name || booking.customerName || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{booking.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{booking.type || 'Custom'}</td>
                  <td className="px-4 py-3 text-sm">{booking.startDate} – {booking.endDate}</td>
                  <td className="px-4 py-3 text-sm font-medium">Rs {booking.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.cancellationMessage && (
                      <div className="text-xs text-red-500 mt-1 max-w-xs truncate" title={booking.cancellationMessage}>
                        ⚠️ {booking.cancellationMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.isRead ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.isRead ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => viewDetails(booking)} className="text-blue-600 hover:text-blue-800" title="View Details">
                      <Eye size={18} />
                    </button>
                    {booking.status === 'pending' && (
                      <button onClick={() => confirmBooking(booking)} className="text-green-600 hover:text-green-800" title="Confirm Booking">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => markAsRead(booking)} className="text-indigo-600 hover:text-indigo-800" title={booking.isRead ? 'Mark unread' : 'Mark read'}>
                      {booking.isRead ? 'U' : 'R'}
                    </button>
                    {/* Cancel (soft) only if not already cancelled */}
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => cancelBookingWithReason(booking.id)} className="text-orange-600 hover:text-orange-800" title="Cancel with reason">
                        <Trash2 size={18} className="opacity-70" />
                      </button>
                    )}
                    {/* Permanent Delete (always available for admin) */}
                    <button onClick={() => deleteBookingPermanent(booking.id)} className="text-red-600 hover:text-red-800" title="Permanently delete">
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="btn-outline px-4 py-2 flex items-center gap-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages} (Total: {total} bookings)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isFetching}
            className="btn-outline px-4 py-2 flex items-center gap-2 disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Details / Edit Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Booking Details</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            {!isEditing ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedBooking.id}</p>
                <p><strong>Customer:</strong> {selectedBooking.user?.name || selectedBooking.customerName}</p>
                <p><strong>Email:</strong> {selectedBooking.user?.email}</p>
                <p><strong>Phone:</strong> {selectedBooking.user?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedBooking.user?.address || 'N/A'}</p>
                <p><strong>Country:</strong> {selectedBooking.user?.country || 'N/A'}</p>
                <p><strong>Dates:</strong> {selectedBooking.startDate} – {selectedBooking.endDate}</p>
                <p><strong>Passengers:</strong> {selectedBooking.passengers}</p>
                <p><strong>Total:</strong> Rs {selectedBooking.totalAmount?.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedBooking.status}</p>
                <p><strong>Payment Status:</strong> {selectedBooking.paymentStatus || 'unpaid'}</p>
                {selectedBooking.cardLastFour && (
                  <p><strong>Payment:</strong> {selectedBooking.cardType || 'Card'} •••• {selectedBooking.cardLastFour}</p>
                )}
                {selectedBooking.cancellationMessage && (
                  <p><strong>Cancellation Reason:</strong> {selectedBooking.cancellationMessage}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={startEdit} className="btn-secondary"><Edit2 size={16} /> Edit</button>
                  <button onClick={() => setShowModal(false)} className="btn-outline">Close</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={editData.startDate?.split('T')[0] || ''}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={editData.endDate?.split('T')[0] || ''}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label>Passengers</label>
                  <input
                    type="number"
                    name="passengers"
                    value={editData.passengers || 1}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={saveEdit} className="btn-primary"><Save size={16} /> Save</button>
                  <button onClick={() => setIsEditing(false)} className="btn-outline">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;