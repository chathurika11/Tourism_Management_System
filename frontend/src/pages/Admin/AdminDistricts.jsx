import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const AdminDistricts = () => {
  const [districts, setDistricts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [districtName, setDistrictName] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [placeCoords, setPlaceCoords] = useState('');

  const fetchDistricts = async () => {
    const res = await API.get('/districts');
    setDistricts(res.data);
  };

  useEffect(() => { fetchDistricts(); }, []);

  const handleSaveDistrict = async () => {
    if (!districtName.trim()) return toast.error('District name required');
    if (editingDistrict) {
      await API.put(`/districts/${editingDistrict.id}`, { name: districtName });
      toast.success('District updated');
    } else {
      await API.post('/districts', { name: districtName });
      toast.success('District created');
    }
    fetchDistricts();
    setShowModal(false);
    setDistrictName('');
    setEditingDistrict(null);
  };

  const handleDeleteDistrict = async (id) => {
    if (window.confirm('Delete district and all its places?')) {
      await API.delete(`/districts/${id}`);
      fetchDistricts();
      toast.success('Deleted');
    }
  };

  const handleAddPlace = async (districtId) => {
    if (!placeName.trim()) return toast.error('Place name required');
    let coords = null;
    if (placeCoords) {
      const parts = placeCoords.split(',').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coords = [parts[0], parts[1]];
      } else {
        toast.error('Coordinates must be two numbers separated by comma (e.g., 6.9271,79.8612)');
        return;
      }
    }
    if (editingPlace) {
      await API.put(`/districts/places/${editingPlace.id}`, { name: placeName, coordinates: coords });
      toast.success('Place updated');
    } else {
      await API.post('/districts/places', { name: placeName, coordinates: coords, districtId });
      toast.success('Place added');
    }
    fetchDistricts();
    setEditingPlace(null);
    setPlaceName('');
    setPlaceCoords('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Manage Destinations (Districts & Places)</h1>
        <button onClick={() => { setEditingDistrict(null); setDistrictName(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add District
        </button>
      </div>
      <div className="space-y-6">
        {districts.map(district => (
          <div key={district.id} className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-primary">{district.name}</h2>
              <div className="flex gap-2">
                <button onClick={() => { setEditingDistrict(district); setDistrictName(district.name); setShowModal(true); }} className="text-blue-600"><Edit2 size={18} /></button>
                <button onClick={() => handleDeleteDistrict(district.id)} className="text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold mb-2">Places</h3>
              <div className="space-y-2">
                {district.places.map(place => (
                  <div key={place.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div><span>{place.name}</span>{place.coordinates && <span className="text-xs text-gray-500 ml-2">({place.coordinates.join(', ')})</span>}</div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingPlace(place); setPlaceName(place.name); setPlaceCoords(place.coordinates ? place.coordinates.join(',') : ''); }} className="text-blue-600"><Edit2 size={14} /></button>
                      <button onClick={async () => { if (window.confirm('Delete place?')) { await API.delete(`/districts/places/${place.id}`); fetchDistricts(); } }} className="text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input type="text" placeholder="Place name" value={placeName} onChange={e => setPlaceName(e.target.value)} className="input-field text-sm" />
                <input type="text" placeholder="Coordinates (lat,lng)" value={placeCoords} onChange={e => setPlaceCoords(e.target.value)} className="input-field text-sm" />
                <button onClick={() => handleAddPlace(district.id)} className="btn-primary text-sm px-3 py-1">{editingPlace ? 'Update' : 'Add Place'}</button>
                {editingPlace && <button onClick={() => { setEditingPlace(null); setPlaceName(''); setPlaceCoords(''); }} className="btn-outline text-sm">Cancel</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-96">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">{editingDistrict ? 'Edit District' : 'New District'}</h2><button onClick={() => setShowModal(false)}><X size={24} /></button></div>
            <input type="text" value={districtName} onChange={e => setDistrictName(e.target.value)} placeholder="District name" className="input-field mb-4" />
            <div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button><button onClick={handleSaveDistrict} className="btn-primary flex-1">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDistricts;