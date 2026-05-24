import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { tourGuides, getGuidesByDistrict, vehicles, getVehiclesByPassengers, getHotelsByDistrictAndBudget, getHotelsByDistrict } from '../data/tourismData';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit map bounds to show all markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
};

// Function to calculate optimal route order (nearest neighbor algorithm)
const calculateOptimalRoute = (startPoint, places) => {
  if (!places.length) return [];
  
  const points = [...places];
  const ordered = [];
  let currentPoint = startPoint;
  
  while (points.length > 0) {
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    for (let i = 0; i < points.length; i++) {
      const lat1 = currentPoint[0];
      const lng1 = currentPoint[1];
      const lat2 = points[i].coordinates[0];
      const lng2 = points[i].coordinates[1];
      
      // Haversine formula for distance
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    
    ordered.push(points[closestIndex]);
    currentPoint = points[closestIndex].coordinates;
    points.splice(closestIndex, 1);
  }
  
  return ordered;
};

const CustomBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useTour();
  const [step, setStep] = useState(1);
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [budgetMessage, setBudgetMessage] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]);

  // Form Data
  const [formData, setFormData] = useState({
    district: '',
    places: [],
    startDate: '',
    endDate: '',
    passengers: 1,
    needGuide: false,
    selectedGuide: '',
    needVehicle: false,
    transportation: '',
    needHotel: false,
    accommodationBudget: '',
    hotel: '',
  });

  // District coordinates for map
  const districtCoordinates = {
    'Colombo': [6.9271, 79.8612],
    'Kandy': [7.2906, 80.6337],
    'Galle': [6.0328, 80.2168],
    'Ella': [6.8667, 81.0500],
    'Nuwara Eliya': [6.9707, 80.7829],
    'Sigiriya': [7.9569, 80.7596],
    'Anuradhapura': [8.3114, 80.4037],
    'Polonnaruwa': [7.9393, 81.0003],
    'Yala': [6.3762, 81.4753],
    'Trincomalee': [8.5774, 81.2248],
  };

  // Places coordinates for map markers
  const placesCoordinates = {
    'Galle Face Green': [6.9271, 79.8570],
    'Gangaramaya Temple': [6.9121, 79.8550],
    'National Museum': [6.9070, 79.8600],
    'Viharamahadevi Park': [6.9100, 79.8620],
    'Pettah Market': [6.9400, 79.8600],
    'Temple of the Tooth': [7.2939, 80.6413],
    'Peradeniya Gardens': [7.2712, 80.5980],
    'Kandy Lake': [7.2900, 80.6350],
    'Bahiravokanda Vihara': [7.2850, 80.6400],
    'Udawatta Kele Sanctuary': [7.3000, 80.6300],
    'Galle Fort': [6.0263, 80.2157],
    'Dutch Church': [6.0258, 80.2160],
    'Galle Lighthouse': [6.0238, 80.2143],
    'Japanese Peace Pagoda': [6.0400, 80.2150],
    'Jungle Beach': [6.0200, 80.2200],
    'Nine Arches Bridge': [6.8510, 81.0557],
    'Ella Rock': [6.8667, 81.0500],
    "Little Adam's Peak": [6.8563, 81.0460],
    'Ravana Falls': [6.8032, 81.0220],
    'Demodara Loop': [6.8700, 81.0600],
    'Gregory Lake': [6.9504, 80.7853],
    'Hakgala Gardens': [6.9130, 80.8239],
    'Tea Plantations': [6.9600, 80.7700],
    'Victoria Park': [6.9700, 80.7800],
    'Single Tree Hill': [6.9550, 80.7900],
    'Sigiriya Rock Fortress': [7.9569, 80.7596],
    'Pidurangala Rock': [7.9472, 80.7531],
    'Minneriya National Park': [7.9971, 80.8464],
    'Dambulla Cave Temple': [7.8567, 80.6494],
    'Sri Maha Bodhi': [8.3445, 80.3969],
    'Ruwanwelisaya': [8.3507, 80.3969],
    'Jetavanaramaya': [8.3500, 80.4000],
    'Abhayagiri Monastery': [8.3600, 80.4000],
    'Gal Vihara': [7.9400, 81.0000],
    'Parakrama Samudra': [7.9300, 81.0100],
    'Royal Palace': [7.9350, 81.0050],
    'Quadrangle': [7.9380, 81.0020],
    'Yala National Park': [6.3762, 81.4753],
    'Sithulpawwa Rock Temple': [6.3900, 81.4700],
    'Kataragama Temple': [6.4200, 81.3300],
    'Nilaveli Beach': [8.4591, 81.1816],
    'Koneswaram Temple': [8.5720, 81.2417],
    'Pigeon Island': [8.4670, 81.2150],
    'Uppuveli Beach': [8.4500, 81.1800],
  };

  // Districts and places data
  const districts = {
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

  // Calculate number of days
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const numberOfDays = calculateDays();

  // Get available guides based on selected district
  const getAvailableGuides = () => {
    if (!formData.district) return [];
    return getGuidesByDistrict(formData.district);
  };

  // Get available vehicles based on passengers + guide
  const getAvailableVehicles = () => {
    let requiredPassengers = formData.passengers;
    if (formData.needGuide && formData.selectedGuide) requiredPassengers += 1;
    return getVehiclesByPassengers(requiredPassengers);
  };

  // Get available hotels based on selected district AND budget
  const getAvailableHotels = () => {
    if (!formData.district) return [];
    if (!formData.accommodationBudget) return getHotelsByDistrict(formData.district);
    return getHotelsByDistrictAndBudget(formData.district, formData.accommodationBudget);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData({ 
      ...formData, 
      district, 
      places: [],
      selectedGuide: '',
      needGuide: false,
      needVehicle: false,
      needHotel: false,
      accommodationBudget: '',
      hotel: '',
      transportation: ''
    });
    if (district && districtCoordinates[district]) {
      setMapCenter(districtCoordinates[district]);
    }
  };

  const handlePlaceToggle = (place) => {
    const currentPlaces = [...formData.places];
    if (currentPlaces.includes(place)) {
      setFormData({ ...formData, places: currentPlaces.filter(p => p !== place) });
    } else {
      setFormData({ ...formData, places: [...currentPlaces, place] });
    }
  };

  const handlePassengerChange = (value) => {
    const newPassengers = Math.max(1, Math.min(20, value));
    setFormData({ ...formData, passengers: newPassengers, transportation: '' });
  };

  const handleGuideChange = (checked) => {
    setFormData({ ...formData, needGuide: checked, selectedGuide: checked ? formData.selectedGuide : '' });
  };

  const handleVehicleChange = (checked) => {
    setFormData({ ...formData, needVehicle: checked, transportation: checked ? formData.transportation : '' });
  };

  const handleHotelChange = (checked) => {
    setFormData({ ...formData, needHotel: checked, accommodationBudget: '', hotel: '' });
  };

  const handleAccommodationBudgetChange = (e) => {
    const budget = e.target.value;
    setFormData({ ...formData, accommodationBudget: budget, hotel: '' });
    const availableHotels = getHotelsByDistrictAndBudget(formData.district, budget);
    if (availableHotels.length === 0 && budget) {
      setBudgetMessage(`No hotels available in ${budget} budget range in ${formData.district}. Please try a different budget.`);
      setShowBudgetPopup(true);
      setTimeout(() => setShowBudgetPopup(false), 3000);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.district) {
        toast.error('Please select a district');
        return;
      }
      if (formData.places.length === 0) {
        toast.error('Please select at least one place to visit');
        return;
      }
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!formData.startDate) {
        toast.error('Please select start date');
        return;
      }
      if (!formData.endDate) {
        toast.error('Please select end date');
        return;
      }
      if (new Date(formData.startDate) < new Date()) {
        toast.error('Start date cannot be in the past');
        return;
      }
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        toast.error('End date must be after start date');
        return;
      }
      setStep(3);
      return;
    }
    
    if (step === 3) {
      if (formData.passengers < 1) {
        toast.error('Please enter number of passengers');
        return;
      }
      if (formData.needGuide && !formData.selectedGuide) {
        toast.error('Please select a tour guide');
        return;
      }
      setStep(4);
      return;
    }
    
    if (step === 4) {
      if (formData.needVehicle) {
        const availableVehicles = getAvailableVehicles();
        if (availableVehicles.length > 0 && !formData.transportation) {
          toast.error('Please select a vehicle');
          return;
        }
      }
      setStep(5);
      return;
    }
    
    if (step === 5) {
      if (formData.needHotel) {
        const availableHotels = getAvailableHotels();
        if (availableHotels.length > 0 && !formData.hotel && formData.accommodationBudget) {
          toast.error('Please select a hotel');
          return;
        }
      }
      setStep(6);
      return;
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.transportation));
    const selectedGuide = tourGuides.find(g => g.id === parseInt(formData.selectedGuide));
    const selectedHotel = getAvailableHotels().find(h => h.id === parseInt(formData.hotel));
    const days = numberOfDays;
    
    if (selectedVehicle && formData.needVehicle) total += selectedVehicle.pricePerDay * days;
    if (selectedGuide && formData.needGuide) total += selectedGuide.pricePerDay * days;
    if (selectedHotel && formData.needHotel) total += selectedHotel.pricePerNight * days;
    
    return total;
  };

  const handleConfirmBooking = () => {
    if (!user) {
      toast.error('Please login to confirm booking');
      navigate('/login');
      return;
    }
    
    const selectedGuide = tourGuides.find(g => g.id === parseInt(formData.selectedGuide));
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.transportation));
    const selectedHotel = getAvailableHotels().find(h => h.id === parseInt(formData.hotel));
    
    // Calculate optimal route order
    const startPoint = districtCoordinates[formData.district];
    const selectedPlaces = formData.places
      .filter(place => placesCoordinates[place])
      .map(place => ({
        name: place,
        coordinates: placesCoordinates[place]
      }));
    
    const optimalRoute = calculateOptimalRoute(startPoint, selectedPlaces);
    
    const routeSummary = {
      district: formData.district,
      places: optimalRoute.map(p => p.name),
      originalPlaces: formData.places,
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfDays: numberOfDays,
      passengers: formData.passengers,
      needGuide: formData.needGuide,
      guide: selectedGuide,
      needVehicle: formData.needVehicle,
      vehicle: selectedVehicle,
      needHotel: formData.needHotel,
      hotel: selectedHotel,
    };
    setSelectedRoute(routeSummary);
    
    const booking = {
      type: 'Custom Tour',
      destination: formData.district,
      places: optimalRoute.map(p => p.name),
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfDays: numberOfDays,
      passengers: formData.passengers,
      needGuide: formData.needGuide,
      guideName: selectedGuide?.name,
      needVehicle: formData.needVehicle,
      vehicleName: selectedVehicle?.model,
      needHotel: formData.needHotel,
      hotelName: selectedHotel?.name,
      totalAmount: calculateTotal(),
    };
    addBooking(booking);
    
    setShowConfirmModal(true);
  };

  const finalConfirmBooking = () => {
    toast.success('Booking confirmed! Redirecting to payment...');
    setTimeout(() => navigate('/payment'), 1500);
  };

  // Render Step 1 - Destination
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Choose Your Destination</h2>
      <div>
        <label className="block text-gray-700 mb-2">Select District</label>
        <select 
          value={formData.district} 
          onChange={handleDistrictChange} 
          className="input-field" 
          required
        >
          <option value="">-- Select a district --</option>
          {Object.keys(districts).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      {formData.district && (
        <div>
          <label className="block text-gray-700 mb-2">Select Places to Visit (Select at least one)</label>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-3">
            {districts[formData.district].map(place => (
              <label key={place} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.places.includes(place)} 
                  onChange={() => handlePlaceToggle(place)} 
                  className="w-4 h-4 text-primary" 
                />
                <span className="text-sm">{place}</span>
              </label>
            ))}
          </div>
          {formData.places.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">✓ {formData.places.length} place(s) selected</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render Step 2 - Dates
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Travel Dates</h2>
      <div>
        <label className="block text-gray-700 mb-2">Start Date</label>
        <input 
          type="date" 
          value={formData.startDate} 
          onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
          className="input-field" 
          required 
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">End Date</label>
        <input 
          type="date" 
          value={formData.endDate} 
          onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
          className="input-field" 
          required 
        />
      </div>
      {numberOfDays > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-primary font-semibold">📅 Total Stay: {numberOfDays} day(s)</p>
        </div>
      )}
    </div>
  );

  // Render Step 3 - Travelers & Guide (Optional)
  const renderStep3 = () => {
    const availableGuides = getAvailableGuides();
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Travelers</h2>
        
        <div>
          <label className="block text-gray-700 mb-2">Number of Passengers</label>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => handlePassengerChange(formData.passengers - 1)} 
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
            >-</button>
            <span className="text-2xl font-semibold w-16 text-center">{formData.passengers}</span>
            <button 
              type="button"
              onClick={() => handlePassengerChange(formData.passengers + 1)} 
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
            >+</button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input 
              type="checkbox" 
              checked={formData.needGuide} 
              onChange={(e) => handleGuideChange(e.target.checked)} 
              className="w-4 h-4 text-primary" 
            />
            <span>I need a Tour Guide (+Rs 5000/day)</span>
          </label>
        </div>
        
        {formData.needGuide && (
          <div>
            <label className="block text-gray-700 mb-2">Select a Tour Guide for {formData.district}</label>
            {availableGuides.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 text-yellow-800">
                No guides available for {formData.district}. Please select a different district.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableGuides.map(guide => (
                  <label key={guide.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${parseInt(formData.selectedGuide) === guide.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="guide" 
                        value={guide.id} 
                        checked={parseInt(formData.selectedGuide) === guide.id} 
                        onChange={(e) => setFormData({...formData, selectedGuide: e.target.value})} 
                        className="w-4 h-4" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{guide.name}</span>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-cta fill-current" />
                            <span className="text-sm">{guide.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{guide.specialty} • {guide.language}</p>
                        <p className="text-xs text-gray-400">Expert in: {guide.location}</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">Rs {guide.pricePerDay.toLocaleString()}/day</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Step 4 - Transportation (Optional)
  const renderStep4 = () => {
    const availableVehicles = getAvailableVehicles();
    const passengerCount = formData.passengers + (formData.needGuide && formData.selectedGuide ? 1 : 0);
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Transportation</h2>
        
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input 
            type="checkbox" 
            checked={formData.needVehicle} 
            onChange={(e) => handleVehicleChange(e.target.checked)} 
            className="w-4 h-4 text-primary" 
          />
          <span>I need a Vehicle for {passengerCount} passenger(s)</span>
        </label>
        
        {formData.needVehicle && (
          <>
            <p className="text-gray-600">You need a vehicle for {passengerCount} passenger(s) for {numberOfDays} day(s)</p>
            {availableVehicles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 text-yellow-800">
                No vehicles available for {passengerCount} passengers. Please reduce passenger count or remove guide.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableVehicles.map(vehicle => (
                  <label key={vehicle.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${parseInt(formData.transportation) === vehicle.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="vehicle" 
                        value={vehicle.id} 
                        checked={parseInt(formData.transportation) === vehicle.id} 
                        onChange={(e) => setFormData({...formData, transportation: e.target.value})} 
                        className="w-4 h-4" 
                      />
                      <div>
                        <span className="font-semibold">{vehicle.model}</span>
                        <p className="text-sm text-gray-500">{vehicle.type} • {vehicle.passengers} seats • {vehicle.fuelType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">Rs {vehicle.pricePerDay.toLocaleString()}/day</span>
                      <p className="text-xs text-gray-500">Total: Rs {(vehicle.pricePerDay * numberOfDays).toLocaleString()}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render Step 5 - Accommodation (Optional)
  const renderStep5 = () => {
    const availableHotels = getAvailableHotels();
    const districtHotelsCount = getHotelsByDistrict(formData.district).length;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Accommodation</h2>
        
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input 
            type="checkbox" 
            checked={formData.needHotel} 
            onChange={(e) => handleHotelChange(e.target.checked)} 
            className="w-4 h-4 text-primary" 
          />
          <span>I need accommodation for {numberOfDays} night(s)</span>
        </label>
        
        {formData.needHotel && (
          <>
            <div>
              <label className="block text-gray-700 mb-2">Budget Range (Optional)</label>
              <select value={formData.accommodationBudget} onChange={handleAccommodationBudgetChange} className="input-field">
                <option value="">-- Select budget (optional) --</option>
                <option value="budget">Budget (Up to Rs 7000/night)</option>
                <option value="mid">Mid (Rs 7000 - 12000/night)</option>
                <option value="luxury">Luxury (Rs 12000+/night)</option>
              </select>
            </div>
            
            {availableHotels.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <label className="block text-gray-700 mb-2">Select Hotel in {formData.district}</label>
                {availableHotels.map(hotel => (
                  <label key={hotel.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${parseInt(formData.hotel) === hotel.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="hotel" 
                        value={hotel.id} 
                        checked={parseInt(formData.hotel) === hotel.id} 
                        onChange={(e) => setFormData({...formData, hotel: e.target.value})} 
                        className="w-4 h-4" 
                      />
                      <div>
                        <span className="font-semibold">{hotel.name}</span>
                        <p className="text-sm text-gray-500">{hotel.location}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={12} className="text-cta fill-current" />
                          <span className="text-xs">{hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">Rs {hotel.pricePerNight.toLocaleString()}/night</span>
                      <p className="text-xs text-gray-500">Total: Rs {(hotel.pricePerNight * numberOfDays).toLocaleString()}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {formData.accommodationBudget && availableHotels.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 text-yellow-800">
                No hotels found in {formData.district} for {formData.accommodationBudget} budget. 
                {districtHotelsCount > 0 && ` There are {districtHotelsCount} hotels in ${formData.district}. Please try a different budget.`}
              </div>
            )}
          </>
        )}
        
        <p className="text-sm text-gray-500">Note: All selections are optional. You can skip any service you don't need.</p>
      </div>
    );
  };

  // Create custom numbered marker icons
  const createNumberedIcon = (number, isStart = false) => {
    if (isStart) {
      return L.divIcon({
        html: `<div style="background-color: #D4AF37; color: #093C5D; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #093C5D;">S</div>`,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        popupAnchor: [0, -15]
      });
    }
    return L.divIcon({
      html: `<div style="background-color: #093C5D; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #D4AF37;">${number}</div>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      popupAnchor: [0, -15]
    });
  };

  // Render Step 6 - Review with Map
  const renderStep6 = () => {
    const selectedGuide = tourGuides.find(g => g.id === parseInt(formData.selectedGuide));
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.transportation));
    const selectedHotel = getAvailableHotels().find(h => h.id === parseInt(formData.hotel));
    
    // Calculate optimal route order
    const startPoint = districtCoordinates[formData.district];
    const selectedPlaces = formData.places
      .filter(place => placesCoordinates[place])
      .map(place => ({
        name: place,
        coordinates: placesCoordinates[place]
      }));
    
    const optimalRoute = calculateOptimalRoute(startPoint, selectedPlaces);
    const positions = [startPoint, ...optimalRoute.map(p => p.coordinates)];
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Review Your Journey</h2>
        
        {/* Optimized Route Order Display */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2">🗺️ Optimized Travel Route</h3>
          <p className="text-sm text-gray-600 mb-3">We've arranged your places in the most efficient travel order for {numberOfDays} day(s):</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">Start: {formData.district}</span>
            <ChevronRight size={16} className="text-gray-400" />
            {optimalRoute.map((place, idx) => (
              <React.Fragment key={idx}>
                <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm">
                  {idx + 1}. {place.name}
                </span>
                {idx < optimalRoute.length - 1 && <ChevronRight size={16} className="text-gray-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Map Section */}
        <div className="border rounded-lg overflow-hidden">
          <MapContainer center={mapCenter} zoom={8} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={startPoint} icon={createNumberedIcon(0, true)}>
              <Popup>
                <div className="text-center">
                  <strong>📍 {formData.district}</strong>
                  <p className="text-sm">Starting Point</p>
                </div>
              </Popup>
            </Marker>
            {optimalRoute.map((marker, idx) => (
              <Marker 
                key={marker.name} 
                position={marker.coordinates}
                icon={createNumberedIcon(idx + 1)}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{idx + 1}. {marker.name}</strong>
                    <p className="text-sm">Tourist Attraction</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {positions.length > 1 && (
              <Polyline 
                positions={positions} 
                color="#D4AF37" 
                weight={4} 
                opacity={0.9}
              />
            )}
            <FitBounds positions={positions} />
          </MapContainer>
          <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
            🗺️ Optimized route showing {optimalRoute.length} place(s) in the most efficient travel order
          </div>
        </div>
        
        {/* Trip Summary */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
          <h3 className="font-bold text-lg border-b pb-2">Trip Summary</h3>
          <div className="grid grid-cols-2 gap-2">
            <p className="font-semibold">Destination:</p>
            <p>{formData.district}</p>
            <p className="font-semibold">Places to Visit:</p>
            <p>{optimalRoute.map(p => p.name).join(' → ')}</p>
            <p className="font-semibold">Travel Dates:</p>
            <p>{formData.startDate} to {formData.endDate}</p>
            <p className="font-semibold">Number of Days:</p>
            <p className="text-primary font-bold">{numberOfDays} day(s)</p>
            <p className="font-semibold">Travelers:</p>
            <p>{formData.passengers}</p>
            
            {formData.needGuide && selectedGuide && (
              <>
                <p className="font-semibold">Tour Guide:</p>
                <p>{selectedGuide.name}</p>
                <p className="col-span-2 text-sm text-gray-500 pl-4">Guide Fee: Rs {selectedGuide.pricePerDay.toLocaleString()} × {numberOfDays} days = Rs {(selectedGuide.pricePerDay * numberOfDays).toLocaleString()}</p>
              </>
            )}
            
            {formData.needVehicle && selectedVehicle && (
              <>
                <p className="font-semibold">Vehicle:</p>
                <p>{selectedVehicle.model}</p>
                <p className="col-span-2 text-sm text-gray-500 pl-4">Vehicle Fee: Rs {selectedVehicle.pricePerDay.toLocaleString()} × {numberOfDays} days = Rs {(selectedVehicle.pricePerDay * numberOfDays).toLocaleString()}</p>
              </>
            )}
            
            {formData.needHotel && selectedHotel && (
              <>
                <p className="font-semibold">Hotel:</p>
                <p>{selectedHotel.name}</p>
                <p className="col-span-2 text-sm text-gray-500 pl-4">Hotel Fee: Rs {selectedHotel.pricePerNight.toLocaleString()} × {numberOfDays} nights = Rs {(selectedHotel.pricePerNight * numberOfDays).toLocaleString()}</p>
              </>
            )}
          </div>
          <div className="border-t pt-3 mt-3 text-right">
            <p className="text-xl font-bold text-primary">Total: Rs {calculateTotal().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handlePrev} className="btn-outline flex-1">← Back</button>
          <button onClick={handleConfirmBooking} className="btn-primary flex-1">Confirm Booking →</button>
        </div>
      </div>
    );
  };

  // Confirm Modal with Map
  const renderConfirmModal = () => {
    if (!selectedRoute) return null;
    
    const startPoint = districtCoordinates[selectedRoute.district];
    const optimalPlaces = selectedRoute.places
      .filter(place => placesCoordinates[place])
      .map((place, idx) => ({
        name: place,
        coordinates: placesCoordinates[place],
        number: idx + 1
      }));
    
    const positions = [startPoint, ...optimalPlaces.map(p => p.coordinates)];
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Confirm Your Booking</h2>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {/* Map */}
            <div className="border rounded-lg overflow-hidden mb-4">
              <MapContainer center={mapCenter} zoom={8} style={{ height: "250px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <Marker position={startPoint} icon={createNumberedIcon(0, true)}>
                  <Popup>📍 {selectedRoute.district}</Popup>
                </Marker>
                {optimalPlaces.map((place) => (
                  <Marker key={place.name} position={place.coordinates} icon={createNumberedIcon(place.number)}>
                    <Popup>{place.number}. {place.name}</Popup>
                  </Marker>
                ))}
                {positions.length > 1 && <Polyline positions={positions} color="#D4AF37" weight={3} opacity={0.8} />}
                <FitBounds positions={positions} />
              </MapContainer>
            </div>
            
            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-lg">Your Journey</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <p className="font-semibold">📍 Destination:</p>
                <p>{selectedRoute.district}</p>
                <p className="font-semibold">🏞️ Places:</p>
                <p>{selectedRoute.places.length} locations</p>
                <p className="font-semibold">📅 Dates:</p>
                <p>{selectedRoute.startDate} to {selectedRoute.endDate}</p>
                <p className="font-semibold">📆 Duration:</p>
                <p className="text-primary font-bold">{selectedRoute.numberOfDays} days</p>
                <p className="font-semibold">👥 Travelers:</p>
                <p>{selectedRoute.passengers}</p>
                
                {selectedRoute.needGuide && selectedRoute.guide && (
                  <>
                    <p className="font-semibold">👨‍🏫 Guide:</p>
                    <p>{selectedRoute.guide.name}</p>
                    <p className="text-xs text-gray-500 col-span-2">Guide Fee: Rs {selectedRoute.guide.pricePerDay} × {selectedRoute.numberOfDays} days = Rs {(selectedRoute.guide.pricePerDay * selectedRoute.numberOfDays).toLocaleString()}</p>
                  </>
                )}
                
                {selectedRoute.needVehicle && selectedRoute.vehicle && (
                  <>
                    <p className="font-semibold">🚗 Vehicle:</p>
                    <p>{selectedRoute.vehicle.model}</p>
                    <p className="text-xs text-gray-500 col-span-2">Vehicle Fee: Rs {selectedRoute.vehicle.pricePerDay} × {selectedRoute.numberOfDays} days = Rs {(selectedRoute.vehicle.pricePerDay * selectedRoute.numberOfDays).toLocaleString()}</p>
                  </>
                )}
                
                {selectedRoute.needHotel && selectedRoute.hotel && (
                  <>
                    <p className="font-semibold">🏨 Hotel:</p>
                    <p>{selectedRoute.hotel.name}</p>
                    <p className="text-xs text-gray-500 col-span-2">Hotel Fee: Rs {selectedRoute.hotel.pricePerNight} × {selectedRoute.numberOfDays} nights = Rs {(selectedRoute.hotel.pricePerNight * selectedRoute.numberOfDays).toLocaleString()}</p>
                  </>
                )}
              </div>
              <div className="border-t pt-2 mt-2 text-right">
                <p className="text-xl font-bold text-primary">💰 Total: Rs {calculateTotal().toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirmModal(false)} className="btn-outline flex-1">Edit Booking</button>
              <button onClick={finalConfirmBooking} className="btn-primary flex-1">Confirm & Proceed to Payment</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} className={`flex flex-col items-center ${step >= num ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= num ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                {num}
              </div>
              <span className="text-xs mt-1 hidden md:block">
                {num === 1 ? 'Destination' : num === 2 ? 'Dates' : num === 3 ? 'Travelers' : num === 4 ? 'Transport' : num === 5 ? 'Hotel' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          
          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button onClick={handlePrev} className="btn-outline">
                  ← Back
                </button>
              )}
              <button onClick={handleNext} className={`btn-primary ${step === 1 && 'w-full'} ${step > 1 && 'ml-auto'}`}>
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Budget Popup */}
      {showBudgetPopup && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
          {budgetMessage}
        </div>
      )}
      
      {/* Confirm Modal */}
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
};

export default CustomBooking;