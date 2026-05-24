import React from 'react';
import { Star, Award } from 'lucide-react';

const popularGuides = [
  { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', location: 'Kandy & Cultural Triangle', rating: 4.9, reviews: 124, language: 'English, German', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
  { id: 2, name: 'Samantha Perera', specialty: 'Wildlife & Nature Safaris', location: 'Yala & Udawalawe', rating: 4.8, reviews: 98, language: 'English, French', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400' },
  { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', location: 'Ella & Nuwara Eliya', rating: 4.7, reviews: 85, language: 'English', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400' },
  { id: 4, name: 'Lakmini Silva', specialty: 'Culinary & City Tours', location: 'Colombo & Galle', rating: 4.9, reviews: 156, language: 'English, Mandarin', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
];

const TourGuides = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">Expert Tour Guides</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Enhance your journey with our knowledgeable local guides who bring the magic of Sri Lanka to life.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {popularGuides.map(guide => (
          <div key={guide.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <div className="flex gap-6 items-start mb-6 border-b pb-6">
              <img src={guide.image} alt={guide.name} className="w-20 h-20 rounded-full object-cover border-4 border-cream shadow-md flex-shrink-0" />
              <div className="flex-grow flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-primary flex items-center gap-1 mb-1">{guide.name} <Award size={18} className="text-cta" /></h3>
                  <p className="text-secondary text-sm font-semibold">{guide.specialty}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm font-bold shadow-sm"><Star size={14} className="text-cta fill-current" /> {guide.rating}</div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{guide.reviews} reviews</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
              <p className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-semibold text-primary">Locations:</span> 
                <span>{guide.location}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-primary">Languages:</span> 
                <span>{guide.language}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourGuides;
