import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { 
  tourGuides, getGuidesByDistrict, 
  vehicles, 
  getHotelsByDistrictAndBudget, getHotelsByDistrict 
} from '../data/tourismData';
import API from '../services/api';

// Lazy load leaflet components (only when a map is expanded)
const MapContainer = lazy(() => import('react-leaflet').then(module => ({ default: module.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(module => ({ default: module.TileLayer })));
const Marker = lazy(() => import('react-leaflet').then(module => ({ default: module.Marker })));
const Popup = lazy(() => import('react-leaflet').then(module => ({ default: module.Popup })));
const Polyline = lazy(() => import('react-leaflet').then(module => ({ default: module.Polyline })));

// Fix Leaflet icons (runs once, outside component)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// FitBounds component – uses useMap
const FitBounds = ({ positions }) => {
  const map = useMap();
  React.useEffect(() => {
    if (positions && positions.length) map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
  }, [map, positions]);
  return null;
};

// Optimised route calculation (pure function)
const calculateOptimalRoute = (startPoint, places) => {
  if (!places.length) return [];
  const points = [...places];
  const ordered = [];
  let currentPoint = startPoint;
  while (points.length) {
    let closestIdx = 0, closestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const lat1 = currentPoint[0], lng1 = currentPoint[1];
      const lat2 = points[i].coordinates[0], lng2 = points[i].coordinates[1];
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

const CustomBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useTour();
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const [destinations, setDestinations] = useState([
    { id: 1, district: '', places: [], needGuide: false, guideId: '', needHotel: false, hotelBudget: '', hotelId: '', needVehicle: false, vehicleId: '' }
  ]);
  const [nextId, setNextId] = useState(2);

  const districtsList = {
    'Colombo': ['Galle Face Green', 'Gangaramaya Temple', 'National Museum', 'Viharamahadevi Park', 'Pettah Market'],
    'Kandy': ['Temple of the Tooth', 'Peradeniya Gardens', 'Kandy Lake', 'Bahiravokanda Vihara', 'Udawatta Kele Sanctuary'],
    'Galle': ['Galle Fort', 'Dutch Church', 'Galle Lighthouse', 'Japanese Peace Pagoda', 'Jungle Beach'],
    'Ella': ['Nine Arches Bridge', 'Ella Rock', "Little Adam's Peak", 'Ravana Falls', 'Demodara Loop'],
    'Nuwara Eliya': ['Gregory Lake', 'Hakgala Gardens', 'Tea Plantations', 'Victoria Park', 'Single Tree Hill'],
    'Sigiriya': ['Sigiriya Rock Fortress', 'Pidurangala Rock', 'Minneriya National Park', 'Dambulla Cave Temple'],
    'Anuradhapura': ['Sri Maha Bodhi', 'Ruwanwelisaya', 'Jetavanaramaya', 'Abhayagiri Monastery'],
    'Polonnaruwa': ['Gal Vihara', 'Parakrama Samudra', 'Royal Palace', 'Quadrangle'],
    'Yala': ['Yala National Park', 'Sithulpawwa Rock Temple', 'Kataragama Temple'],
    'Trincomalee': ['Nilaveli Beach', 'Koneswaram Temple', 'Pigeon Island', 'Uppuveli Beach'],
  };
  const districtCoordinates = {
    'Colombo': [6.9271, 79.8612], 'Kandy': [7.2906, 80.6337], 'Galle': [6.0328, 80.2168],
    'Ella': [6.8667, 81.0500], 'Nuwara Eliya': [6.9707, 80.7829], 'Sigiriya': [7.9569, 80.7596],
    'Anuradhapura': [8.3114, 80.4037], 'Polonnaruwa': [7.9393, 81.0003], 'Yala': [6.3762, 81.4753],
    'Trincomalee': [8.5774, 81.2248],
  };
  const placesCoordinates = {
    'Galle Face Green': [6.9271, 79.8570], 'Gangaramaya Temple': [6.9121, 79.8550],
    'National Museum': [6.9070, 79.8600], 'Viharamahadevi Park': [6.9100, 79.8620],
    'Pettah Market': [6.9400, 79.8600], 'Temple of the Tooth': [7.2939, 80.6413],
    'Peradeniya Gardens': [7.2712, 80.5980], 'Kandy Lake': [7.2900, 80.6350],
    'Bahiravokanda Vihara': [7.2850, 80.6400], 'Udawatta Kele Sanctuary': [7.3000, 80.6300],
    'Galle Fort': [6.0263, 80.2157], 'Dutch Church': [6.0258, 80.2160],
    'Galle Lighthouse': [6.0238, 80.2143], 'Japanese Peace Pagoda': [6.0400, 80.2150],
    'Jungle Beach': [6.0200, 80.2200], 'Nine Arches Bridge': [6.8510, 81.0557],
    'Ella Rock': [6.8667, 81.0500], "Little Adam's Peak": [6.8563, 81.0460],
    'Ravana Falls': [6.8032, 81.0220], 'Demodara Loop': [6.8700, 81.0600],
    'Gregory Lake': [6.9504, 80.7853], 'Hakgala Gardens': [6.9130, 80.8239],
    'Tea Plantations': [6.9600, 80.7700], 'Victoria Park': [6.9700, 80.7800],
    'Single Tree Hill': [6.9550, 80.7900], 'Sigiriya Rock Fortress': [7.9569, 80.7596],
    'Pidurangala Rock': [7.9472, 80.7531], 'Minneriya National Park': [7.9971, 80.8464],
    'Dambulla Cave Temple': [7.8567, 80.6494], 'Sri Maha Bodhi': [8.3445, 80.3969],
    'Ruwanwelisaya': [8.3507, 80.3969], 'Jetavanaramaya': [8.3500, 80.4000],
    'Abhayagiri Monastery': [8.3600, 80.4000], 'Gal Vihara': [7.9400, 81.0000],
    'Parakrama Samudra': [7.9300, 81.0100], 'Royal Palace': [7.9350, 81.0050],
    'Quadrangle': [7.9380, 81.0020], 'Yala National Park': [6.3762, 81.4753],
    'Sithulpawwa Rock Temple': [6.3900, 81.4700], 'Kataragama Temple': [6.4200, 81.3300],
    'Nilaveli Beach': [8.4591, 81.1816], 'Koneswaram Temple': [8.5720, 81.2417],
    'Pigeon Island': [8.4670, 81.2150], 'Uppuveli Beach': [8.4500, 81.1800],
  };

  const numberOfDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000*60*60*24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  const getAvailableGuides = (district) => getGuidesByDistrict(district);
  const getAvailableVehiclesForDestination = (dest, pax) => {
    const requiredSeats = pax + (dest.needGuide ? 1 : 0);
    return vehicles.filter(v => v.passengers >= requiredSeats).sort((a,b) => a.pricePerDay - b.pricePerDay);
  };
  const getAvailableHotels = (district, budget) => {
    if (!budget) return getHotelsByDistrict(district);
    return getHotelsByDistrictAndBudget(district, budget);
  };

  useEffect(() => {
    destinations.forEach(dest => {
      if (dest.needHotel && dest.hotelBudget && getAvailableHotels(dest.district, dest.hotelBudget).length === 0) {
        toast.error(`No hotels available in ${dest.district} for the selected budget.`);
      }
    });
  }, [destinations]);

  const addDestination = () => {
    setDestinations([...destinations, { id: nextId, district: '', places: [], needGuide: false, guideId: '', needHotel: false, hotelBudget: '', hotelId: '', needVehicle: false, vehicleId: '' }]);
    setNextId(nextId + 1);
  };
  const removeDestination = (id) => {
    if (destinations.length === 1) { toast.error('At least one destination required'); return; }
    setDestinations(destinations.filter(d => d.id !== id));
  };
  const updateDestination = (id, field, value) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: value } : d));
  };
  const togglePlace = (id, place) => {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;
    const newPlaces = dest.places.includes(place) ? dest.places.filter(p => p !== place) : [...dest.places, place];
    updateDestination(id, 'places', newPlaces);
  };

  const calculateTotal = useMemo(() => {
    let total = 0;
    destinations.forEach(d => {
      if (d.needGuide && d.guideId) {
        const guide = tourGuides.find(g => g.id === parseInt(d.guideId));
        if (guide) total += guide.pricePerDay * numberOfDays;
      }
      if (d.needVehicle && d.vehicleId) {
        const vehicle = vehicles.find(v => v.id === parseInt(d.vehicleId));
        if (vehicle) total += vehicle.pricePerDay * numberOfDays;
      }
      if (d.needHotel && d.hotelId) {
        const hotel = getHotelsByDistrict(d.district).find(h => h.id === parseInt(d.hotelId));
        if (hotel) total += hotel.pricePerNight * numberOfDays;
      }
    });
    return total;
  }, [destinations, numberOfDays]);

  // Validation functions
  const validateStep1 = () => {
    for (let i = 0; i < destinations.length; i++) {
      const d = destinations[i];
      if (!d.district) { toast.error(`Please select district for destination ${i+1}`); return false; }
      if (d.places.length === 0) { toast.error(`Please select at least one place for ${d.district}`); return false; }
      if (d.needGuide && !d.guideId) { toast.error(`Please select a guide for ${d.district}`); return false; }
      if (d.needHotel && !d.hotelId) { toast.error(`Please select a hotel for ${d.district}`); return false; }
    }
    return true;
  };
  const validateStep2 = () => {
    if (!startDate || !endDate) { toast.error('Please select both start and end dates'); return false; }
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start < today) { toast.error('Start date cannot be in the past'); return false; }
    if (end < start) { toast.error('End date must be after start date'); return false; }
    return true;
  };
  const validateStep3 = () => {
    if (passengers < 1) { toast.error('Passengers must be at least 1'); return false; }
    return true;
  };
  const validateStep4 = () => {
    for (let i = 0; i < destinations.length; i++) {
      const d = destinations[i];
      if (d.needVehicle && !d.vehicleId) {
        toast.error(`Please select a vehicle for destination ${i+1} (${d.district})`);
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
  const handlePrev = () => { if (step > 1) setStep(step-1); };

  const handleConfirmBooking = async () => {
    if (!user) {
      const pendingData = {
        type: 'custom',
        destinations: destinations.map(d => ({
          district: d.district,
          places: d.places,
          needGuide: d.needGuide,
          guideId: d.guideId,
          needHotel: d.needHotel,
          hotelBudget: d.hotelBudget,
          hotelId: d.hotelId,
          needVehicle: d.needVehicle,
          vehicleId: d.vehicleId,
        })),
        startDate,
        endDate,
        passengers,
      };
      sessionStorage.setItem('pendingCustomBooking', JSON.stringify(pendingData));
      toast.error('Please login to confirm booking');
      navigate('/login');
      return;
    }
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) return;
    const allDestinationsData = destinations.map(d => ({
      district: d.district,
      places: d.places,
      guide: d.needGuide ? tourGuides.find(g => g.id === parseInt(d.guideId)) : null,
      vehicle: d.needVehicle ? vehicles.find(v => v.id === parseInt(d.vehicleId)) : null,
      hotel: d.needHotel ? getHotelsByDistrict(d.district).find(h => h.id === parseInt(d.hotelId)) : null,
      route: (() => {
        const start = districtCoordinates[d.district];
        const placesWithCoords = d.places.filter(p => placesCoordinates[p]).map(p => ({ name: p, coordinates: placesCoordinates[p] }));
        return calculateOptimalRoute(start, placesWithCoords);
      })(),
    }));
    const totalAmount = calculateTotal;
    const bookingPayload = {
      type: 'Multi-District Custom Tour',
      destinations: allDestinationsData.map(d => ({
        district: d.district,
        places: d.places,
        guide: d.guide,
        vehicle: d.vehicle,
        hotel: d.hotel,
      })),
      startDate,
      endDate,
      numberOfDays,
      passengers,
      totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
    };
    try {
      const res = await API.post('/bookings', bookingPayload);
      const savedBooking = res.data;
      // ✅ FIX: Use sessionStorage instead of localStorage
      sessionStorage.setItem('pendingBooking', JSON.stringify(savedBooking));
      setSelectedRoute({ startDate, endDate, numberOfDays, passengers, allDestinations: allDestinationsData });
      setShowConfirmModal(true);
    } catch (err) {
      toast.error('Failed to create booking');
    }
  };

  const finalConfirmBooking = () => {
    toast.success('Proceed to payment');
    navigate('/payment');
  };

  const createNumberedIcon = (number, isStart = false) => {
    if (isStart) {
      return L.divIcon({
        html: `<div style="background:#D4AF37; color:#093C5D; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #093C5D;">S</div>`,
        className: 'custom-div-icon', iconSize: [30,30], popupAnchor: [0,-15]
      });
    }
    return L.divIcon({
      html: `<div style="background:#093C5D; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid #D4AF37;">${number}</div>`,
      className: 'custom-div-icon', iconSize: [30,30], popupAnchor: [0,-15]
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select Your Destinations</h2>
      {destinations.map((dest, idx) => (
        <div key={dest.id} className="border rounded-xl p-4 relative">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Destination {idx+1}</h3>
            {destinations.length > 1 && <button onClick={() => removeDestination(dest.id)} className="text-red-500 text-sm">Remove</button>}
          </div>
          <select className="input-field mb-3" value={dest.district} onChange={e => updateDestination(dest.id, 'district', e.target.value)}>
            <option value="">-- Select district --</option>
            {Object.keys(districtsList).map(d => <option key={d}>{d}</option>)}
          </select>
          {dest.district && (
            <>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Places (select at least one)</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {districtsList[dest.district].map(place => (
                    <label key={place} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={dest.places.includes(place)} onChange={() => togglePlace(dest.id, place)} />
                      {place}
                    </label>
                  ))}
                </div>
                {dest.places.length > 0 && <div className="text-green-600 text-xs mt-1">✓ {dest.places.length} selected</div>}
              </div>
              <div className="border-t pt-2 mt-2">
                <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={dest.needGuide} onChange={e => updateDestination(dest.id, 'needGuide', e.target.checked)} /> Need a Guide</label>
                {dest.needGuide && (
                  <select className="input-field mb-2" value={dest.guideId} onChange={e => updateDestination(dest.id, 'guideId', e.target.value)}>
                    <option value="">Select guide</option>
                    {getAvailableGuides(dest.district).map(g => <option key={g.id} value={g.id}>{g.name} – Rs {g.pricePerDay}/day</option>)}
                  </select>
                )}
                <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={dest.needHotel} onChange={e => updateDestination(dest.id, 'needHotel', e.target.checked)} /> Need a Hotel</label>
                {dest.needHotel && (
                  <>
                    <select className="input-field mb-2" value={dest.hotelBudget} onChange={e => {
                      updateDestination(dest.id, 'hotelBudget', e.target.value);
                      updateDestination(dest.id, 'hotelId', '');
                    }}>
                      <option value="">Budget (optional)</option>
                      <option value="budget">Budget ≤7000</option>
                      <option value="mid">Mid 7000-12000</option>
                      <option value="luxury">Luxury ≥12000</option>
                    </select>
                    <select className="input-field" value={dest.hotelId} onChange={e => updateDestination(dest.id, 'hotelId', e.target.value)}>
                      <option value="">Select hotel</option>
                      {getAvailableHotels(dest.district, dest.hotelBudget).map(h => (
                        <option key={h.id} value={h.id}>{h.name} – Rs {h.pricePerNight}/night</option>
                      ))}
                    </select>
                    {getAvailableHotels(dest.district, dest.hotelBudget).length === 0 && dest.hotelBudget && (
                      <p className="text-red-500 text-xs mt-1">⚠️ No hotels found for this budget in {dest.district}</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))}
      <button onClick={addDestination} className="btn-secondary w-full">+ Add Another Destination</button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Travel Dates</h2>
      <div><label className="block mb-1">Start Date</label><input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
      <div><label className="block mb-1">End Date</label><input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
      {numberOfDays > 0 && <div className="bg-blue-50 p-3 rounded text-primary font-semibold">📅 Total days: {numberOfDays}</div>}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Number of Passengers</h2>
      <div className="flex items-center gap-4">
        <button onClick={() => setPassengers(Math.max(1, passengers-1))} className="w-10 h-10 rounded-full bg-gray-200">-</button>
        <span className="text-2xl font-semibold">{passengers}</span>
        <button onClick={() => setPassengers(passengers+1)} className="w-10 h-10 rounded-full bg-gray-200">+</button>
      </div>
      <p className="text-sm text-gray-500">Note: If you select a guide for a destination, the vehicle capacity will increase by 1 seat for that district.</p>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Select Vehicles (if needed)</h2>
      {destinations.map((dest, idx) => {
        const requiredSeats = passengers + (dest.needGuide ? 1 : 0);
        const available = getAvailableVehiclesForDestination(dest, passengers);
        return (
          <div key={dest.id} className="border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Destination {idx+1}: {dest.district}</h3>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={dest.needVehicle} onChange={e => {
                updateDestination(dest.id, 'needVehicle', e.target.checked);
                if (!e.target.checked) updateDestination(dest.id, 'vehicleId', '');
              }} />
              Need a Vehicle
            </label>
            {dest.needVehicle && (
              <>
                <p className="text-sm text-gray-600 mb-2">Required seats: {requiredSeats} (passengers + {dest.needGuide ? '1 guide' : '0 guide'})</p>
                <select className="input-field" value={dest.vehicleId} onChange={e => updateDestination(dest.id, 'vehicleId', e.target.value)}>
                  <option value="">Select vehicle</option>
                  {available.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.model} – Rs {v.pricePerDay}/day (seats {v.passengers})
                    </option>
                  ))}
                </select>
                {available.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">⚠️ No vehicle available for {requiredSeats} seats</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Review Itinerary</h2>
      {destinations.map((d, idx) => (
        <div key={d.id} className="border rounded-lg p-4">
          <h3 className="font-bold text-primary">Destination {idx+1}: {d.district}</h3>
          <p><strong>Places:</strong> {d.places.join(', ')}</p>
          {d.needGuide && <p>Guide: {tourGuides.find(g => g.id === parseInt(d.guideId))?.name}</p>}
          {d.needVehicle && <p>Vehicle: {vehicles.find(v => v.id === parseInt(d.vehicleId))?.model}</p>}
          {d.needHotel && <p>Hotel: {getHotelsByDistrict(d.district).find(h => h.id === parseInt(d.hotelId))?.name}</p>}
        </div>
      ))}
    </div>
  );

  const renderStep6 = () => {
    const allMaps = destinations.map((dest, idx) => {
      const startPoint = districtCoordinates[dest.district];
      const selectedPlaces = dest.places.filter(p => placesCoordinates[p]).map(p => ({ name: p, coordinates: placesCoordinates[p] }));
      const optimalRoute = calculateOptimalRoute(startPoint, selectedPlaces);
      const positions = [startPoint, ...optimalRoute.map(p => p.coordinates)];
      const isOpen = expandedMap === dest.id;
      return (
        <div key={dest.id} className="border rounded-lg mb-4">
          <button
            onClick={() => setExpandedMap(isOpen ? null : dest.id)}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
          >
            <span className="font-semibold text-primary">District {idx+1}: {dest.district} ({dest.places.length} places)</span>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          {isOpen && (
            <div className="p-4">
              <div className="border rounded-lg overflow-hidden" style={{ height: '350px' }}>
                <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Loading map...</div>}>
                  <MapContainer center={startPoint} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={startPoint} icon={createNumberedIcon(0, true)}><Popup>Start: {dest.district}</Popup></Marker>
                    {optimalRoute.map((marker, i) => (
                      <Marker key={marker.name} position={marker.coordinates} icon={createNumberedIcon(i+1)}><Popup>{i+1}. {marker.name}</Popup></Marker>
                    ))}
                    {positions.length > 1 && <Polyline positions={positions} color="#D4AF37" weight={4} />}
                    <FitBounds positions={positions} />
                  </MapContainer>
                </Suspense>
              </div>
              <div className="bg-blue-50 p-2 rounded mt-2 text-sm">
                Optimised route: {optimalRoute.map(p => p.name).join(' → ')}
              </div>
            </div>
          )}
        </div>
      );
    });
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Route Maps (All Districts)</h2>
        <p className="text-gray-600">Click on each district to see its optimised route map.</p>
        {allMaps}
      </div>
    );
  };

  const renderStep7 = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-primary">Total Price</h2>
      <div className="text-4xl font-bold text-primary">Rs {calculateTotal.toLocaleString()}</div>
      <button onClick={handleConfirmBooking} className="btn-primary w-full py-3">Confirm Booking →</button>
    </div>
  );

  const renderConfirmModal = () => {
    if (!selectedRoute) return null;
    const total = calculateTotal;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-primary">Confirm Booking</h2><button onClick={() => setShowConfirmModal(false)}><X size={24} /></button></div>
          <p><strong>Dates:</strong> {startDate} – {endDate} ({numberOfDays} days)</p>
          <p><strong>Passengers:</strong> {passengers}</p>
          {selectedRoute.allDestinations.map((d, i) => (
            <div key={i} className="border-t mt-3 pt-3"><h3 className="font-bold">Destination {i+1}: {d.district}</h3><p>Places: {d.places.join(', ')}</p>{d.guide && <p>Guide: {d.guide.name} (Rs {d.guide.pricePerDay}/day)</p>}{d.vehicle && <p>Vehicle: {d.vehicle.model} (Rs {d.vehicle.pricePerDay}/day)</p>}{d.hotel && <p>Hotel: {d.hotel.name} (Rs {d.hotel.pricePerNight}/night)</p>}</div>
          ))}
          <div className="text-right text-xl font-bold mt-4">Total: Rs {total.toLocaleString()}</div>
          <div className="flex gap-3 mt-6"><button onClick={() => setShowConfirmModal(false)} className="btn-outline flex-1">Edit</button><button onClick={finalConfirmBooking} className="btn-primary flex-1">Confirm & Pay</button></div>
        </div>
      </div>
    );
  };

  // Main return
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-between mb-8">
          {[1,2,3,4,5,6,7].map(num => (
            <div key={num} className={`flex flex-col items-center ${step >= num ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= num ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>{num}</div>
              <span className="text-xs mt-1 hidden md:block">
                {num===1?'Destination':num===2?'Dates':num===3?'Passenger':num===4?'Vehicle':num===5?'Review':num===6?'Maps':'Total'}
              </span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step===1 && renderStep1()}
          {step===2 && renderStep2()}
          {step===3 && renderStep3()}
          {step===4 && renderStep4()}
          {step===5 && renderStep5()}
          {step===6 && renderStep6()}
          {step===7 && renderStep7()}
          {step < 7 && (
            <div className="flex justify-between mt-8">
              {step > 1 && <button onClick={handlePrev} className="btn-outline">← Back</button>}
              <button onClick={handleNext} className={`btn-primary ${step===1?'w-full':'ml-auto'}`}>Continue →</button>
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
};

export default CustomBooking;