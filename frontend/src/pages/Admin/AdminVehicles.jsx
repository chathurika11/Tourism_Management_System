import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Upload, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../../services/api';

const AdminVehicles = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const prefill = useMemo(() => location.state?.prefill || {}, [location.state]);

  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preserveImage, setPreserveImage] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    model: '',
    pricePerDay: '',
    passengers: '',
    fuelType: '',
    fuelEfficiency: '',
    year: '',
    insuranceIncluded: true,
    supportHours: '24/7',
    pickupLocations: '',
    includedFeatures: '',
    securityDeposit: '',
    depositRefundable: true,
    location: '',
    district: '',
    status: 'available',
  });

  // Prefill from provider request
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      setFormData({
        type: prefill.type || '',
        model: prefill.model || '',
        pricePerDay: prefill.pricePerDay || '',
        passengers: prefill.passengers || '',
        fuelType: prefill.fuelType || '',
        fuelEfficiency: prefill.fuelEfficiency || '',
        year: prefill.year || '',
        insuranceIncluded: prefill.insuranceIncluded !== undefined ? prefill.insuranceIncluded : true,
        supportHours: prefill.supportHours || '24/7',
        pickupLocations: (prefill.pickupLocations || []).join(', '),
        includedFeatures: (prefill.includedFeatures || []).join(', '),
        securityDeposit: prefill.securityDeposit || '',
        depositRefundable: prefill.depositRefundable !== undefined ? prefill.depositRefundable : true,
        location: prefill.location || '',
        district: prefill.district || '',
        status: prefill.status || 'available',
      });
      if (prefill.image) {
        setImagePreview(prefill.image);
        setPreserveImage(true);
      }
      setShowModal(true);
      toast('Prefilled from provider request – review and save');
    }
  }, [prefill]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vehicles-admin', page],
    queryFn: () => API.get(`/vehicles?page=${page}&limit=10`).then((res) => res.data),
    keepPreviousData: true,
  });
  const vehicles = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (fd) => API.post('/vehicles', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles-admin']);
      queryClient.invalidateQueries(['vehicles']);
      refetch();
      toast.success('Vehicle added successfully!');
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add vehicle'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) =>
      API.put(`/vehicles/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles-admin']);
      queryClient.invalidateQueries(['vehicles']);
      refetch();
      toast.success('Vehicle updated successfully!');
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update vehicle'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles-admin']);
      queryClient.invalidateQueries(['vehicles']);
      refetch();
      toast.success('Vehicle deleted successfully!');
    },
    onError: () => toast.error('Failed to delete vehicle'),
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('type', formData.type);
    fd.append('model', formData.model);
    fd.append('pricePerDay', formData.pricePerDay);
    fd.append('passengers', formData.passengers);
    fd.append('fuelType', formData.fuelType);
    fd.append('fuelEfficiency', formData.fuelEfficiency);
    fd.append('year', formData.year);
    fd.append('insuranceIncluded', formData.insuranceIncluded);
    fd.append('supportHours', formData.supportHours);
    fd.append('pickupLocations', formData.pickupLocations);
    fd.append('includedFeatures', formData.includedFeatures);
    fd.append('securityDeposit', formData.securityDeposit);
    fd.append('depositRefundable', formData.depositRefundable);
    fd.append('location', formData.location);
    fd.append('district', formData.district);
    fd.append('status', formData.status);

    if (imageFile && imageFile !== 'preserve') {
      fd.append('image', imageFile);
    } else if (preserveImage && prefill.image) {
      fd.append('imageUrl', prefill.image);
    }

    if (editingVehicle) updateMutation.mutate({ id: editingVehicle.id, fd });
    else createMutation.mutate(fd);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      type: vehicle.type,
      model: vehicle.model,
      pricePerDay: vehicle.pricePerDay,
      passengers: vehicle.passengers,
      fuelType: vehicle.fuelType || '',
      fuelEfficiency: vehicle.fuelEfficiency || '',
      year: vehicle.year || '',
      insuranceIncluded: vehicle.insuranceIncluded,
      supportHours: vehicle.supportHours || '24/7',
      pickupLocations: (vehicle.pickupLocations || []).join(', '),
      includedFeatures: (vehicle.includedFeatures || []).join(', '),
      securityDeposit: vehicle.securityDeposit || '',
      depositRefundable: vehicle.depositRefundable,
      location: vehicle.location,
      district: vehicle.district,
      status: vehicle.status,
    });
    setImagePreview(getImageUrl(vehicle.image));
    setImageFile(null);
    setPreserveImage(false);
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setImagePreview(null);
    setImageFile(null);
    setPreserveImage(false);
    setFormData({
      type: '',
      model: '',
      pricePerDay: '',
      passengers: '',
      fuelType: '',
      fuelEfficiency: '',
      year: '',
      insuranceIncluded: true,
      supportHours: '24/7',
      pickupLocations: '',
      includedFeatures: '',
      securityDeposit: '',
      depositRefundable: true,
      location: '',
      district: '',
      status: 'available',
    });
  };

  if (isLoading) return <div className="text-center py-20">Loading vehicles...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Vehicles</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
            <img
              src={getImageUrl(vehicle.image)}
              alt={vehicle.model}
              className="w-full h-40 object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-primary">{vehicle.model}</h3>
                <span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                  <Star size={14} className="text-cta fill-current" /> {vehicle.rating}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{vehicle.type} • {vehicle.location}</p>
              <p className="text-primary font-bold mt-2">Rs {vehicle.pricePerDay.toLocaleString()}/day</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline px-4 py-2"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-primary">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-medium mb-1">Type *</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="input-field"
                    required
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
                <div>
                  <label className="block font-medium mb-1">Passengers *</label>
                  <input
                    type="number"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Fuel Type</label>
                  <input
                    type="text"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Fuel Efficiency</label>
                  <input
                    type="text"
                    value={formData.fuelEfficiency}
                    onChange={(e) => setFormData({ ...formData, fuelEfficiency: e.target.value })}
                    className="input-field"
                    placeholder="18 km/l"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Model Year</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Support Hours</label>
                  <input
                    type="text"
                    value={formData.supportHours}
                    onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
                    className="input-field"
                    placeholder="24/7"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  <label className="block font-medium mb-1">Security Deposit (Rs)</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.insuranceIncluded}
                    onChange={(e) => setFormData({ ...formData, insuranceIncluded: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Insurance Included
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.depositRefundable}
                    onChange={(e) => setFormData({ ...formData, depositRefundable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Deposit Refundable
                </label>
              </div>
              <div>
                <label className="block font-medium mb-1">Pickup Locations (comma separated)</label>
                <input
                  type="text"
                  value={formData.pickupLocations}
                  onChange={(e) => setFormData({ ...formData, pickupLocations: e.target.value })}
                  className="input-field"
                  placeholder="Colombo, Kandy, Galle"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">What's Included (comma separated)</label>
                <textarea
                  value={formData.includedFeatures}
                  onChange={(e) => setFormData({ ...formData, includedFeatures: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Unlimited km, GPS, Child seat, 24/7 roadside assistance"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Vehicle Image (max 2MB)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="vehicle-image"
                  />
                  <label htmlFor="vehicle-image" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</span>
                  </label>
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={preserveImage ? getImageUrl(imagePreview) : (imageFile ? URL.createObjectURL(imageFile) : '')}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      {preserveImage && (
                        <span className="text-xs text-green-600 block mt-1">(Image from provider request)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
                <strong>Note:</strong> Vehicle rating is automatically calculated from customer reviews.
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
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;