import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Reply, Send, X, Hotel, Car, Users, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `http://localhost:5000/${cleanPath}`;
};

const AdminFeedbacks = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hotel');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fetch feedbacks based on active tab
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-feedbacks', activeTab],
    queryFn: async () => {
      let endpoint = '';
      if (activeTab === 'hotel') endpoint = '/feedback/hotel/all';
      else if (activeTab === 'guide') endpoint = '/feedback/guide/all';
      else if (activeTab === 'vehicle') endpoint = '/feedback/vehicle/all';
      else if (activeTab === 'tour') endpoint = '/feedback/tour/all';
      const res = await API.get(endpoint);
      return res.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }) => {
      let endpoint = '';
      if (activeTab === 'hotel') endpoint = `/feedback/hotel/${id}/reply`;
      else if (activeTab === 'guide') endpoint = `/feedback/guide/${id}/reply`;
      else if (activeTab === 'vehicle') endpoint = `/feedback/vehicle/${id}/reply`;
      else if (activeTab === 'tour') endpoint = `/feedback/tour/${id}/reply`;
      return API.put(endpoint, { reply });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-feedbacks', activeTab]);
      toast.success('Reply sent');
      setReplyingTo(null);
      setReplyText('');
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const tabs = [
    { id: 'hotel', label: 'Hotels', icon: Hotel },
    { id: 'guide', label: 'Guides', icon: Users },
    { id: 'vehicle', label: 'Vehicles', icon: Car },
    { id: 'tour', label: 'Tours', icon: Compass },
  ];

  if (isLoading) return <div className="text-center py-20">Loading feedbacks...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Feedbacks</h1>
      
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedbacks List */}
      <div className="space-y-6">
        {data?.length === 0 && (
          <p className="text-gray-500 text-center py-10">No feedbacks found.</p>
        )}
        {data?.map(fb => (
          <div key={fb.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {fb.hotel?.image && <img src={getImageUrl(fb.hotel.image)} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                {fb.guide?.image && <img src={getImageUrl(fb.guide.image)} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                {fb.vehicle?.image && <img src={getImageUrl(fb.vehicle.image)} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                {fb.tour?.image && <img src={getImageUrl(fb.tour.image)} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                <div>
                  <h3 className="font-bold text-primary">
                    {fb.hotel?.name || fb.guide?.name || fb.vehicle?.model || fb.tour?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {fb.user?.name} • {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-gray-700">{fb.comment}</p>
            
            {fb.reply && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-primary">Admin Reply:</p>
                <p className="text-gray-700">{fb.reply}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(fb.repliedAt).toLocaleString()}</p>
              </div>
            )}
            
            {!fb.reply && (
              <div className="mt-4">
                {replyingTo === fb.id ? (
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="input-field flex-1"
                      rows="2"
                      placeholder="Write your reply..."
                    />
                    <button
                      onClick={() => replyMutation.mutate({ id: fb.id, reply: replyText })}
                      className="btn-primary px-4"
                    >
                      <Send size={16} />
                    </button>
                    <button onClick={() => setReplyingTo(null)} className="btn-outline px-4">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(fb.id)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <Reply size={14} /> Reply
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedbacks;