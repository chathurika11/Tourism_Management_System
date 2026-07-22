import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, Users, Fuel, Calendar, Shield, Star, MapPin, ArrowLeft } from 'lucide-react';
import { getVehicleById } from '../data/tourismData';
import FeedbackModal from '../components/FeedbackModal';
import { useTour } from '../context/TourContext';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { addVehicleFeedback, getVehicleFeedbacks } = useTour();
  
  const vehicle = getVehicleById(id);
  const feedbacks = getVehicleFeedbacks(parseInt(id));

  // Status config (matching the modal)
  const statusConfig = {
    available: { label: 'Available', className: 'bg-green-100 text-green-800 border-green-300' },
    booked: { label: 'Booked', className: 'bg-red-100 text-red-800 border-red-300' },
    maintenance: { label: 'Under Maintenance', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  };
  const statusInfo = statusConfig[vehicle?.status] || statusConfig.available;
  const isAvailable = vehicle?.status === 'available';

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-primary">Vehicle not found</h2>
        <button onClick={() => navigate('/vehicles')} className="btn-primary mt-4">Back to Vehicles</button>
      </div>
    );
  }

  const amenities = [
    { icon: Users, name: `${vehicle.passengers} Passengers` },
    { icon: Fuel, name: vehicle.fuelType },
    { icon: Calendar, name: `Model Year: ${vehicle.year}` },
    { icon: Shield, name: 'Insurance Included' },
  ];

  const handleAddFeedback = (feedback) => {
    addVehicleFeedback(feedback);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/vehicles')} className="flex items-center gap-2 text-primary hover:text-secondary mb-6">
          <ArrowLeft size={20} /> Back to Vehicles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src={vehicle.image} alt={vehicle.model} className="w-full h-96 object-cover" />
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold text-primary">{vehicle.model}</h1>
              {/* Status Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin size={18} /> {vehicle.location}
              <span className="ml-4 flex items-center gap-1">
                <Car size={16} className="text-secondary" /> {vehicle.type}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-6">
              <Star size={18} className="text-cta fill-current" />
              <span className="font-semibold">{vehicle.rating || '4.8'}</span>
              <span className="text-gray-500">(124 reviews)</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Price</span>
                <span className="text-3xl font-bold text-primary">Rs {vehicle.pricePerDay.toLocaleString()} <span className="text-sm font-normal">/ day</span></span>
              </div>
              {!isAvailable && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ This vehicle is currently {statusInfo.label.toLowerCase()}.
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Unlimited kilometers • Free cancellation</p>
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
                Perfect for exploring Sri Lanka, this {vehicle.type} offers comfort, reliability, and excellent fuel efficiency.
                Ideal for {vehicle.passengers} passengers with {vehicle.mileage} mileage.
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
          <h2 className="text-2xl font-bold text-primary mb-6">Customer Reviews</h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No reviews yet. Be the first to review this vehicle!</p>
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
        itemName={vehicle.model}
        itemId={vehicle.id}
        type="vehicle"
      />
    </>
  );
};

export default VehicleDetailPage;