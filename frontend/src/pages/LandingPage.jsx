import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Hotel, ArrowRight, Car, Users, Compass, Award, Clock, Shield, ChevronRight } from 'lucide-react';
import { getAllToursSortedByRating, getAllHotelsSortedByRating, getAllVehiclesSortedByRating, getAllGuidesSortedByRating } from '../data/tourismData';
import home1 from '../images/home1.jpeg';
import home2 from '../images/home2.jpeg';
import home3 from '../images/home3.jpeg';
import home4 from '../images/home4.jpeg';
import home5 from '../images/home5.jpeg';
import home6 from '../images/home6.jpeg';

const backgroundImages = [home1, home2, home3, home4, home5, home6];

const features = [
  { icon: Compass, title: 'Curated Tours', desc: 'Hand-picked cultural and adventure experiences', color: 'bg-primary' },
  { icon: Award, title: 'Certified Guides', desc: 'Expert local guides with certification', color: 'bg-secondary' },
  { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock customer service', color: 'bg-accent' },
  { icon: Shield, title: 'Secure Booking', desc: 'Safe and encrypted transactions', color: 'bg-cta' },
];

const stats = [
  { value: '10K+', label: 'Happy Travelers' },
  { value: '50+', label: 'Tour Packages' },
  { value: '100+', label: 'Hotels' },
  { value: '98%', label: 'Satisfaction' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  
  const popularTours = getAllToursSortedByRating().slice(0, 3);
  const popularHotels = getAllHotelsSortedByRating().slice(0, 3);
  const popularVehicles = getAllVehiclesSortedByRating().slice(0, 3);
  const popularGuides = getAllGuidesSortedByRating().slice(0, 3);

  const handleVehicleClick = (vehicleId) => navigate(`/vehicles/${vehicleId}`);
  const handleHotelClick = (hotelId) => navigate(`/hotels/${hotelId}`);
  const handleTourClick = (tourId) => navigate(`/tours/${tourId}`);
  const handleGuideClick = (guideId) => navigate(`/guides/${guideId}`);

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
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center p-2 shadow-lg border border-white/20">
            <input type="text" placeholder="Search tours, hotels, vehicles, or guides..." className="flex-grow px-6 py-3 rounded-full bg-transparent text-white placeholder-white/70 focus:outline-none" />
            <button className="bg-white text-dark px-6 py-3 rounded-full hover:bg-gray-100 transition flex items-center gap-2 font-semibold">
              <Search size={20} /> Explore Now
            </button>
          </div>
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

      {/* Stats Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="transform hover:scale-110 transition duration-300">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-secondary font-semibold tracking-wider uppercase">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-primary mt-2">Experience Sri Lanka Beautifully</h2>
            <div className="w-20 h-1 bg-cta mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="group text-center p-6 rounded-xl bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition duration-300`}>
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tour Packages */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary">Popular Tour Packages</h2>
              <p className="text-gray-600 mt-1">Highest Rated First</p>
            </div>
            <Link to="/tours" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTours.map(tour => (
              <div key={tour.id} className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleTourClick(tour.id)}>
                <div className="relative overflow-hidden h-56">
                  <img src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-cta text-primary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-current" /> {tour.rating}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-primary mb-1">{tour.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2"><MapPin size={14} /> {tour.location}</div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tour.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">Rs {tour.price.toLocaleString()}</span>
                    <button className="text-accent hover:text-primary text-sm flex items-center gap-1">View Details <ChevronRight size={14} /></button>
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
            <div>
              <h2 className="text-3xl font-bold text-primary">Popular Hotels</h2>
              <p className="text-gray-600 mt-1">Highest Rated First</p>
            </div>
            <Link to="/hotels" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularHotels.map(hotel => (
              <div key={hotel.id} className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleHotelClick(hotel.id)}>
                <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-primary">{hotel.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-xs"><Star size={12} className="text-cta fill-current" />{hotel.rating}</div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm my-2"><Hotel size={14} /> {hotel.location}</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}<span className="text-xs">/night</span></span>
                    <button className="text-accent hover:text-primary text-sm flex items-center gap-1">View Details <ChevronRight size={14} /></button>
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
            <div>
              <h2 className="text-3xl font-bold text-primary">Vehicles for Rent</h2>
              <p className="text-gray-600 mt-1">Highest Rated First</p>
            </div>
            <Link to="/vehicles" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularVehicles.map(vehicle => (
              <div key={vehicle.id} className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleVehicleClick(vehicle.id)}>
                <img src={vehicle.image} alt={vehicle.model} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-primary">{vehicle.model}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-xs"><Star size={12} className="text-cta fill-current" />{vehicle.rating || '4.5'}</div>
                  </div>
                  <p className="text-gray-500 text-sm my-2">{vehicle.type} • {vehicle.location}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-primary">Rs {vehicle.pricePerDay.toLocaleString()}<span className="text-xs">/day</span></span>
                    <button className="text-accent hover:text-primary text-sm flex items-center gap-1">View Details <ChevronRight size={14} /></button>
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
            <div>
              <h2 className="text-3xl font-bold text-primary">Expert Tour Guides</h2>
              <p className="text-gray-600 mt-1">Highest Rated First</p>
            </div>
            <Link to="/guides" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGuides.map(guide => (
              <div key={guide.id} className="group bg-white rounded-xl shadow-lg p-5 text-center cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => handleGuideClick(guide.id)}>
                <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-primary group-hover:border-cta transition-colors" />
                <h3 className="font-bold text-primary">{guide.name}</h3>
                <p className="text-xs text-gray-600">{guide.specialty}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star size={14} className="text-cta fill-current" />
                  <span className="text-sm font-semibold">{guide.rating}</span>
                  <span className="text-xs text-gray-400">({guide.reviews || 0} reviews)</span>
                </div>
                <button className="mt-3 text-accent hover:text-primary text-xs flex items-center justify-center gap-1 w-full">View Details <ChevronRight size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Start Your Sri Lankan Journey Today</h2>
          <p className="text-lg mb-8 opacity-90">Plan your perfect trip with SerendiGo - your trusted travel partner</p>
          <Link to="/register" className="bg-cta text-primary px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition inline-block shadow-lg hover:scale-105 transform transition-all">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;