import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ArrowLeft, Wifi, Coffee, Home, Car, Users } from 'lucide-react';
import { getHotelById } from '../data/tourismData';
import FeedbackModal from '../components/FeedbackModal';   // ← fixed path
import { useTour } from '../context/TourContext';

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { addHotelFeedback, getHotelFeedbacks } = useTour();
  
  const hotel = getHotelById(id);
  const feedbacks = getHotelFeedbacks(parseInt(id));

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-primary">Hotel not found</h2>
        <button onClick={() => navigate('/hotels')} className="btn-primary mt-4">Back to Hotels</button>
      </div>
    );
  }

  const amenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Coffee, name: 'Restaurant' },
    { icon: Home, name: 'Room Service' },
    { icon: Car, name: 'Free Parking' },
    { icon: Users, name: '24/7 Front Desk' },
  ];

  const handleAddFeedback = (feedback) => {
    addHotelFeedback(feedback);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/hotels')} className="flex items-center gap-2 text-primary hover:text-secondary mb-6">
          <ArrowLeft size={20} /> Back to Hotels
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={hotel.image} alt={hotel.name} className="w-full h-96 object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{hotel.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin size={18} /> {hotel.location}
            </div>

            <div className="flex items-center gap-1 mb-6">
              <Star size={18} className="text-cta fill-current" />
              <span className="font-semibold">{hotel.rating}</span>
              <span className="text-gray-500">({hotel.reviews || 124} reviews)</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Price per night</span>
                <span className="text-3xl font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Free cancellation • Breakfast included</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-600">
                  <item.icon size={18} className="text-primary" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Description</h3>
              <p className="text-gray-600">
                Experience luxury and comfort at {hotel.name}. Located in the heart of {hotel.location},
                this premium accommodation offers world-class amenities and exceptional service.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate(-1)} className="btn-outline flex-1">Go Back</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">
                Write a Review
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Guest Reviews</h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No reviews yet. Be the first to review this hotel!</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg">
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

export default HotelDetailPage;