import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../../services/api';

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ProviderRequests = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [providerType, setProviderType] = useState('all');
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['provider-requests', status, providerType],
    queryFn: async () => {
      const params = new URLSearchParams({ status, providerType });
      const res = await API.get(`/provider-requests?${params.toString()}`);
      return res.data;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['provider-requests'] });
    queryClient.invalidateQueries({ queryKey: ['guides-admin'] });
    queryClient.invalidateQueries({ queryKey: ['hotels-admin'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles-admin'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id) => API.put(`/provider-requests/${id}/approve`),
    onSuccess: () => {
      toast.success('Request approved and published.');
      setSelected(null);
      refresh();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to approve request'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => API.put(`/provider-requests/${id}/reject`, { rejectionReason: reason }),
    onSuccess: () => {
      toast.success('Request rejected.');
      setSelected(null);
      setRejectionReason('');
      refresh();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to reject request'),
  });

  if (isLoading) return <div className="text-center py-20">Loading provider requests...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Provider Requests</h1>
          <p className="text-sm text-gray-500">Approve partner registrations into guides, hotels, or vehicles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-40">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <select value={providerType} onChange={(e) => setProviderType(e.target.value)} className="input-field w-40">
            <option value="all">All Types</option>
            <option value="guide">Guides</option>
            <option value="hotel">Hotels</option>
            <option value="vehicle">Vehicles</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No requests found.</td>
                </tr>
              )}
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {request.images?.[0] ? (
                        <img src={getImageUrl(request.images[0])} alt={request.businessName} className="w-12 h-12 object-cover rounded-md" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <Clock size={18} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-primary">{request.businessName || request.requesterName}</p>
                        <p className="text-xs text-gray-500 capitalize">{request.providerType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p>{request.requesterName}</p>
                    <p className="text-xs text-gray-500">{request.requesterEmail}</p>
                  </td>
                  <td className="px-4 py-3">{request.location}, {request.district}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusClass[request.status] || statusClass.pending}`}>{request.status}</span>
                  </td>
                  <td className="px-4 py-3">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(request)} className="btn-outline px-3 py-1 inline-flex items-center gap-1">
                      <Eye size={15} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">{selected.businessName || selected.requesterName}</h2>
                <p className="text-sm text-gray-500 capitalize">{selected.providerType} request from {selected.requesterName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {selected.images?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {selected.images.map((image) => (
                    <img key={image} src={getImageUrl(image)} alt="Request upload" className="h-28 w-full object-cover rounded-md" />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="Email" value={selected.requesterEmail} />
                <Info label="Phone" value={selected.requesterPhone} />
                <Info label="District" value={selected.district} />
                <Info label="Location" value={selected.location} />
                <Info label="Price" value={selected.price ? `Rs ${selected.price.toLocaleString()}` : '-'} />
                <Info label="Status" value={selected.status} />
              </div>

              <div>
                <h3 className="font-semibold text-primary mb-2">Submitted Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(selected.data || {}).map(([key, value]) => (
                    <Info key={key} label={key} value={Array.isArray(value) ? value.join(', ') : String(value ?? '-')} />
                  ))}
                </div>
              </div>

              {selected.message && (
                <div>
                  <h3 className="font-semibold text-primary mb-2">Message</h3>
                  <p className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">{selected.message}</p>
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="border-t pt-5 space-y-4">
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Rejection reason (shown to requester if rejected)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => approveMutation.mutate(selected.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Approve & Publish
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate({ id: selected.id, reason: rejectionReason })}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex-1 flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {selected.status === 'rejected' && selected.rejectionReason && (
                <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">{selected.rejectionReason}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="font-medium text-gray-800 break-words">{value}</p>
  </div>
);

export default ProviderRequests;
