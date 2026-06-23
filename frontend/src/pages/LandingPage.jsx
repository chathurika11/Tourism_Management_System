import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, MapPin, Compass, Award, Shield, Hotel, ArrowRight, Clock, X } from 'lucide-react';
import API from '../services/api';
import home1 from '../images/home1.jpeg';
import home2 from '../images/home2.jpeg';
import home3 from '../images/home3.jpeg';
import home4 from '../images/home4.jpeg';
import home5 from '../images/home5.jpeg';
import home6 from '../images/home6.jpeg';

const backgroundImages = [home1, home2, home3, home4, home5, home6];

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `http://localhost:5000/${cleanPath}`;
};

const formatPrice = (price) => (price === undefined || price === null) ? '0' : price.toLocaleString();

const LandingPage = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [activeFilters, setActiveFilters] = useState({ name: '', district: '' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data (limit 100 for broader search)
  const { data: hotelsData, isLoading: hotelsLoading } = useQuery({
    queryKey: ['home-hotels'],
    queryFn: async () => {
      const res = await API.get('/hotels?page=1&limit=100');
      const hotels = res.data?.data || [];
      return hotels.filter(h => h.pricePerNight !== undefined && h.rating !== undefined);
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['home-vehicles'],
    queryFn: async () => {
      const res = await API.get('/vehicles?page=1&limit=100');
      const vehicles = res.data?.data || [];
      return vehicles.filter(v => v.pricePerDay !== undefined && v.rating !== undefined);
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: guidesData, isLoading: guidesLoading } = useQuery({
    queryKey: ['home-guides'],
    queryFn: async () => {
      const res = await API.get('/guides?page=1&limit=100');
      const guides = res.data?.data || [];
      return guides.filter(g => g.rating !== undefined);
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['home-packages'],
    queryFn: async () => {
      const res = await API.get('/tour-packages?page=1&limit=100');
      const packages = res.data?.data || [];
      return packages.filter(p => p.price !== undefined && p.rating !== undefined);
    },
    staleTime: 2 * 60 * 1000,
  });

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

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({ name: searchName.trim(), district: searchDistrict.trim() });
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchDistrict('');
    setActiveFilters({ name: '', district: '' });
  };

  // ---- Filter functions ----
  const matchesName = (item, fields) => {
    if (!activeFilters.name) return true;
    const q = activeFilters.name.toLowerCase();
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(q);
    });
  };

  const matchesDistrict = (item) => {
    if (!activeFilters.district) return true;
    const q = activeFilters.district.toLowerCase();
    const locationFields = ['location', 'district', 'city', 'area'];
    return locationFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(q);
    });
  };

  const filterItems = (items, nameFields) => {
    if (!items) return [];
    return items.filter(item => matchesName(item, nameFields) && matchesDistrict(item));
  };

  const filteredHotels = filterItems(hotelsData, ['name', 'location']);
  const filteredVehicles = filterItems(vehiclesData, ['model', 'type', 'location']);
  const filteredGuides = filterItems(guidesData, ['name', 'specialty']);
  const filteredPackages = filterItems(packagesData, ['name', 'district']);

  const hasFilters = activeFilters.name || activeFilters.district;
  const hasResults = filteredHotels.length > 0 || filteredVehicles.length > 0 || filteredGuides.length > 0 || filteredPackages.length > 0;
  const noResults = hasFilters && !hasResults;

  // ---- Render functions ----
  const renderPopularHotels = (hotels = hotelsData) => {
    if (hotelsLoading) return <p className="text-gray-500">Loading hotels...</p>;
    if (!hotels?.length) return <p className="text-gray-500">No hotels found</p>;
    return hotels.map(hotel => (
      <div key={hotel.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-primary">{hotel.name}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">
              <Star size={12} className="text-cta fill-current" /> {hotel.rating?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm my-2"><Hotel size={14} /> {hotel.location || 'N/A'}</div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-bold text-primary">Rs {formatPrice(hotel.pricePerNight)}<span className="text-xs">/night</span></span>
          </div>
        </div>
      </div>
    ));
  };

  const renderPopularVehicles = (vehicles = vehiclesData) => {
    if (vehiclesLoading) return <p className="text-gray-500">Loading vehicles...</p>;
    if (!vehicles?.length) return <p className="text-gray-500">No vehicles found</p>;
    return vehicles.map(vehicle => (
      <div key={vehicle.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <img src={getImageUrl(vehicle.image)} alt={vehicle.model} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-primary">{vehicle.model}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">
              <Star size={12} className="text-cta fill-current" /> {vehicle.rating?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <p className="text-gray-500 text-sm my-2">{vehicle.type} • {vehicle.location}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-bold text-primary">Rs {formatPrice(vehicle.pricePerDay)}<span className="text-xs">/day</span></span>
          </div>
        </div>
      </div>
    ));
  };

  const renderPopularGuides = (guides = guidesData) => {
    if (guidesLoading) return <p className="text-gray-500">Loading guides...</p>;
    if (!guides?.length) return <p className="text-gray-500">No guides found</p>;
    return guides.map(guide => (
      <div key={guide.id} className="group bg-white rounded-xl shadow-lg p-5 text-center transform hover:scale-105 transition-all duration-300">
        <img src={getImageUrl(guide.image)} alt={guide.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-primary group-hover:border-cta transition-colors" loading="lazy" />
        <h3 className="font-bold text-primary">{guide.name}</h3>
        <p className="text-xs text-gray-600">{guide.specialty}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Star size={14} className="text-cta fill-current" />
          <span className="text-sm font-semibold">{guide.rating?.toFixed(1) || 'N/A'}</span>
          <span className="text-xs text-gray-400">({guide.reviews || 0} reviews)</span>
        </div>
      </div>
    ));
  };

  const renderPopularPackages = (packages = packagesData) => {
    if (packagesLoading) return <p className="text-gray-500">Loading tour packages...</p>;
    if (!packages?.length) return <p className="text-gray-500">No tour packages found</p>;
    return packages.map(pkg => (
      <div key={pkg.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-primary">{pkg.name}</h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">
              <Star size={12} className="text-cta fill-current" /> {pkg.rating?.toFixed(1) || 'N/A'}
            </div>
          </div>
          <p className="text-gray-500 text-sm my-2"><MapPin size={14} className="inline mr-1" />{pkg.district}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-bold text-primary">Rs {formatPrice(pkg.price)}<span className="text-xs">/package</span></span>
          </div>
        </div>
      </div>
    ));
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

          {/* Two‑field search form – DISTRICT FIRST */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
            <div className="flex flex-col md:flex-row gap-3">
              {/* District / Location – now first */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by district / location (e.g., Kandy, Galle)..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none border border-white/10"
                />
              </div>
              {/* Name – second */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name (tour, hotel, vehicle, guide)..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none border border-white/10"
                />
              </div>
              <button type="submit" className="bg-white text-dark px-6 py-3 rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2 font-semibold whitespace-nowrap">
                <Search size={20} /> Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-center gap-2">
            {backgroundImages.map((_, idx) => (
              <button key={idx} type="button" onClick={() => setCurrentBgIndex(idx)} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentBgIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white'}`} aria-label={`Slide ${idx + 1}`} />
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
              <div key={idx} className="group text-center p-6 rounded-xl bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-primary hover:text-white cursor-pointer">
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition duration-300 group-hover:bg-white`}>
                  <feature.icon className="text-white group-hover:text-primary transition" size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-white transition">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-200 transition">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SEARCH RESULTS SECTION (only visible when filters are active) ---- */}
      {hasFilters && (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-primary">
                Search Results
                {activeFilters.name && <span className="text-lg font-normal ml-2">for “{activeFilters.name}”</span>}
                {activeFilters.district && <span className="text-lg font-normal ml-2">in “{activeFilters.district}”</span>}
              </h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition text-gray-700"
              >
                <X size={18} /> Clear Filters
              </button>
            </div>

            {noResults && (
              <p className="text-gray-500 text-center py-8">No results found. Try different keywords.</p>
            )}

            {hasResults && (
              <>
                {filteredPackages.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Tour Packages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {renderPopularPackages(filteredPackages)}
                    </div>
                  </div>
                )}
                {filteredHotels.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Hotels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {renderPopularHotels(filteredHotels)}
                    </div>
                  </div>
                )}
                {filteredVehicles.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Vehicles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {renderPopularVehicles(filteredVehicles)}
                    </div>
                  </div>
                )}
                {filteredGuides.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Tour Guides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {renderPopularGuides(filteredGuides)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ---- Regular sections (only shown when NOT filtering) ---- */}
      {!hasFilters && (
        <>
          {/* Popular Tour Packages */}
          <section className="py-16 bg-cream">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div><h2 className="text-3xl font-bold text-primary">Popular Tour Packages</h2><p className="text-gray-600 mt-1">Highest Rated First</p></div>
                <Link to="/tours" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{renderPopularPackages()}</div>
            </div>
          </section>

          {/* Popular Hotels */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div><h2 className="text-3xl font-bold text-primary">Popular Hotels</h2><p className="text-gray-600 mt-1">Highest Rated First</p></div>
                <Link to="/hotels" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{renderPopularHotels()}</div>
            </div>
          </section>

          {/* Vehicles for Rent */}
          <section className="py-16 bg-cream">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div><h2 className="text-3xl font-bold text-primary">Vehicles for Rent</h2><p className="text-gray-600 mt-1">Highest Rated First</p></div>
                <Link to="/vehicles" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{renderPopularVehicles()}</div>
            </div>
          </section>

          {/* Expert Tour Guides */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div><h2 className="text-3xl font-bold text-primary">Expert Tour Guides</h2><p className="text-gray-600 mt-1">Highest Rated First</p></div>
                <Link to="/guides" className="text-secondary hover:text-primary flex items-center gap-1">View All <ArrowRight size={16} /></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{renderPopularGuides()}</div>
            </div>
          </section>
        </>
      )}

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