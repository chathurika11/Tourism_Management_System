import React, { useState } from 'react';
import { X, Users, Wifi, Coffee, Home, Car, Star, MapPin } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useTour } from '../context/TourContext';

const HotelDetailModal = ({ isOpen, onClose, hotel, onAddFeedback }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { getHotelFeedbacks } = useTour();
  const feedbacks = getHotelFeedbacks(hotel?.id);

  if (!isOpen || !hotel) return null;

  const amenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Coffee, name: 'Restaurant' },
    { icon: Home, name: 'Room Service' },
    { icon: Car, name: 'Free Parking' },
    { icon: Users, name: '24/7 Front Desk' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow-md">
            <X size={24} className="text-gray-500" />
          </button>
          
          <img src={hotel.image} alt={hotel.name} className="w-full h-64 object-cover" />
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{hotel.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin size={18} /> {hotel.location}
              <span className="ml-4 flex items-center gap-1">
                <Star size={16} className="text-cta fill-current" /> {hotel.rating}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <item.icon size={18} className="text-primary" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3">Important Info</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Check-in: 2:00 PM</li>
                  <li>Check-out: 12:00 PM</li>
                  <li>Free cancellation up to 48 hours</li>
                  <li>Breakfast included</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per night</span>
                <span className="text-2xl font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-outline flex-1">Close</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">
                Write a Review
              </button>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="border-t p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4">Guest Reviews</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-primary">{feedback.userName}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < feedback.rating ? 'text-cta fill-current' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{feedback.comment}</p>
                    <p className="text-xs text-gray-400">{feedback.date}</p>
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
        onSubmit={onAddFeedback}
        itemName={hotel.name}
        itemId={hotel.id}
        type="hotel"
      />
    </>
  );
};

export default HotelDetailModal;