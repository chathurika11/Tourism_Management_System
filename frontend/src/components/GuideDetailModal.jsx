import React, { useState } from 'react';
import { X, MapPin, Star, Calendar, Globe, Award, DollarSign, Sparkles, Phone, Mail, MessageCircle, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GuideDetailModal = ({ isOpen, onClose, guide, onAddFeedback }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !guide) return null;

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    setSubmitting(true);
    try {
      await onAddFeedback(guide.id, { rating, comment: reviewText });
      toast.success('Thank you for your review!');
      setRating(0);
      setReviewText('');
      onClose();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img src={getImageUrl(guide.image)} alt={guide.name} className="w-full h-64 object-cover rounded-t-2xl" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition"><X size={20} /></button>
          {guide.popular && (<div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">🔥 Popular</div>)}
        </div>
        <div className="p-6">
          <h2 className="text-3xl font-bold text-primary mb-2">{guide.name}</h2>
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <span className="flex items-center gap-1"><MapPin size={16} /> {guide.location || 'Sri Lanka'}</span>
            <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {guide.rating} / 5</span>
            <span className="flex items-center gap-1"><Award size={16} className="text-secondary" /> {guide.specialty}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl text-center"><Globe size={20} className="mx-auto text-primary mb-1" /><p className="text-sm text-gray-500">Languages</p><p className="font-semibold">{guide.language || 'English'}</p></div>
            <div className="bg-gray-50 p-3 rounded-xl text-center"><Calendar size={20} className="mx-auto text-primary mb-1" /><p className="text-sm text-gray-500">Experience</p><p className="font-semibold">{guide.experience || 'N/A'}</p></div>
            <div className="bg-gray-50 p-3 rounded-xl text-center"><DollarSign size={20} className="mx-auto text-primary mb-1" /><p className="text-sm text-gray-500">Rate</p><p className="font-semibold text-primary">Rs {guide.pricePerDay?.toLocaleString()}/day</p></div>
            <div className="bg-gray-50 p-3 rounded-xl text-center"><Sparkles size={20} className="mx-auto text-primary mb-1" /><p className="text-sm text-gray-500">Tour Type</p><p className="font-semibold">{guide.tourType || 'Private'}</p></div>
          </div>
          <div className="mb-6"><h3 className="font-bold text-lg mb-2">About {guide.name}</h3><p className="text-gray-600">{guide.description || 'Experienced local guide passionate about sharing Sri Lankan culture and history.'}</p></div>
          <div className="mb-6"><h3 className="font-bold text-lg mb-2">Contact Information</h3><div className="space-y-2"><p className="flex items-center gap-2"><Phone size={16} className="text-primary" /> {guide.phone || '+94 XX XXX XXXX'}</p><p className="flex items-center gap-2"><Mail size={16} className="text-primary" /> {guide.email || 'contact@example.com'}</p><p className="flex items-center gap-2"><MessageCircle size={16} className="text-primary" /> WhatsApp available</p></div></div>
          <div className="border-t border-gray-200 pt-6 mt-4"><h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ThumbsUp size={18} /> Write a Review</h3>
            <div className="flex items-center gap-2 mb-3">{[...Array(5)].map((_,i) => (<button key={i} onClick={() => setRating(i+1)} onMouseEnter={() => setHoverRating(i+1)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none"><Star size={24} className={(hoverRating || rating) >= i+1 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} /></button>))}<span className="text-sm text-gray-500 ml-2">({rating} / 5)</span></div>
            <textarea rows="3" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary" placeholder="Share your experience with this guide..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            <div className="flex justify-end gap-3 mt-3"><button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button><button onClick={handleSubmitReview} disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">{submitting ? 'Submitting...' : 'Submit Review'}</button></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailModal;