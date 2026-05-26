import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star, Globe, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminGuides = () => {
  const [guides, setGuides] = useState([
    { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', location: 'Kandy, Sigiriya', rating: 4.9, reviews: 124, language: 'English, German', experience: '15 years', pricePerDay: 5000, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
    { id: 2, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', location: 'Ella, Nuwara Eliya', rating: 4.7, reviews: 85, language: 'English', experience: '8 years', pricePerDay: 4500, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ name: '', specialty: '', location: '', rating: '', reviews: '', language: '', experience: '', pricePerDay: '', image: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result); setFormData({ ...formData, image: reader.result }); }; reader.readAsDataURL(file); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGuide = { id: editingGuide ? editingGuide.id : guides.length + 1, ...formData, rating: parseFloat(formData.rating), reviews: parseInt(formData.reviews), pricePerDay: parseInt(formData.pricePerDay) };
    if (editingGuide) { setGuides(guides.map(g => g.id === editingGuide.id ? newGuide : g)); toast.success('Guide updated!'); }
    else { setGuides([...guides, newGuide]); toast.success('Guide added!'); }
    resetModal();
  };

  const handleDelete = (id) => { if (window.confirm('Delete this guide?')) { setGuides(guides.filter(g => g.id !== id)); toast.success('Guide deleted!'); } };
  const handleEdit = (guide) => { setEditingGuide(guide); setFormData(guide); setImagePreview(guide.image); setShowModal(true); };
  const resetModal = () => { setShowModal(false); setEditingGuide(null); setImagePreview(null); setFormData({ name: '', specialty: '', location: '', rating: '', reviews: '', language: '', experience: '', pricePerDay: '', image: '' }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-primary">Manage Tour Guides</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Guide</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map(guide => (
          <div key={guide.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex">
            <img src={guide.image} alt={guide.name} className="w-32 h-32 object-cover" />
            <div className="p-4 flex-1">
              <div className="flex justify-between"><h3 className="font-bold text-lg text-primary">{guide.name}</h3><span className="flex items-center gap-1"><Star size={14} className="text-cta fill-current" />{guide.rating}</span></div>
              <p className="text-gray-500 text-sm">{guide.specialty}</p>
              <div className="flex gap-3 text-xs text-gray-500 my-2"><span className="flex items-center gap-1"><MapPin size={12} /> {guide.location.split(',')[0]}</span><span className="flex items-center gap-1"><Globe size={12} /> {guide.language}</span><span className="flex items-center gap-1"><Calendar size={12} /> {guide.experience}</span></div>
              <p className="text-primary font-bold">Rs {guide.pricePerDay.toLocaleString()}/day</p>
              <div className="flex gap-2 mt-2"><button onClick={() => handleEdit(guide)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"><Edit2 size={14} /> Edit</button><button onClick={() => handleDelete(guide.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"><Trash2 size={14} /> Delete</button></div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full"><div className="flex justify-between p-4 border-b"><h2 className="text-xl font-bold text-primary">{editingGuide ? 'Edit Guide' : 'Add Guide'}</h2><button onClick={resetModal}><X size={24} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><label>Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" required /></div><div><label>Specialty *</label><input type="text" value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="input-field" required /></div></div>
            <div><label>Location *</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-field" required /></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Rating</label><input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="input-field" /></div><div><label>Reviews</label><input type="number" value={formData.reviews} onChange={(e) => setFormData({...formData, reviews: e.target.value})} className="input-field" /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Languages</label><input type="text" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})} className="input-field" /></div><div><label>Experience</label><input type="text" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="input-field" /></div></div>
            <div><label>Price per Day *</label><input type="number" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="input-field" required /></div>
            <div><label>Guide Image</label><div className="border-2 border-dashed rounded-lg p-4 text-center">{imagePreview ? <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto" /> : <label className="cursor-pointer"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /><Upload size={40} className="text-gray-400 mx-auto" /><p>Click to upload</p></label>}</div></div>
            <div className="flex gap-3"><button type="button" onClick={resetModal} className="btn-outline flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{editingGuide ? 'Update' : 'Add'}</button></div>
          </form></div>
        </div>
      )}
    </div>
  );
};

export default AdminGuides;