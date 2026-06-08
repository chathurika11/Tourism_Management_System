import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Eye, Search, Clock, Calendar, Bell } from 'lucide-react';
import API, { getImageUrl } from '../services/api';
import HotelDetailModal from '../components/HotelDetailModal';
import { useTour } from '../context/TourContext';
import hotelsBg from '../images/HotelsPremiumAccommodationsBackground.jpg';
import toast from 'react-hot-toast';

const HotelCard = React.memo(({ hotel, onViewDetails }) => (
  <div className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative">
    <div className="relative overflow-hidden h-64">
      <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
        <Star size={14} className="fill-current" /> {hotel.rating}
      </div>
      {hotel.popular && <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">🔥 Popular</div>}
    </div>
    <div className="p-6">
      <h3 className="font-bold text-xl text-primary group-hover:text-secondary transition-colors">{hotel.name}</h3>
      <div className="flex items-center gap-2 text-gray-500 mt-1"><MapPin size={16} /> {hotel.location}</div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Clock size={12} /> {hotel.checkIn || '2:00 PM'}</span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Calendar size={12} /> {hotel.checkOut || '12:00 PM'}</span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Bell size={12} /> Cancel {hotel.freeCancellationHours || 48}h</span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div><span className="text-2xl font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}</span><p className="text-xs text-gray-500">per night</p></div>
        <button onClick={() => onViewDetails(hotel)} className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-secondary transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"><Eye size={16} /> View Details</button>
      </div>
    </div>
  </div>
));

const Hotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const { addHotelFeedback } = useTour();

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotels', page],
    queryFn: () => API.get(`/hotels?page=${page}&limit=12`).then(res => res.data),
    keepPreviousData: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fix: wrap hotels extraction in useMemo to avoid recreation on every render
  const hotels = useMemo(() => data?.data || [], [data?.data]);

  const totalPages = data?.totalPages || 1;

  const filteredHotels = useMemo(() => {
    if (!searchTerm) return hotels;
    const term = searchTerm.toLowerCase();
    return hotels.filter(h => h.name.toLowerCase().includes(term) || h.location.toLowerCase().includes(term));
  }, [hotels, searchTerm]);

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  if (isLoading && page === 1) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  if (error) toast.error('Failed to load hotels');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-gray-100">
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-24" style={{ backgroundImage: `url(${hotelsBg})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Premium Accommodations</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-95">Experience luxury and comfort at Sri Lanka's finest hotels and resorts</p>
          <div className="mt-10 max-w-md mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition" size={22} />
              <input type="text" placeholder="Search hotels by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-4 rounded-full text-dark focus:outline-none focus:ring-4 focus:ring-cta/50 shadow-2xl transition" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {filteredHotels.length === 0 ? <div className="text-center py-16"><p className="text-gray-500 text-xl">No hotels found.</p></div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onViewDetails={handleViewDetails} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-outline px-6 py-2 disabled:opacity-40 transition">Previous</button>
                <span className="text-gray-700 font-medium">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-outline px-6 py-2 disabled:opacity-40 transition">Next</button>
              </div>
            )}
          </>
        )}
      </section>

      <HotelDetailModal isOpen={showModal} onClose={() => setShowModal(false)} hotel={selectedHotel} onAddFeedback={addHotelFeedback} />
    </div>
  );
};

export default Hotels;