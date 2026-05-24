import React, { useState } from 'react';
import { Star, MapPin, Eye } from 'lucide-react';
import HotelDetailModal from '../components/HotelDetailModal';
import { useTour } from '../context/TourContext';
import { hotels } from '../data/tourismData';

const HotelsPage = () => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addHotelFeedback } = useTour();

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addHotelFeedback(feedback);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Premium Accommodations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Experience luxury and comfort at Sri Lanka's finest hotels and resorts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl text-primary mb-2">{hotel.name}</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={16} /> {hotel.location}
              </div>
              <div className="flex items-center gap-1 mb-4">
                <Star size={16} className="text-cta fill-current" />
                <span>{hotel.rating}</span>
              </div>
              <div className="border-t pt-4 mb-4 flex justify-between items-center">
                <span className="font-bold text-secondary text-lg">Rs {hotel.pricePerNight.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ night</span></span>
                <button onClick={() => handleViewDetails(hotel)} className="text-accent hover:text-primary transition flex items-center gap-1">
                  <Eye size={16} /> View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <HotelDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        hotel={selectedHotel}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  );
};

export default HotelsPage;