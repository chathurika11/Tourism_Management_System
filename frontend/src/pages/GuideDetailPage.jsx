import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ArrowLeft, Globe, Award, Calendar, Phone, Mail, MessageCircle } from 'lucide-react';
import { getGuideById } from '../data/tourismData';
import FeedbackModal from '../components/FeedbackModal';
import { useTour } from '../context/TourContext';

const statusConfig = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800 border-green-300' },
  unavailable: { label: 'Unavailable', className: 'bg-red-100 text-red-800 border-red-300' },
};

const GuideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { addGuideFeedback, getGuideFeedbacks } = useTour();
  
  const guide = getGuideById(id);
  const feedbacks = getGuideFeedbacks(parseInt(id));

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-primary">Guide not found</h2>
        <button onClick={() => navigate('/guides')} className="btn-primary mt-4">Back to Guides</button>
      </div>
    );
  }

  const statusInfo = statusConfig[guide.status] || statusConfig.available;
  const hasContact = guide.phone || guide.email || guide.whatsapp;

  const handleAddFeedback = (feedback) => {
    addGuideFeedback(feedback);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/guides')} className="flex items-center gap-2 text-primary hover:text-secondary mb-6">
          <ArrowLeft size={20} /> Back to Guides
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-primary text-white rounded-xl p-6 text-center">
            <img src={guide.image} alt={guide.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-cta" />
            <div className="flex justify-between items-center mt-2">
              <h1 className="text-2xl font-bold">{guide.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-accent mt-1">{guide.specialty}</p>
            <div className="flex justify-center items-center gap-1 mt-2">
              <Star size={16} className="text-cta fill-current" />
              <span>{guide.rating}</span>
              <span className="text-xs ml-1">({guide.reviews} reviews)</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Price per day</span>
                <span className="text-3xl font-bold text-primary">Rs {guide.pricePerDay.toLocaleString()}</span>
              </div>
              {guide.status === 'unavailable' && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ This guide is currently unavailable.
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
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
                <span>{guide.experience} experience</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Award size={20} className="text-primary" />
                <span>{guide.certification}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">About {guide.name}</h3>
              <p className="text-gray-600">
                {guide.name} is a {guide.specialty.toLowerCase()} with {guide.experience} of experience.
                Fluent in {guide.language}, they provide an authentic and memorable experience.
              </p>
            </div>

            {/* Contact Information */}
            {hasContact && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {guide.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={18} className="text-primary" />
                      <a href={`tel:${guide.phone}`} className="text-primary hover:underline">{guide.phone}</a>
                    </p>
                  )}
                  {guide.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={18} className="text-primary" />
                      <a href={`mailto:${guide.email}`} className="text-primary hover:underline">{guide.email}</a>
                    </p>
                  )}
                  {guide.whatsapp && (
                    <p className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-primary" />
                      <span>WhatsApp available</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate(-1)} className="btn-outline flex-1">Go Back</button>
              <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary flex-1">
                Write a Review
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Customer Reviews</h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No reviews yet. Be the first to review this guide!</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg">
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

export default GuideDetailPage;