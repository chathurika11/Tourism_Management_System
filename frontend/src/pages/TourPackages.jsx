import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Eye, Search, Calendar, Users, Utensils, Package, Car, Home, BookOpen, Heart, X } from 'lucide-react';
import API, { getImageUrl } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import tourPackagesBg from '../images/TourPackagesBackground.jpg';

const PackageCard = React.memo(({ pkg, onViewDetails }) => (
  <div className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative">
    <div className="relative overflow-hidden h-64">
      <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
        <Star size={14} className="fill-current" /> {pkg.popular ? 'Popular' : 'Standard'}
      </div>
    </div>
    <div className="p-6">
      <h3 className="font-bold text-xl text-primary group-hover:text-secondary transition-colors">{pkg.name}</h3>
      <div className="flex items-center gap-2 text-gray-500 mt-1"><MapPin size={16} /> {pkg.district}</div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Calendar size={12} /> {pkg.duration} days</span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Users size={12} /> Max {pkg.maxPeople}</span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><Utensils size={12} /> {pkg.mealPlan || 'N/A'}</span>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div><span className="text-2xl font-bold text-primary">Rs {pkg.price.toLocaleString()}</span><p className="text-xs text-gray-500">per package</p></div>
        <button onClick={() => onViewDetails(pkg)} className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-secondary transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"><Eye size={16} /> View Details</button>
      </div>
    </div>
  </div>
));

const PackageDetailModal = ({ isOpen, onClose, pkg }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen || !pkg) return null;

  const handleBookNow = async () => {
    if (!user) {
      // Store intended booking in session and redirect to login
      sessionStorage.setItem('intendedBooking', JSON.stringify({
        type: 'tour',
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        maxPeople: pkg.maxPeople,
        hotel: pkg.hotel,
        vehicle: pkg.vehicle,
        guide: pkg.guide,
      }));
      toast.error('Please login to book this package');
      navigate('/login');
      return;
    }

    try {
      const bookingPayload = {
        type: 'Tour Package',
        packageName: pkg.name,
        destination: pkg.district,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + pkg.duration * 86400000).toISOString().split('T')[0],
        numberOfDays: parseInt(pkg.duration),
        passengers: 1,
        totalAmount: pkg.price,
        status: 'pending',
        paymentStatus: 'unpaid',
      };

      const res = await API.post('/bookings', bookingPayload);
      const savedBooking = res.data;

      sessionStorage.setItem('pendingBooking', JSON.stringify(savedBooking));
      navigate('/payment');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button onClick={onClose} className="absolute right-5 top-5 z-10 bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:bg-gray-100 transition">
          <X size={22} className="text-gray-600" />
        </button>
        <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-72 object-cover rounded-t-3xl" />
        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold text-primary mb-2">{pkg.name}</h2>
          <div className="flex items-center gap-2 text-gray-600 mb-4"><MapPin size={18} /> {pkg.district}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> Duration: {pkg.duration} days</div>
              <div className="flex items-center gap-2"><Users size={18} className="text-primary" /> Max People: {pkg.maxPeople}</div>
              <div className="flex items-center gap-2"><Star size={18} className="text-primary" /> Best Season: {pkg.bestSeason || 'Year round'}</div>
              <div className="flex items-center gap-2"><Utensils size={18} className="text-primary" /> Meal Plan: {pkg.mealPlan || 'Not specified'}</div>
            </div>
            <div className="space-y-3">
              {pkg.hotel && <div className="flex items-center gap-2"><Home size={18} className="text-primary" /> Hotel: {pkg.hotel.name}</div>}
              {pkg.vehicle && <div className="flex items-center gap-2"><Car size={18} className="text-primary" /> Vehicle: {pkg.vehicle.model} ({pkg.vehicle.type})</div>}
              {pkg.guide && <div className="flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Guide: {pkg.guide.name}</div>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{pkg.description}</p>
          </div>

          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Package size={18} className="text-green-600" /> Inclusions</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.inclusions.map((item, i) => (
                  <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-sm">{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-2xl mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Price</span>
              <span className="text-3xl font-bold text-primary">Rs {pkg.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-outline flex-1">Close</button>
            <button onClick={handleBookNow} className="btn-primary flex-1">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TourPackages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tour-packages', page],
    queryFn: () => API.get(`/tour-packages?page=${page}&limit=12`).then(res => res.data),
    keepPreviousData: true,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const packages = useMemo(() => data?.data || [], [data?.data]);
  const totalPages = data?.totalPages || 1;

  const filteredPackages = useMemo(() => {
    if (!searchTerm) return packages;
    const term = searchTerm.toLowerCase();
    return packages.filter(p => p.name.toLowerCase().includes(term) || p.district.toLowerCase().includes(term));
  }, [packages, searchTerm]);

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  if (isLoading && page === 1) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  if (error) toast.error('Failed to load packages');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-gray-100">
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-24" style={{ backgroundImage: `url(${tourPackagesBg})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Tour Packages</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-95">Discover the best of Sri Lanka with our curated tours</p>
          <div className="mt-10 max-w-md mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition" size={22} />
              <input type="text" placeholder="Search by name or district..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-4 py-4 rounded-full text-dark focus:outline-none focus:ring-4 focus:ring-cta/50 shadow-2xl transition" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {filteredPackages.length === 0 ? <div className="text-center py-16"><p className="text-gray-500 text-xl">No packages found.</p></div> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} onViewDetails={handleViewDetails} />)}
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

      <PackageDetailModal isOpen={showModal} onClose={() => setShowModal(false)} pkg={selectedPackage} />
    </div>
  );
};

export default TourPackages;