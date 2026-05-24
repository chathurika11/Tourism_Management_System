import React from 'react';
import { Car } from 'lucide-react';

const popularVehicles = [
  { id: 1, type: 'Scooter', model: 'Honda Dio', price: 15, passengers: 2, image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400' },
  { id: 2, type: 'Car', model: 'Toyota Axio', price: 35, passengers: 4, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400' },
  { id: 3, type: 'Van', model: 'Nissan Caravan', price: 50, passengers: 10, image: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?w=400' },
  { id: 4, type: 'SUV', model: 'Toyota Prado', price: 80, passengers: 7, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
];

const Vehicles = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Vehicles for Rent</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Travel across Sri Lanka in comfort and style. From nimble scooters to spacious vans, find the perfect ride for your journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {popularVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <img src={vehicle.image} alt={vehicle.model} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-primary">{vehicle.model}</h3>
                <div className="bg-cream p-2 rounded-full text-primary">
                  <Car size={16} />
                </div>
              </div>
              <p className="text-gray-600 mb-6">{vehicle.type} • Up to {vehicle.passengers} passengers</p>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-secondary text-lg">Rs: {vehicle.price} <span className="text-sm font-normal text-gray-500">/ day</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehicles;
