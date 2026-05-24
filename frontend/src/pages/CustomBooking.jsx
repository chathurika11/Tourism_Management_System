import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import { Map, MapPin, Car, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const districts = [
  { name: 'Colombo', places: ['Galle Face Green', 'Gangaramaya Temple', 'Lotus Tower', 'Viharamahadevi Park'] },
  { name: 'Kandy', places: ['Temple of the Tooth', 'Peradeniya Botanical Gardens', 'Kandy Lake', 'Udawatta Kele Sanctuary'] },
  { name: 'Galle', places: ['Galle Fort', 'Unawatuna Beach', 'Jungle Beach', 'Japanese Peace Pagoda'] },
  { name: 'Nuwara Eliya', places: ['Gregory Lake', 'Horton Plains', 'Hakgala Botanical Garden', 'Victoria Park'] },
  { name: 'Sigiriya', places: ['Sigiriya Rock Fortress', 'Pidurangala Rock', 'Minneriya National Park'] },
];

const popularGuides = [
  { id: 1, name: 'Priya Samarawickrama (Cultural Tours)' },
  { id: 2, name: 'Samantha Perera (Wildlife Safaris)' },
  { id: 3, name: 'Nuwan Jayawardene (Hiking & Adventure)' },
  { id: 4, name: 'Lakmini Silva (Culinary Tours)' },
];

const CustomBooking = () => {
  const { customTour, updateTour } = useTour();
  const navigate = useNavigate();

  const handleDistrictChange = (e) => {
    updateTour({ district: e.target.value, places: [] });
  };

  const handlePlaceToggle = (place) => {
    const updatedPlaces = customTour.places.includes(place)
      ? customTour.places.filter(p => p !== place)
      : [...customTour.places, place];
    updateTour({ places: updatedPlaces });
  };

  const handleNextStep = () => {
    if (!customTour.district) {
      toast.error('Please select a district.');
      return;
    }
    if (customTour.places.length === 0) {
      toast.error('Please select at least one place to visit.');
      return;
    }
    
    if (customTour.wantsVehicle && (!customTour.vehicleDetails?.passengers || !customTour.vehicleDetails?.type)) {
       toast.error('Please complete the vehicle details.');
       return;
    }

    if (customTour.wantsGuide && !customTour.guideId) {
      toast.error('Please select a tour guide.');
      return;
    }

    if (!customTour.hotelBudget) {
      toast.error('Please enter a hotel budget.');
      return;
    }
    
    toast.success('Tour planned successfully! (Mock submission)');
    updateTour({ district: '', places: [], wantsVehicle: null, wantsGuide: null, hotelBudget: '' }); // Reset
    navigate('/my-bookings');
  };

  const selectedDistrictData = districts.find(d => d.name === customTour.district);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-primary mb-2 text-center">Plan Your Custom Tour</h1>
      <p className="text-gray-600 text-center mb-8">Build your perfect Sri Lankan itinerary step by step.</p>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">1. Choose Destinations</h2>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Select District</label>
          <select value={customTour.district} onChange={handleDistrictChange} className="input-field w-full md:w-1/2">
            <option value="">-- Choose a District --</option>
            {districts.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {selectedDistrictData && (
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3">Select Places to Visit in {customTour.district}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDistrictData.places.map(place => (
                <label key={place} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-cream transition">
                  <input type="checkbox" checked={customTour.places.includes(place)} onChange={() => handlePlaceToggle(place)} className="form-checkbox h-5 w-5 text-primary" />
                  <span className="text-gray-700">{place}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {customTour.places.length > 0 && (
          <div className="mb-8 p-4 bg-cream rounded-lg border border-secondary/20">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Map className="text-secondary" /> Route Path:</h3>
            <div className="flex flex-wrap items-center gap-2 text-primary font-medium">
              {customTour.places.map((place, idx) => (
                <React.Fragment key={place}>
                  <span className="bg-white px-3 py-1 rounded shadow-sm flex items-center gap-1"><MapPin size={14} className="text-cta" /> {place}</span>
                  {idx < customTour.places.length - 1 && <span>➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {customTour.places.length > 0 && (
          <div className="space-y-8 border-t pt-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-primary border-b pb-2">2. Transportation</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><Car className="text-secondary" /> Do you want to rent a vehicle?</label>
              <div className="flex gap-4">
                <button onClick={() => updateTour({ wantsVehicle: true })} className={`px-6 py-2 rounded-lg font-bold transition ${customTour.wantsVehicle === true ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Yes</button>
                <button onClick={() => updateTour({ wantsVehicle: false })} className={`px-6 py-2 rounded-lg font-bold transition ${customTour.wantsVehicle === false ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>No</button>
              </div>
            </div>

            {customTour.wantsVehicle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Number of Passengers</label>
                  <input type="number" min="1" max="50" 
                    value={customTour.vehicleDetails?.passengers || ''} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const currentType = customTour.vehicleDetails?.type;
                      const newType = (val >= 4 && currentType === 'Scooter') ? '' : currentType;
                      updateTour({ 
                        vehicleDetails: { ...customTour.vehicleDetails, passengers: e.target.value, type: newType }
                      });
                    }}
                    className="input-field w-full" placeholder="e.g. 4" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Vehicle Type</label>
                  <select 
                    value={customTour.vehicleDetails?.type || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const passengersCount = parseInt(customTour.vehicleDetails?.passengers || 0);
                      if (val === 'Scooter' && passengersCount >= 4) {
                        toast.error('Scooter/Bike is not available for 4 or more passengers.');
                        return;
                      }
                      updateTour({ vehicleDetails: { ...customTour.vehicleDetails, type: val }});
                    }}
                    className="input-field w-full"
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Scooter" disabled={parseInt(customTour.vehicleDetails?.passengers || 0) >= 4}>Scooter / Bike {parseInt(customTour.vehicleDetails?.passengers || 0) >= 4 ? '(Disabled for 4+)' : ''}</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="SUV">SUV / 4x4</option>
                    <option value="Bus">Mini Bus</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2">Preferred Model (Optional)</label>
                  <input type="text" 
                    value={customTour.vehicleDetails?.model || ''} 
                    onChange={(e) => updateTour({ vehicleDetails: { ...customTour.vehicleDetails, model: e.target.value }})}
                    className="input-field w-full" placeholder="e.g. Toyota Prius" />
                </div>
              </div>
            )}

            {(customTour.wantsVehicle === true || customTour.wantsVehicle === false) && (
              <div className="border-t pt-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4 border-b pb-2">3. Expert Guides</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><Users className="text-secondary" /> Do you want to hire a tour guide?</label>
                  <div className="flex gap-4">
                    <button onClick={() => updateTour({ wantsGuide: true })} className={`px-6 py-2 rounded-lg font-bold transition ${customTour.wantsGuide === true ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Yes</button>
                    <button onClick={() => updateTour({ wantsGuide: false })} className={`px-6 py-2 rounded-lg font-bold transition ${customTour.wantsGuide === false ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>No</button>
                  </div>
                </div>

                {customTour.wantsGuide && (
                  <div className="p-6 bg-gray-50 rounded-lg border">
                    <label className="block text-gray-700 font-bold mb-2">Select a Guide</label>
                    <select value={customTour.guideId || ''} onChange={(e) => updateTour({ guideId: parseInt(e.target.value) })} className="input-field w-full md:w-1/2">
                      <option value="">-- Choose a Guide --</option>
                      {popularGuides.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">Looking for a specific guide? Browse our <a href="/guides" target="_blank" className="text-accent hover:underline">Guides page</a>.</p>
                  </div>
                )}
              </div>
            )}

            {((customTour.wantsGuide === true && customTour.guideId) || customTour.wantsGuide === false) && (
              <div className="border-t pt-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4 border-b pb-2">4. Accommodation Budget</h2>
                <label className="block text-gray-700 font-bold mb-2">What is your Hotel Budget per night? (LKR)</label>
                <input type="number" min="1000" placeholder="e.g. 15000" value={customTour.hotelBudget} onChange={(e) => updateTour({ hotelBudget: e.target.value })} className="input-field w-full md:w-1/3" />
              </div>
            )}

          </div>
        )}
      </div>

      <div className="text-right">
        <button onClick={handleNextStep} className="btn-primary px-10 py-3 text-lg flex items-center justify-center gap-2 ml-auto hover:scale-105 transform transition-all duration-300">
          Complete Booking <CheckCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default CustomBooking;
