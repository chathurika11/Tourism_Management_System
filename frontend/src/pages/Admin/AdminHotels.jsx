import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([
    { id: 1, name: 'Jetwing Blue', location: 'Negombo', pricePerNight: 12500, rating: 4.7, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', amenities: ['Pool', 'Spa', 'Restaurant'] },
    { id: 2, name: 'Cinnamon Lodge', location: 'Kandy', pricePerNight: 18500, rating: 4.9, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', amenities: ['Pool', 'Spa', 'Nature Trails'] },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', pricePerNight: '', rating: '', amenities: '', image: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result); setFormData({ ...formData, image: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHotel = {
      id: editingHotel ? editingHotel.id : hotels.length + 1,
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()),
      pricePerNight: parseInt(formData.pricePerNight),
      rating: parseFloat(formData.rating)
    };
    if (editingHotel) {
      setHotels(hotels.map(h => h.id === editingHotel.id ? newHotel : h));
      toast.success('Hotel updated successfully!');
    } else {
      setHotels([...hotels, newHotel]);
      toast.success('Hotel added successfully!');
    }
    resetModal();
  };

  const handleDelete = (id) => { if (window.confirm('Delete this hotel?')) { setHotels(hotels.filter(h => h.id !== id)); toast.success('Hotel deleted!'); } };
  const handleEdit = (hotel) => { setEditingHotel(hotel); setFormData({ ...hotel, amenities: hotel.amenities.join(', ') }); setImagePreview(hotel.image); setShowModal(true); };
  const resetModal = () => { setShowModal(false); setEditingHotel(null); setImagePreview(null); setFormData({ name: '', location: '', pricePerNight: '', rating: '', amenities: '', image: '' }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-primary">Manage Hotels</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Hotel</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start"><h3 className="font-bold text-lg text-primary">{hotel.name}</h3><span className="flex items-center gap-1 text-sm"><Star size={14} className="text-cta fill-current" />{hotel.rating}</span></div>
              <p className="text-gray-500 text-sm">{hotel.location}</p>
              <p className="text-primary font-bold mt-2">Rs {hotel.pricePerNight.toLocaleString()}/night</p>
              <div className="flex gap-2 mt-4"><button onClick={() => handleEdit(hotel)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Edit2 size={14} /> Edit</button><button onClick={() => handleDelete(hotel.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Trash2 size={14} /> Delete</button></div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full"><div className="flex justify-between p-4 border-b"><h2 className="text-xl font-bold text-primary">{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</h2><button onClick={resetModal}><X size={24} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div><label>Hotel Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
            <div><label>Location *</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-field" required /></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Price/Night *</label><input type="number" value={formData.pricePerNight} onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} className="input-field" /></div><div><label>Rating *</label><input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="input-field" /></div></div>
            <div><label>Amenities (comma separated)</label><input type="text" value={formData.amenities} onChange={(e) => setFormData({...formData, amenities: e.target.value})} className="input-field" placeholder="Pool, Spa, Restaurant" /></div>
            <div><label>Hotel Image</label><div className="border-2 border-dashed rounded-lg p-4 text-center">{imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" /> : <label className="cursor-pointer"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /><Upload size={40} className="text-gray-400 mx-auto" /><p>Click to upload</p></label>}</div></div>
            <div className="flex gap-3"><button type="button" onClick={resetModal} className="btn-outline flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{editingHotel ? 'Update' : 'Add'}</button></div>
          </form></div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;