const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

// CORS - Allow frontend to connect
app.use(cors());

// Increase payload limit for image uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const bookingRoutes = require('./routes/bookings');
const vehicleRoutes = require('./routes/vehicles');
const hotelRoutes = require('./routes/hotels');
const guideRoutes = require('./routes/guides');
const feedbackRoutes = require('./routes/feedback');
const tourPackageRoutes = require('./routes/tourPackages');
const paymentRoutes = require('./routes/payments');
const districtRoutes = require('./routes/districts');


// const userRoutes = require('./routes/users'); // uncomment if needed

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/tour-packages', tourPackageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/districts', districtRoutes);
// app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});