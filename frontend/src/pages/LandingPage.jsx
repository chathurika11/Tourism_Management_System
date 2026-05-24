import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Map, Users, Home, Car } from 'lucide-react';

const LandingPage = () => {
  // Sample data for sections
  const popularPackages = [
    { id: 1, name: 'Cultural Triangle', location: 'Kandy, Sigiriya', price: 45000, rating: 4.8, image: 'https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=400', includes: { hotel: 'Cinnamon Lodge Habarana', vehicle: 'Toyota Axio', guide: 'Priya Samarawickrama' } },
    { id: 2, name: 'Galle Fort Tour', location: 'Galle', price: 38000, rating: 4.5, image: 'https://images.unsplash.com/photo-1557992260-ec58e38d3632?w=400', includes: { hotel: 'Amangalla', vehicle: 'Nissan Caravan', guide: 'Lakmini Silva' } },
    { id: 3, name: 'Ella Highlands', location: 'Ella', price: 42000, rating: 4.9, image: 'https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=400', includes: { hotel: '98 Acres Resort', vehicle: 'Toyota Prado', guide: 'Nuwan Jayawardene' } },
  ];

  const popularHotels = [
    { id: 1, name: 'Jetwing Blue', location: 'Negombo', price: 12000, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    { id: 2, name: 'Heritance Kandalama', location: 'Dambulla', price: 18000, rating: 4.9, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
    { id: 3, name: 'Cinnamon Wild', location: 'Yala', price: 15000, rating: 4.6, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400' },
  ];

  const popularVehicles = [
    { id: 1, type: 'Scooter', model: 'Honda Dio', price: 2000, location: 'Colombo' },
    { id: 2, type: 'Car', model: 'Toyota Corolla', price: 2500, location: 'Kandy' },
    { id: 3, type: 'Van', model: 'Nissan Caravan', price: 3000, location: 'Ella' },
  ];

  const popularGuides = [
    { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural Tours', location: 'Kandy', price: 3000, rating: 4.9 },
    { id: 2, name: 'Samantha Perera', specialty: 'Wildlife', location: 'Yala', price: 4000, rating: 4.8 },
    { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking (Adventure)', location: 'Ella', price: 5000, rating: 4.7 },
  ];

  return (
    <div>
      {/* Hero Section with Search */}
      <section className="relative h-[650px] flex items-center justify-center bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=1600)' }}>
        <div className="absolute inset-0 bg-primary/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mt-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-cta drop-shadow-xl">SerendiGo</h1>
          <p className="text-2xl md:text-3xl mb-10 font-light tracking-wide drop-shadow-md text-gray-100">Experience Sri Lanka Beautifully</p>
          <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-full flex items-center p-2 shadow-2xl border border-white/40 transform hover:scale-[1.02] transition-transform duration-300">
            <Search className="text-primary ml-4" size={24} />
            <input type="text" placeholder="Search tours, hotels, vehicles, or guides..." className="flex-grow px-4 py-4 bg-transparent text-lg text-dark focus:outline-none placeholder-gray-500 font-medium" />
            <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold text-lg">
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Popular Tour Packages */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">Popular Tour Packages</h2>
          <p className="text-center text-gray-600 mb-12">Discover Sri Lanka's most loved destinations</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularPackages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <img src={pkg.image} alt={pkg.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="font-bold text-xl text-primary">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2"><MapPin size={16} /> {pkg.location}</div>
                  
                  {/* Included Amenities */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-700 space-y-1">
                    <p className="font-semibold text-primary mb-1 border-b pb-1">Package Includes:</p>
                    <p className="flex items-center gap-1"><Home size={12} className="text-secondary" /> {pkg.includes.hotel}</p>
                    <p className="flex items-center gap-1"><Car size={12} className="text-secondary" /> {pkg.includes.vehicle}</p>
                    <p className="flex items-center gap-1"><Users size={12} className="text-secondary" /> {pkg.includes.guide}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1"><Star size={16} className="text-cta fill-current" /> {pkg.rating}</div>
                    <span className="font-bold text-secondary">Rs: {pkg.price}</span>
                  </div>
                  <Link to={`/booking/${pkg.id}`} className="btn-primary w-full mt-3 block text-center">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Hotels */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">Popular Hotels</h2>
          <p className="text-center text-gray-600 mb-12">Stay at Sri Lanka's finest accommodations</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularHotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="font-bold text-xl text-primary">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2"><Home size={16} /> {hotel.location}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1"><Star size={16} className="text-cta fill-current" /> {hotel.rating}</div>
                    <span className="font-bold text-secondary">Rs: {hotel.price}/night</span>
                  </div>
                  <Link to={`/booking/${hotel.id}`} className="btn-secondary w-full mt-3 block text-center">Book Hotel</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles & Tour Guides Combined Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Vehicles Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2"><Map /> Vehicles for Rent</h2>
              <div className="space-y-4">
                {popularVehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex items-center gap-4 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                    <div className="bg-cream p-3 rounded-full text-primary">
                      <Car />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{vehicle.model}</h3>
                      <p className="text-gray-600">{vehicle.type} • {vehicle.location}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-secondary font-bold">Rs: {vehicle.price}/day</p>
                      <Link to="/vehicles" className="text-accent text-sm hover:underline">View Details →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Guides Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary flex items-center gap-2"><Users /> Expert Tour Guides</h2>
              <div className="space-y-4">
                {popularGuides.map(guide => (
                  <div key={guide.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center transform hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                    <div>
                      <h3 className="font-bold text-lg">{guide.name}</h3>
                      <p className="text-gray-600">{guide.specialty} • {guide.location}</p>
                    </div>
                    <div className="text-right ml-auto">
                      <div className="flex items-center justify-end gap-1 mb-1"><Star size={14} className="text-cta fill-current" /> {guide.rating}</div>
                      <p className="text-secondary font-bold text-sm mb-1">Rs: {guide.price}/day</p>
                      <Link to="/guides" className="text-accent font-semibold text-sm hover:underline">View Guide →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative bg-cover bg-center bg-fixed overflow-hidden" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=1600)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cta to-white">Start Your Sri Lankan Journey</h2>
          <p className="mb-10 text-xl md:text-2xl font-light text-gray-200">Plan your perfect trip with SerendiGo - your trusted travel partner</p>
          <Link to="/register" className="bg-cta text-primary px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(93,248,216,0.6)] transform hover:-translate-y-2 transition-all duration-300 inline-block">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;