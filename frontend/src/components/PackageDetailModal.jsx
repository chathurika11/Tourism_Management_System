import React from 'react';
import { X, MapPin, Clock, Calendar, Users, Star, CheckCircle, DollarSign } from 'lucide-react';

const PackageDetailModal = ({ isOpen, onClose, packageData, onAddFeedback }) => {
  if (!isOpen || !packageData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img src={packageData.image} alt={packageData.name} className="w-full h-64 object-cover rounded-t-2xl" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition">
            <X size={20} />
          </button>
          {packageData.popular && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">🔥 Popular</div>
          )}
        </div>
        <div className="p-6">
          <h2 className="text-3xl font-bold text-primary mb-2">{packageData.name}</h2>
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <span className="flex items-center gap-1"><MapPin size={16} /> {packageData.destination || packageData.location}</span>
            <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {packageData.rating} / 5</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <Clock size={20} className="mx-auto text-primary mb-1" />
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{packageData.duration || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <Users size={20} className="mx-auto text-primary mb-1" />
              <p className="text-sm text-gray-500">Max People</p>
              <p className="font-semibold">{packageData.maxPeople || '?'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <Calendar size={20} className="mx-auto text-primary mb-1" />
              <p className="text-sm text-gray-500">Best Season</p>
              <p className="font-semibold">{packageData.season || 'All year'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <DollarSign size={20} className="mx-auto text-primary mb-1" />
              <p className="text-sm text-gray-500">Price / person</p>
              <p className="font-semibold text-primary">Rs {packageData.pricePerPerson?.toLocaleString() || packageData.price?.toLocaleString()}</p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-600">{packageData.description || 'No description available.'}</p>
          </div>
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">What's Included</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(packageData.inclusions || ['Accommodation', 'Transport', 'Meals as per itinerary', 'Sightseeing']).map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600"><CheckCircle size={16} className="text-green-500" /> {item}</li>
              ))}
            </ul>
          </div>
          <button className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition font-semibold">
            Book This Package
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailModal;