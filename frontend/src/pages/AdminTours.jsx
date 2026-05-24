import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTours = () => {
  // Removed unused 'setTours' as data is static for the demo
  const [tours] = useState([
    { _id: 1, name: 'Cultural Triangle Tour', location: 'Kandy', price: 250, description: '5 days cultural experience' },
    { _id: 2, name: 'Galle Day Tour', location: 'Galle', price: 180, description: '1 day fort tour' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', location: '', duration: '', price: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Tour package created');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this tour?')) {
      toast.success('Deleted');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tour Packages</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add New Tour
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tours.map(tour => (
              <tr key={tour._id}>
                <td className="px-6 py-4 font-medium">{tour.name}</td>
                <td className="px-6 py-4">{tour.location}</td>
                <td className="px-6 py-4">${tour.price}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(tour._id)} className="text-red-600"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Add Tour Package</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field mb-3" required />
              <input type="text" placeholder="Location" onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-field mb-3" required />
              <input type="text" placeholder="Duration (e.g., 5 days)" onChange={(e) => setFormData({...formData, duration: e.target.value})} className="input-field mb-3" required />
              <input type="number" placeholder="Price" onChange={(e) => setFormData({...formData, price: e.target.value})} className="input-field mb-3" required />
              <textarea placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-field mb-3" rows="3" required />
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

export default AdminTours;