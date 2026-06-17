import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Lock, Calendar, Shield, CheckCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const Payment = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('pendingBooking');
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    } else {
      toast.error('No booking found. Please start a new booking.');
      navigate('/');
    }
  }, [navigate]);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Add space after every 4 digits
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    const formatted = parts.join(' ');
    setCardNumber(formatted);
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  // CVV only digits, max 4
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardCvv(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    if (paymentMethod === 'card') {
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
    }

    setLoading(true);
    try {
      let response;
      if (paymentMethod === 'card') {
        response = await API.post('/payments/process', {
          bookingId: booking.id,
          paymentMethod: 'card',
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry,
          cardCvv,
          cardHolder: cardHolder.trim(),
        });
      } else {
        // Mock PayPal payment
        response = await API.post('/payments/process', {
          bookingId: booking.id,
          paymentMethod: 'paypal',
        });
      }

      if (response.data.success) {
        toast.success('Payment successful! Booking confirmed.');
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
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
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
                <div className="flex justify-between"><span className="text-gray-600">Package:</span><span className="font-medium">{booking.type || booking.packageName || 'Custom Tour'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Dates:</span><span>{booking.startDate} – {booking.endDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Passengers:</span><span>{booking.passengers || 1}</span></div>
                <div className="border-t pt-3 mt-3"><div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">Rs {booking.totalAmount?.toLocaleString()}</span></div></div>
              </div>
              <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-700"><Shield size={14} /> Your payment is secure and encrypted.</div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6"><CreditCard size={24} className="text-primary" /><h1 className="text-2xl font-bold text-primary">Payment Details</h1></div>

              {/* Payment Method Selection */}
              <div className="flex gap-4 mb-6">
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4" />
                  <CreditCard size={18} /> Card
                </label>
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <input type="radio" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-4 h-4" />
                  <DollarSign size={18} /> PayPal (Demo)
                </label>
              </div>

              <form onSubmit={handleSubmit}>
                {paymentMethod === 'card' ? (
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
                            onChange={handleCvvChange}
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
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <DollarSign size={48} className="mx-auto text-blue-600 mb-2" />
                    <p className="text-gray-700">You will be redirected to PayPal for payment.</p>
                    <p className="text-xs text-gray-500 mt-2">(Demo mode – clicking Pay will simulate success)</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 text-sm mt-6">
                  <Lock size={16} className="text-green-600" />
                  <span className="text-gray-600">Your payment details are encrypted and never stored fully.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2 mt-6"
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;