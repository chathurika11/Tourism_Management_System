import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Car, Eye, Users, Fuel, Calendar, Search, Star, MapPin, Shield, Heart } from 'lucide-react';
import API, { getImageUrl } from '../services/api';
import VehicleDetailModal from '../components/VehicleDetailModal';
import { useTour } from '../context/TourContext';
import vehiclesBg from '../images/VehiclesforRentBackground.png';
import toast from 'react-hot-toast';

const VehicleCard = React.memo(({ vehicle, onViewDetails }) => {
  const formatPrice = (price) => (price === undefined || price === null) ? '0' : price.toLocaleString();
  return (
    <div className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative">
      <div className="relative overflow-hidden h-48">
        <img src={getImageUrl(vehicle.image)} alt={vehicle.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Star size={12} className="fill-current" /> {vehicle.rating}
        </div>
        {vehicle.popular && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
            <Heart size={12} /> Popular
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-1"><h3 className="font-bold text-xl text-primary group-hover:text-secondary transition-colors">{vehicle.model}</h3><Car size={20} className="text-secondary" /></div>
        <p className="text-secondary font-medium text-sm mb-2">{vehicle.type || 'Vehicle'}</p>
        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1"><MapPin size={14} /> {vehicle.location}</p>
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Users size={12} /> {vehicle.passengers} seats</span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Fuel size={12} /> {vehicle.fuelType}</span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Calendar size={12} /> {vehicle.year}</span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Shield size={12} /> {vehicle.insuranceIncluded ? 'Insured' : 'No Ins'}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div><span className="text-2xl font-bold text-primary">Rs {formatPrice(vehicle.pricePerDay)}</span><p className="text-xs text-gray-500">per day</p></div>
          <button onClick={() => onViewDetails(vehicle)} className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"><Eye size={14} /> View Details</button>
        </div>
      </div>
    </div>
  );
});

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const { addVehicleFeedback } = useTour();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', page],
    queryFn: () => API.get(`/vehicles?page=${page}&limit=12`).then(res => res.data),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const vehicles = useMemo(() => data?.data || [], [data?.data]);
  const totalPages = data?.totalPages || 1;

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const term = searchTerm.toLowerCase();
    return vehicles.filter(v => v.model?.toLowerCase().includes(term) || v.type?.toLowerCase().includes(term) || v.location?.toLowerCase().includes(term));
  }, [vehicles, searchTerm]);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  if (isLoading && page === 1) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error) toast.error('Failed to load vehicles');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-gray-100">
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-24" style={{ backgroundImage: `url(${vehiclesBg})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Vehicles for Rent</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-95">Travel across Sri Lanka in comfort and style – from nimble scooters to spacious vans</p>
          <div className="mt-10 max-w-md mx-auto"><div className="relative group"><Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition" size={22} /><input type="text" placeholder="Search by model, type or location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-4 rounded-full text-dark focus:outline-none focus:ring-4 focus:ring-cta/50 shadow-2xl transition" /></div></div>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        {filteredVehicles.length === 0 ? <div className="text-center py-16"><p className="text-gray-500 text-xl">No vehicles found.</p></div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{filteredVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} onViewDetails={handleViewDetails} />)}</div>
            {totalPages > 1 && (<div className="flex justify-center items-center gap-6 mt-12"><button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-outline px-6 py-2 disabled:opacity-40 transition">Previous</button><span className="text-gray-700 font-medium">Page {page} of {totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-outline px-6 py-2 disabled:opacity-40 transition">Next</button></div>)}
          </>
        )}
      </section>
      <VehicleDetailModal isOpen={showModal} onClose={() => setShowModal(false)} vehicle={selectedVehicle} onAddFeedback={addVehicleFeedback} />
    </div>
  );
};

export default Vehicles;