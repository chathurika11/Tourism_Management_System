import React, { useEffect, useState } from 'react';
import { X, MapPin, Star, Calendar, Globe, Award, DollarSign, Sparkles, Phone, Mail, MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import API, { getImageUrl } from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800 border-green-300' },
  unavailable: { label: 'Unavailable', className: 'bg-red-100 text-red-800 border-red-300' },
};

const GuideDetailModal = ({ isOpen, onClose, guide }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const loadFeedbacks = React.useCallback(() => {
    if (!guide?.id) return;
    API.get(`/feedback/guide/${guide.id}`)
      .then(res => setFeedbacks(res.data))
      .catch(err => console.error(err));
  }, [guide?.id]);

  useEffect(() => {
    if (isOpen && guide?.id) loadFeedbacks();
  }, [isOpen, guide?.id, loadFeedbacks]);

  if (!isOpen || !guide) return null;

  const statusInfo = statusConfig[guide.status] || statusConfig.available;

  const handleAddFeedback = async ({ guideId, rating, comment }) => {
    await API.post('/feedback/guide', { guideId, rating, comment });
    toast.success('Review submitted');
    loadFeedbacks();
  };

  // Determine if phone or email exists to show the section
  const hasContact = guide.phone || guide.email || guide.whatsapp;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <img src={getImageUrl(guide.image)} alt={guide.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition"><X size={20} /></button>
            {guide.popular && (<div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">🔥 Popular</div>)}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold text-primary mb-2">{guide.name}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
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

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">About {guide.name}</h3>
              <p className="text-gray-600">{guide.description || 'Experienced local guide passionate about sharing Sri Lankan culture and history.'}</p>
            </div>

            {/* Contact Information – only if any contact field exists */}
            {hasContact && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {guide.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      <a href={`tel:${guide.phone}`} className="text-primary hover:underline">{guide.phone}</a>
                    </p>
                  )}
                  {guide.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      <a href={`mailto:${guide.email}`} className="text-primary hover:underline">{guide.email}</a>
                    </p>
                  )}
                  {guide.whatsapp && (
                    <p className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-primary" />
                      <span>WhatsApp available</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-outline flex-1">Close</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">Write a Review</button>
            </div>
          </div>
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2"><MessageCircle size={18} /> Customer Reviews ({feedbacks.length})</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-primary">{fb.user?.name || 'Guest'}</span>
                      <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />)}</div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{fb.comment}</p>
                    {fb.reply && (
                      <div className="mt-2 bg-blue-50 p-2 rounded-lg">
                        <p className="text-xs font-semibold text-primary">Admin Reply:</p>
                        <p className="text-gray-700 text-sm">{fb.reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
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
        onSubmit={handleAddFeedback}
        itemName={guide.name}
        itemId={guide.id}
        type="guide"
      />
    </>
  );
};

export default GuideDetailModal;