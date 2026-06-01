import React, { useState } from 'react';
import { X, Globe, Star, Award, MapPin, Calendar } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useTour } from '../context/TourContext';

const GuideDetailModal = ({ isOpen, onClose, guide, onAddFeedback }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { getGuideFeedbacks } = useTour();
  const feedbacks = getGuideFeedbacks(guide?.id);

  if (!isOpen || !guide) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 bg-white rounded-full p-1 shadow-md">
            <X size={24} className="text-gray-500" />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Profile Section */}
            <div className="bg-primary text-white p-6 text-center">
              <img src={guide.image} alt={guide.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-cta" />
              <h2 className="text-xl font-bold">{guide.name}</h2>
              <p className="text-accent text-sm mt-1">{guide.specialty}</p>
              <div className="flex justify-center items-center gap-1 mt-2">
                <Star size={16} className="text-cta fill-current" />
                <span>{guide.rating}</span>
                <span className="text-xs ml-1">({guide.reviews} reviews)</span>
              </div>
            </div>
            
            {/* Details Section */}
            <div className="md:col-span-2 p-6">
              <h3 className="text-xl font-bold text-primary mb-4">About {guide.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={20} className="text-primary" />
                  <span>Areas: {guide.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe size={20} className="text-primary" />
                  <span>Languages: {guide.language}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-primary" />
                  <span>{guide.experience || '10+ years experience'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Award size={20} className="text-primary" />
                  <span>{guide.certification || 'Certified Tourist Guide'}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="font-bold text-lg mb-2">Tour Highlights</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Customized itineraries</li>
                  <li>Insider knowledge of local culture</li>
                  <li>Flexible scheduling</li>
                  <li>Photography assistance</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-outline flex-1">Close</button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">
                  Write a Review
                </button>
              </div>
            </div>
          </div>
          
          {/* Feedback Section */}
          <div className="border-t p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4">Customer Reviews</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-primary">{feedback.userName}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < feedback.rating ? 'text-cta fill-current' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{feedback.comment}</p>
                    <p className="text-xs text-gray-400">{feedback.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={onAddFeedback}
        itemName={guide.name}
        itemId={guide.id}
        type="guide"
      />
    </>
  );
};

export default GuideDetailModal;