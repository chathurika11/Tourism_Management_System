import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

// Fix Leaflet icons (required for markers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getCoordinates = (item) => {
  if (!item || !item.coordinates) return null;
  if (Array.isArray(item.coordinates)) return [item.coordinates[0], item.coordinates[1]];
  if (item.coordinates.lat && item.coordinates.lng) return [item.coordinates.lat, item.coordinates.lng];
  return null;
};

const calculateOptimalRoute = (startPoint, places) => {
  if (!startPoint || !places.length) return [];
  const points = [...places];
  const ordered = [];
  let currentPoint = startPoint;
  while (points.length) {
    let closestIdx = 0, closestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const [lat1, lng1] = currentPoint;
      const [lat2, lng2] = points[i].coordinates;
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    }
    ordered.push(points[closestIdx]);
    currentPoint = points[closestIdx].coordinates;
    points.splice(closestIdx, 1);
  }
  return ordered;
};

// ---------- Separate component for each district map ----------
const DistrictMap = ({ startPoint, positions, optimalRoute, districtName }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && positions.length) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
    }
  }, [map, positions]);

  const createNumberedIcon = (number, isStart = false) => {
    if (isStart) {
      return L.divIcon({
        html: `<div style="background:#D4AF37; color:#093C5D; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold;">S</div>`,
        className: 'custom-div-icon', iconSize: [30,30], popupAnchor: [0,-15]
      });
    }
    return L.divIcon({
      html: `<div style="background:#093C5D; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${number}</div>`,
      className: 'custom-div-icon', iconSize: [30,30], popupAnchor: [0,-15]
    });
  };

  return (
    <MapContainer
      ref={setMap}
      center={startPoint}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={startPoint} icon={createNumberedIcon(0, true)}>
        <Popup>Start: {districtName}</Popup>
      </Marker>
      {optimalRoute.map((marker, i) => (
        <Marker key={marker.name} position={marker.coordinates} icon={createNumberedIcon(i + 1)}>
          <Popup>{i + 1}. {marker.name}</Popup>
        </Marker>
      ))}
      {positions.length > 1 && <Polyline positions={positions} color="#D4AF37" weight={4} />}
    </MapContainer>
  );
};

