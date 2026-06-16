const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const { logAudit } = require('../services/auditLog');
const router = express.Router();
const prisma = new PrismaClient();

const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ error: 'Admin or staff only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET vehicles – with optional district filter and pagination
router.get('/', async (req, res) => {
  try {
    const { district } = req.query;

    if (district) {
      const vehicles = await prisma.vehicle.findMany({
        where: { district: { equals: district, mode: 'insensitive' } },
        orderBy: { rating: 'desc' }
      });
      return res.json(vehicles);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.vehicle.count()
    ]);

    res.json({ data: vehicles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

// POST create vehicle (admin only)
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const pickupLocations = req.body.pickupLocations ? req.body.pickupLocations.split(',').map(s => s.trim()) : [];
    const includedFeatures = req.body.includedFeatures ? req.body.includedFeatures.split(',').map(s => s.trim()) : [];
    const data = {
      type: req.body.type,
      model: req.body.model,
      pricePerDay: parseFloat(req.body.pricePerDay),
      passengers: parseInt(req.body.passengers),
      fuelType: req.body.fuelType || '',
      fuelEfficiency: req.body.fuelEfficiency || '',
      year: req.body.year || '',
      insuranceIncluded: req.body.insuranceIncluded === 'true',
      supportHours: req.body.supportHours || '24/7',
      pickupLocations,
      includedFeatures,
      securityDeposit: parseFloat(req.body.securityDeposit) || 0,
      depositRefundable: req.body.depositRefundable === 'true',
      location: req.body.location,
      district: req.body.district,
      status: req.body.status || 'available',
      image: imageUrl,
      rating: 0
    };
    const vehicle = await prisma.vehicle.create({ data });
    await logAudit(req, 'VEHICLE_CREATED', 'Vehicle', vehicle.id, {
      description: `Added ${vehicle.model} vehicle`,
      name: vehicle.model,
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update vehicle (admin only)
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const pickupLocations = req.body.pickupLocations ? req.body.pickupLocations.split(',').map(s => s.trim()) : [];
    const includedFeatures = req.body.includedFeatures ? req.body.includedFeatures.split(',').map(s => s.trim()) : [];
    const data = {
      type: req.body.type,
      model: req.body.model,
      pricePerDay: parseFloat(req.body.pricePerDay),
      passengers: parseInt(req.body.passengers),
      fuelType: req.body.fuelType || '',
      fuelEfficiency: req.body.fuelEfficiency || '',
      year: req.body.year || '',
      insuranceIncluded: req.body.insuranceIncluded === 'true',
      supportHours: req.body.supportHours || '24/7',
      pickupLocations,
      includedFeatures,
      securityDeposit: parseFloat(req.body.securityDeposit) || 0,
      depositRefundable: req.body.depositRefundable === 'true',
      location: req.body.location,
      district: req.body.district,
      status: req.body.status || 'available',
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'VEHICLE_UPDATED', 'Vehicle', vehicle.id, {
      description: `Updated ${vehicle.model} vehicle`,
      name: vehicle.model,
    });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE vehicle (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  await logAudit(req, 'VEHICLE_DELETED', 'Vehicle', req.params.id, {
    description: `Deleted ${vehicle?.model || req.params.id} vehicle`,
    name: vehicle?.model,
  });
  res.json({ message: 'Vehicle deleted' });
});

module.exports = router;
