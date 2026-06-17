import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Save, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000/${path.startsWith('/') ? path.slice(1) : path}`;
};

const MyReviews = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: () => API.get('/feedback/my-feedbacks').then(res => res.data),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const editMutation = useMutation({
    mutationFn: ({ type, id, rating, comment }) => (
      API.put(`/feedback/${type}/${id}`, { rating, comment }).then(res => res.data)
    ),
    onSuccess: (result, variables) => {
      const updatedFeedback = result?.feedback || { id: variables.id, rating: variables.rating, comment: variables.comment };
      queryClient.setQueryData(['my-feedbacks'], (oldData) => {
        if (!oldData) return oldData;
        const collectionKey = `${variables.type}Feedbacks`;
        return {
          ...oldData,
          [collectionKey]: (oldData[collectionKey] || []).map(fb => (
            fb.id === variables.id ? { ...fb, ...updatedFeedback } : fb
          )),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      toast.success('Review updated');
      setEditingId(null);
      setEditComment('');
    },
    onError: (error) => {
      console.error('Review update failed:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.error || 'Failed to update review');
    },
  });

  const startEditing = (fb) => {
    setEditingId(fb.id);
    setEditRating(fb.rating);
    setEditComment(fb.comment);
  };

  if (isLoading) return <div className="text-center py-20">Loading your reviews...</div>;

  const allFeedbacks = [
    ...(data?.hotelFeedbacks || []).map(fb => ({ ...fb, type: 'Hotel', apiType: 'hotel', itemName: fb.hotel?.name, image: fb.hotel?.image })),
    ...(data?.guideFeedbacks || []).map(fb => ({ ...fb, type: 'Guide', apiType: 'guide', itemName: fb.guide?.name, image: fb.guide?.image })),
    ...(data?.vehicleFeedbacks || []).map(fb => ({ ...fb, type: 'Vehicle', apiType: 'vehicle', itemName: fb.vehicle?.model, image: fb.vehicle?.image })),
    ...(data?.tourFeedbacks || []).map(fb => ({ ...fb, type: 'Tour', apiType: 'tour', itemName: fb.tour?.name, image: fb.tour?.image })),
  ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">My Reviews</h1>
      {allFeedbacks.length === 0 ? <p className="text-gray-500">You haven't written any reviews yet.</p> : (
        <div className="space-y-6">
          {allFeedbacks.map(fb => {
            const isEditing = editingId === fb.id;
            const isLocked = Boolean(fb.reply);
            return (
              <div key={fb.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4"><img src={getImageUrl(fb.image)} alt={fb.itemName} className="w-16 h-16 object-cover rounded-lg" /><div><p className="text-sm text-gray-500">{fb.type}</p><h3 className="font-bold text-lg text-primary">{fb.itemName}</h3><div className="flex gap-1 mt-1">{[...Array(5)].map((_,i) => (<Star key={i} size={16} className={i < (isEditing ? editRating : fb.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />))}</div></div></div>
                  {!isEditing && !isLocked && <button onClick={() => startEditing(fb)} className="btn-outline px-3 py-2 flex items-center gap-2 text-sm"><Edit2 size={14} /> Edit</button>}
                </div>
                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} className="input-field max-w-32">
                      {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
                    </select>
                    <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="input-field" rows="3" />
                    <div className="flex gap-2">
                      <button onClick={() => editMutation.mutate({ type: fb.apiType, id: fb.id, rating: editRating, comment: editComment })} className="btn-primary px-4 flex items-center gap-2" disabled={editMutation.isPending}><Save size={16} /> Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-outline px-4 flex items-center gap-2"><X size={16} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-700">{fb.comment}</p>
                )}
                {fb.reply && <div className="mt-3 bg-blue-50 p-3 rounded-lg"><p className="text-sm font-semibold text-primary">Admin Reply:</p><p className="text-gray-700">{fb.reply}</p><p className="text-xs text-gray-400">{new Date(fb.repliedAt).toLocaleString()}</p></div>}
                <p className="text-xs text-gray-400 mt-3">Submitted on {new Date(fb.createdAt).toLocaleDateString()} - {isLocked ? 'Locked after admin reply' : 'Editable for 4 hours after submitting'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
