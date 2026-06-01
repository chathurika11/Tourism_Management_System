import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Eye, Wifi, Coffee, Home, Car, Users, Search } from 'lucide-react';
import { hotels } from '../data/tourismData';
import HotelDetailModal from '../components/HotelDetailModal';
import { useTour } from '../context/TourContext';

const Hotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addHotelFeedback } = useTour();

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addHotelFeedback(feedback);
  };

  const amenitiesList = [Wifi, Coffee, Home, Car, Users];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-secondary to-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Accommodations</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">Experience luxury and comfort at Sri Lanka's finest hotels and resorts</p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search hotels by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-dark focus:outline-none focus:ring-2 focus:ring-cta shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map(hotel => (
            <div key={hotel.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative overflow-hidden h-64">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-cta text-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Star size={14} className="fill-current" /> {hotel.rating}
                </div>
                {hotel.popular && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">🔥 Popular</div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-secondary transition-colors">{hotel.name}</h3>
                <div className="flex items-center gap-2 text-gray-500 mb-4"><MapPin size={16} /> {hotel.location}</div>
                
                <div className="flex items-center gap-3 mb-4">
                  {amenitiesList.slice(0, 4).map((Icon, idx) => (
                    <Icon key={idx} size={16} className="text-gray-400" />
                  ))}
                  <span className="text-xs text-gray-400">+ more amenities</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}</span>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <button onClick={() => handleViewDetails(hotel)} className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-secondary transition flex items-center gap-2">
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hotels found matching your search.</p>
          </div>
        )}
      </section>

      <HotelDetailModal isOpen={showModal} onClose={() => setShowModal(false)} hotel={selectedHotel} onAddFeedback={handleAddFeedback} />
    </div>
  );
};

export default Hotels;