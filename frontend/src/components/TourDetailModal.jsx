import React, { useState } from 'react';
import { X, Globe, Star, Award, MapPin, Calendar, Users, DollarSign, Sparkles } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useTour } from '../context/TourContext';
import { getImageUrl } from '../services/api';

const GuideDetailModal = ({ isOpen, onClose, guide, onAddFeedback }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { getGuideFeedbacks } = useTour();
  const feedbacks = getGuideFeedbacks(guide?.id);

  if (!isOpen || !guide) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
          <button onClick={onClose} className="absolute right-5 top-5 z-10 bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:bg-gray-100 transition">
            <X size={22} className="text-gray-600" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="bg-gradient-to-b from-primary to-secondary text-white p-8 text-center rounded-t-3xl md:rounded-l-3xl">
              <img src={getImageUrl(guide.image)} alt={guide.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-cta shadow-xl" />
              <h2 className="text-2xl font-bold">{guide.name}</h2>
              <p className="text-accent text-sm mt-1">{guide.specialty}</p>
              <div className="flex justify-center items-center gap-1 mt-3 bg-white/20 inline-flex px-3 py-1 rounded-full mx-auto">
                <Star size={16} className="text-cta fill-current" />
                <span className="font-semibold">{guide.rating}</span>
                <span className="text-xs">({guide.reviews} reviews)</span>
              </div>
            </div>
            <div className="md:col-span-2 p-6 md:p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">About {guide.name}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700"><MapPin size={20} className="text-primary" /> Service Areas: {guide.location}</div>
                <div className="flex items-center gap-3 text-gray-700"><Globe size={20} className="text-primary" /> Languages: {guide.language}</div>
                <div className="flex items-center gap-3 text-gray-700"><Calendar size={20} className="text-primary" /> Experience: {guide.experience}</div>
                <div className="flex items-center gap-3 text-gray-700"><Award size={20} className="text-primary" /> Certification: {guide.certification}</div>
                <div className="flex items-center gap-3 text-gray-700"><DollarSign size={20} className="text-primary" /> Price: <span className="font-bold text-primary">Rs {guide.pricePerDay.toLocaleString()}</span>/day</div>
              </div>
              {guide.description && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-2xl mb-6">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2"><Sparkles size={18} /> Why choose {guide.name.split(' ')[0]}?</h4>
                  <p className="text-gray-700">{guide.description}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-outline flex-1">Close</button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">Write a Review</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4">Customer Reviews</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-primary">{fb.userName}</span>
                      <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}</div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{fb.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">{fb.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSubmit={onAddFeedback} itemName={guide.name} itemId={guide.id} type="guide" />
    </>
  );
};

export default GuideDetailModal;