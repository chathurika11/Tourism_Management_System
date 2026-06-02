import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Eye, Globe, Calendar, MapPin, Search, Users } from 'lucide-react';
import { tourGuides } from '../data/tourismData';
import GuideDetailModal from '../components/GuideDetailModal';
import { useTour } from '../context/TourContext';
import guidesBg from '../images/ExpertTourGuides.jpg';

const TourGuides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { addGuideFeedback } = useTour();

  const filteredGuides = tourGuides.filter(guide =>
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (guide) => {
    setSelectedGuide(guide);
    setShowModal(true);
  };

  const handleAddFeedback = (feedback) => {
    addGuideFeedback(feedback);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-20"
        style={{ backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.7), rgba(10, 25, 47, 0.7)), url(${guidesBg})` }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Expert Tour Guides</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">Enhance your journey with our knowledgeable local guides who bring the magic of Sri Lanka to life</p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-200" size={20} />
              <input
                type="text"
                placeholder="Search guides by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-dark focus:outline-none focus:ring-2 focus:ring-cta shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative overflow-hidden">
                  <img src={guide.image} alt={guide.name} className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-cta text-primary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-current" /> {guide.rating}
                  </div>
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-2xl text-primary group-hover:text-secondary transition-colors">{guide.name}</h3>
                    <Award size={24} className="text-cta" />
                  </div>
                  <p className="text-secondary font-semibold mb-3">{guide.specialty}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Service Areas: {guide.location}</p>
                    <p className="flex items-center gap-2"><Globe size={16} className="text-primary" /> Languages: {guide.language}</p>
                    <p className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> Experience: {guide.experience}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-xl font-bold text-primary">Rs {guide.pricePerDay.toLocaleString()}</span>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                    <button onClick={() => handleViewDetails(guide)} className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-secondary transition flex items-center gap-2">
                      <Eye size={16} /> View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No guides found matching your search.</p>
          </div>
        )}
      </section>

      <GuideDetailModal isOpen={showModal} onClose={() => setShowModal(false)} guide={selectedGuide} onAddFeedback={handleAddFeedback} />
    </div>
  );
};

export default TourGuides;