// ---------- Main CustomBooking component ----------
const CustomBooking = () => {
  const navigate = useNavigate();
  const location = useLocation(); // to read returnToStep from state
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const [destinations, setDestinations] = useState([
    { id: 1, districtId: '', districtName: '', places: [], needGuide: false, guideId: '', needHotel: false, hotelBudget: '', hotelId: '', needVehicle: false, vehicleId: '' }
  ]);
  const [nextId, setNextId] = useState(2);

  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [guidesMap, setGuidesMap] = useState({});
  const [vehiclesMap, setVehiclesMap] = useState({});
  const [hotelsMap, setHotelsMap] = useState({});
  const [loadingServices, setLoadingServices] = useState({});

  // On mount, check if we should return to a specific step (from Payment page)
  useEffect(() => {
    if (location.state?.returnToStep) {
      setStep(location.state.returnToStep);
      // Clear the state so it doesn't persist on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Helper for minimum start date (48 hours from now)
  const getMinStartDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    return date.toISOString().split('T')[0];
  };

  // Persist progress for unauthenticated users
  useEffect(() => {
    const savePending = () => {
      const payload = { destinations, startDate, endDate, passengers };
      sessionStorage.setItem('pendingCustomBooking', JSON.stringify(payload));
    };
    const id = setInterval(savePending, 3000);
    return () => clearInterval(id);
  }, [destinations, startDate, endDate, passengers]);

  // Load districts
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await API.get('/districts');
        setDistricts(res.data);
        if (res.data.length === 0) toast('No destinations available. Ask admin to add districts.');
      } catch (err) {
        toast.error('Failed to load destinations');
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    // restore pending booking
    const pending = sessionStorage.getItem('pendingCustomBooking');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (parsed.passengers) setPassengers(parsed.passengers);
        if (parsed.destinations) setDestinations(parsed.destinations);
        sessionStorage.removeItem('pendingCustomBooking');
      } catch (e) { console.warn('Invalid pendingCustomBooking', e); }
    }
  }, []);

  const fetchItemsForDistrict = async (districtId, districtName) => {
    setLoadingServices(prev => ({ ...prev, [districtId]: true }));
    try {
      if (!guidesMap[districtId]) {
        const res = await API.get(`/guides?district=${encodeURIComponent(districtName)}`);
        setGuidesMap(prev => ({ ...prev, [districtId]: res.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch guides for ${districtName}:`, err);
      toast.error(`Failed to load guides for ${districtName}`);
    }
    try {
      if (!vehiclesMap[districtId]) {
        const res = await API.get(`/vehicles?district=${encodeURIComponent(districtName)}`);
        setVehiclesMap(prev => ({ ...prev, [districtId]: res.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch vehicles for ${districtName}:`, err);
      toast.error(`Failed to load vehicles for ${districtName}`);
    }
    try {
      if (!hotelsMap[districtId]) {
        const res = await API.get(`/hotels?district=${encodeURIComponent(districtName)}`);
        setHotelsMap(prev => ({ ...prev, [districtId]: res.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch hotels for ${districtName}:`, err);
      toast.error(`Failed to load hotels for ${districtName}`);
    }
    setLoadingServices(prev => ({ ...prev, [districtId]: false }));
  };

  // Total nights – fixed (no subtraction)
  const numberOfNights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const addDestination = () => {
    setDestinations([...destinations, { id: nextId, districtId: '', districtName: '', places: [], needGuide: false, guideId: '', needHotel: false, hotelBudget: '', hotelId: '', needVehicle: false, vehicleId: '' }]);
    setNextId(nextId + 1);
  };

  const removeDestination = (id) => {
    if (destinations.length === 1) { toast.error('At least one destination required'); return; }
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const updateDestination = (id, field, value) => {
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const togglePlace = (id, placeId) => {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;
    const newPlaces = dest.places.includes(placeId) ? dest.places.filter(p => p !== placeId) : [...dest.places, placeId];
    updateDestination(id, 'places', newPlaces);
  };

  const handleDistrictChange = async (id, districtId) => {
    const district = districts.find(d => d.id === districtId);
    updateDestination(id, 'districtId', districtId);
    updateDestination(id, 'districtName', district?.name || '');
    updateDestination(id, 'places', []);
    updateDestination(id, 'guideId', '');
    updateDestination(id, 'hotelId', '');
    updateDestination(id, 'vehicleId', '');
    if (district) {
      await fetchItemsForDistrict(districtId, district.name);
    }
  };

  const calculateTotal = useMemo(() => {
    let total = 0;
    const days = numberOfNights + 1;
    destinations.forEach(d => {
      if (d.needGuide && d.guideId) {
        const guide = (guidesMap[d.districtId] || []).find(g => g.id === d.guideId);
        if (guide) total += guide.pricePerDay * days;
      }
      if (d.needVehicle && d.vehicleId) {
        const vehicle = (vehiclesMap[d.districtId] || []).find(v => v.id === d.vehicleId);
        if (vehicle) total += vehicle.pricePerDay * days;
      }
      if (d.needHotel && d.hotelId) {
        const hotel = (hotelsMap[d.districtId] || []).find(h => h.id === d.hotelId);
        if (hotel) total += hotel.pricePerNight * days;
      }
    });
    return total;
  }, [destinations, numberOfNights, guidesMap, vehiclesMap, hotelsMap]);

  const validateStep1 = () => {
    for (let i = 0; i < destinations.length; i++) {
      const d = destinations[i];
      if (!d.districtId) { toast.error(`Please select district for destination ${i + 1}`); return false; }
      if (d.places.length === 0) { toast.error(`Please select at least one place for ${d.districtName}`); return false; }
      if (d.needGuide && !d.guideId) { toast.error(`Please select a guide for ${d.districtName}`); return false; }
      if (d.needHotel && !d.hotelId) { toast.error(`Please select a hotel for ${d.districtName}`); return false; }
    }
    return true;
  };

  const validateStep2 = () => {
    if (!startDate || !endDate) { toast.error('Please select both start and end dates'); return false; }
    const minStartDate = new Date();
    minStartDate.setHours(minStartDate.getHours() + 48);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start < minStartDate) { toast.error('Bookings must be made at least 48 hours in advance.'); return false; }
    if (end <= start) { toast.error('End date must be after start date'); return false; }
    const destCount = destinations.filter(d => d.districtId).length;
    if (destCount > 1 && numberOfNights < destCount) {
      toast.error(`For ${destCount} destinations, you need at least ${destCount} nights total.`);
      return false;
    }
    return true;
  };

  const validateStep3 = () => passengers >= 1;
  const validateStep4 = () => {
    for (let i = 0; i < destinations.length; i++) {
      const d = destinations[i];
      if (d.needVehicle && !d.vehicleId) {
        toast.error(`Please select a vehicle for ${d.districtName}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
    else if (step === 4 && validateStep4()) setStep(5);
    else if (step === 5) setStep(6);
    else if (step === 6) setStep(7);
  };
  const handlePrev = () => { if (step > 1) setStep(step - 1); };

  const handleConfirmBooking = async () => {
    if (!user) {
      sessionStorage.setItem('pendingCustomBooking', JSON.stringify({
        destinations,
        startDate,
        endDate,
        passengers,
      }));
      toast.error('Please login to confirm booking');
      navigate('/login');
      return;
    }
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;

    const allDestinationsData = destinations.map(d => {
      const districtObj = districts.find(di => di.id === d.districtId);
      const placesList = d.places.map(pid => districtObj?.places.find(p => p.id === pid)).filter(Boolean);
      return {
        district: d.districtName,
        places: placesList.map(p => p.name),
        guide: d.needGuide ? (guidesMap[d.districtId] || []).find(g => g.id === d.guideId) : null,
        vehicle: d.needVehicle ? (vehiclesMap[d.districtId] || []).find(v => v.id === d.vehicleId) : null,
        hotel: d.needHotel ? (hotelsMap[d.districtId] || []).find(h => h.id === d.hotelId) : null,
      };
    });
    const totalAmount = calculateTotal;
    const days = numberOfNights + 1;
    try {
      const res = await API.post('/bookings', {
        type: 'Multi-District Custom Tour',
        destinations: allDestinationsData,
        startDate, endDate, numberOfDays: days, nights: numberOfNights,
        passengers, totalAmount, status: 'pending', paymentStatus: 'unpaid',
      });
      sessionStorage.setItem('pendingBooking', JSON.stringify(res.data));
      setSelectedRoute({ startDate, endDate, numberOfNights, passengers, allDestinations: allDestinationsData });
      setShowConfirmModal(true);
    } catch (err) {
      toast.error('Failed to create booking');
    }
  };

  const finalConfirmBooking = () => navigate('/payment');

  // ---------- Step 1 – Select Destinations (No Vehicle checkbox) ----------
  const renderStep1 = () => {
    if (loadingDistricts) return <div className="text-center py-8">Loading destinations...</div>;
    if (districts.length === 0) {
      return (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700">⚠️ No destinations available yet.</p>
          <p className="text-sm text-gray-600 mt-2">Please contact the administrator to add districts and places.</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Select Your Destinations</h2>
        {destinations.map((dest, idx) => {
          const isLoading = loadingServices[dest.districtId] || false;
          const guides = guidesMap[dest.districtId] || [];
          const hotels = hotelsMap[dest.districtId] || [];

          return (
            <div key={dest.id} className="border rounded-xl p-4 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Destination {idx + 1}</h3>
                {destinations.length > 1 && <button onClick={() => removeDestination(dest.id)} className="text-red-500 text-sm">Remove</button>}
              </div>
              <select
                className="input-field mb-3"
                value={dest.districtId || ""}
                onChange={(e) => handleDistrictChange(dest.id, e.target.value)}
              >
                <option value="">-- Select district --</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {dest.districtId && (
                <>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Places (select at least one)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                      {(districts.find(d => d.id === dest.districtId)?.places || []).map(place => (
                        <label key={place.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={dest.places.includes(place.id)}
                            onChange={() => togglePlace(dest.id, place.id)}
                          />
                          {place.name}
                        </label>
                      ))}
                    </div>
                    {dest.places.length > 0 && <div className="text-green-600 text-xs mt-1">✓ {dest.places.length} selected</div>}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={dest.needGuide}
                        onChange={e => updateDestination(dest.id, 'needGuide', e.target.checked)}
                      /> Need a Guide
                    </label>
                    {dest.needGuide && (
                      <div className="mb-2">
                        {isLoading ? (
                          <p className="text-sm text-gray-500">Loading guides...</p>
                        ) : guides.length === 0 ? (
                          <p className="text-sm text-red-500">No guides found for this district</p>
                        ) : (
                          <select className="input-field" value={dest.guideId || ""} onChange={e => updateDestination(dest.id, 'guideId', e.target.value)}>
                            <option value="">Select guide</option>
                            {guides.map(g => <option key={g.id} value={g.id}>{g.name} – Rs {g.pricePerDay}/day</option>)}
                          </select>
                        )}
                      </div>
                    )}
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={dest.needHotel}
                        onChange={e => updateDestination(dest.id, 'needHotel', e.target.checked)}
                      /> Need a Hotel
                    </label>
                    {dest.needHotel && (
                      <div className="mb-2">
                        {isLoading ? (
                          <p className="text-sm text-gray-500">Loading hotels...</p>
                        ) : hotels.length === 0 ? (
                          <p className="text-sm text-red-500">No hotels found for this district</p>
                        ) : (
                          <>
                            <select className="input-field mb-2" value={dest.hotelBudget || ""} onChange={e => {
                              updateDestination(dest.id, 'hotelBudget', e.target.value);
                              updateDestination(dest.id, 'hotelId', '');
                            }}>
                              <option value="">Budget (optional)</option>
                              <option value="budget">Budget ≤7000</option>
                              <option value="mid">Mid 7000-12000</option>
                              <option value="luxury">Luxury ≥12000</option>
                            </select>
                            <select className="input-field" value={dest.hotelId || ""} onChange={e => updateDestination(dest.id, 'hotelId', e.target.value)}>
                              <option value="">Select hotel</option>
                              {hotels.filter(h => {
                                if (!dest.hotelBudget) return true;
                                if (dest.hotelBudget === 'budget') return h.pricePerNight <= 7000;
                                if (dest.hotelBudget === 'mid') return h.pricePerNight > 7000 && h.pricePerNight <= 12000;
                                if (dest.hotelBudget === 'luxury') return h.pricePerNight > 12000;
                                return true;
                              }).map(h => <option key={h.id} value={h.id}>{h.name} – Rs {h.pricePerNight}/night</option>)}
                            </select>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <button onClick={addDestination} className="btn-secondary w-full">+ Add Another Destination</button>
      </div>
    );
  };

  // ---------- Step 2 – Travel Dates ----------
  const renderStep2 = () => {
    const minDate = getMinStartDate();
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Travel Dates</h2>
        <div>
          <label className="block mb-1">Start Date (minimum 48 hours from now)</label>
          <input type="date" className="input-field" value={startDate} min={minDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">End Date</label>
          <input type="date" className="input-field" value={endDate} min={startDate || minDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {numberOfNights >= 0 && <div className="bg-blue-50 p-3 rounded text-primary font-semibold">🏨 Total nights: {numberOfNights}</div>}
        <p className="text-sm text-gray-500">Note: If you have multiple destinations, total nights must be at least the number of destinations.</p>
      </div>
    );
  };

  // ---------- Step 3 – Passengers ----------
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Number of Passengers</h2>
      <div className="flex items-center gap-4">
        <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-10 h-10 rounded-full bg-gray-200">-</button>
        <span className="text-2xl font-semibold">{passengers}</span>
        <button onClick={() => setPassengers(passengers + 1)} className="w-10 h-10 rounded-full bg-gray-200">+</button>
      </div>
      <p className="text-sm text-gray-500">Note: If you select a guide for a destination, the vehicle capacity will increase by 1 seat for that district.</p>
    </div>
  );

  // ---------- Step 4 – Select Vehicles (only) ----------
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select Vehicles (if needed)</h2>
      {destinations.map((dest, idx) => {
        const requiredSeats = passengers + (dest.needGuide ? 1 : 0);
        const available = (vehiclesMap[dest.districtId] || []).filter(v => v.passengers >= requiredSeats);
        return (
          <div key={dest.id} className="border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Destination {idx + 1}: {dest.districtName}</h3>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={dest.needVehicle}
                onChange={e => {
                  updateDestination(dest.id, 'needVehicle', e.target.checked);
                  if (!e.target.checked) updateDestination(dest.id, 'vehicleId', '');
                }}
              /> Need a Vehicle
            </label>
            {dest.needVehicle && (
              <>
                <p className="text-sm text-gray-600 mb-2">Required seats: {requiredSeats}</p>
                <select className="input-field" value={dest.vehicleId || ""} onChange={e => updateDestination(dest.id, 'vehicleId', e.target.value)}>
                  <option value="">Select vehicle</option>
                  {available.map(v => <option key={v.id} value={v.id}>{v.model} – Rs {v.pricePerDay}/day (seats {v.passengers})</option>)}
                </select>
                {available.length === 0 && <p className="text-red-500 text-sm mt-2">⚠️ No vehicle available</p>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  // ---------- Step 5 – Review Itinerary ----------
  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Review Itinerary</h2>
      {destinations.map((d, idx) => {
        const districtObj = districts.find(di => di.id === d.districtId);
        const placeNames = d.places.map(pid => districtObj?.places.find(p => p.id === pid)?.name).filter(Boolean);
        return (
          <div key={d.id} className="border rounded-lg p-4">
            <h3 className="font-bold text-primary">Destination {idx + 1}: {d.districtName}</h3>
            <p><strong>Places:</strong> {placeNames.join(', ') || 'None'}</p>
            {d.needGuide && <p>Guide: {(guidesMap[d.districtId] || []).find(g => g.id === d.guideId)?.name}</p>}
            {d.needVehicle && <p>Vehicle: {(vehiclesMap[d.districtId] || []).find(v => v.id === d.vehicleId)?.model}</p>}
            {d.needHotel && <p>Hotel: {(hotelsMap[d.districtId] || []).find(h => h.id === d.hotelId)?.name}</p>}
          </div>
        );
      })}
    </div>
  );

  // ---------- Step 6 – Route Maps ----------
  const renderStep6 = () => {
    const allMaps = destinations.map((dest, idx) => {
      const districtObj = districts.find(d => d.id === dest.districtId);
      if (!districtObj) return null;

      const selectedPlaces = dest.places
        .map(pid => districtObj.places.find(p => p.id === pid))
        .filter(p => p && getCoordinates(p));

      if (selectedPlaces.length === 0) {
        return (
          <div key={dest.id} className="border rounded-lg p-4 bg-yellow-50">
            <p className="text-yellow-700">⚠️ No places with coordinates selected for {dest.districtName}.</p>
            <p className="text-sm text-gray-600">Add coordinates to places in the admin panel to see them on the map.</p>
          </div>
        );
      }

      let startPoint = getCoordinates(districtObj);
      if (!startPoint) {
        startPoint = selectedPlaces[0].coordinates;
      }

      const positions = [startPoint, ...selectedPlaces.map(p => getCoordinates(p))];
      const optimalRoute = calculateOptimalRoute(startPoint, selectedPlaces.map(p => ({ name: p.name, coordinates: getCoordinates(p) })));
      const isOpen = expandedMap === dest.id;

      // Unique key to force remount
      const containerKey = `map-${dest.id}-${isOpen ? 'open' : 'closed'}`;

      return (
        <div key={dest.id} className="border rounded-lg mb-4">
          <button
            onClick={() => {
              setExpandedMap(isOpen ? null : dest.id);
            }}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
          >
            <span className="font-semibold text-primary">
              District {idx + 1}: {dest.districtName} ({dest.places.length} places, {selectedPlaces.length} with coordinates)
            </span>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          {isOpen && (
            <div className="p-4">
              <div className="border rounded-lg overflow-hidden" style={{ height: '350px', width: '100%' }}>
                <DistrictMap
                  key={containerKey}
                  startPoint={startPoint}
                  positions={positions}
                  optimalRoute={optimalRoute}
                  districtName={dest.districtName}
                />
              </div>
              <div className="bg-blue-50 p-2 rounded mt-2 text-sm">
                Optimised route: {optimalRoute.map(p => p.name).join(' → ')}
              </div>
            </div>
          )}
        </div>
      );
    });
    return <div className="space-y-6"><h2 className="text-2xl font-bold text-primary">Route Maps</h2>{allMaps}</div>;
  };

  // ---------- Step 7 – Total Price ----------
  const renderStep7 = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-primary">Total Price</h2>
      <div className="text-4xl font-bold text-primary">Rs {calculateTotal.toLocaleString()}</div>
      <button onClick={handleConfirmBooking} className="btn-primary w-full py-3">Confirm Booking →</button>
    </div>
  );

  // ---------- Confirm Modal ----------
  const renderConfirmModal = () => {
    if (!selectedRoute) return null;
    const total = calculateTotal;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Confirm Booking</h2>
            <button onClick={() => setShowConfirmModal(false)}><X size={24} /></button>
          </div>
          <p><strong>Dates:</strong> {startDate} – {endDate} ({selectedRoute.numberOfNights} nights)</p>
          <p><strong>Passengers:</strong> {passengers}</p>
          {selectedRoute.allDestinations.map((d, i) => (
            <div key={i} className="border-t mt-3 pt-3">
              <h3 className="font-bold">Destination {i + 1}: {d.district}</h3>
              <p>Places: {d.places.join(', ')}</p>
              {d.guide && <p>Guide: {d.guide.name} (Rs {d.guide.pricePerDay}/day)</p>}
              {d.vehicle && <p>Vehicle: {d.vehicle.model} (Rs {d.vehicle.pricePerDay}/day)</p>}
              {d.hotel && <p>Hotel: {d.hotel.name} (Rs {d.hotel.pricePerNight}/night)</p>}
            </div>
          ))}
          <div className="text-right text-xl font-bold mt-4">Total: Rs {total.toLocaleString()}</div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setStep(6);
              }}
              className="btn-outline flex-1"
            >
              Edit
            </button>
            <button onClick={finalConfirmBooking} className="btn-primary flex-1">Confirm & Pay</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <div key={num} className={`flex flex-col items-center ${step >= num ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= num ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>{num}</div>
              <span className="text-xs mt-1 hidden md:block">
                {num === 1 ? 'Destination' :
                  num === 2 ? 'Dates' :
                  num === 3 ? 'Passenger' :
                  num === 4 ? 'Vehicle' :
                  num === 5 ? 'Review' :
                  num === 6 ? 'Maps' :
                  'Total'}
              </span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
          {step < 7 && (
            <div className="flex justify-between mt-8">
              {step > 1 && <button onClick={handlePrev} className="btn-outline">← Back</button>}
              <button onClick={handleNext} className={`btn-primary ${step === 1 ? 'w-full' : 'ml-auto'}`}>Continue →</button>
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
};

export default CustomBooking;