import React, { useState } from 'react';
import { Car, Eye } from 'lucide-react';
import VehicleDetailModal from '../components/VehicleDetailModal';
import { useTour } from '../context/TourContext';
import { vehicles } from '../data/tourismData';

const VehiclesPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addVehicleFeedback } = useTour();

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addVehicleFeedback(feedback);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Vehicles for Rent</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Travel across Sri Lanka in comfort and style. From nimble scooters to spacious vans, find the perfect ride for your journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <img src={vehicle.image} alt={vehicle.model} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-primary">{vehicle.model}</h3>
                <div className="bg-cream p-2 rounded-full text-primary">
                  <Car size={16} />
                </div>
              </div>
              <p className="text-gray-600 mb-2">{vehicle.type} • Up to {vehicle.passengers} passengers</p>
              <p className="text-sm text-gray-500 mb-3">{vehicle.fuelType} • {vehicle.mileage}</p>
              <div className="border-t pt-4 mb-4 flex justify-between items-center">
                <span className="font-bold text-secondary text-lg">Rs {vehicle.pricePerDay.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ day</span></span>
                <button onClick={() => handleViewDetails(vehicle)} className="text-accent hover:text-primary transition flex items-center gap-1">
                  <Eye size={16} /> View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VehicleDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        vehicle={selectedVehicle}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  );
};

export default VehiclesPage;