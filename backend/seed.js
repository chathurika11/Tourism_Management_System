const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { ensureRoles, assignRoleToUser } = require('./services/roles');
const prisma = new PrismaClient();

// ---------- Hotels Data (same as frontend) ----------
const hotels = [
  { id: 1, name: 'Jetwing Blue', location: 'Negombo', district: 'Colombo', pricePerNight: 12500, rating: 4.7, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Spa', 'Restaurant', 'Beach Access'] },
  { id: 2, name: 'Cinnamon Lakeside', location: 'Colombo', district: 'Colombo', pricePerNight: 18000, rating: 4.6, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Pool', 'Spa', 'Multiple Restaurants'] },
  { id: 3, name: 'Galle Face Hotel', location: 'Colombo', district: 'Colombo', pricePerNight: 22000, rating: 4.8, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Heritage Building', 'Ocean View', 'Fine Dining'] },
  { id: 4, name: 'Cinnamon Lodge', location: 'Kandy', district: 'Kandy', pricePerNight: 18500, rating: 4.9, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 5, name: 'Earl\'s Regency', location: 'Kandy', district: 'Kandy', pricePerNight: 16500, rating: 4.7, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Pool', 'Gym', 'Multiple Restaurants'] },
  { id: 6, name: 'Mahaweli Reach', location: 'Kandy', district: 'Kandy', pricePerNight: 15000, rating: 4.6, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['River View', 'Pool', 'Spa'] },
  { id: 7, name: 'Amangalla', location: 'Galle', district: 'Galle', pricePerNight: 22000, rating: 4.9, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: true, amenities: ['Spa', 'Fine Dining', 'Heritage Building'] },
  { id: 8, name: 'Jetwing Lighthouse', location: 'Galle', district: 'Galle', pricePerNight: 19500, rating: 4.8, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Pool', 'Spa', 'Beach Access'] },
  { id: 9, name: 'Fort Bazaar', location: 'Galle', district: 'Galle', pricePerNight: 16000, rating: 4.7, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Boutique Hotel', 'Library', 'Courtyard'] },
  { id: 10, name: '98 Acres Resort', location: 'Ella', district: 'Ella', pricePerNight: 16500, rating: 4.8, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Restaurant', 'Mountain Views'] },
  { id: 11, name: 'Ella Jungle Resort', location: 'Ella', district: 'Ella', pricePerNight: 12000, rating: 4.5, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: false, amenities: ['Jungle View', 'Nature Trails'] },
  { id: 12, name: 'Grand Hotel', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 14000, rating: 4.7, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: true, amenities: ['Pool', 'Golf', 'Multiple Restaurants'] },
  { id: 13, name: 'The Hill Club', location: 'Nuwara Eliya', district: 'Nuwara Eliya', pricePerNight: 12000, rating: 4.6, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: false, amenities: ['Heritage Building', 'Library', 'Garden'] },
  { id: 14, name: 'Heritance Kandalama', location: 'Dambulla', district: 'Sigiriya', pricePerNight: 18500, rating: 4.9, image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?w=600', popular: true, amenities: ['Pool', 'Spa', 'Nature Trails'] },
  { id: 15, name: 'Cinnamon Wild', location: 'Yala', district: 'Yala', pricePerNight: 15500, rating: 4.6, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=600', popular: true, amenities: ['Pool', 'Restaurant', 'Wildlife Viewing'] },
];

// ---------- Vehicles Data ----------
const vehicles = [
  { id: 1, type: 'Scooter', model: 'Honda Dio', pricePerDay: 2500, passengers: 2, fuelType: 'Petrol', mileage: '45 km/l', year: '2024', popular: true, district: 'Colombo', rating: 4.7, location: 'Colombo', status: 'available', image: 'https://images.pexels.com/photos/1046997/pexels-photo-1046997.jpeg?w=600' },
  { id: 2, type: 'Car', model: 'Honda Fit', pricePerDay: 6000, passengers: 4, fuelType: 'Petrol', mileage: '20 km/l', year: '2023', popular: false, district: 'Colombo', rating: 4.5, location: 'Colombo', status: 'available', image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=600' },
  { id: 3, type: 'Car', model: 'Toyota Axio', pricePerDay: 6500, passengers: 4, fuelType: 'Petrol', mileage: '18 km/l', year: '2023', popular: true, district: 'Kandy', rating: 4.8, location: 'Kandy', status: 'available', image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?w=600' },
  { id: 4, type: 'SUV', model: 'Toyota Prado', pricePerDay: 12000, passengers: 7, fuelType: 'Diesel', mileage: '12 km/l', year: '2024', popular: true, district: 'Ella', rating: 4.9, location: 'Ella', status: 'available', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 5, type: 'Van', model: 'Nissan Caravan', pricePerDay: 9000, passengers: 10, fuelType: 'Diesel', mileage: '14 km/l', year: '2023', popular: true, district: 'Galle', rating: 4.4, location: 'Galle', status: 'maintenance', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 6, type: 'SUV', model: 'Mitsubishi Montero', pricePerDay: 11000, passengers: 7, fuelType: 'Diesel', mileage: '11 km/l', year: '2023', popular: false, district: 'Kandy', rating: 4.6, location: 'Kandy', status: 'available', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
  { id: 7, type: 'Van', model: 'Toyota Hiace', pricePerDay: 10000, passengers: 10, fuelType: 'Diesel', mileage: '13 km/l', year: '2024', popular: false, district: 'Ella', rating: 4.3, location: 'Ella', status: 'booked', image: 'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?w=600' },
];

// ---------- Tour Guides Data ----------
const tourGuides = [
  { id: 1, name: 'Priya Samarawickrama', specialty: 'Cultural & Historical Tours', district: 'Kandy', location: 'Kandy, Sigiriya, Anuradhapura', rating: 4.9, reviews: 124, language: 'English, German', experience: '15 years', certification: 'Senior Certified Guide', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 2, name: 'Samantha Perera', specialty: 'Wildlife & Nature Safaris', district: 'Yala', location: 'Yala, Udawalawe, Wilpattu', rating: 4.8, reviews: 98, language: 'English, French', experience: '12 years', certification: 'Wildlife Specialist', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
  { id: 3, name: 'Nuwan Jayawardene', specialty: 'Hiking & Adventure', district: 'Ella', location: 'Ella, Nuwara Eliya, Horton Plains', rating: 4.7, reviews: 85, language: 'English', experience: '8 years', certification: 'Adventure Guide', pricePerDay: 4500, popular: true, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 4, name: 'Lakmini Silva', specialty: 'Culinary & City Tours', district: 'Galle', location: 'Colombo, Galle, Kandy', rating: 4.9, reviews: 156, language: 'English, Mandarin', experience: '10 years', certification: 'Cultural Ambassador', pricePerDay: 5000, popular: true, image: 'https://images.pexels.com/photos/3711600/pexels-photo-3711600.jpeg?w=400' },
  { id: 5, name: 'Ruwan Herath', specialty: 'Cultural Tours', district: 'Sigiriya', location: 'Sigiriya, Dambulla, Polonnaruwa', rating: 4.8, reviews: 112, language: 'English, Japanese', experience: '12 years', certification: 'Heritage Guide', pricePerDay: 5000, popular: false, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
  { id: 6, name: 'Chamila Perera', specialty: 'City Explorer', district: 'Colombo', location: 'Colombo, Negombo', rating: 4.6, reviews: 78, language: 'English, Hindi', experience: '7 years', certification: 'City Guide', pricePerDay: 4000, popular: false, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?w=400' },
  { id: 7, name: 'Dilshan Rajapaksha', specialty: 'Highland Tours', district: 'Nuwara Eliya', location: 'Nuwara Eliya, Bandarawela', rating: 4.8, reviews: 95, language: 'English', experience: '9 years', certification: 'Mountain Guide', pricePerDay: 4800, popular: false, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=400' },
];

async function seed() {
  try {
    await ensureRoles();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { name: 'Main Admin', role: 'admin', password: hashedAdminPassword, passwordHash: hashedAdminPassword, status: 'ACTIVE', emailVerified: true, mustChangePassword: false },
      create: {
        name: 'Main Admin',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@serendigo.local',
        phone: '+94000000000',
        address: 'SerendiGo Office',
        country: 'Sri Lanka',
        idNumber: null,
        idType: null,
        password: hashedAdminPassword,
        passwordHash: hashedAdminPassword,
        status: 'ACTIVE',
        emailVerified: true,
        mustChangePassword: false,
        role: 'admin'
      }
    });
    await assignRoleToUser(admin.id, 'ADMIN');
    console.log('Main admin ready: username=admin password=' + adminPassword);

    for (const hotel of hotels) {
      await prisma.hotel.upsert({
        where: { id: hotel.id.toString() },
        update: {},
        create: { id: hotel.id.toString(), name: hotel.name, location: hotel.location, district: hotel.district, pricePerNight: hotel.pricePerNight, rating: hotel.rating, amenities: hotel.amenities, image: hotel.image, popular: hotel.popular }
      });
    }
    console.log('✓ Hotels seeded');

    for (const vehicle of vehicles) {
      await prisma.vehicle.upsert({
        where: { id: vehicle.id.toString() },
        update: {},
        create: { id: vehicle.id.toString(), type: vehicle.type, model: vehicle.model, pricePerDay: vehicle.pricePerDay, passengers: vehicle.passengers, fuelType: vehicle.fuelType, mileage: vehicle.mileage, year: vehicle.year, rating: vehicle.rating, location: vehicle.location, district: vehicle.district, status: vehicle.status, image: vehicle.image }
      });
    }
    console.log('✓ Vehicles seeded');

    for (const guide of tourGuides) {
      await prisma.guide.upsert({
        where: { id: guide.id.toString() },
        update: {},
        create: { id: guide.id.toString(), name: guide.name, specialty: guide.specialty, district: guide.district, location: guide.location, rating: guide.rating, reviews: guide.reviews, language: guide.language, experience: guide.experience, certification: guide.certification, pricePerDay: guide.pricePerDay, popular: guide.popular, image: guide.image }
      });
    }
    console.log('✓ Guides seeded');

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
