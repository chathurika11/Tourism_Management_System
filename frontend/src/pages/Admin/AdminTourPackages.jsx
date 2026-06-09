import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Upload, Star, Loader2 } from 'lucide-react';
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
    name: '', district: '', description: '', duration: '', maxPeople: '', bestSeason: '',
    mealPlan: [], inclusions: [], price: '', popular: false,
    hotelIds: [], vehicleIds: [], guideIds: [],
  });
  const [availableHotels, setAvailableHotels] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);

  const mealPlanOptions = [
    { value: 'Breakfast', label: 'Breakfast' }, { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' }, { value: 'All Inclusive', label: 'All Inclusive' },
    { value: 'Half Board', label: 'Half Board' },
  ];
  const inclusionOptions = [
    { value: 'Transport', label: 'Transport' }, { value: 'Hotel', label: 'Hotel' },
    { value: 'Guide', label: 'Guide' }, { value: 'Entry Fees', label: 'Entry Fees' },
    { value: 'Insurance', label: 'Insurance' }, { value: 'Meals', label: 'Meals' },
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tour-packages-admin', page],
    queryFn: () => API.get(`/tour-packages?page=${page}&limit=10`).then(res => res.data),
    keepPreviousData: true,
  });
  const packages = data?.data || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (formData.district) {
      API.get(`/tour-packages/reference/hotels/${formData.district}`).then(res => setAvailableHotels(res.data));
      API.get(`/tour-packages/reference/vehicles/${formData.district}`).then(res => setAvailableVehicles(res.data));
      API.get(`/tour-packages/reference/guides/${formData.district}`).then(res => setAvailableGuides(res.data));
    } else {
      setAvailableHotels([]); setAvailableVehicles([]); setAvailableGuides([]);
    }
  }, [formData.district]);

  const createMutation = useMutation({
    mutationFn: (fd) => API.post('/tour-packages', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      queryClient.invalidateQueries(['tour-packages']);
      refetch();
      toast.success('Package added');
      resetModal();
    },
    onError: (err) => {
      console.error('Create error:', err);
      toast.error(err.response?.data?.error || 'Failed to add package');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => API.put(`/tour-packages/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      queryClient.invalidateQueries(['tour-packages']);
      refetch();
      toast.success('Package updated');
      resetModal();
    },
    onError: (err) => {
      console.error('Update error:', err);
      toast.error(err.response?.data?.error || 'Failed to update package');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/tour-packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tour-packages-admin']);
      queryClient.invalidateQueries(['tour-packages']);
      refetch();
      toast.success('Package deleted');
    },
    onError: () => toast.error('Delete failed'),
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) { toast.error('Image too large, max 2MB'); return; }
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('district', formData.district);
    fd.append('description', formData.description);
    fd.append('duration', formData.duration);
    fd.append('maxPeople', formData.maxPeople);
    fd.append('bestSeason', formData.bestSeason);
    fd.append('mealPlan', JSON.stringify(formData.mealPlan));
    fd.append('inclusions', JSON.stringify(formData.inclusions));
    fd.append('price', formData.price);
    fd.append('popular', formData.popular);
    fd.append('hotelIds', JSON.stringify(formData.hotelIds));
    fd.append('vehicleIds', JSON.stringify(formData.vehicleIds));
    fd.append('guideIds', JSON.stringify(formData.guideIds));
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
      name: pkg.name, district: pkg.district, description: pkg.description, duration: pkg.duration, maxPeople: pkg.maxPeople,
      bestSeason: pkg.bestSeason || '', mealPlan: pkg.mealPlan || [], inclusions: pkg.inclusions || [],
      price: pkg.price, popular: pkg.popular, hotelIds: pkg.hotelIds || [], vehicleIds: pkg.vehicleIds || [], guideIds: pkg.guideIds || [],
    });
    setImagePreview(getImageUrl(pkg.image));
    setShowModal(true);
  };
  const resetModal = () => {
    setShowModal(false); setEditingPackage(null); setImagePreview(null); setImageFile(null);
    setFormData({ name: '', district: '', description: '', duration: '', maxPeople: '', bestSeason: '', mealPlan: [], inclusions: [], price: '', popular: false, hotelIds: [], vehicleIds: [], guideIds: [] });
  };
  const handleDurationChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, duration: value });
  };

  if (isLoading) return <div className="text-center py-20">Loading packages...</div>;

  const hotelOptions = availableHotels.map(h => ({ value: h.id, label: `${h.name} (${h.district})` }));
  const vehicleOptions = availableVehicles.map(v => ({ value: v.id, label: `${v.model} (${v.type} - ${v.district})` }));
  const guideOptions = availableGuides.map(g => ({ value: g.id, label: `${g.name} (${g.specialty} - ${g.district})` }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Tour Packages</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Package</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img src={getImageUrl(pkg.image)} alt={pkg.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between"><h3 className="font-bold text-lg text-primary">{pkg.name}</h3><span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full"><Star size={14} className="text-cta fill-current" /> {pkg.popular ? 'Popular' : 'Standard'}</span></div>
              <p className="text-gray-500 text-sm mt-1">{pkg.district}</p>
              <p className="text-primary font-bold mt-2">Rs {pkg.price.toLocaleString()}</p>
              <div className="mt-2 text-xs text-gray-500">Duration: {pkg.duration} days | Max: {pkg.maxPeople} people</div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleEdit(pkg)} className="btn-primary flex-1"><Edit2 size={16} /> Edit</button>
                <button onClick={() => handleDelete(pkg.id)} className="bg-red-500 text-white flex-1 px-3 py-2 rounded-lg text-sm font-medium"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (<div className="flex justify-between items-center mt-8"><button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-outline px-4 py-2">Previous</button><span>Page {page} of {totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="btn-outline px-4 py-2">Next</button></div>)}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between p-5 border-b"><h2 className="text-2xl font-bold text-primary">{editingPackage ? 'Edit Package' : 'Add New Package'}</h2><button onClick={resetModal}><X size={24} /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label>Package Name *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
                <div><label>District *</label><select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="input-field" required><option value="">Select District</option><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Ella</option><option>Nuwara Eliya</option><option>Sigiriya</option><option>Anuradhapura</option><option>Polonnaruwa</option><option>Yala</option><option>Trincomalee</option></select></div>
                <div><label>Duration (days) *</label><input type="text" value={formData.duration} onChange={handleDurationChange} placeholder="e.g., 3" className="input-field" required />{formData.duration && <span className="text-xs">→ will show as "{formData.duration} days"</span>}</div>
                <div><label>Max People *</label><input type="number" value={formData.maxPeople} onChange={e => setFormData({...formData, maxPeople: e.target.value})} className="input-field" required /></div>
                <div><label>Best Season</label><input type="text" value={formData.bestSeason} onChange={e => setFormData({...formData, bestSeason: e.target.value})} className="input-field" placeholder="e.g., December to March" /></div>
                <div><label>Price (Rs) *</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" required /></div>
                <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} /> Mark as Popular</label></div>
              </div>
              <div><label>Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows="3" required /></div>
              <div><label>Meal Plan (multi-select)</label><Select isMulti options={mealPlanOptions} value={mealPlanOptions.filter(opt => formData.mealPlan.includes(opt.value))} onChange={(selected) => setFormData({...formData, mealPlan: selected.map(s => s.value)})} /></div>
              <div><label>Inclusions (multi-select)</label><Select isMulti options={inclusionOptions} value={inclusionOptions.filter(opt => formData.inclusions.includes(opt.value))} onChange={(selected) => setFormData({...formData, inclusions: selected.map(s => s.value)})} /></div>
              {formData.district && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div><label>Select Hotels (multiple)</label><Select isMulti options={hotelOptions} value={hotelOptions.filter(opt => formData.hotelIds.includes(opt.value))} onChange={(selected) => setFormData({...formData, hotelIds: selected.map(s => s.value)})} placeholder="Choose hotels..." /></div>
                  <div><label>Select Vehicles (multiple)</label><Select isMulti options={vehicleOptions} value={vehicleOptions.filter(opt => formData.vehicleIds.includes(opt.value))} onChange={(selected) => setFormData({...formData, vehicleIds: selected.map(s => s.value)})} placeholder="Choose vehicles..." /></div>
                  <div><label>Select Guides (multiple)</label><Select isMulti options={guideOptions} value={guideOptions.filter(opt => formData.guideIds.includes(opt.value))} onChange={(selected) => setFormData({...formData, guideIds: selected.map(s => s.value)})} placeholder="Choose guides..." /></div>
                </div>
              )}
              <div><label>Package Image (max 2MB)</label><div className="border-2 border-dashed rounded-lg p-4 text-center"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="package-image" /><label htmlFor="package-image" className="cursor-pointer flex flex-col items-center"><Upload size={32} className="text-gray-400" /><span>Click to upload</span></label>{imagePreview && <img src={imagePreview} className="mt-2 w-32 h-32 object-cover rounded mx-auto" />}</div></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={resetModal} className="btn-outline flex-1">Cancel</button><button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1">{editingPackage ? 'Update Package' : 'Add Package'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTourPackages;