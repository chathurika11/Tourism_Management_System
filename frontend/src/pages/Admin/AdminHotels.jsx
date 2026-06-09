import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Upload, Star, Clock, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../../services/api';

const AdminHotels = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', location: '', district: '', pricePerNight: '', amenities: '',
    checkIn: '2:00 PM', checkOut: '12:00 PM', freeCancellationHours: '48', breakfastIncluded: false,
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['hotels-admin', page],
    queryFn: () => API.get(`/hotels?page=${page}&limit=10`).then(res => res.data),
    keepPreviousData: true,
    staleTime: 0,
  });
  
  const hotels = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['hotels-admin'] });
    queryClient.invalidateQueries({ queryKey: ['hotels'] });
    refetch();
  };

  const createMutation = useMutation({
    mutationFn: (fd) => API.post('/hotels', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Hotel added successfully!'); resetModal(); refreshAll(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add hotel'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => API.put(`/hotels/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { toast.success('Hotel updated successfully!'); resetModal(); refreshAll(); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update hotel'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/hotels/${id}`),
    onSuccess: () => { toast.success('Hotel deleted successfully!'); refreshAll(); },
    onError: () => toast.error('Failed to delete hotel'),
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(item => item !== '');
    fd.append('name', formData.name);
    fd.append('location', formData.location);
    fd.append('district', formData.district);
    fd.append('pricePerNight', formData.pricePerNight);
    fd.append('amenities', JSON.stringify(amenitiesArray));
    fd.append('checkIn', formData.checkIn);
    fd.append('checkOut', formData.checkOut);
    fd.append('freeCancellationHours', formData.freeCancellationHours);
    fd.append('breakfastIncluded', formData.breakfastIncluded);
    if (imageFile) fd.append('image', imageFile);
    if (editingHotel) updateMutation.mutate({ id: editingHotel.id, fd });
    else createMutation.mutate(fd);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      ...hotel,
      amenities: hotel.amenities.join(', '),
    });
    setImagePreview(getImageUrl(hotel.image));
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingHotel(null);
    setImagePreview(null);
    setImageFile(null);
    setFormData({
      name: '', location: '', district: '', pricePerNight: '', amenities: '',
      checkIn: '2:00 PM', checkOut: '12:00 PM', freeCancellationHours: '48', breakfastIncluded: false,
    });
  };

  if (isLoading && hotels.length === 0) return <div className="text-center py-20">Loading hotels...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Hotels</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Hotel</button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search by name, location, or district..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field" />
      </div>

      {isFetching && hotels.length > 0 && <div className="text-center py-2 text-sm text-gray-500">Refreshing...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
            <img src={getImageUrl(hotel.image)} alt={hotel.name} className="w-full h-48 object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-primary">{hotel.name}</h3>
                <span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full"><Star size={14} className="text-cta fill-current" /> {hotel.rating}</span>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={12} /> {hotel.location}</p>
              <p className="text-primary font-bold mt-2">Rs {hotel.pricePerNight?.toLocaleString()}/night</p>
              <div className="mt-2 text-xs text-gray-500 flex gap-2"><Clock size={12} /> {hotel.checkIn} | {hotel.checkOut}</div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleEdit(hotel)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"><Edit2 size={16} /> Edit</button>
                <button onClick={() => handleDelete(hotel.id)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all"><Trash2 size={16} /> Delete</button>
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

      {/* Modal – keep your existing modal JSX here (it's unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* ... your modal form content (unchanged) ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;