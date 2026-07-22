import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Upload, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../../services/api';

const AdminGuides = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = useMemo(() => location.state?.prefill || {}, [location.state]);
  const providerRequestId = useMemo(() => location.state?.providerRequestId || null, [location.state]);

  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preserveImage, setPreserveImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    district: '',
    location: '',
    language: '',
    experience: '',
    certification: '',
    pricePerDay: '',
    popular: false,
    description: '',
  });

  // Prefill from provider request
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      const description = prefill.description || prefill.data?.description || '';
      let imageUrl = '';
      if (prefill.images && Array.isArray(prefill.images) && prefill.images.length > 0) {
        imageUrl = prefill.images[0];
      } else if (prefill.image) {
        imageUrl = prefill.image;
      }

      setFormData({
        name: prefill.name || prefill.businessName || '',
        specialty: prefill.specialty || '',
        district: prefill.district || '',
        location: prefill.location || '',
        language: prefill.language || '',
        experience: prefill.experience || '',
        certification: prefill.certification || '',
        pricePerDay: prefill.pricePerDay || prefill.price || '',
        popular: prefill.popular || false,
        description: description,
      });

      if (imageUrl) {
        setImagePreview(imageUrl);
        setPreserveImage(true);
      }

      setShowModal(true);
      toast('Prefilled from provider request – review and save');
    }
  }, [prefill]);

  // ---- Fetch guides ----
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['guides-admin', page],
    queryFn: () => API.get(`/guides?page=${page}&limit=10`).then((res) => res.data),
    keepPreviousData: true,
  });
  const guides = data?.data || [];
  const totalPages = data?.totalPages || 1;

  // ---- Mutation: Create guide ----
  const createMutation = useMutation({
    mutationFn: (fd) => API.post('/guides', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: async (res) => {
      queryClient.invalidateQueries(['guides-admin']);
      queryClient.invalidateQueries(['guides']);
      refetch();
      toast.success('Guide added successfully!');

      // If this came from a provider request, approve it now
      if (providerRequestId) {
        try {
          await API.put(`/provider-requests/${providerRequestId}/approve`);
          toast.success('Provider request approved!');
          // Remove the state to avoid re-triggering
          navigate(location.pathname, { replace: true, state: {} });
        } catch (err) {
          toast.error('Failed to approve provider request: ' + err.response?.data?.error);
        }
      }
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add guide'),
  });

  // ---- Mutation: Update guide ----
  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) =>
      API.put(`/guides/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['guides-admin']);
      queryClient.invalidateQueries(['guides']);
      refetch();
      toast.success('Guide updated successfully!');
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update guide'),
  });

  // ---- Mutation: Delete guide ----
  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/guides/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['guides-admin']);
      queryClient.invalidateQueries(['guides']);
      refetch();
      toast.success('Guide deleted successfully!');
    },
    onError: () => toast.error('Failed to delete guide'),
  });

  // ---- Image upload ----
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('Image too large, max 2MB');
      return;
    }
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPreserveImage(false);
    }
  };

  // ---- Submit ----
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('specialty', formData.specialty);
    fd.append('district', formData.district);
    fd.append('location', formData.location);
    fd.append('language', formData.language);
    fd.append('experience', formData.experience);
    fd.append('certification', formData.certification);
    fd.append('pricePerDay', formData.pricePerDay);
    fd.append('popular', formData.popular);
    fd.append('description', formData.description);

    if (imageFile && imageFile !== 'preserve') {
      fd.append('image', imageFile);
    } else if (preserveImage && imagePreview) {
      fd.append('imageUrl', imagePreview);
    }

    if (editingGuide) updateMutation.mutate({ id: editingGuide.id, fd });
    else createMutation.mutate(fd);
  };

  // ---- Delete handler ----
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      deleteMutation.mutate(id);
    }
  };

  // ---- Edit handler ----
  const handleEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name,
      specialty: guide.specialty,
      district: guide.district,
      location: guide.location || '',
      language: guide.language || '',
      experience: guide.experience || '',
      certification: guide.certification || '',
      pricePerDay: guide.pricePerDay,
      popular: guide.popular,
      description: guide.description || '',
    });
    setImagePreview(getImageUrl(guide.image));
    setImageFile(null);
    setPreserveImage(false);
    setShowModal(true);
  };

  // ---- Reset modal ----
  const resetModal = () => {
    setShowModal(false);
    setEditingGuide(null);
    setImagePreview(null);
    setImageFile(null);
    setPreserveImage(false);
    setFormData({
      name: '',
      specialty: '',
      district: '',
      location: '',
      language: '',
      experience: '',
      certification: '',
      pricePerDay: '',
      popular: false,
      description: '',
    });
  };

  if (isLoading) return <div className="text-center py-20">Loading guides...</div>;

  return (
    <div>
      {/* Header and table as before */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Guides</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Add Guide
        </button>
      </div>

      {/* Guide cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
            <img
              src={getImageUrl(guide.image)}
              alt={guide.name}
              className="w-full h-48 object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-primary">{guide.name}</h3>
                <span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                  <Star size={14} className="text-cta fill-current" /> {guide.rating}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{guide.specialty}</p>
              <p className="text-primary font-bold mt-2">Rs {guide.pricePerDay.toLocaleString()}/day</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(guide)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(guide.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline px-4 py-2"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-outline px-4 py-2"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-primary">
                {editingGuide ? 'Edit Guide' : 'Add New Guide'}
              </h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Form fields – same as before */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Specialty *</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Service Area</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Kandy, Sigiriya"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Languages</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="input-field"
                    placeholder="English, German"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input-field"
                    placeholder="10 years"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Certification</label>
                  <input
                    type="text"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="input-field"
                    placeholder="Senior Certified Guide"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Price per Day (Rs) *</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Why choose this guide? (Description)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="E.g., Deep local knowledge, personalized itineraries, and a passion for sharing Sri Lanka's rich heritage."
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-4 h-4"
                />
                Mark as Popular
              </label>
              <div>
                <label className="block font-medium mb-1">Guide Image (max 2MB)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="guide-image"
                  />
                  <label htmlFor="guide-image" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</span>
                  </label>
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={preserveImage ? getImageUrl(imagePreview) : (imageFile ? URL.createObjectURL(imageFile) : '')}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-full mx-auto"
                      />
                      {preserveImage && (
                        <span className="text-xs text-green-600 block mt-1">(Image from provider request)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
                <strong>Note:</strong> Guide rating and reviews are automatically calculated from customer feedback.
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetModal} className="btn-outline flex-1 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1 py-2 flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {editingGuide ? 'Update Guide' : 'Add Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGuides;