// Shared data for all pages with high-quality images
import packagesSigiriya from '../images/packagesSigiriya.jpeg';
import packagesGalleFort from '../images/packagesgallefort.jpeg';
import packagesElla from '../images/packagesElla.jpeg';
import packagesNuwaraEliya from '../images/packagesnuwaraeliya.jpeg';
import hotelsJetwingBlue from '../images/HotelsJetwingBlue.jpeg';
import hotelsCinnamonLakeside from '../images/HotelsCinnamonlakeside.jpeg.jpg';
import hotelsGalleFaceHotel from '../images/HotelsGallefaceHotel.jpeg.jpeg';
import hotelsCinnamonLodge from '../images/HotelsCinnamonLodge.jpeg.jpg';
import hotelsEarlsRegency from '../images/HotelsEarlsRegency.jpeg';
import hotelsMahaweliReach from '../images/HotelsMahaweliReach.jpeg';
import hotelsAmangalla from '../images/HotelsAmangalla.jpeg';
import hotelsJetwingLighthouse from '../images/HotelsJetwinglighthouse.jpg';
import hotelsFortBazaar from '../images/HotelsFortBazzar.jpeg';
import hotels98AcresResort from '../images/Hotels98Acresresort.jpeg';
import hotelsEllaJungleResort from '../images/HotelsEllaJungleresort.jpeg';
import hotelsGrandHotel from '../images/HotelsGrandHotel.jpeg';
import hotelsTheHillClub from '../images/HotelsTheHillClub.jpeg';
import hotelsHeritanceKandalama from '../images/HotelsHeritanceKandalama.jpeg';
import hotelsCinnamonWild from '../images/HotelsCinnamonwild.jpeg';
import vehiclesHondaDio from '../images/honda dio.jpeg';
import vehiclesHondaFit from '../images/honda fit.jpg';
import vehiclesToyotaAxio from '../images/toyota axio.webp';
import vehiclesToyotaPrado from '../images/toyota prado.webp';
import vehiclesNissanCaravan from '../images/nissan caravan.webp';
import vehiclesMitsubishiMontero from '../images/MitsubishiMontero.webp';
import vehiclesToyotaHiace from '../images/Toyota Hiace.jpg';
import priyaGuide from '../images/priya.jpg';
import samanthaGuide from '../images/samantha.jpeg';
import nuwanGuide from '../images/nuwan.jpeg';
import lakminiGuide from '../images/lakmini.jpg';
import ruwanGuide from '../images/ruwan.jpeg';
import chamilaGuide from '../images/chamila.jpg';
import dilshanGuide from '../images/dilshan.jpg';

// Tour Packages Data
export const tourPackages = [
  { 
    id: 1, name: 'Cultural Triangle Tour', location: 'Kandy, Sigiriya', district: 'Kandy', rating: 4.8, price: 25000,
    description: 'Explore ancient cities and Buddhist temples including Sigiriya Rock Fortress and Temple of the Tooth', 
    image: packagesSigiriya,
    duration: '5 days', popular: true, 
    includes: { 
      hotel: { id: 4, name: 'Cinnamon Lodge', location: 'Kandy', pricePerNight: 18500 },
      vehicle: { id: 3, name: 'Toyota Axio', type: 'Car', pricePerDay: 6500 },
      guide: { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', pricePerDay: 5000 }
    },
    mealIncluded: 'Breakfast & Lunch' 
  },
  { 
    id: 2, name: 'Galle Day Tour', location: 'Galle Fort', district: 'Galle', rating: 4.5, price: 18000,
    description: 'Visit the historic Dutch fort and explore colonial architecture', 
    image: packagesGalleFort,
    duration: '1 day', popular: true, 
    includes: { 
      hotel: { id: 7, name: 'Amangalla', location: 'Galle', pricePerNight: 22000 },
      vehicle: { id: 5, name: 'Nissan Caravan', type: 'Van', pricePerDay: 9000 },
      guide: { id: 4, name: 'Lakmini Silva', specialty: 'Culinary & City Tours', pricePerDay: 5000 }
    },
    mealIncluded: 'Lunch' 
  },
  { 
    id: 3, name: 'Ella Escape', location: 'Ella', district: 'Ella', rating: 4.9, price: 22000,
    description: 'Scenic train ride, hiking to Nine Arches Bridge and Little Adam\'s Peak', 
    image: packagesElla,
    duration: '3 days', popular: true, 
    includes: { 
      hotel: { id: 10, name: '98 Acres Resort', location: 'Ella', pricePerNight: 16500 },
      vehicle: { id: 7, name: 'Toyota Prado', type: 'SUV', pricePerDay: 12000 },
      guide: { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', pricePerDay: 4500 }
    },
    mealIncluded: 'Breakfast' 
  },
  { 
    id: 4, name: 'Nuwara Eliya Highlands', location: 'Nuwara Eliya', district: 'Nuwara Eliya', rating: 4.7, price: 30000,
    description: 'Tea plantations, Gregory Lake, and cool climate experience', 
    image: packagesNuwaraEliya,
    duration: '4 days', popular: false, 
    includes: { 
      hotel: { id: 12, name: 'Grand Hotel', location: 'Nuwara Eliya', pricePerNight: 14000 },
      vehicle: { id: 7, name: 'Toyota Prado', type: 'SUV', pricePerDay: 12000 },
      guide: { id: 7, name: 'Dilshan Rajapaksha', specialty: 'Highland Tours', pricePerDay: 4800 }
    },
    mealIncluded: 'Breakfast & Dinner' 
  },
];

// Hotels Data
export const hotels = [
  { id: 1, name: 'Jetwing Blue', location: 'Negombo', district: 'Colombo', pricePerNight: 12500, rating: 4.7, image: hotelsJetwingBlue, popular: true, amenities: ['Pool', 'Spa', 'Restaurant', 'Beach Access'] },
  { id: 2, name: 'Cinnamon Lakeside', location: 'Colombo', district: 'Colombo', pricePerNight: 18000, rating: 4.6, image: hotelsCinnamonLakeside, popular: false, amenities: ['Pool', 'Spa', 'Multiple Restaurants'] },
  { id: 3, name: 'Galle Face Hotel', location: 'Colombo', district: 'Colombo', pricePerNight: 22000, rating: 4.8, image: hotelsGalleFaceHotel, popular: false, amenities: ['Heritage Building', 'Ocean View', 'Fine Dining'] },
  { id: 4, name: 'Cinnamon Lodge', location: 'Kandy', district: 'Kandy', pricePerNight: 18500, rating: 4.9, image: hotelsCinnamonLodge, popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 5, name: 'Earl\'s Regency', location: 'Kandy', district: 'Kandy', pricePerNight: 16500, rating: 4.7, image: hotelsEarlsRegency, popular: false, amenities: ['Pool', 'Gym', 'Multiple Restaurants'] },
  { id: 6, name: 'Mahaweli Reach', location: 'Kandy', district: 'Kandy', pricePerNight: 15000, rating: 4.6, image: hotelsMahaweliReach, popular: false, amenities: ['River View', 'Pool', 'Spa'] },
  { id: 7, name: 'Amangalla', location: 'Galle', district: 'Galle', pricePerNight: 22000, rating: 4.9, image: hotelsAmangalla, popular: true, amenities: ['Spa', 'Fine Dining', 'Heritage Building'] },
  { id: 8, name: 'Jetwing Lighthouse', location: 'Galle', district: 'Galle', pricePerNight: 19500, rating: 4.8, image: hotelsJetwingLighthouse, popular: false, amenities: ['Pool', 'Spa', 'Beach Access'] },
  { id: 9, name: 'Fort Bazaar', location: 'Galle', district: 'Galle', pricePerNight: 16000, rating: 4.7, image: hotelsFortBazaar, popular: false, amenities: ['Boutique Hotel', 'Library', 'Courtyard'] },
  { id: 10, name: '98 Acres Resort', location: 'Ella', district: 'Ella', pricePerNight: 16500, rating: 4.8, image: hotels98AcresResort, popular: true, amenities: ['Pool', 'Restaurant', 'Mountain Views'] },
  { id: 11, name: 'Ella Jungle Resort', location: 'Ella', district: 'Ella', pricePerNight: 12000, rating: 4.5, image: hotelsEllaJungleResort, popular: false, amenities: ['Jungle View', 'Nature Trails'] },
  { id: 12, name: 'Grand Hotel', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 14000, rating: 4.7, image: hotelsGrandHotel, popular: true, amenities: ['Pool', 'Golf', 'Multiple Restaurants'] },
  { id: 13, name: 'The Hill Club', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 12000, rating: 4.6, image: hotelsTheHillClub, popular: false, amenities: ['Heritage Building', 'Library', 'Garden'] },
  { id: 14, name: 'Heritance Kandalama', location: 'Dambulla', district: 'Sigiriya', pricePerNight: 18500, rating: 4.9, image: hotelsHeritanceKandalama, popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 15, name: 'Cinnamon Wild', location: 'Yala', district: 'Yala', pricePerNight: 15500, rating: 4.6, image: hotelsCinnamonWild, popular: true, amenities: ['Pool', 'Restaurant', 'Wildlife Viewing'] },
];

// Vehicles Data
export const vehicles = [
  { id: 1, type: 'Scooter', model: 'Honda Dio', pricePerDay: 2500, passengers: 2, fuelType: 'Petrol', mileage: '45 km/l', year: '2024', popular: true, district: 'Colombo', rating: 4.7, location: 'Colombo', status: 'available', image: vehiclesHondaDio },
  { id: 2, type: 'Car', model: 'Honda Fit', pricePerDay: 6000, passengers: 4, fuelType: 'Petrol', mileage: '20 km/l', year: '2023', popular: false, district: 'Colombo', rating: 4.5, location: 'Colombo', status: 'available', image: vehiclesHondaFit },
  { id: 3, type: 'Car', model: 'Toyota Axio', pricePerDay: 6500, passengers: 4, fuelType: 'Petrol', mileage: '18 km/l', year: '2023', popular: true, district: 'Kandy', rating: 4.8, location: 'Kandy', status: 'available', image: vehiclesToyotaAxio },
  { id: 4, type: 'SUV', model: 'Toyota Prado', pricePerDay: 12000, passengers: 7, fuelType: 'Diesel', mileage: '12 km/l', year: '2024', popular: true, district: 'Ella', rating: 4.9, location: 'Ella', status: 'available', image: vehiclesToyotaPrado },
  { id: 5, type: 'Van', model: 'Nissan Caravan', pricePerDay: 9000, passengers: 10, fuelType: 'Diesel', mileage: '14 km/l', year: '2023', popular: true, district: 'Galle', rating: 4.4, location: 'Galle', status: 'maintenance', image: vehiclesNissanCaravan },
  { id: 6, type: 'SUV', model: 'Mitsubishi Montero', pricePerDay: 11000, passengers: 7, fuelType: 'Diesel', mileage: '11 km/l', year: '2023', popular: false, district: 'Kandy', rating: 4.6, location: 'Kandy', status: 'available', image: vehiclesMitsubishiMontero },
  { id: 7, type: 'Van', model: 'Toyota Hiace', pricePerDay: 10000, passengers: 10, fuelType: 'Diesel', mileage: '13 km/l', year: '2024', popular: false, district: 'Ella', rating: 4.3, location: 'Ella', status: 'booked', image: vehiclesToyotaHiace },
];

// Tour Guides Data
export const tourGuides = [
  { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', district: 'Kandy', location: 'Kandy, Sigiriya, Anuradhapura', rating: 4.9, reviews: 124, language: 'English, German', experience: '15 years', certification: 'Senior Certified Guide', pricePerDay: 5000, popular: true, image: priyaGuide },
  { id: 2, name: 'Samantha Perera', specialty: 'Wildlife & Nature Safaris', district: 'Yala', location: 'Yala, Udawalawe, Wilpattu', rating: 4.8, reviews: 98, language: 'English, French', experience: '12 years', certification: 'Wildlife Specialist', pricePerDay: 5000, popular: true, image: samanthaGuide },
  { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', district: 'Ella', location: 'Ella, Nuwara Eliya, Horton Plains', rating: 4.7, reviews: 85, language: 'English', experience: '8 years', certification: 'Adventure Guide', pricePerDay: 4500, popular: true, image: nuwanGuide },
  { id: 4, name: 'Lakmini Silva', specialty: 'Culinary & City Tours', district: 'Galle', location: 'Colombo, Galle, Kandy', rating: 4.9, reviews: 156, language: 'English, Mandarin', experience: '10 years', certification: 'Cultural Ambassador', pricePerDay: 5000, popular: true, image: lakminiGuide },
  { id: 5, name: 'Ruwan Herath', specialty: 'Cultural Tours', district: 'Sigiriya', location: 'Sigiriya, Dambulla, Polonnaruwa', rating: 4.8, reviews: 112, language: 'English, Japanese', experience: '12 years', certification: 'Heritage Guide', pricePerDay: 5000, popular: false, image: ruwanGuide },
  { id: 6, name: 'Chamila Perera', specialty: 'City Explorer', district: 'Colombo', location: 'Colombo, Negombo', rating: 4.6, reviews: 78, language: 'English, Hindi', experience: '7 years', certification: 'City Guide', pricePerDay: 4000, popular: false, image: chamilaGuide },
  { id: 7, name: 'Dilshan Rajapaksha', specialty: 'Highland Tours', district: 'Nuwara Eliya', location: 'Nuwara Eliya, Bandarawela', rating: 4.8, reviews: 95, language: 'English', experience: '9 years', certification: 'Mountain Guide', pricePerDay: 4800, popular: false, image: dilshanGuide },
];

// Bookings Data
export const bookings = [
  { id: 1, customerName: 'John Doe', customerEmail: 'john@example.com', customerPhone: '+94 77 123 4567', packageName: 'Cultural Triangle Tour', startDate: '2025-06-20', endDate: '2025-06-25', totalAmount: 50000, status: 'pending', paymentStatus: 'unpaid', bookingDate: '2025-05-20' },
  { id: 2, customerName: 'Sarah Wilson', customerEmail: 'sarah@example.com', customerPhone: '+94 77 234 5678', packageName: 'Galle Day Tour', startDate: '2025-07-10', endDate: '2025-07-10', totalAmount: 18000, status: 'confirmed', paymentStatus: 'paid', bookingDate: '2025-05-21' },
  { id: 3, customerName: 'Michael Chen', customerEmail: 'michael@example.com', customerPhone: '+94 77 345 6789', packageName: 'Ella Escape', startDate: '2025-08-05', endDate: '2025-08-08', totalAmount: 66000, status: 'pending', paymentStatus: 'partial', bookingDate: '2025-05-22' },
];

// Users Data
export const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', registeredAt: '2025-05-15' },
  { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', registeredAt: '2025-05-16' },
  { id: 3, name: 'Michael Chen', email: 'michael@example.com', role: 'user', registeredAt: '2025-05-17' },
];

// ============== HELPER FUNCTIONS ==============

export const getPopularTours = () => tourPackages.filter(item => item.popular === true);
export const getPopularHotels = () => hotels.filter(item => item.popular === true);
export const getPopularVehicles = () => vehicles.filter(item => item.popular === true);
export const getPopularGuides = () => tourGuides.filter(item => item.popular === true);

export const getGuidesByDistrict = (district) => {
  return tourGuides.filter(guide => 
    guide.district.toLowerCase() === district.toLowerCase() ||
    guide.location.toLowerCase().includes(district.toLowerCase())
  );
};

export const getHotelsByDistrict = (district) => {
  return hotels.filter(hotel => hotel.district.toLowerCase() === district.toLowerCase()).sort((a, b) => b.rating - a.rating);
};

export const getHotelsByDistrictAndBudget = (district, budget) => {
  let filteredHotels = hotels.filter(hotel => hotel.district.toLowerCase() === district.toLowerCase());
  if (budget === 'budget') {
    filteredHotels = filteredHotels.filter(h => h.pricePerNight <= 7000);
  } else if (budget === 'mid') {
    filteredHotels = filteredHotels.filter(h => h.pricePerNight > 7000 && h.pricePerNight <= 12000);
  } else if (budget === 'luxury') {
    filteredHotels = filteredHotels.filter(h => h.pricePerNight > 12000);
  }
  return filteredHotels.sort((a, b) => b.rating - a.rating);
};

export const getVehiclesByPassengers = (passengerCount) => {
  return vehicles.filter(vehicle => vehicle.passengers >= passengerCount).sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

export const getVehicleById = (id) => vehicles.find(v => v.id === parseInt(id));
export const getHotelById = (id) => hotels.find(h => h.id === parseInt(id));
export const getGuideById = (id) => tourGuides.find(g => g.id === parseInt(id));
export const getTourById = (id) => tourPackages.find(t => t.id === parseInt(id));

export const calculatePackagePricingFn = (tour) => {
  if (!tour || !tour.includes) return { total: 0, discountAmount: 0 };
  const days = parseInt(tour.duration.split(' ')[0]) || 5;
  const hotelPrice = tour.includes.hotel?.pricePerNight || 0;
  const vehiclePrice = tour.includes.vehicle?.pricePerDay || 0;
  const guidePrice = tour.includes.guide?.pricePerDay || 0;
  const serviceCharge = 15000;
  
  const hotelTotal = hotelPrice * days;
  const vehicleTotal = vehiclePrice * days;
  const guideTotal = guidePrice * days;
  const subtotal = hotelTotal + vehicleTotal + guideTotal + serviceCharge;
  const discountPercent = 5;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;
  
  return { days, hotelTotal, vehicleTotal, guideTotal, serviceCharge, subtotal, discountAmount, total };
};

export const getAllToursSortedByRating = () => [...tourPackages].sort((a, b) => b.rating - a.rating);
export const getAllHotelsSortedByRating = () => [...hotels].sort((a, b) => b.rating - a.rating);
export const getAllVehiclesSortedByRating = () => [...vehicles].sort((a, b) => (b.rating || 0) - (a.rating || 0));
export const getAllGuidesSortedByRating = () => [...tourGuides].sort((a, b) => b.rating - a.rating);

// Dashboard Stats Function
export const getDashboardStats = () => {
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalUsers = users.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  
  return { totalBookings, totalRevenue, totalUsers, availableVehicles };
};
