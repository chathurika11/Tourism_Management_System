import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TourFeedbackModal = ({ isOpen, onClose, onSubmit, tourName, tourId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit feedback');
      onClose();
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    onSubmit({
      tourId: tourId,
      userName: user.name || 'Guest User',
      rating,
      comment
    });
    setRating(5);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold text-primary mb-2">Rate {tourName}</h3>
        <p className="text-gray-600 mb-4">Share your tour experience with others</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} className="focus:outline-none">
                  <Star size={32} className={(hoveredRating || rating) >= star ? 'text-cta fill-current' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Your Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field" rows="4" placeholder="Tell others about your tour experience..." required />
          </div>
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Review</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourFeedbackModal;