import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import API from '../services/api';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `http://localhost:5000/${cleanPath}`;
};

const MyReviews = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: () => API.get('/feedback/my-feedbacks').then(res => res.data),
  });

  if (isLoading) return <div className="text-center py-20">Loading your reviews...</div>;

  const allFeedbacks = [
    ...(data?.hotelFeedbacks || []).map(fb => ({ ...fb, type: 'Hotel', itemName: fb.hotel?.name, image: fb.hotel?.image })),
    ...(data?.guideFeedbacks || []).map(fb => ({ ...fb, type: 'Guide', itemName: fb.guide?.name, image: fb.guide?.image })),
    ...(data?.vehicleFeedbacks || []).map(fb => ({ ...fb, type: 'Vehicle', itemName: fb.vehicle?.model, image: fb.vehicle?.image })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">My Reviews</h1>
      {allFeedbacks.length === 0 ? (
        <p className="text-gray-500 text-center py-10">You haven't written any reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {allFeedbacks.map(fb => (
            <div key={fb.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4">
                <img src={getImageUrl(fb.image)} alt={fb.itemName} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <p className="text-sm text-gray-500">{fb.type}</p>
                  <h3 className="font-bold text-lg text-primary">{fb.itemName}</h3>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-700">{fb.comment}</p>
              {fb.reply && (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-primary">Admin Reply:</p>
                  <p className="text-gray-700">{fb.reply}</p>
                  <p className="text-xs text-gray-400">{new Date(fb.repliedAt).toLocaleString()}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">Submitted on {new Date(fb.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;