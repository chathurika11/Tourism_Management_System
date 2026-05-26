import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Star, Users, Fuel, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, type: 'Scooter', model: 'Honda Dio', pricePerDay: 2500, passengers: 2, fuelType: 'Petrol', mileage: '45 km/l', year: '2024', rating: 4.7, location: 'Colombo', image: 'https://images.pexels.com/photos/1046997/pexels-photo-1046997.jpeg?w=600' },
    { id: 2, type: 'Car', model: 'Toyota Axio', pricePerDay: 6500, passengers: 4, fuelType: 'Petrol', mileage: '18 km/l', year: '2023', rating: 4.8, location: 'Kandy', image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=600' },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ type: '', model: '', pricePerDay: '', passengers: '', fuelType: '', mileage: '', year: '', rating: '', location: '', image: '' });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result); setFormData({ ...formData, image: reader.result }); }; reader.readAsDataURL(file); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVehicle = { id: editingVehicle ? editingVehicle.id : vehicles.length + 1, ...formData, pricePerDay: parseInt(formData.pricePerDay), passengers: parseInt(formData.passengers), rating: parseFloat(formData.rating) };
    if (editingVehicle) { setVehicles(vehicles.map(v => v.id === editingVehicle.id ? newVehicle : v)); toast.success('Vehicle updated!'); }
    else { setVehicles([...vehicles, newVehicle]); toast.success('Vehicle added!'); }
    resetModal();
  };

  const handleDelete = (id) => { if (window.confirm('Delete this vehicle?')) { setVehicles(vehicles.filter(v => v.id !== id)); toast.success('Vehicle deleted!'); } };
  const handleEdit = (vehicle) => { setEditingVehicle(vehicle); setFormData(vehicle); setImagePreview(vehicle.image); setShowModal(true); };
  const resetModal = () => { setShowModal(false); setEditingVehicle(null); setImagePreview(null); setFormData({ type: '', model: '', pricePerDay: '', passengers: '', fuelType: '', mileage: '', year: '', rating: '', location: '', image: '' }); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-primary">Manage Vehicles</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Vehicle</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img src={vehicle.image} alt={vehicle.model} className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start"><h3 className="font-bold text-lg text-primary">{vehicle.model}</h3><span className="flex items-center gap-1"><Star size={14} className="text-cta fill-current" />{vehicle.rating}</span></div>
              <p className="text-gray-500 text-sm">{vehicle.type} • {vehicle.location}</p>
              <div className="flex gap-3 text-xs text-gray-500 my-2"><span className="flex items-center gap-1"><Users size={12} /> {vehicle.passengers}</span><span className="flex items-center gap-1"><Fuel size={12} /> {vehicle.fuelType}</span><span className="flex items-center gap-1"><Calendar size={12} /> {vehicle.year}</span></div>
              <p className="text-primary font-bold">Rs {vehicle.pricePerDay.toLocaleString()}/day</p>
              <div className="flex gap-2 mt-3"><button onClick={() => handleEdit(vehicle)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"><Edit2 size={14} /> Edit</button><button onClick={() => handleDelete(vehicle.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"><Trash2 size={14} /> Delete</button></div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full"><div className="flex justify-between p-4 border-b"><h2 className="text-xl font-bold text-primary">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2><button onClick={resetModal}><X size={24} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><label>Type *</label><input type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-field" required /></div><div><label>Model *</label><input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="input-field" required /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Price/Day *</label><input type="number" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="input-field" /></div><div><label>Passengers *</label><input type="number" value={formData.passengers} onChange={(e) => setFormData({...formData, passengers: e.target.value})} className="input-field" /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Fuel Type</label><input type="text" value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})} className="input-field" /></div><div><label>Mileage</label><input type="text" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} className="input-field" /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label>Year</label><input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="input-field" /></div><div><label>Rating</label><input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="input-field" /></div></div>
            <div><label>Location *</label><input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-field" required /></div>
            <div><label>Vehicle Image</label><div className="border-2 border-dashed rounded-lg p-4 text-center">{imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" /> : <label className="cursor-pointer"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /><Upload size={40} className="text-gray-400 mx-auto" /><p>Click to upload</p></label>}</div></div>
            <div className="flex gap-3"><button type="button" onClick={resetModal} className="btn-outline flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{editingVehicle ? 'Update' : 'Add'}</button></div>
          </form></div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;