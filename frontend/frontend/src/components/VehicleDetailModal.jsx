import React, { useState } from 'react';
import { X, Users, Fuel, Calendar, Shield, Star, MapPin } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useTour } from '../context/TourContext';

const VehicleDetailModal = ({ isOpen, onClose, vehicle, onAddFeedback }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { getVehicleFeedbacks } = useTour();
  const feedbacks = getVehicleFeedbacks(vehicle?.id);

  if (!isOpen || !vehicle) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow-md">
            <X size={24} className="text-gray-500" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="h-64 md:h-full">
              <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover rounded-l-2xl" />
            </div>
            
            {/* Details Section */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-2">{vehicle.model}</h2>
              <p className="text-secondary font-semibold mb-4">{vehicle.type}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Users size={20} className="text-primary" />
                  <span>{vehicle.passengers} Passengers</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Fuel size={20} className="text-primary" />
                  <span>{vehicle.fuelType || 'Petrol'} • {vehicle.mileage || '18-22 km/l'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-primary" />
                  <span>Model Year: {vehicle.year || '2023-2025'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield size={20} className="text-primary" />
                  <span>Insurance Included • 24/7 Support</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={20} className="text-primary" />
                  <span>Pickup Locations: Colombo, Kandy, Galle</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="font-bold text-lg mb-2">What's Included</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Unlimited kilometers</li>
                  <li>Full insurance coverage</li>
                  <li>24/7 roadside assistance</li>
                  <li>Free cancellation up to 24 hours</li>
                  <li>GPS navigation system</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per day</span>
                  <span className="text-2xl font-bold text-primary">Rs {vehicle.pricePerDay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Security Deposit</span>
                  <span>Rs 10,000 (refundable)</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-outline flex-1">Close</button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">
                  Write a Review
                </button>
              </div>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="border-t p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4">Customer Reviews</h3>
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
        itemName={vehicle.model}
        itemId={vehicle.id}
        type="vehicle"
      />
    </>
  );
};

export default VehicleDetailModal;