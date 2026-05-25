// Shared data for all pages with high-quality images

// Tour Packages Data
export const tourPackages = [
  { 
    id: 1, name: 'Cultural Triangle Tour', location: 'Kandy, Sigiriya', district: 'Kandy', rating: 4.8, price: 25000,
    description: 'Explore ancient cities and Buddhist temples including Sigiriya Rock Fortress and Temple of the Tooth', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvUDk_oBEgsIf5XTgDTixBkmmr_H4C1zC5BQ&s',
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
    image: 'data:image/jpeg;base64,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', 
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
    image: 'https://cdn.pixabay.com/photo/2020/07/19/10/33/bridge-5419582_1280.jpg', 
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTvkCQmTjmp5Qto_CEmfW7rW53M67rGCKkJQ&s', 
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
  { id: 1, name: 'Jetwing Blue', location: 'Negombo', district: 'Colombo', pricePerNight: 12500, rating: 4.7, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Spa', 'Restaurant', 'Beach Access'] },
  { id: 2, name: 'Cinnamon Lakeside', location: 'Colombo', district: 'Colombo', pricePerNight: 18000, rating: 4.6, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Pool', 'Spa', 'Multiple Restaurants'] },
  { id: 3, name: 'Galle Face Hotel', location: 'Colombo', district: 'Colombo', pricePerNight: 22000, rating: 4.8, image: 'https://images.pexels.com/photos/19689235/pexels-photo-19689235.jpeg?auto=compress&cs=tinysrgb&w=900', popular: false, amenities: ['Heritage Building', 'Ocean View', 'Fine Dining'] },
  { id: 4, name: 'Cinnamon Lodge', location: 'Kandy', district: 'Kandy', pricePerNight: 18500, rating: 4.9, image: 'https://images.pexels.com/photos/17568098/pexels-photo-17568098.jpeg?auto=compress&cs=tinysrgb&w=900', popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 5, name: 'Earl\'s Regency', location: 'Kandy', district: 'Kandy', pricePerNight: 16500, rating: 4.7, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Pool', 'Gym', 'Multiple Restaurants'] },
  { id: 6, name: 'Mahaweli Reach', location: 'Kandy', district: 'Kandy', pricePerNight: 15000, rating: 4.6, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['River View', 'Pool', 'Spa'] },
  { id: 7, name: 'Amangalla', location: 'Galle', district: 'Galle', pricePerNight: 22000, rating: 4.9, image: 'https://images.pexels.com/photos/6758532/pexels-photo-6758532.jpeg?auto=compress&cs=tinysrgb&w=900', popular: true, amenities: ['Spa', 'Fine Dining', 'Heritage Building'] },
  { id: 8, name: 'Jetwing Lighthouse', location: 'Galle', district: 'Galle', pricePerNight: 19500, rating: 4.8, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Pool', 'Spa', 'Beach Access'] },
  { id: 9, name: 'Fort Bazaar', location: 'Galle', district: 'Galle', pricePerNight: 16000, rating: 4.7, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Boutique Hotel', 'Library', 'Courtyard'] },
  { id: 10, name: '98 Acres Resort', location: 'Ella', district: 'Ella', pricePerNight: 16500, rating: 4.8, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Restaurant', 'Mountain Views'] },
  { id: 11, name: 'Ella Jungle Resort', location: 'Ella', district: 'Ella', pricePerNight: 12000, rating: 4.5, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Jungle View', 'Nature Trails'] },
  { id: 12, name: 'Grand Hotel', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 14000, rating: 4.7, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: true, amenities: ['Pool', 'Golf', 'Multiple Restaurants'] },
  { id: 13, name: 'The Hill Club', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 12000, rating: 4.6, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Heritage Building', 'Library', 'Garden'] },
  { id: 14, name: 'Heritance Kandalama', location: 'Dambulla', district: 'Sigiriya', pricePerNight: 18500, rating: 4.9, image: 'https://images.pexels.com/photos/32229384/pexels-photo-32229384.jpeg?auto=compress&cs=tinysrgb&w=900', popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 15, name: 'Cinnamon Wild', location: 'Yala', district: 'Yala', pricePerNight: 15500, rating: 4.6, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Restaurant', 'Wildlife Viewing'] },
];

// Vehicles Data
export const vehicles = [
  { id: 1, type: 'Scooter', model: 'Honda Dio', pricePerDay: 2500, passengers: 2, fuelType: 'Petrol', mileage: '45 km/l', year: '2024', popular: true, district: 'Colombo', rating: 4.7, location: 'Colombo', image: 'https://images.pexels.com/photos/1046997/pexels-photo-1046997.jpeg?w=600' },
  { id: 2, type: 'Car', model: 'Honda Fit', pricePerDay: 6000, passengers: 4, fuelType: 'Petrol', mileage: '20 km/l', year: '2023', popular: false, district: 'Colombo', rating: 4.5, location: 'Colombo', image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=600' },
  { id: 3, type: 'Car', model: 'Toyota Axio', pricePerDay: 6500, passengers: 4, fuelType: 'Petrol', mileage: '18 km/l', year: '2023', popular: true, district: 'Kandy', rating: 4.8, location: 'Kandy', image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=600' },
  { id: 4, type: 'SUV', model: 'Toyota Prado', pricePerDay: 12000, passengers: 7, fuelType: 'Diesel', mileage: '12 km/l', year: '2024', popular: true, district: 'Ella', rating: 4.9, location: 'Ella', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 5, type: 'Van', model: 'Nissan Caravan', pricePerDay: 9000, passengers: 10, fuelType: 'Diesel', mileage: '14 km/l', year: '2023', popular: true, district: 'Galle', rating: 4.4, location: 'Galle', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 6, type: 'SUV', model: 'Mitsubishi Montero', pricePerDay: 11000, passengers: 7, fuelType: 'Diesel', mileage: '11 km/l', year: '2023', popular: false, district: 'Kandy', rating: 4.6, location: 'Kandy', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 7, type: 'Van', model: 'Toyota Hiace', pricePerDay: 10000, passengers: 10, fuelType: 'Diesel', mileage: '13 km/l', year: '2024', popular: false, district: 'Ella', rating: 4.3, location: 'Ella', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
];

// Tour Guides Data
export const tourGuides = [
  { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', district: 'Kandy', location: 'Kandy, Sigiriya, Anuradhapura', rating: 4.9, reviews: 124, language: 'English, German', experience: '15 years', certification: 'Senior Certified Guide', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 2, name: 'Samantha Perera', specialty: 'Wildlife & Nature Safaris', district: 'Yala', location: 'Yala, Udawalawe, Wilpattu', rating: 4.8, reviews: 98, language: 'English, French', experience: '12 years', certification: 'Wildlife Specialist', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
  { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', district: 'Ella', location: 'Ella, Nuwara Eliya, Horton Plains', rating: 4.7, reviews: 85, language: 'English', experience: '8 years', certification: 'Adventure Guide', pricePerDay: 4500, popular: true, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 4, name: 'Lakmini Silva', specialty: 'Culinary & City Tours', district: 'Galle', location: 'Colombo, Galle, Kandy', rating: 4.9, reviews: 156, language: 'English, Mandarin', experience: '10 years', certification: 'Cultural Ambassador', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/3711600/pexels-photo-3711600.jpeg?w=400' },
  { id: 5, name: 'Ruwan Herath', specialty: 'Cultural Tours', district: 'Sigiriya', location: 'Sigiriya, Dambulla, Polonnaruwa', rating: 4.8, reviews: 112, language: 'English, Japanese', experience: '12 years', certification: 'Heritage Guide', pricePerDay: 5000, popular: false, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
  { id: 6, name: 'Chamila Perera', specialty: 'City Explorer', district: 'Colombo', location: 'Colombo, Negombo', rating: 4.6, reviews: 78, language: 'English, Hindi', experience: '7 years', certification: 'City Guide', pricePerDay: 4000, popular: false, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 7, name: 'Dilshan Rajapaksha', specialty: 'Highland Tours', district: 'Nuwara Eliya', location: 'Nuwara Eliya, Bandarawela', rating: 4.8, reviews: 95, language: 'English', experience: '9 years', certification: 'Mountain Guide', pricePerDay: 4800, popular: false, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
];

// Get popular items
export const getPopularTours = () => tourPackages.filter(item => item.popular === true);
export const getPopularHotels = () => hotels.filter(item => item.popular === true);
export const getPopularVehicles = () => vehicles.filter(item => item.popular === true);
export const getPopularGuides = () => tourGuides.filter(item => item.popular === true);

// Get guides by district
export const getGuidesByDistrict = (district) => {
  return tourGuides.filter(guide => 
    guide.district.toLowerCase() === district.toLowerCase() ||
    guide.location.toLowerCase().includes(district.toLowerCase())
  );
};

// Get hotels by district
export const getHotelsByDistrict = (district) => {
  return hotels.filter(hotel => hotel.district.toLowerCase() === district.toLowerCase()).sort((a, b) => b.rating - a.rating);
};

// Get hotels by district AND budget
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

// Get vehicles by passenger count
export const getVehiclesByPassengers = (passengerCount) => {
  return vehicles.filter(vehicle => vehicle.passengers >= passengerCount).sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

// Get single item by ID
export const getVehicleById = (id) => vehicles.find(v => v.id === parseInt(id));
export const getHotelById = (id) => hotels.find(h => h.id === parseInt(id));
export const getGuideById = (id) => tourGuides.find(g => g.id === parseInt(id));
export const getTourById = (id) => tourPackages.find(t => t.id === parseInt(id));

// Calculate package pricing
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

// Get all items sorted by rating
export const getAllToursSortedByRating = () => [...tourPackages].sort((a, b) => b.rating - a.rating);
export const getAllHotelsSortedByRating = () => [...hotels].sort((a, b) => b.rating - a.rating);
export const getAllVehiclesSortedByRating = () => [...vehicles].sort((a, b) => (b.rating || 0) - (a.rating || 0));
export const getAllGuidesSortedByRating = () => [...tourGuides].sort((a, b) => b.rating - a.rating);
