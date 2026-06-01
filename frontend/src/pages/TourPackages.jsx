import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Search, Home, Car, Users, Eye, TrendingDown, Calendar, Clock } from 'lucide-react';
import { tourPackages, calculatePackagePricingFn } from '../data/tourismData';
import TourDetailModal from '../components/TourDetailModal';
import { useTour } from '../context/TourContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TourPackages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addTourFeedback, addBooking } = useTour();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleBookNow = (tour) => {
    if (!user) {
      // Store intended booking in sessionStorage to recover after login
      sessionStorage.setItem('pendingBooking', JSON.stringify({ type: 'package', tourId: tour.id, tourName: tour.name, price: tour.price }));
      toast.error('Please login to book this package');
      navigate('/login');
      return;
    }

    // Create booking object
    const booking = {
      id: Date.now(),
      type: 'Package',
      packageName: tour.name,
      packageId: tour.id,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      passengers: 1,
      totalAmount: tour.price,
      status: 'pending',
      paymentStatus: 'unpaid',
      bookingDate: new Date().toISOString().split('T')[0],
      userId: user.id,
    };

    addBooking(booking);
    toast.success('Booking created! Please complete payment.');
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tour Packages</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">Discover the best of Sri Lanka with SerendiGo's curated tours</p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tours by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-dark focus:outline-none focus:ring-2 focus:ring-cta shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map(pkg => {
            const pricing = calculatePackagePricingFn(pkg);
            const days = parseInt(pkg.duration.split(' ')[0]) || 5;

            return (
              <div key={pkg.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative overflow-hidden h-64">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-cta text-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Star size={14} className="fill-current" /> {pkg.rating}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {pkg.duration}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {days} days</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-primary mb-2 group-hover:text-secondary transition-colors">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mb-3"><MapPin size={16} /> {pkg.location}</div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-primary mb-2 text-sm">✨ Package Includes:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p className="flex items-center gap-1"><Home size={12} className="text-secondary" /> {pkg.includes.hotel.name}</p>
                      <p className="flex items-center gap-1"><Car size={12} className="text-secondary" /> {pkg.includes.vehicle.name}</p>
                      <p className="flex items-center gap-1"><Users size={12} className="text-secondary" /> {pkg.includes.guide.name}</p>
                      <p className="flex items-center gap-1 text-green-600">🍽️ {pkg.mealIncluded}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">Rs {Math.round(pricing.total).toLocaleString()}</span>
                      <p className="text-xs text-green-600">Save Rs {Math.round(pricing.discountAmount).toLocaleString()} (5% off)</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookNow(pkg)}
                        className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-secondary transition flex items-center gap-1 text-sm"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => handleViewDetails(pkg)}
                        className="bg-gray-200 text-primary px-4 py-2 rounded-xl hover:bg-gray-300 transition flex items-center gap-1 text-sm"
                      >
                        <Eye size={16} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No tour packages found matching your search.</p>
          </div>
        )}
      </section>

      <TourDetailModal isOpen={showModal} onClose={() => setShowModal(false)} tour={selectedTour} onAddFeedback={handleAddFeedback} />
    </div>
  );
};

export default TourPackages;