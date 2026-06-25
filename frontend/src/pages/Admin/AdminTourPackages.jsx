import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Upload, Star, Loader2, PlusCircle } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../../services/api';

const AdminTourPackages = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    popular: false,
    mealPlan: [],
    inclusions: [],
    destinations: [],
  });

  const [districts, setDistricts] = useState([]);
  const [guidesMap, setGuidesMap] = useState({});
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [hotelsMap, setHotelsMap] = useState({});

  const mealPlanOptions = [
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
    { value: 'All Inclusive', label: 'All Inclusive' },
    { value: 'Half Board', label: 'Half Board' },
  ];
  const inclusionOptions = [
    { value: 'Transport', label: 'Transport' },
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Guide', label: 'Guide' },
    { value: 'Entry Fees', label: 'Entry Fees' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Meals', label: 'Meals' },
  ];

  useEffect(() => {
    API.get('/districts')
      .then(res => setDistricts(res.data))
      .catch(console.error);
  }, []);

  const fetchItemsForDistrict = async (districtId, districtName) => {
    if (!guidesMap[districtId]) {
      const res = await API.get(`/guides?district=${encodeURIComponent(districtName)}`);
      setGuidesMap(prev => ({ ...prev, [districtId]: res.data }));
    }
    if (!vehiclesMap[districtId]) {
      const res = await API.get(`/vehicles?district=${encodeURIComponent(districtName)}`);
      setVehiclesMap(prev => ({ ...prev, [districtId]: res.data }));
    }
    if (!hotelsMap[districtId]) {
      const res = await API.get(`/hotels?district=${encodeURIComponent(districtName)}`);
      setHotelsMap(prev => ({ ...prev, [districtId]: res.data }));
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tour-packages-admin', page],
    queryFn: () => API.get(`/tour-packages?page=${page}&limit=10`).then(res => res.data),
    keepPreviousData: true,
  });
  const packages = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (fd) => API.post('/tour-packages', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      refetch();
      toast.success('Package added');
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => API.put(`/tour-packages/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      refetch();
      toast.success('Package updated');
      resetModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/tour-packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      refetch();
      toast.success('Package deleted');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Delete failed'),
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
    }
  };

  const addDestination = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [
        ...prev.destinations,
        { id: Date.now(), districtId: '', districtName: '', places: [], needGuide: false, guideId: '', needHotel: false, hotelId: '', needVehicle: false, vehicleId: '' }
      ]
    }));
  };

  const removeDestination = (destId) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d.id !== destId)
    }));
  };

  const updateDestination = (destId, field, value) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map(d => d.id === destId ? { ...d, [field]: value } : d)
    }));
  };

  const handleDistrictSelect = async (destId, districtId) => {
    const district = districts.find(d => d.id === districtId);
    if (district) {
      await fetchItemsForDistrict(districtId, district.name);
      updateDestination(destId, 'districtId', districtId);
      updateDestination(destId, 'districtName', district.name);
      updateDestination(destId, 'places', []);
      updateDestination(destId, 'guideId', '');
      updateDestination(destId, 'hotelId', '');
      updateDestination(destId, 'vehicleId', '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('duration', formData.duration);
    fd.append('price', formData.price);
    fd.append('popular', formData.popular);
    fd.append('mealPlan', JSON.stringify(formData.mealPlan));
    fd.append('inclusions', JSON.stringify(formData.inclusions));
    const destinationsToSend = formData.destinations.map(({ id, ...rest }) => rest);
    fd.append('destinations', JSON.stringify(destinationsToSend));
    if (imageFile) fd.append('image', imageFile);
    if (editingPackage) updateMutation.mutate({ id: editingPackage.id, fd });
    else createMutation.mutate(fd);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this package? This action cannot be undone.')) deleteMutation.mutate(id);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      popular: pkg.popular,
      mealPlan: pkg.mealPlan ? pkg.mealPlan.split(', ') : [],
      inclusions: pkg.inclusions || [],
      destinations: (pkg.destinations || []).map((d, idx) => ({ ...d, id: Date.now() + idx })),
    });
    setImagePreview(getImageUrl(pkg.image));
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setImagePreview(null);
    setImageFile(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
      popular: false,
      mealPlan: [],
      inclusions: [],
      destinations: [],
    });
  };

  if (isLoading) return <div className="text-center py-20">Loading packages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Tour Packages</h1>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2">
          <Plus size={18} /> Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
            <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-primary">{pkg.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                    <Star size={14} className="text-cta fill-current" /> {pkg.rating?.toFixed(1) || 'N/A'}
                  </span>
                  {pkg.popular && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🔥 Popular</span>}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">Duration: {pkg.duration} days</p>
              <p className="text-primary font-bold mt-2">Rs {pkg.price.toLocaleString()}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleEdit(pkg)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-outline px-4 py-2">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-outline px-4 py-2">Next</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-primary">{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label>Package Name *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
                <div><label>Duration (days) *</label><input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g., 5" className="input-field" required /></div>
                <div><label>Price (Rs) *</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" required /></div>
                <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} /> Mark as Popular</label></div>
              </div>
              <div><label>Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows="3" required /></div>
              <div><label>Meal Plan (multi-select)</label><Select isMulti options={mealPlanOptions} value={mealPlanOptions.filter(opt => formData.mealPlan.includes(opt.value))} onChange={(selected) => setFormData({...formData, mealPlan: selected.map(s => s.value)})} /></div>
              <div><label>Inclusions (multi-select)</label><Select isMulti options={inclusionOptions} value={inclusionOptions.filter(opt => formData.inclusions.includes(opt.value))} onChange={(selected) => setFormData({...formData, inclusions: selected.map(s => s.value)})} /></div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Destinations (Districts & Places)</h3>
                  <button type="button" onClick={addDestination} className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"><PlusCircle size={16} /> Add Destination</button>
                </div>
                {formData.destinations.map((dest, idx) => {
                  const districtOptions = districts.map(d => ({ value: d.id, label: d.name }));
                  const selectedDistrict = districts.find(d => d.id === dest.districtId);
                  const placeOptions = selectedDistrict?.places || [];
                  const hotelOptions = (hotelsMap[dest.districtId] || []).map(h => ({ value: h.id, label: `${h.name} - Rs ${h.pricePerNight}/night` }));
                  const vehicleOptions = (vehiclesMap[dest.districtId] || []).map(v => ({ value: v.id, label: `${v.model} (${v.type}) - Rs ${v.pricePerDay}/day` }));
                  const guideOptions = (guidesMap[dest.districtId] || []).map(g => ({ value: g.id, label: `${g.name} - Rs ${g.pricePerDay}/day` }));

                  return (
                    <div key={dest.id} className="border rounded-lg p-4 mb-4 relative bg-gray-50">
                      <button type="button" onClick={() => removeDestination(dest.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X size={18} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>District</label><Select options={districtOptions} value={districtOptions.find(opt => opt.value === dest.districtId)} onChange={(opt) => handleDistrictSelect(dest.id, opt?.value)} placeholder="Select district" /></div>
                        <div><label>Places (select at least one)</label><Select isMulti options={placeOptions.map(p => ({ value: p.id, label: p.name }))} value={placeOptions.filter(p => dest.places.includes(p.id)).map(p => ({ value: p.id, label: p.name }))} onChange={(selected) => updateDestination(dest.id, 'places', selected.map(s => s.value))} isDisabled={!dest.districtId} /></div>
                        <div><label className="flex items-center gap-2"><input type="checkbox" checked={dest.needGuide} onChange={e => updateDestination(dest.id, 'needGuide', e.target.checked)} /> Select a Guide</label>{dest.needGuide && <Select options={guideOptions} value={guideOptions.find(opt => opt.value === dest.guideId)} onChange={(opt) => updateDestination(dest.id, 'guideId', opt?.value)} isDisabled={!dest.districtId} placeholder="Choose guide" />}</div>
                        <div><label className="flex items-center gap-2"><input type="checkbox" checked={dest.needHotel} onChange={e => updateDestination(dest.id, 'needHotel', e.target.checked)} /> Select a Hotel</label>{dest.needHotel && <Select options={hotelOptions} value={hotelOptions.find(opt => opt.value === dest.hotelId)} onChange={(opt) => updateDestination(dest.id, 'hotelId', opt?.value)} isDisabled={!dest.districtId} placeholder="Choose hotel" />}</div>
                        <div><label className="flex items-center gap-2"><input type="checkbox" checked={dest.needVehicle} onChange={e => updateDestination(dest.id, 'needVehicle', e.target.checked)} /> Select a Vehicle</label>{dest.needVehicle && <Select options={vehicleOptions} value={vehicleOptions.find(opt => opt.value === dest.vehicleId)} onChange={(opt) => updateDestination(dest.id, 'vehicleId', opt?.value)} isDisabled={!dest.districtId} placeholder="Choose vehicle" />}</div>
                      </div>
                    </div>
                  );
                })}
                {formData.destinations.length === 0 && <p className="text-gray-500 text-center py-4">No destinations added. Click "Add Destination" to include districts and places.</p>}
              </div>

              <div><label>Package Image (max 2MB)</label><div className="border-2 border-dashed rounded-lg p-4 text-center"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="package-image" /><label htmlFor="package-image" className="cursor-pointer flex flex-col items-center"><Upload size={32} className="text-gray-400" /><span>Click to upload</span></label>{imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded mx-auto" />}</div></div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetModal} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={18} className="animate-spin" />}
                  {editingPackage ? 'Update Package' : 'Add Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTourPackages;