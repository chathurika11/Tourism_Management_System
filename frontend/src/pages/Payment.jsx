import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Calendar, User, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Retrieve booking from sessionStorage (set during booking creation)
  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    } else {
      toast.error('No booking found. Please start a new booking.');
      navigate('/');
    }
  }, [navigate]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setCardExpiry(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;
    
    // Basic validation
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.length < 15 || rawCardNumber.length > 19) {
      toast.error('Invalid card number');
      return;
    }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Expiry must be MM/YY');
      return;
    }
    if (!cardCvv.match(/^\d{3,4}$/)) {
      toast.error('CVV must be 3 or 4 digits');
      return;
    }
    if (!cardHolder.trim()) {
      toast.error('Cardholder name is required');
      return;
    }

    setLoading(true);
    try {
      // Call backend payment endpoint
      const response = await API.post('/payments/process', {
        bookingId: booking.id,
        cardNumber: rawCardNumber,
        cardExpiry,
        cardCvv,
        cardHolder: cardHolder.trim(),
      });
      
      if (response.data.success) {
        toast.success('Payment successful! Booking confirmed.');
        // Clear session storage and navigate to my bookings
        sessionStorage.removeItem('pendingBooking');
        navigate('/my-bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{booking.type || booking.packageName || 'Custom Tour'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span>{booking.startDate} – {booking.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span>{booking.passengers || 1}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rs {booking.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-700">
                <Shield size={14} /> Your payment is secure and encrypted.
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={24} className="text-primary" />
                <h1 className="text-2xl font-bold text-primary">Payment Details</h1>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-700 mb-1">Card Number *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">We only store the last 4 digits</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Expiry Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">CVV *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength="4"
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Cardholder Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name as on card"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 text-sm">
                    <Lock size={16} className="text-green-600" />
                    <span className="text-gray-600">Your card details are encrypted and never stored fully.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Pay Rs {booking.totalAmount?.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;