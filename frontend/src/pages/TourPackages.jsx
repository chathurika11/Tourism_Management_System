import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Search, Car, Home, Users } from 'lucide-react';

const TourPackages = () => {
    const [packages] = useState([
        { _id: 1, name: 'Cultural Triangle Tour', location: 'Kandy, Sigiriya', price: 250, rating: 4.8, description: 'Explore ancient cities and Buddhist temples', image: 'https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=400', includes: { hotel: 'Cinnamon Lodge', vehicle: 'Toyota Axio', guide: 'Priya Samarawickrama' } },
        { _id: 2, name: 'Galle Day Tour', location: 'Galle Fort', price: 180, rating: 4.5, description: 'Visit the historic Dutch fort', image: 'https://images.unsplash.com/photo-1557992260-ec58e38d3632?w=400', includes: { hotel: 'Amangalla', vehicle: 'Nissan Caravan', guide: 'Lakmini Silva' } },
        { _id: 3, name: 'Ella Escape', location: 'Ella', price: 220, rating: 4.9, description: 'Scenic train ride and hiking', image: 'https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=400', includes: { hotel: '98 Acres Resort', vehicle: 'Toyota Prado', guide: 'Nuwan Jayawardene' } },
        { _id: 4, name: 'Nuwara Eliya Highlands', location: 'Nuwara Eliya', price: 300, rating: 4.7, description: 'Tea plantations and cool climate', image: 'https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=400', includes: { hotel: 'Grand Hotel', vehicle: 'Toyota Prado', guide: 'Samantha Perera' } },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-4">Tour Packages</h1>
            <p className="text-center text-gray-600 mb-12">Discover the best of Sri Lanka with SerendiGo's curated tours</p>

            <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPackages.map(pkg => (
                    <div key={pkg._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-56 object-cover" />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-xl">{pkg.name}</h3>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-secondary fill-current" /> {pkg.rating}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 mb-3">
                                <MapPin size={16} /> {pkg.location}
                            </div>
                            <p className="text-gray-600 mb-4">{pkg.description}</p>
                            
                            {/* Included Amenities */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-700 space-y-1">
                                <p className="font-semibold text-primary mb-1 border-b pb-1">Package Includes:</p>
                                <p className="flex items-center gap-1"><Home size={12} className="text-secondary" /> {pkg.includes.hotel}</p>
                                <p className="flex items-center gap-1"><Car size={12} className="text-secondary" /> {pkg.includes.vehicle}</p>
                                <p className="flex items-center gap-1"><Users size={12} className="text-secondary" /> {pkg.includes.guide}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-primary">Rs: {pkg.price}</span>
                                <Link to={`/tours/${pkg._id}`} className="btn-primary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourPackages;