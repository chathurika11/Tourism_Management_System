import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Building, Shield, Loader, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookingData, setBookingData] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Sri Lanka'
  });

  useEffect(() => {
    const pending = localStorage.getItem('pendingBooking');
    if (pending) {
      setBookingData(JSON.parse(pending));
    } else {
      toast.error('No booking to pay');
      navigate('/');
    }
  }, [navigate]);

  const validate = () => {
    if (paymentMethod === 'card') {
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) { toast.error('Invalid card number (16 digits)'); return false; }
      if (cardDetails.cvv.length < 3) { toast.error('Invalid CVV'); return false; }
      if (!cardDetails.name) { toast.error('Cardholder name required'); return false; }
      if (!cardDetails.address) { toast.error('Billing address required'); return false; }
    }
    return true;
  };

  const sendSMS = (booking) => {
    let placesMsg = '';
    if (booking.destinations && booking.destinations.length) {
      placesMsg = booking.destinations.map(d => `${d.district}: ${d.places.join(', ')}`).join(' | ');
    } else if (booking.places) {
      placesMsg = booking.places.join(', ');
    } else {
      placesMsg = booking.packageName || 'Custom tour';
    }
    const message = `✅ CONFIRMATION: ${user?.name}, booking confirmed!\n📍 ${placesMsg}\n📅 ${booking.startDate} to ${booking.endDate}\n💰 Rs ${booking.totalAmount?.toLocaleString()}\nThank you for choosing SerendiGo!`;
    console.log('📱 SMS to', user?.phone || 'N/A', message);
    toast.success(`Confirmation sent to ${user?.phone || 'your phone'}`);
  };

  const handlePayment = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const confirmed = { 
        ...bookingData, 
        status: 'confirmed', 
        paymentStatus: 'paid', 
        paymentDate: new Date().toISOString(),
        billingAddress: {
          address: cardDetails.address,
          city: cardDetails.city,
          postalCode: cardDetails.postalCode,
          country: cardDetails.country
        }
      };
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(confirmed);
      localStorage.setItem('bookings', JSON.stringify(existing));
      localStorage.removeItem('pendingBooking');
      // Dispatch storage event so other tabs/components refresh
      window.dispatchEvent(new Event('storage'));
      sendSMS(confirmed);
      toast.success('Payment successful! Booking confirmed.');
      setLoading(false);
      navigate('/my-bookings');
    }, 2000);
  };

  if (!bookingData) return <div className="text-center py-20">Loading booking details...</div>;

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">Complete Payment</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex gap-4 mb-6 border-b pb-4">
              {['card','mobile','bank'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`px-4 py-2 rounded-lg ${paymentMethod===m ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                  {m==='card' && <CreditCard size={18} />} {m==='mobile' && <Smartphone size={18} />} {m==='bank' && <Building size={18} />} {m.toUpperCase()}
                </button>
              ))}
            </div>
            
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" className="input-field" value={cardDetails.cardNumber} onChange={e => setCardDetails({...cardDetails, cardNumber: e.target.value.replace(/\D/g,'').slice(0,16)})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Expiry (MM/YY)</label>
                    <input type="text" placeholder="MM/YY" className="input-field" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">CVV</label>
                    <input type="password" placeholder="123" className="input-field" maxLength="4" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Cardholder Name</label>
                  <input type="text" placeholder="Name on card" className="input-field" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} />
                </div>
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-3">Billing Address</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Street Address" className="input-field" value={cardDetails.address} onChange={e => setCardDetails({...cardDetails, address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" className="input-field" value={cardDetails.city} onChange={e => setCardDetails({...cardDetails, city: e.target.value})} />
                      <input type="text" placeholder="Postal Code" className="input-field" value={cardDetails.postalCode} onChange={e => setCardDetails({...cardDetails, postalCode: e.target.value})} />
                    </div>
                    <input type="text" placeholder="Country" className="input-field" value={cardDetails.country} onChange={e => setCardDetails({...cardDetails, country: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'mobile' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold mb-2">Mobile Payment</p>
                <input type="tel" className="input-field" placeholder="+94 XX XXX XXXX" />
                <p className="text-xs text-gray-500 mt-2">You will receive a confirmation SMS with payment link.</p>
              </div>
            )}
            
            {paymentMethod === 'bank' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold">Bank Transfer Details</p>
                <p className="text-sm">Bank: SerendiGo Commercial Bank<br/>Account: 1234-5678-9012-3456<br/>Branch: Colombo Main<br/>Reference: Use your Booking ID</p>
                <input type="text" placeholder="Transaction Reference ID" className="input-field mt-3" />
              </div>
            )}
            
            <button onClick={handlePayment} disabled={loading} className="btn-primary w-full mt-6 py-3 flex justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : <Shield />} {loading ? 'Processing...' : `Pay Rs ${bookingData.totalAmount?.toLocaleString() || 0}`}
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <p><strong>Type:</strong> {bookingData.type || 'Custom Tour'}</p>
            <p><strong>Dates:</strong> {bookingData.startDate} – {bookingData.endDate}</p>
            <p><strong>Days:</strong> {bookingData.numberOfDays}</p>
            <p><strong>Passengers:</strong> {bookingData.passengers}</p>
            {bookingData.destinations && (
              <div className="mt-2">
                <p className="font-semibold">Destinations:</p>
                <ul className="text-sm list-disc pl-4">
                  {bookingData.destinations.map((d, i) => (
                    <li key={i}>{d.district} – {d.places.length} places</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-t mt-4 pt-4">
              <p className="text-sm text-gray-600">Total amount:</p>
              <p className="text-2xl font-bold text-primary">Rs {bookingData.totalAmount?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;