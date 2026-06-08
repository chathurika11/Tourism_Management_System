import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, XCircle, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['bookings-admin', page],
    queryFn: () => API.get(`/bookings?page=${page}&limit=10`).then(res => res.data),
    keepPreviousData: true,
  });
  const bookings = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const confirmMutation = useMutation({
    mutationFn: ({ id }) => API.put(`/bookings/${id}`, { status: 'confirmed', confirmedAt: new Date().toISOString() }),
    onSuccess: () => { queryClient.invalidateQueries(['bookings-admin']); toast.success('Booking confirmed'); },
    onError: () => toast.error('Confirmation failed'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => API.put(`/bookings/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['bookings-admin']); toast.success('Booking updated'); setIsEditing(false); setShowModal(false); },
    onError: () => toast.error('Update failed'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/bookings/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['bookings-admin']); toast.success('Booking deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  const viewDetails = (booking) => { setSelectedBooking(booking); setEditData(booking); setIsEditing(false); setShowModal(true); };
  const startEdit = () => setIsEditing(true);
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const saveEdit = () => updateMutation.mutate({ id: editData.id, data: { startDate: editData.startDate, endDate: editData.endDate, passengers: editData.passengers } });
  const confirmBooking = (booking) => confirmMutation.mutate({ id: booking.id });
  const deleteBooking = (id) => { if (window.confirm('Delete this booking?')) deleteMutation.mutate(id); };

  if (isLoading) return <div className="text-center py-20">Loading bookings...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Bookings</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left">ID</th><th className="px-6 py-3 text-left">Customer</th><th className="px-6 py-3 text-left">Type</th><th className="px-6 py-3 text-left">Dates</th><th className="px-6 py-3 text-left">Total (Rs)</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{booking.id}</td>
                <td>{booking.user?.name || booking.customerName || 'Guest'}</td>
                <td>{booking.type || 'Custom'}</td>
                <td>{booking.startDate} – {booking.endDate}</td>
                <td>Rs {booking.totalAmount?.toLocaleString()}</td>
                <td><span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{booking.status}</span></td>
                <td className="space-x-2">
                  <button onClick={() => viewDetails(booking)} className="text-blue-600"><Eye size={18} /></button>
                  {booking.status === 'pending' && <button onClick={() => confirmBooking(booking)} className="text-green-600"><CheckCircle size={18} /></button>}
                  <button onClick={() => deleteBooking(booking.id)} className="text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-outline">Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn-outline">Next</button>
      </div>

      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Booking Details</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            {!isEditing ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedBooking.id}</p>
                <p><strong>Customer:</strong> {selectedBooking.user?.name || selectedBooking.customerName}</p>
                <p><strong>Email:</strong> {selectedBooking.user?.email || selectedBooking.customerEmail}</p>
                <p><strong>Dates:</strong> {selectedBooking.startDate} – {selectedBooking.endDate}</p>
                <p><strong>Passengers:</strong> {selectedBooking.passengers}</p>
                <p><strong>Total:</strong> Rs {selectedBooking.totalAmount?.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedBooking.status}</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={startEdit} className="btn-secondary"><Edit2 size={16} /> Edit</button>
                  <button onClick={() => setShowModal(false)} className="btn-outline">Close</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div><label className="block text-sm">Start Date</label><input type="date" name="startDate" value={editData.startDate || ''} onChange={handleEditChange} className="input-field" /></div>
                <div><label className="block text-sm">End Date</label><input type="date" name="endDate" value={editData.endDate || ''} onChange={handleEditChange} className="input-field" /></div>
                <div><label className="block text-sm">Passengers</label><input type="number" name="passengers" value={editData.passengers || 1} onChange={handleEditChange} className="input-field" /></div>
                <div className="flex gap-3 mt-4">
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