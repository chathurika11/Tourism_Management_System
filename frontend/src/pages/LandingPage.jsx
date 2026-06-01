import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Car, Users, Compass, Award, Clock, Shield, ChevronRight, Hotel } from 'lucide-react';
import { getAllToursSortedByRating, getAllHotelsSortedByRating, getAllVehiclesSortedByRating, getAllGuidesSortedByRating } from '../data/tourismData';
import home1 from '../images/home1.jpeg';
import home2 from '../images/home2.jpeg';
import home3 from '../images/home3.jpeg';
import home4 from '../images/home4.jpeg';
import home5 from '../images/home5.jpeg';
import home6 from '../images/home6.jpeg';

const backgroundImages = [home1, home2, home3, home4, home5, home6];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ tours: [], hotels: [], vehicles: [], guides: [] });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const popularTours = getAllToursSortedByRating().slice(0, 3);
  const popularHotels = getAllHotelsSortedByRating().slice(0, 3);
  const popularVehicles = getAllVehiclesSortedByRating().slice(0, 3);
  const popularGuides = getAllGuidesSortedByRating().slice(0, 3);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();
    const allTours = getAllToursSortedByRating();
    const allHotels = getAllHotelsSortedByRating();
    const allVehicles = getAllVehiclesSortedByRating();
    const allGuides = getAllGuidesSortedByRating();

    const filteredTours = allTours.filter(tour =>
      tour.name.toLowerCase().includes(term) ||
      tour.location.toLowerCase().includes(term) ||
      tour.district?.toLowerCase().includes(term)
    );
    const filteredHotels = allHotels.filter(hotel =>
      hotel.name.toLowerCase().includes(term) ||
      hotel.location.toLowerCase().includes(term) ||
      hotel.district?.toLowerCase().includes(term)
    );
    const filteredVehicles = allVehicles.filter(vehicle =>
      vehicle.model.toLowerCase().includes(term) ||
      vehicle.type.toLowerCase().includes(term) ||
      vehicle.location.toLowerCase().includes(term) ||
      vehicle.district?.toLowerCase().includes(term)
    );
    const filteredGuides = allGuides.filter(guide =>
      guide.name.toLowerCase().includes(term) ||
      guide.specialty.toLowerCase().includes(term) ||
      guide.location.toLowerCase().includes(term) ||
      guide.district?.toLowerCase().includes(term)
    );

    setSearchResults({
      tours: filteredTours,
      hotels: filteredHotels,
      vehicles: filteredVehicles,
      guides: filteredGuides,
    });
    setShowResults(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {backgroundImages.map((image, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === currentBgIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4 tracking-wider border border-white/20">✦ WELCOME TO PARADISE ✦</span>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">SerendiGo</h1>
          <p className="text-2xl md:text-3xl mb-3 drop-shadow-lg font-light">DISCOVER · EXPERIENCE · BELONG</p>
          <p className="text-lg mb-8 drop-shadow-lg">Experience Sri Lanka Beautifully with our curated tours</p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center p-2 shadow-lg border border-white/20">
            <input
              type="text"
              placeholder="Search tours, hotels, vehicles, or guides by name or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-6 py-3 rounded-full bg-transparent text-white placeholder-white/70 focus:outline-none"
            />
            <button type="submit" className="bg-white text-dark px-6 py-3 rounded-full hover:bg-gray-100 transition flex items-center gap-2 font-semibold">
              <Search size={20} /> Search
            </button>
          </form>
          <div className="mt-6 flex justify-center gap-2">
            {backgroundImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentBgIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentBgIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Results Modal / Section */}
      {showResults && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto p-4" onClick={clearSearch}>
          <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 mt-20" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Search Results for "{searchTerm}"</h2>
              <button onClick={clearSearch} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            {/* Tours */}
            {searchResults.tours.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Tour Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.tours.map(tour => (
                    <div key={tour.id} className="border rounded-lg p-3 hover:shadow-lg cursor-pointer" onClick={() => navigate(`/tours/${tour.id}`)}>
                      <img src={tour.image} alt={tour.name} className="w-full h-32 object-cover rounded mb-2" />
                      <h4 className="font-bold">{tour.name}</h4>
                      <p className="text-sm text-gray-600">{tour.location}</p>
                      <p className="text-primary font-bold">Rs {tour.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Hotels */}
            {searchResults.hotels.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Hotels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.hotels.map(hotel => (
                    <div key={hotel.id} className="border rounded-lg p-3 hover:shadow-lg cursor-pointer" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                      <img src={hotel.image} alt={hotel.name} className="w-full h-32 object-cover rounded mb-2" />
                      <h4 className="font-bold">{hotel.name}</h4>
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                      <p className="text-primary font-bold">Rs {hotel.pricePerNight}/night</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Vehicles */}
            {searchResults.vehicles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.vehicles.map(vehicle => (
                    <div key={vehicle.id} className="border rounded-lg p-3 hover:shadow-lg cursor-pointer" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                      <img src={vehicle.image} alt={vehicle.model} className="w-full h-32 object-cover rounded mb-2" />
                      <h4 className="font-bold">{vehicle.model}</h4>
                      <p className="text-sm text-gray-600">{vehicle.type} - {vehicle.location}</p>
                      <p className="text-primary font-bold">Rs {vehicle.pricePerDay}/day</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Guides */}
            {searchResults.guides.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-3">Tour Guides</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.guides.map(guide => (
                    <div key={guide.id} className="border rounded-lg p-3 hover:shadow-lg cursor-pointer" onClick={() => navigate(`/guides/${guide.id}`)}>
                      <img src={guide.image} alt={guide.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                      <h4 className="font-bold text-center">{guide.name}</h4>
                      <p className="text-sm text-gray-600 text-center">{guide.specialty}</p>
                      <p className="text-primary font-bold text-center">Rs {guide.pricePerDay}/day</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchResults.tours.length === 0 && searchResults.hotels.length === 0 && searchResults.vehicles.length === 0 && searchResults.guides.length === 0 && (
              <p className="text-gray-500 text-center py-8">No results found for "{searchTerm}". Try a different search term.</p>
            )}
          </div>
        </div>
      )}

      {/* Rest of the landing page (stats, features, popular sections) - keep as is */}
      {/* ... */}
    </div>
  );
};

export default LandingPage;