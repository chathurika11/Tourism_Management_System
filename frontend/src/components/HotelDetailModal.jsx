import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, Calendar, Bell, CheckCircle, Sparkles, MessageCircle, Coffee } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import API, { getImageUrl } from '../services/api';
import toast from 'react-hot-toast';

const HotelDetailModal = ({ isOpen, onClose, hotel }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const loadFeedbacks = React.useCallback(() => {
    if (!hotel?.id) return;
    API.get(`/feedback/hotel/${hotel.id}`)
      .then(res => setFeedbacks(res.data))
      .catch(err => console.error(err));
  }, [hotel?.id]);

  useEffect(() => {
    if (isOpen && hotel?.id) {
      loadFeedbacks();
    }
  }, [isOpen, hotel?.id, loadFeedbacks]);

  if (!isOpen || !hotel) return null;

  const amenities = hotel.amenities || [];

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString();
  };

  const handleAddFeedback = async ({ hotelId, rating, comment }) => {
    await API.post('/feedback/hotel', { hotelId, rating, comment });
    toast.success('Review submitted');
    loadFeedbacks();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
          <button onClick={onClose} className="absolute right-5 top-5 z-10 bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:bg-gray-100 transition">
            <X size={22} className="text-gray-600" />
          </button>
          <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-72 object-cover rounded-t-3xl" />
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-primary mb-2">{hotel.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin size={18} /> {hotel.location}
              <span className="ml-4 flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                <Star size={16} className="text-yellow-500 fill-current" /> {hotel.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-primary mb-3 flex items-center gap-2"><Clock size={18} /> Important Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> Check-in: {hotel.checkIn || '2:00 PM'}</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> Check-out: {hotel.checkOut || '12:00 PM'}</div>
                <div className="flex items-center gap-2"><Bell size={16} className="text-primary" /> Free cancellation up to {hotel.freeCancellationHours || 48} hours</div>
              </div>
              {hotel.breakfastIncluded && <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-md"><Coffee size={16} /> Breakfast Included</div>}
            </div>

            {amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Sparkles size={18} className="text-yellow-500" /> Amenities & What's Included</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((item, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-2xl mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per night</span>
                <span className="text-3xl font-bold text-primary">Rs {formatPrice(hotel.pricePerNight)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-outline flex-1">Close</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">Write a Review</button>
            </div>
          </div>
          
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <MessageCircle size={18} /> Guest Reviews ({feedbacks.length})
            </h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-primary">{fb.user?.name || 'Guest'}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < (fb.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{fb.comment}</p>
                    {fb.reply && (
                      <div className="mt-2 bg-blue-50 p-2 rounded-lg">
                        <p className="text-xs font-semibold text-primary">Admin Reply:</p>
                        <p className="text-gray-700 text-sm">{fb.reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        onSubmit={handleAddFeedback} 
        itemName={hotel.name} 
        itemId={hotel.id} 
        type="hotel" 
      />
    </>
  );
};

export default HotelDetailModal;
