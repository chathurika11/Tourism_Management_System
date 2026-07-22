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
      // Search across old fields and new arrays
      const vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { district: { contains: district, mode: 'insensitive' } },
            { location: { contains: district, mode: 'insensitive' } },
            { districts: { has: district } }, // exact match in array
            { locations: { has: district } },
            // For partial matches inside arrays (MongoDB specific)
            // If you need partial matching, use $regex via raw query or use Prisma's `$elemMatch` with `contains`
            // Since Prisma doesn't support $elemMatch with contains directly on arrays of strings,
            // we'll rely on the exact match for now.
          ]
        },
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
    console.error('❌ GET /vehicles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    console.error('❌ GET /vehicle/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create vehicle (admin only) – supports locations and districts arrays
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');
    const pickupLocations = req.body.pickupLocations ? req.body.pickupLocations.split(',').map(s => s.trim()) : [];
    const includedFeatures = req.body.includedFeatures ? req.body.includedFeatures.split(',').map(s => s.trim()) : [];
    
    // Parse locations and districts arrays from request
    let locations = [];
    let districts = [];
    if (req.body.locations) {
      try { locations = JSON.parse(req.body.locations); } catch (e) { locations = []; }
    } else if (req.body.locationsStr) {
      locations = req.body.locationsStr.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (req.body.districts) {
      try { districts = JSON.parse(req.body.districts); } catch (e) { districts = []; }
    } else if (req.body.districtsStr) {
      districts = req.body.districtsStr.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Fallback to single location/district if arrays are empty
    if (locations.length === 0 && req.body.location) locations = [req.body.location];
    if (districts.length === 0 && req.body.district) districts = [req.body.district];

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
      location: req.body.location || (locations.length ? locations[0] : ''),
      district: req.body.district || (districts.length ? districts[0] : ''),
      locations: locations,
      districts: districts,
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
    console.error('❌ POST /vehicles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update vehicle (admin only) – supports arrays
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const pickupLocations = req.body.pickupLocations ? req.body.pickupLocations.split(',').map(s => s.trim()) : [];
    const includedFeatures = req.body.includedFeatures ? req.body.includedFeatures.split(',').map(s => s.trim()) : [];
    
    let locations = [];
    let districts = [];
    if (req.body.locations) {
      try { locations = JSON.parse(req.body.locations); } catch (e) { locations = []; }
    } else if (req.body.locationsStr) {
      locations = req.body.locationsStr.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (req.body.districts) {
      try { districts = JSON.parse(req.body.districts); } catch (e) { districts = []; }
    } else if (req.body.districtsStr) {
      districts = req.body.districtsStr.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Fallback to single location/district if arrays are empty
    if (locations.length === 0 && req.body.location) locations = [req.body.location];
    if (districts.length === 0 && req.body.district) districts = [req.body.district];

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
      location: req.body.location || (locations.length ? locations[0] : ''),
      district: req.body.district || (districts.length ? districts[0] : ''),
      locations: locations,
      districts: districts,
      status: req.body.status || 'available',
    };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
    }
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'VEHICLE_UPDATED', 'Vehicle', vehicle.id, {
      description: `Updated ${vehicle.model} vehicle`,
      name: vehicle.model,
    });
    res.json(vehicle);
  } catch (error) {
    console.error('❌ PUT /vehicles/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE vehicle (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    await prisma.tourPackage.updateMany({
      where: { vehicleId: req.params.id },
      data: { vehicleId: null }
    });

    await prisma.vehicleFeedback.deleteMany({ where: { vehicleId: req.params.id } });

    await prisma.vehicle.delete({ where: { id: req.params.id } });
    await logAudit(req, 'VEHICLE_DELETED', 'Vehicle', req.params.id, {
      description: `Deleted ${vehicle.model} vehicle`,
      name: vehicle.model,
    });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /vehicles/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;