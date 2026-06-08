import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, FileText, Download, Edit2, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});

  const loadBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}`, editData);
      toast.success('Booking updated');
      setShowModal(false);
      setEditData({});
      setSelected(null);
      loadBookings();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Cancel this booking?')) {
      try {
        await API.delete(`/bookings/${id}`);
        toast.success('Booking cancelled');
        loadBookings();
      } catch (err) {
        toast.error('Cancellation failed');
      }
    }
  };

  const generateInvoiceHTML = (booking) => {
    const formatPrice = (price) => `Rs ${(price || 0).toLocaleString()}`;
    let placesList = '';
    if (booking.places && booking.places.length) {
      placesList = `<ul>${booking.places.map(p => `<li>${p}</li>`).join('')}</ul>`;
    } else if (booking.destinations) {
      placesList = booking.destinations.map(d => 
        `<li><strong>${d.district}:</strong> ${d.places.join(', ')}</li>`
      ).join('');
      placesList = `<ul>${placesList}</ul>`;
    } else {
      placesList = '<p>Not specified</p>';
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #093C5D; padding-bottom: 20px; margin-bottom: 20px; }
          .company { font-size: 28px; font-weight: bold; color: #093C5D; }
          .invoice-title { font-size: 24px; margin: 20px 0; text-align: center; }
          .details { margin: 20px 0; }
          .details table { width: 100%; border-collapse: collapse; }
          .details td { padding: 8px; vertical-align: top; }
          .section { margin: 25px 0; }
          .section-title { font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 8px; margin-bottom: 10px; }
          .item-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total { font-size: 20px; font-weight: bold; text-align: right; border-top: 2px solid #093C5D; padding-top: 10px; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">SerendiGo Travels</div>
          <div>Experience Sri Lanka Beautifully</div>
        </div>
        <div class="invoice-title">TAX INVOICE</div>
        <div class="details">
          <table>
            <tr><td width="120"><strong>Invoice No:</strong></td><td>INV-${booking.id}-${Date.now()}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
            <tr><td><strong>Customer:</strong></td><td>${booking.customerName || user?.name || 'Guest'}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${booking.customerEmail || user?.email || 'N/A'}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${booking.customerPhone || user?.phone || 'N/A'}</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">📅 Travel Details</div>
          <div class="item-row"><span>Destination(s):</span><span>${booking.destination || (booking.destinations ? 'Multiple districts' : 'N/A')}</span></div>
          <div class="item-row"><span>Places to visit:</span></div>
          <div>${placesList}</div>
          <div class="item-row"><span>Start Date:</span><span>${booking.startDate}</span></div>
          <div class="item-row"><span>End Date:</span><span>${booking.endDate}</span></div>
          <div class="item-row"><span>Number of Days:</span><span>${booking.numberOfDays || booking.days || 1}</span></div>
          <div class="item-row"><span>Number of Passengers:</span><span>${booking.passengers || 1}</span></div>
        </div>
        <div class="section">
          <div class="section-title">🏨 Accommodation</div>
          ${booking.hotelName ? `
            <div class="item-row"><span>Hotel:</span><span>${booking.hotelName}</span></div>
            <div class="item-row"><span>Price per night:</span><span>${formatPrice(booking.hotelPricePerNight)}</span></div>
            <div class="item-row"><span>Total Hotel Cost:</span><span>${formatPrice(booking.hotelTotal)}</span></div>
          ` : '<p>No hotel selected</p>'}
        </div>
        <div class="section">
          <div class="section-title">🚗 Vehicle</div>
          ${booking.vehicleName ? `
            <div class="item-row"><span>Vehicle:</span><span>${booking.vehicleName}</span></div>
            <div class="item-row"><span>Price per day:</span><span>${formatPrice(booking.vehiclePricePerDay)}</span></div>
            <div class="item-row"><span>Total Vehicle Cost:</span><span>${formatPrice(booking.vehicleTotal)}</span></div>
          ` : '<p>No vehicle selected</p>'}
        </div>
        <div class="section">
          <div class="section-title">👨‍🏫 Tour Guide</div>
          ${booking.guideName ? `
            <div class="item-row"><span>Guide:</span><span>${booking.guideName}</span></div>
            <div class="item-row"><span>Price per day:</span><span>${formatPrice(booking.guidePricePerDay)}</span></div>
            <div class="item-row"><span>Total Guide Cost:</span><span>${formatPrice(booking.guideTotal)}</span></div>
          ` : '<p>No guide selected</p>'}
        </div>
        <div class="total">Grand Total: ${formatPrice(booking.totalAmount)}</div>
        <div class="footer"><p>Thank you for choosing SerendiGo!<br/>For support: +94 11 234 5678 | support@serendigo.com</p></div>
      </body>
      </html>
    `;
  };

  const downloadPDF = (booking) => {
    const html = generateInvoiceHTML(booking);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${booking.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  const payNow = (booking) => {
    localStorage.setItem('pendingBooking', JSON.stringify(booking));
    window.location.href = '/payment';
  };

  const openInvoiceModal = (booking) => {
    setSelected(booking);
    setEditData({});
    setShowModal(true);
  };

  const openEditModal = (booking) => {
    setEditData(booking);
    setSelected(null);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-center py-10">No bookings. <Link to="/tours" className="text-secondary">Start planning</Link></p>
      ) : (
        <div className="space-y-6 mt-6">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{b.type || b.packageName || 'Custom Tour'}</h3>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span><Calendar size={14} /> {b.startDate} – {b.endDate}</span>
                    <span><MapPin size={14} /> {b.destination || (b.destinations ? 'Multiple districts' : 'Sri Lanka')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {b.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                {b.hotelName && <span className="mr-3">🏨 {b.hotelName}</span>}
                {b.vehicleName && <span className="mr-3">🚗 {b.vehicleName}</span>}
                {b.guideName && <span className="mr-3">👨‍🏫 {b.guideName}</span>}
                <span>👥 {b.passengers || 1} passengers</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => openInvoiceModal(b)} className="text-blue-600 flex items-center gap-1"><FileText size={16}/> Invoice</button>
                {b.status === 'confirmed' && (
                  <button onClick={() => downloadPDF(b)} className="text-green-600 flex items-center gap-1"><Download size={16}/> PDF</button>
                )}
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => openEditModal(b)} className="text-yellow-600 flex items-center gap-1"><Edit2 size={16}/> Edit</button>
                    <button onClick={() => payNow(b)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><CreditCard size={14}/> Pay Now</button>
                  </>
                )}
                <button onClick={() => deleteBooking(b.id)} className="text-red-600 flex items-center gap-1"><Trash2 size={16}/> Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editData.id ? 'Edit Booking' : 'Invoice'}</h2>
            {editData.id ? (
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} className="input-field mb-3"/>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" value={editData.endDate} onChange={e => setEditData({...editData, endDate: e.target.value})} className="input-field mb-3"/>
                <label className="block text-sm font-medium mb-1">Passengers</label>
                <input type="number" min="1" value={editData.passengers} onChange={e => setEditData({...editData, passengers: e.target.value})} className="input-field mb-4"/>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setEditData({}); }} className="btn-outline flex-1">Cancel</button>
                  <button onClick={() => updateBooking(editData.id)} className="btn-primary flex-1">Save Changes</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Booking ID:</strong> {selected?.id}</p>
                <p><strong>Destination:</strong> {selected?.destination || (selected?.destinations ? 'Multiple' : 'N/A')}</p>
                <p><strong>Places:</strong> {selected?.places ? selected.places.join(', ') : (selected?.destinations ? 'See invoice' : 'N/A')}</p>
                <p><strong>Dates:</strong> {selected?.startDate} – {selected?.endDate}</p>
                <p><strong>Days:</strong> {selected?.numberOfDays || selected?.days}</p>
                <p><strong>Passengers:</strong> {selected?.passengers || 1}</p>
                {selected?.hotelName && <p><strong>Hotel:</strong> {selected.hotelName}</p>}
                {selected?.vehicleName && <p><strong>Vehicle:</strong> {selected.vehicleName}</p>}
                {selected?.guideName && <p><strong>Guide:</strong> {selected.guideName}</p>}
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
    </div>
  );
};

export default MyBookings;