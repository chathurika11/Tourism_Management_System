import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Send, Calendar, MapPin, Car, Users, Hotel } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { vehicles, hotels, tourGuides } from '../../data/tourismData';

const AdminBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load bookings from localStorage
  const loadBookings = useCallback(() => {
    const stored = localStorage.getItem('bookings');
    if (stored) {
      setBookings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    loadBookings();
    const handleStorageChange = () => loadBookings();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadBookings]);

  // Helper to get resource by ID
  const getVehicleById = (id) => vehicles.find(v => v.id === parseInt(id));
  const getHotelById = (id) => hotels.find(h => h.id === parseInt(id));
  const getGuideById = (id) => tourGuides.find(g => g.id === parseInt(id));

  // Check if a resource (vehicle, hotel, guide) is available for given date range
  const isResourceAvailable = (resourceType, resourceId, startDate, endDate, excludeBookingId = null) => {
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const booking of allBookings) {
      // Skip the current booking if we're editing
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (booking.status !== 'confirmed') continue;

      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check date overlap
      if (start <= bookingEnd && end >= bookingStart) {
        // Check if the resource is used in this booking
        if (resourceType === 'vehicle' && booking.vehicleId === resourceId) return false;
        if (resourceType === 'guide' && booking.guideId === resourceId) return false;
        if (resourceType === 'hotel' && booking.hotelId === resourceId) return false;
        // For multi-destination custom tours
        if (booking.destinations) {
          for (const dest of booking.destinations) {
            if (resourceType === 'vehicle' && dest.vehicle?.id === resourceId) return false;
            if (resourceType === 'guide' && dest.guide?.id === resourceId) return false;
            if (resourceType === 'hotel' && dest.hotel?.id === resourceId) return false;
          }
        }
      }
    }
    return true;
  };

  // Mark resources as booked for the given dates
  const markResourcesBooked = (booking) => {
    // This is just a placeholder – actual availability is checked on the fly using `isResourceAvailable`.
    // The confirmation itself updates the booking status to 'confirmed', and future checks will see that.
    // No separate "bookedDates" store needed because we query all confirmed bookings.
    console.log('Resources marked as booked for booking', booking.id);
  };

  // Send SMS simulation
  const sendSMS = (booking) => {
    let placesMsg = '';
    let guideMsg = '';
    let vehicleMsg = '';
    let hotelMsg = '';

    if (booking.destinations && booking.destinations.length) {
      // Custom multi-destination booking
      placesMsg = booking.destinations.map(d => `${d.district}: ${d.places.join(', ')}`).join(' | ');
      guideMsg = booking.destinations.filter(d => d.guide).map(d => `${d.guide.name} (${d.district})`).join(', ');
      vehicleMsg = booking.destinations.filter(d => d.vehicle).map(d => `${d.vehicle.model} (${d.district})`).join(', ');
      hotelMsg = booking.destinations.filter(d => d.hotel).map(d => `${d.hotel.name} (${d.district})`).join(', ');
    } else {
      // Single package booking
      placesMsg = booking.places?.join(', ') || booking.packageName || 'N/A';
      guideMsg = booking.guideName || 'None';
      vehicleMsg = booking.vehicleName || 'None';
      hotelMsg = booking.hotelName || 'None';
    }

    const message = `✅ CONFIRMATION: ${booking.customerName}, your booking is confirmed!\n\n` +
      `📍 Destinations/Places: ${placesMsg}\n` +
      `👨‍🏫 Guides: ${guideMsg}\n` +
      `🚗 Vehicles: ${vehicleMsg}\n` +
      `🏨 Hotels: ${hotelMsg}\n` +
      `📅 Dates: ${booking.startDate} to ${booking.endDate}\n` +
      `👥 Passengers: ${booking.passengers}\n` +
      `💰 Total: Rs ${booking.totalAmount?.toLocaleString()}\n\n` +
      `Thank you for choosing SerendiGo!`;

    console.log('📱 SMS sent to', booking.customerPhone, ':', message);
    toast.success(`Confirmation sent to ${booking.customerPhone || 'customer'} via SMS`);
  };

  // Confirm booking
  const confirmBooking = async (booking) => {
    setLoading(true);
    try {
      // Check availability for all resources in the booking
      let unavailableResources = [];

      if (booking.destinations && booking.destinations.length) {
        // Custom booking: check each destination's resources
        for (const dest of booking.destinations) {
          if (dest.vehicle && !isResourceAvailable('vehicle', dest.vehicle.id, booking.startDate, booking.endDate, booking.id)) {
            unavailableResources.push(`Vehicle ${dest.vehicle.model} in ${dest.district}`);
          }
          if (dest.guide && !isResourceAvailable('guide', dest.guide.id, booking.startDate, booking.endDate, booking.id)) {
            unavailableResources.push(`Guide ${dest.guide.name} in ${dest.district}`);
          }
          if (dest.hotel && !isResourceAvailable('hotel', dest.hotel.id, booking.startDate, booking.endDate, booking.id)) {
            unavailableResources.push(`Hotel ${dest.hotel.name} in ${dest.district}`);
          }
        }
      } else {
        // Single package booking
        if (booking.vehicleId && !isResourceAvailable('vehicle', booking.vehicleId, booking.startDate, booking.endDate, booking.id)) {
          unavailableResources.push(`Vehicle ${booking.vehicleName}`);
        }
        if (booking.guideId && !isResourceAvailable('guide', booking.guideId, booking.startDate, booking.endDate, booking.id)) {
          unavailableResources.push(`Guide ${booking.guideName}`);
        }
        if (booking.hotelId && !isResourceAvailable('hotel', booking.hotelId, booking.startDate, booking.endDate, booking.id)) {
          unavailableResources.push(`Hotel ${booking.hotelName}`);
        }
      }

      if (unavailableResources.length > 0) {
        toast.error(`Cannot confirm: ${unavailableResources.join(', ')} already booked for these dates.`);
        setLoading(false);
        return;
      }

      // Update booking status
      const updatedBookings = bookings.map(b =>
        b.id === booking.id ? { ...b, status: 'confirmed', confirmedAt: new Date().toISOString() } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
      window.dispatchEvent(new Event('storage'));

      // Mark resources as booked (the availability check uses confirmed bookings, so this is automatic)
      markResourcesBooked(booking);

      // Send SMS
      sendSMS(booking);

      toast.success('Booking confirmed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Bookings</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (Rs)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">No bookings found</td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    <div className="text-sm text-gray-500">{booking.customerPhone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.type || booking.packageName || 'Custom Tour'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.startDate} – {booking.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs {booking.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewDetails(booking)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => confirmBooking(booking)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for booking details */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Booking Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-semibold">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{selectedBooking.customerName}</p>
                <p className="text-sm">{selectedBooking.customerEmail}</p>
                <p className="text-sm">{selectedBooking.customerPhone || 'No phone'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Travel Dates</p>
                <p className="font-semibold">{selectedBooking.startDate} – {selectedBooking.endDate}</p>
                <p>Days: {selectedBooking.numberOfDays}</p>
                <p>Passengers: {selectedBooking.passengers}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Itinerary</p>
                {selectedBooking.destinations ? (
                  selectedBooking.destinations.map((dest, i) => (
                    <div key={i} className="border rounded-lg p-3 mt-2 bg-gray-50">
                      <p className="font-semibold">{dest.district}</p>
                      <p>Places: {dest.places.join(', ')}</p>
                      {dest.guide && <p>Guide: {dest.guide.name} (Rs {dest.guide.pricePerDay}/day)</p>}
                      {dest.vehicle && <p>Vehicle: {dest.vehicle.model} (Rs {dest.vehicle.pricePerDay}/day)</p>}
                      {dest.hotel && <p>Hotel: {dest.hotel.name} (Rs {dest.hotel.pricePerNight}/night)</p>}
                    </div>
                  ))
                ) : (
                  <>
                    <p><strong>Places:</strong> {selectedBooking.places?.join(', ') || 'N/A'}</p>
                    <p><strong>Hotel:</strong> {selectedBooking.hotelName || 'None'}</p>
                    <p><strong>Vehicle:</strong> {selectedBooking.vehicleName || 'None'}</p>
                    <p><strong>Guide:</strong> {selectedBooking.guideName || 'None'}</p>
                  </>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-right text-xl font-bold text-primary">Total: Rs {selectedBooking.totalAmount?.toLocaleString()}</p>
              </div>

              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => confirmBooking(selectedBooking)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;