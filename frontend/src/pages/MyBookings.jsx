import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, FileText, Download, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import EditCustomItineraryModal from '../components/EditCustomItineraryModal';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Load bookings error:', err);
      toast.error('Failed to load bookings');
    }
  };

  useEffect(() => { loadBookings(); }, []);

  // Helper: Can the customer edit/cancel this booking? (only if >48h and not cancelled)
  const canEditOrCancel = (booking) => {
    if (booking.status === 'cancelled') return false;
    const start = new Date(booking.startDate);
    const now = new Date();
    const diffHours = (start - now) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Update booking (dates, passengers)
  const updateBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}`, editData);
      toast.success('Booking updated – pending admin confirmation');
      setShowModal(false);
      setEditData({});
      setSelected(null);
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  // Cancel booking (customer deletion)
  const deleteBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;
        // If owner, use DELETE (cancels and removes)
        await API.delete(`/bookings/${id}`);
        toast.success('Booking cancelled');
        loadBookings();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Cancellation failed');
      }
    }
  };

  // Invoice & PDF functions (keep as in your original)
  const generateInvoiceHTML = (booking) => {
    // ... (your existing function)
  };
  const downloadPDF = (booking) => {
    // ... (your existing function)
  };
  const openInvoiceModal = (booking) => {
    setSelected(booking);
    setEditData({});
    setShowModal(true);
  };
  const openEditModal = (booking) => {
    setEditData({
      id: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      passengers: booking.passengers,
    });
    setSelected(null);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-center py-10">No bookings. <Link to="/tours" className="text-secondary">Start planning</Link></p>
      ) : (
        <div className="space-y-6 mt-6">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{b.packageName || b.type || 'Custom Tour'}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span><Calendar size={14} /> {b.startDate} – {b.endDate}</span>
                    <span><MapPin size={14} /> {b.destination || (b.destinations ? 'Multiple districts' : 'Sri Lanka')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                  b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                {b.hotelName && <span className="mr-3">🏨 {b.hotelName}</span>}
                {b.vehicleName && <span className="mr-3">🚗 {b.vehicleName}</span>}
                {b.guideName && <span className="mr-3">👨‍🏫 {b.guideName}</span>}
                <span>👥 {b.passengers || 1} passengers</span>
              </div>
              {b.status === 'cancelled' && b.cancellationMessage && (
                <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-md text-sm text-red-800">
                  <strong>Cancellation message:</strong>
                  <p className="mt-1">{b.cancellationMessage}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => openInvoiceModal(b)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <FileText size={16}/> Invoice
                </button>
                {b.status === 'confirmed' && (
                  <button onClick={() => downloadPDF(b)} className="text-green-600 hover:text-green-800 flex items-center gap-1">
                    <Download size={16}/> PDF
                  </button>
                )}
                {/* Show Edit/Cancel only if not cancelled and >48h */}
                {canEditOrCancel(b) && (
                  <>
                    <button onClick={() => openEditModal(b)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1">
                      <Edit2 size={16}/> Edit
                    </button>
                    <button onClick={() => deleteBooking(b.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                      <Trash2 size={16}/> Cancel
                    </button>
                    {/* Modify Itinerary for custom tours */}
                    {(b.type?.includes('Custom') || b.destinations) && (
                      <button
                        onClick={() => { setSelectedBooking(b); setShowItineraryModal(true); }}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Edit2 size={16}/> Modify Itinerary
                      </button>
                    )}
                  </>
                )}
                {!canEditOrCancel(b) && b.status !== 'cancelled' && (
                  <p className="text-xs text-red-500 mt-2">
                    ⚠️ Cannot edit or cancel – less than 48 hours before start date.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal (dates & passengers) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editData.id ? 'Edit Booking' : 'Invoice'}</h2>
            {editData.id ? (
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" value={editData.startDate?.split('T')[0] || ''} onChange={e => setEditData({...editData, startDate: e.target.value})} className="input-field mb-3" />
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" value={editData.endDate?.split('T')[0] || ''} onChange={e => setEditData({...editData, endDate: e.target.value})} className="input-field mb-3" />
                <label className="block text-sm font-medium mb-1">Passengers</label>
                <input type="number" min="1" value={editData.passengers || 1} onChange={e => setEditData({...editData, passengers: e.target.value})} className="input-field mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setEditData({}); }} className="btn-outline flex-1">Cancel</button>
                  <button onClick={() => updateBooking(editData.id)} className="btn-primary flex-1">Save Changes</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Booking ID:</strong> {selected?.id}</p>
                <p><strong>Package:</strong> {selected?.packageName || selected?.type}</p>
                <p><strong>Destination:</strong> {selected?.destination || (selected?.destinations ? 'Multiple' : 'N/A')}</p>
                <p><strong>Dates:</strong> {selected?.startDate} – {selected?.endDate}</p>
                <p><strong>Days:</strong> {selected?.numberOfDays || selected?.days}</p>
                <p><strong>Passengers:</strong> {selected?.passengers || 1}</p>
                <p><strong>Total:</strong> <span className="font-bold text-primary">Rs {selected?.totalAmount?.toLocaleString()}</span></p>
                {selected?.status === 'confirmed' && (
                  <button onClick={() => downloadPDF(selected)} className="btn-primary w-full mt-4">Download Full Invoice (PDF)</button>
                )}
                <button onClick={() => setShowModal(false)} className="btn-outline w-full mt-2">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Itinerary Modification Modal */}
      <EditCustomItineraryModal
        isOpen={showItineraryModal}
        onClose={() => setShowItineraryModal(false)}
        booking={selectedBooking}
        onUpdate={loadBookings}
      />
    </div>
  );
};

export default MyBookings;