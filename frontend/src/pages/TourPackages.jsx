import React, { useState } from 'react';
import { Star, MapPin, Search, Home, Car, Users, Eye, TrendingDown } from 'lucide-react';
import { tourPackages, calculatePackagePricingFn } from '../data/tourismData';
import TourDetailModal from '../components/TourDetailModal';
import { useTour } from '../context/TourContext';

const TourPackages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addTourFeedback } = useTour();

  const filteredPackages = tourPackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (tour) => {
    setSelectedTour(tour);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addTourFeedback(feedback);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Tour Packages</h1>
      <p className="text-center text-gray-600 mb-12">Discover the best of Sri Lanka with SerendiGo's curated tours</p>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search tours..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPackages.map(pkg => {
          const pricing = calculatePackagePricingFn(pkg);
          
          return (
            <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <img src={pkg.image} alt={pkg.name} className="w-full h-56 object-cover" />
              
              {/* Discount Badge */}
              <div className="relative">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-bold flex items-center gap-1">
                  <TrendingDown size={14} /> 5% OFF
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl">{pkg.name}</h3>
                  <div className="flex items-center gap-1"><Star size={16} className="text-cta fill-current" /> {pkg.rating}</div>
                </div>
                <div className="flex items-center gap-1 text-gray-600 mb-3"><MapPin size={16} /> {pkg.location}</div>
                <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-700 space-y-1">
                  <p className="font-semibold text-primary mb-1 border-b pb-1">Package Includes:</p>
                  <p className="flex items-center gap-1"><Home size={12} className="text-secondary" /> {pkg.includes.hotel.name}</p>
                  <p className="flex items-center gap-1"><Car size={12} className="text-secondary" /> {pkg.includes.vehicle.name} ({pkg.includes.vehicle.type})</p>
                  <p className="flex items-center gap-1"><Users size={12} className="text-secondary" /> {pkg.includes.guide.name}</p>
                  <p className="flex items-center gap-1 text-green-600 mt-1">🍽️ {pkg.mealIncluded || 'Breakfast & Lunch'} Included</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">Rs: {Math.round(pricing.total).toLocaleString()}</span>
                    <p className="text-xs text-green-600">Save Rs {Math.round(pricing.discountAmount).toLocaleString()} (5% off)</p>
                  </div>
                  <button onClick={() => handleViewDetails(pkg)} className="btn-primary flex items-center gap-2">
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-500">No tour packages found.</p></div>
      )}

      <TourDetailModal isOpen={showModal} onClose={() => setShowModal(false)} tour={selectedTour} onAddFeedback={handleAddFeedback} />
    </div>
  );
};

export default TourPackages;