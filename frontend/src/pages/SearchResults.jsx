import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Hotel, Car, Users, Calendar, Eye } from 'lucide-react';
import API, { getImageUrl } from '../services/api';

const SearchResults = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => API.get(`/search?q=${encodeURIComponent(query)}`).then(res => res.data),
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Please enter a search term.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-red-500 text-center">
        Error loading search results.
      </div>
    );
  }

  const { packages = [], hotels = [], vehicles = [], guides = [] } = data || {};
  const totalResults = packages.length + hotels.length + vehicles.length + guides.length;

  if (totalResults === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-primary">No results found for "{query}"</h2>
        <p className="text-gray-500 mt-2">Try searching for a different district.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const ResultSection = ({ title, icon: Icon, items, renderItem }) =>
    items.length > 0 && (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Icon size={20} /> {title} ({items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => renderItem(item))}
        </div>
      </div>
    );

  const renderPackage = (pkg) => (
    <div key={pkg.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
      <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-32 object-cover" />
      <div className="p-3">
        <h4 className="font-bold text-primary truncate">{pkg.name}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {pkg.district}</p>
        <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-400 fill-current" /> {pkg.rating}</div>
        <p className="text-primary font-bold mt-1">Rs {pkg.price.toLocaleString()}</p>
        <Link to={`/tours/${pkg.id}`} className="btn-outline text-xs mt-2 inline-block">View Details</Link>
      </div>
    </div>
  );

  const renderHotel = (hotel) => (
    <div key={hotel.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
      <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-32 object-cover" />
      <div className="p-3">
        <h4 className="font-bold text-primary truncate">{hotel.name}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {hotel.location}</p>
        <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-400 fill-current" /> {hotel.rating}</div>
        <p className="text-primary font-bold mt-1">Rs {hotel.pricePerNight.toLocaleString()}/night</p>
        <Link to={`/hotels/${hotel.id}`} className="btn-outline text-xs mt-2 inline-block">View Details</Link>
      </div>
    </div>
  );

  const renderVehicle = (vehicle) => (
    <div key={vehicle.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
      <img src={getImageUrl(vehicle.image)} alt={vehicle.model} className="w-full h-32 object-cover" />
      <div className="p-3">
        <h4 className="font-bold text-primary truncate">{vehicle.model}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {vehicle.location}</p>
        <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-400 fill-current" /> {vehicle.rating}</div>
        <p className="text-primary font-bold mt-1">Rs {vehicle.pricePerDay.toLocaleString()}/day</p>
        <Link to={`/vehicles/${vehicle.id}`} className="btn-outline text-xs mt-2 inline-block">View Details</Link>
      </div>
    </div>
  );

  const renderGuide = (guide) => (
    <div key={guide.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition p-4">
      <div className="flex items-center gap-3">
        <img src={getImageUrl(guide.image)} alt={guide.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h4 className="font-bold text-primary">{guide.name}</h4>
          <p className="text-sm text-gray-500">{guide.specialty}</p>
          <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-400 fill-current" /> {guide.rating}</div>
          <p className="text-primary font-bold mt-1">Rs {guide.pricePerDay.toLocaleString()}/day</p>
          <Link to={`/guides/${guide.id}`} className="btn-outline text-xs mt-2 inline-block">View Details</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-primary mb-2">Search results for "{query}"</h2>
      <p className="text-gray-500 mb-6">Found {totalResults} results</p>

      <ResultSection title="Tour Packages" icon={Calendar} items={packages} renderItem={renderPackage} />
      <ResultSection title="Hotels" icon={Hotel} items={hotels} renderItem={renderHotel} />
      <ResultSection title="Vehicles" icon={Car} items={vehicles} renderItem={renderVehicle} />
      <ResultSection title="Guides" icon={Users} items={guides} renderItem={renderGuide} />
    </div>
  );
};

export default SearchResults;