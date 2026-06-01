import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Eye, Users, Fuel, Calendar, Search, Star } from 'lucide-react';
import { vehicles } from '../data/tourismData';
import VehicleDetailModal from '../components/VehicleDetailModal';
import { useTour } from '../context/TourContext';

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addVehicleFeedback } = useTour();

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addVehicleFeedback(feedback);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Vehicles for Rent</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">Travel across Sri Lanka in comfort and style. From nimble scooters to spacious vans</p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vehicles by model or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-dark focus:outline-none focus:ring-2 focus:ring-cta shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative overflow-hidden h-48">
                <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-cta text-primary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star size={12} className="fill-current" /> {vehicle.rating}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-primary group-hover:text-secondary transition-colors">{vehicle.model}</h3>
                  <Car size={20} className="text-secondary" />
                </div>
                <p className="text-gray-500 text-sm mb-3">{vehicle.type} • {vehicle.location}</p>
                
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={14} /> {vehicle.passengers} seats</span>
                  <span className="flex items-center gap-1"><Fuel size={14} /> {vehicle.fuelType}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {vehicle.year}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-xl font-bold text-primary">Rs {vehicle.pricePerDay.toLocaleString()}</span>
                    <p className="text-xs text-gray-500">per day</p>
                  </div>
                  <button onClick={() => handleViewDetails(vehicle)} className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary transition flex items-center gap-2 text-sm">
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No vehicles found matching your search.</p>
          </div>
        )}
      </section>

      <VehicleDetailModal isOpen={showModal} onClose={() => setShowModal(false)} vehicle={selectedVehicle} onAddFeedback={handleAddFeedback} />
    </div>
  );
};

export default Vehicles;