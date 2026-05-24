import React, { useState } from 'react';
import { Plus, Trash2, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminVehicles = () => {
  // Removed unused 'setVehicles'
  const [vehicles] = useState([
    { _id: 1, type: 'Scooter', model: 'Honda Dio', pricePerDay: 15 },
    { _id: 2, type: 'Car', model: 'Suzuki Wagon R', pricePerDay: 35 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ type: '', model: '', pricePerDay: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Vehicle added');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this vehicle?')) {
      toast.success('Deleted');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Vehicle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle._id} className="bg-white rounded-lg shadow-md p-6">
            <Car className="text-primary mb-3" size={32} />
            <h3 className="font-bold text-lg">{vehicle.model}</h3>
            <p className="text-gray-600">{vehicle.type}</p>
            <p className="text-primary font-bold mt-2">${vehicle.pricePerDay}/day</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => handleDelete(vehicle._id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Add Vehicle</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Type (Scooter/Car)" onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-field mb-3" required />
              <input type="text" placeholder="Model" onChange={(e) => setFormData({...formData, model: e.target.value})} className="input-field mb-3" required />
              <input type="number" placeholder="Price per day" onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="input-field mb-3" required />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;