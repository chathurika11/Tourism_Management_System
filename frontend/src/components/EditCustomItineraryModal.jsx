import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const EditCustomItineraryModal = ({ isOpen, onClose, booking, onUpdate }) => {
  const [destinations, setDestinations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guidesMap, setGuidesMap] = useState({});
  const [hotelsMap, setHotelsMap] = useState({});
  const [vehiclesMap, setVehiclesMap] = useState({});

  useEffect(() => {
    if (isOpen && booking) {
      setLoading(true);
      API.get('/districts')
        .then(res => {
          setDistricts(res.data);
          const initialDests = booking.destinations || [];
          // If no destinations, create a default one
          const destsWithId = initialDests.length ? initialDests.map((d, idx) => ({
            id: Date.now() + idx,
            districtId: d.districtId || '',
            districtName: d.district || '',
            places: d.places || [],
            needGuide: !!d.guide,
            guideId: d.guide?.id || '',
            needHotel: !!d.hotel,
            hotelId: d.hotel?.id || '',
            needVehicle: !!d.vehicle,
            vehicleId: d.vehicle?.id || '',
          })) : [{
            id: Date.now(),
            districtId: '',
            districtName: '',
            places: [],
            needGuide: false,
            guideId: '',
            needHotel: false,
            hotelId: '',
            needVehicle: false,
            vehicleId: '',
          }];
          setDestinations(destsWithId);
        })
        .catch(() => toast.error('Failed to load districts'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, booking]);

  const fetchItemsForDistrict = async (districtId, districtName) => {
    if (!guidesMap[districtId]) {
      try {
        const res = await API.get(`/guides?district=${encodeURIComponent(districtName)}`);
        setGuidesMap(prev => ({ ...prev, [districtId]: res.data }));
      } catch (err) { console.error(err); }
    }
    if (!vehiclesMap[districtId]) {
      try {
        const res = await API.get(`/vehicles?district=${encodeURIComponent(districtName)}`);
        setVehiclesMap(prev => ({ ...prev, [districtId]: res.data }));
      } catch (err) { console.error(err); }
    }
    if (!hotelsMap[districtId]) {
      try {
        const res = await API.get(`/hotels?district=${encodeURIComponent(districtName)}`);
        setHotelsMap(prev => ({ ...prev, [districtId]: res.data }));
      } catch (err) { console.error(err); }
    }
  };

  const addDestination = () => {
    setDestinations([...destinations, {
      id: Date.now(),
      districtId: '',
      districtName: '',
      places: [],
      needGuide: false,
      guideId: '',
      needHotel: false,
      hotelId: '',
      needVehicle: false,
      vehicleId: '',
    }]);
  };

  const removeDestination = (id) => {
    if (destinations.length === 1) { toast.error('At least one destination required'); return; }
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const updateDest = (id, field, value) => {
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const togglePlace = (destId, placeId) => {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return;
    const newPlaces = dest.places.includes(placeId) ? dest.places.filter(p => p !== placeId) : [...dest.places, placeId];
    updateDest(destId, 'places', newPlaces);
  };

  const handleDistrictChange = async (destId, districtId) => {
    const district = districts.find(d => d.id === districtId);
    updateDest(destId, 'districtId', districtId);
    updateDest(destId, 'districtName', district?.name || '');
    updateDest(destId, 'places', []);
    updateDest(destId, 'guideId', '');
    updateDest(destId, 'hotelId', '');
    updateDest(destId, 'vehicleId', '');
    if (district) {
      await fetchItemsForDistrict(districtId, district.name);
    }
  };

  const handleSave = async () => {
    for (let d of destinations) {
      if (!d.districtId) { toast.error('Please select district for all destinations'); return; }
      if (d.places.length === 0) { toast.error(`Please select at least one place for ${d.districtName}`); return; }
      if (d.needGuide && !d.guideId) { toast.error(`Please select a guide for ${d.districtName}`); return; }
      if (d.needHotel && !d.hotelId) { toast.error(`Please select a hotel for ${d.districtName}`); return; }
      if (d.needVehicle && !d.vehicleId) { toast.error(`Please select a vehicle for ${d.districtName}`); return; }
    }

    const payload = {
      destinations: destinations.map(d => ({
        district: d.districtName,
        places: d.places.map(pid => {
          const districtObj = districts.find(di => di.id === d.districtId);
          return districtObj?.places.find(p => p.id === pid)?.name || '';
        }).filter(Boolean),
        guide: d.needGuide ? { id: d.guideId } : null,
        hotel: d.needHotel ? { id: d.hotelId } : null,
        vehicle: d.needVehicle ? { id: d.vehicleId } : null,
      })),
    };

    setSaving(true);
    try {
      await API.put(`/bookings/${booking.id}`, payload);
      toast.success('Itinerary updated – pending admin confirmation');
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Modify Itinerary</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="space-y-4">
              {destinations.map((dest, idx) => {
                const selectedDistrict = districts.find(d => d.id === dest.districtId);
                const places = selectedDistrict?.places || [];
                const guides = guidesMap[dest.districtId] || [];
                const hotels = hotelsMap[dest.districtId] || [];
                const vehicles = vehiclesMap[dest.districtId] || [];

                return (
                  <div key={dest.id} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Destination {idx+1}</h3>
                      {destinations.length > 1 && (
                        <button onClick={() => removeDestination(dest.id)} className="text-red-500 text-sm">Remove</button>
                      )}
                    </div>
                    <select
                      className="input-field mb-2"
                      value={dest.districtId || ""}
                      onChange={(e) => handleDistrictChange(dest.id, e.target.value)}
                    >
                      <option value="">-- Select district --</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {dest.districtId && (
                      <>
                        <div className="mb-2">
                          <label className="block text-sm text-gray-700">Places</label>
                          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border rounded p-2">
                            {places.map(place => (
                              <label key={place.id} className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={dest.places.includes(place.id)}
                                  onChange={() => togglePlace(dest.id, place.id)}
                                />
                                {place.name}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={dest.needGuide}
                              onChange={e => updateDest(dest.id, 'needGuide', e.target.checked)}
                            /> Guide
                          </label>
                          {dest.needGuide && (
                            <select
                              className="input-field text-sm py-1 flex-1 min-w-[120px]"
                              value={dest.guideId || ""}
                              onChange={e => updateDest(dest.id, 'guideId', e.target.value)}
                            >
                              <option value="">Select guide</option>
                              {guides.map(g => <option key={g.id} value={g.id}>{g.name} – Rs {g.pricePerDay}/day</option>)}
                            </select>
                          )}
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={dest.needHotel}
                              onChange={e => updateDest(dest.id, 'needHotel', e.target.checked)}
                            /> Hotel
                          </label>
                          {dest.needHotel && (
                            <select
                              className="input-field text-sm py-1 flex-1 min-w-[120px]"
                              value={dest.hotelId || ""}
                              onChange={e => updateDest(dest.id, 'hotelId', e.target.value)}
                            >
                              <option value="">Select hotel</option>
                              {hotels.map(h => <option key={h.id} value={h.id}>{h.name} – Rs {h.pricePerNight}/night</option>)}
                            </select>
                          )}
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={dest.needVehicle}
                              onChange={e => updateDest(dest.id, 'needVehicle', e.target.checked)}
                            /> Vehicle
                          </label>
                          {dest.needVehicle && (
                            <select
                              className="input-field text-sm py-1 flex-1 min-w-[120px]"
                              value={dest.vehicleId || ""}
                              onChange={e => updateDest(dest.id, 'vehicleId', e.target.value)}
                            >
                              <option value="">Select vehicle</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.model} – Rs {v.pricePerDay}/day</option>)}
                            </select>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <button onClick={addDestination} className="btn-secondary w-full">+ Add Destination</button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Itinerary'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditCustomItineraryModal;