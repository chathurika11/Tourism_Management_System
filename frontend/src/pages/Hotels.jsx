import React from 'react';
import { Star, MapPin } from 'lucide-react';

const popularHotels = [
  { id: 1, name: 'Jetwing Blue', location: 'Negombo', price: 120, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  { id: 2, name: 'Heritance Kandalama', location: 'Dambulla', price: 180, rating: 4.9, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
  { id: 3, name: 'Cinnamon Wild', location: 'Yala', price: 150, rating: 4.6, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400' },
  { id: 4, name: 'Amangalla', location: 'Galle Fort', price: 350, rating: 5.0, image: 'https://images.unsplash.com/photo-1557992260-ec58e38d3632?w=400' },
  { id: 5, name: '98 Acres Resort', location: 'Ella', price: 220, rating: 4.9, image: 'https://images.unsplash.com/photo-1582640101010-2e6d5f7d2e8e?w=400' },
  { id: 6, name: 'Grand Hotel', location: 'Nuwara Eliya', price: 200, rating: 4.8, image: 'https://images.unsplash.com/photo-1570197579656-c8c8e6da1a2b?w=400' },
];

const Hotels = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Premium Accommodations</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Experience the finest hospitality Sri Lanka has to offer. From jungle retreats to heritage forts, find your perfect stay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {popularHotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
            <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-primary">{hotel.name}</h3>
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm font-bold">
                  <Star size={14} className="text-cta fill-current" /> {hotel.rating}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4"><MapPin size={16} /> {hotel.location}</div>
              <div className="border-t pt-4 flex justify-between items-center mt-auto">
                <span className="font-bold text-secondary text-lg">Rs: {hotel.price} <span className="text-sm font-normal text-gray-500">/ night</span></span>
                <button className="text-accent font-bold hover:underline">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
