import React, { useState } from 'react';
import { X, Star, MapPin, Users, Home, Car, DollarSign, Percent, TrendingDown, ClipboardList } from 'lucide-react';
import TourFeedbackModal from './TourFeedbackModal';
import { useTour } from '../context/TourContext';

const TourDetailModal = ({ isOpen, onClose, tour, onAddFeedback }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { getTourFeedbacks } = useTour();
  const feedbacks = getTourFeedbacks(tour?.id);

  if (!isOpen || !tour) return null;

  // Calculate pricing
  const days = parseInt(tour.duration.split(' ')[0]) || 5;
  const hotelPrice = tour.includes.hotel.pricePerNight;
  const vehiclePrice = tour.includes.vehicle.pricePerDay;
  const guidePrice = tour.includes.guide.pricePerDay;
  const serviceCharge = 15000;
  
  const hotelTotal = hotelPrice * days;
  const vehicleTotal = vehiclePrice * days;
  const guideTotal = guidePrice * days;
  const subtotal = hotelTotal + vehicleTotal + guideTotal + serviceCharge;
  const discountPercent = 5;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal - discountAmount;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow-md">
            <X size={24} className="text-gray-500" />
          </button>
          
          <img src={tour.image} alt={tour.name} className="w-full h-64 object-cover" />
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{tour.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin size={18} /> {tour.location}
              <span className="ml-4 flex items-center gap-1"><Star size={16} className="text-cta fill-current" /> {tour.rating}</span>
            </div>
            
            {/* Simplified Pricing - Only Total, Discount, Final Price */}
            <div className="bg-gradient-to-r from-green-50 to-gray-50 rounded-lg p-5 mb-6 border border-green-100">
              <h3 className="font-bold text-lg text-primary mb-3 flex items-center gap-2"><DollarSign size={18} /> Package Price</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Package Value</span>
                  <span className="font-semibold">Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1"><Percent size={14} /> Special Discount ({discountPercent}% off)</span>
                  <span>- Rs {discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-primary text-lg font-bold">
                  <span className="text-primary">Final Package Price</span>
                  <span className="text-primary">Rs {grandTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><TrendingDown size={12} /> You save Rs {discountAmount.toLocaleString()} with this package!</p>
              </div>
            </div>
            
            <div className="mb-6"><h3 className="font-bold text-lg mb-2">Description</h3><p className="text-gray-600">{tour.description}</p></div>
            
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Package Includes</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2"><Home size={16} className="text-primary" /> Hotel: {tour.includes.hotel.name} - {tour.includes.hotel.location}</p>
                <p className="flex items-center gap-2"><Car size={16} className="text-primary" /> Vehicle: {tour.includes.vehicle.name} ({tour.includes.vehicle.type})</p>
                <p className="flex items-center gap-2"><Users size={16} className="text-primary" /> Guide: {tour.includes.guide.name} ({tour.includes.guide.specialty})</p>
                <p className="flex items-center gap-2 text-green-600">🍽️ Meals: {tour.mealIncluded || 'Breakfast & Lunch'} Included</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-outline flex-1">Close</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">Write a Review</button>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="border-t p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4">Customer Reviews</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this tour!</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-primary">{feedback.userName}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < feedback.rating ? 'text-cta fill-current' : 'text-gray-300'} />))}
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
      
      <TourFeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSubmit={onAddFeedback} tourName={tour.name} tourId={tour.id} />
    </>
  );
};

export default TourDetailModal;