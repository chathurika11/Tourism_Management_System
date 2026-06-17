import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Star, Reply, Send, X, Hotel, Car, Users, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const EDIT_WINDOW_MS = 4 * 60 * 60 * 1000;

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000/${path.startsWith('/') ? path.slice(1) : path}`;
};

const canEditWithinWindow = (date) => date && Date.now() - new Date(date).getTime() <= EDIT_WINDOW_MS;

const AdminFeedbacks = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('hotel');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feedbacks', activeTab],
    queryFn: async () => {
      const endpoint = `/feedback/${activeTab}/all`;
      const res = await API.get(endpoint);
      return res.data;
    }
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }) => API.put(`/feedback/${activeTab}/${id}/reply`, { reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks', activeTab] });
      toast.success('Reply saved');
      setReplyingTo(null);
      setReplyText('');
    },
    onError: (error) => {
      console.error('Reply save failed:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.error || 'Failed to save reply');
    },
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
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100'}`}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {data?.length === 0 && <p className="text-gray-500 text-center py-10">No feedbacks found.</p>}
        {data?.map(fb => {
          const item = fb.hotel || fb.guide || fb.vehicle || fb.tour;
          const isReplying = replyingTo === fb.id;
          const replyEditable = fb.reply && canEditWithinWindow(fb.repliedAt);

          return (
            <div key={fb.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={getImageUrl(item?.image)} alt={item?.name || item?.model} className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <h3 className="font-bold text-primary">{item?.name || item?.model}</h3>
                    <p className="text-sm text-gray-500">by {fb.user?.name} - {new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />))}</div>
              </div>
              <p className="mt-3 text-gray-700">{fb.comment}</p>

              {fb.reply && (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-primary">Admin Reply:</p>
                  {isReplying ? (
                    <div className="mt-2 flex gap-2">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="input-field flex-1" rows="2" placeholder="Write your reply..." />
                      <button onClick={() => replyMutation.mutate({ id: fb.id, reply: replyText })} className="btn-primary px-4"><Send size={16} /></button>
                      <button onClick={() => setReplyingTo(null)} className="btn-outline px-4"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700">{fb.reply}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">{new Date(fb.repliedAt).toLocaleString()}</p>
                        {replyEditable && (
                          <button onClick={() => { setReplyingTo(fb.id); setReplyText(fb.reply); }} className="text-blue-600 flex items-center gap-1 text-sm">
                            <Edit2 size={14} /> Edit Reply
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!fb.reply && (
                <div className="mt-4">
                  {isReplying ? (
                    <div className="flex gap-2">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="input-field flex-1" rows="2" placeholder="Write your reply..." />
                      <button onClick={() => replyMutation.mutate({ id: fb.id, reply: replyText })} className="btn-primary px-4"><Send size={16} /></button>
                      <button onClick={() => setReplyingTo(null)} className="btn-outline px-4"><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyingTo(fb.id); setReplyText(''); }} className="text-blue-600 flex items-center gap-1 text-sm"><Reply size={14} /> Reply</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFeedbacks;
