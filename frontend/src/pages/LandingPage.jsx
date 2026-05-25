import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Car, Hotel, ArrowRight } from 'lucide-react';
import { getAllToursSortedByRating, getAllHotelsSortedByRating, getAllVehiclesSortedByRating, getAllGuidesSortedByRating } from '../data/tourismData';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const popularTours = getAllToursSortedByRating().slice(0, 4);
  const popularHotels = getAllHotelsSortedByRating().slice(0, 4);
  const popularVehicles = getAllVehiclesSortedByRating().slice(0, 4);
  const popularGuides = getAllGuidesSortedByRating().slice(0, 4);

  const handleVehicleClick = (vehicleId) => navigate(`/vehicles/${vehicleId}`);
  const handleHotelClick = (hotelId) => navigate(`/hotels/${hotelId}`);
  const handleTourClick = (tourId) => navigate(`/tours/${tourId}`);
  const handleGuideClick = (guideId) => navigate(`/guides/${guideId}`);

  // Helper function to safely format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    return price.toLocaleString();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(data:image/jpeg;base64,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)' }}>
        <div className="absolute inset-0 bg-primary/60"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">SerendiGo</h1>
          <p className="text-xl md:text-2xl mb-4">DISCOVER · EXPERIENCE · BELONG</p>
          <p className="text-lg mb-8">Experience Sri Lanka Beautifully</p>
          <div className="max-w-2xl mx-auto bg-white rounded-full flex items-center p-2 shadow-lg">
            <input type="text" placeholder="Search tours, hotels, vehicles, or guides..." className="flex-grow px-6 py-3 rounded-full text-dark focus:outline-none" />
            <button className="bg-primary text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition flex items-center gap-2">
              <Search size={20} /> Search
            </button>
          </div>
        </div>
      </section>

      {/* Popular Tour Packages */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div><h2 className="text-3xl font-bold text-primary">Popular Tour Packages</h2><p className="text-gray-600 mt-2">Highest Rated First</p></div>
            <Link to="/tours" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTours.map(tour => (
              <div key={tour.id} className="card cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleTourClick(tour.id)}>
                <img src={tour.image} alt={tour.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-primary">{tour.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full"><Star size={14} className="text-cta fill-current" />{tour.rating}</div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 my-1 text-sm"><MapPin size={14} /> {tour.location}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-secondary">Rs: {tour.price ? tour.price.toLocaleString() : 'Contact Us'}</span>
                    <button className="text-accent hover:text-primary text-sm">View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Hotels */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div><h2 className="text-3xl font-bold text-primary">Popular Hotels</h2><p className="text-gray-600 mt-2">Highest Rated First</p></div>
            <Link to="/hotels" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularHotels.map(hotel => (
              <div key={hotel.id} className="card cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleHotelClick(hotel.id)}>
                <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-primary">{hotel.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full"><Star size={14} className="text-cta fill-current" />{hotel.rating}</div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 my-1 text-sm"><Hotel size={14} /> {hotel.location}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-secondary">Rs {hotel.pricePerNight ? hotel.pricePerNight.toLocaleString() : 'Contact Us'}<span className="text-xs">/night</span></span>
                    <button className="text-accent hover:text-primary text-sm">View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Vehicles */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div><h2 className="text-3xl font-bold text-primary">Vehicles for Rent</h2><p className="text-gray-600 mt-2">Highest Rated First</p></div>
            <Link to="/vehicles" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularVehicles.map(vehicle => (
              <div key={vehicle.id} className="card cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleVehicleClick(vehicle.id)}>
                <img src={vehicle.image} alt={vehicle.model} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-primary">{vehicle.model}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full"><Star size={14} className="text-cta fill-current" />{vehicle.rating || '4.5'}</div>
                  </div>
                  <p className="text-gray-600 my-1 text-sm">{vehicle.type} • {vehicle.location}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-secondary">Rs: {vehicle.pricePerDay ? vehicle.pricePerDay.toLocaleString() : 'Contact Us'}<span className="text-xs">/day</span></span>
                    <button className="text-accent hover:text-primary text-sm">View Details →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div><h2 className="text-3xl font-bold text-primary">Expert Tour Guides</h2><p className="text-gray-600 mt-2">Highest Rated First</p></div>
            <Link to="/guides" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGuides.map(guide => (
              <div key={guide.id} className="card cursor-pointer text-center p-4 transform hover:scale-105 transition-all duration-300" onClick={() => handleGuideClick(guide.id)}>
                <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-primary" />
                <h3 className="font-bold text-primary">{guide.name}</h3>
                <p className="text-xs text-gray-600">{guide.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star size={14} className="text-cta fill-current" />
                  <span className="text-sm font-semibold">{guide.rating}</span>
                  <span className="text-xs text-gray-400 ml-1">({guide.reviews || 0} reviews)</span>
                </div>
                <button className="mt-2 text-accent hover:text-primary text-xs">View Details →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Start Your Sri Lankan Journey Today</h2>
          <p className="mb-8">Plan your perfect trip with SerendiGo - your trusted travel partner</p>
          <Link to="/register" className="bg-cta text-primary px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition inline-block">Create Free Account</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
