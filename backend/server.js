const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { ensureRoles, assignRoleToUser } = require('./services/roles');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const customerRoutes = require('./routes/customers');
const providerRequestRoutes = require('./routes/providerRequests');

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tour-packages', tourPackageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/provider-requests', providerRequestRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const ensureMainAdmin = async () => {
  await ensureRoles();

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin1234';

  const existingAdmin = await prisma.user.findUnique({
    where: { username }
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Main Admin',
        username,
        email: process.env.ADMIN_EMAIL || 'admin@serendigo.local',
        phone: '+94000000000',
        address: 'SerendiGo Office',
        country: 'Sri Lanka',
        password: hashedPassword,
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        emailVerified: true,
        mustChangePassword: false,
        role: 'admin'
      }
    });

    await assignRoleToUser(admin.id, 'ADMIN');
    console.log(`Main admin created: username=${username} password=${password}`);
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: 'Main Admin',
        password: hashedPassword,
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        emailVerified: true,
        mustChangePassword: false,
        role: 'admin'
      }
    });

    await assignRoleToUser(existingAdmin.id, 'ADMIN');
  }
};



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established');

    await ensureMainAdmin();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();