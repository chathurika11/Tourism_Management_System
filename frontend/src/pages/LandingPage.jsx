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
      <section className="relative h-[600px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(https://images.pexels.com/photos/1603657/sigiriya-lion-rock-sri-lanka-fortress-1603657.jpeg?w=1600)' }}>
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