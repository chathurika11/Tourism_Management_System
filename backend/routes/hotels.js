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

// GET hotels – with optional district filter and pagination
router.get('/', async (req, res) => {
  try {
    const { district } = req.query;

    if (district) {
      const hotels = await prisma.hotel.findMany({
        where: { district: { equals: district, mode: 'insensitive' } },
        orderBy: { rating: 'desc' }
      });
      return res.json(hotels);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.hotel.count()
    ]);

    res.json({ data: hotels, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single hotel
router.get('/:id', async (req, res) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
  res.json(hotel);
});

// POST create hotel (admin only)
// POST /hotels (admin only)
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    // If a file was uploaded, use its path; otherwise use the provided imageUrl
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const data = {
      name: req.body.name,
      location: req.body.location,
      district: req.body.district,
      pricePerNight: parseFloat(req.body.pricePerNight),
      amenities,
      image: imageUrl,
      checkIn: req.body.checkIn || '2:00 PM',
      checkOut: req.body.checkOut || '12:00 PM',
      freeCancellationHours: parseInt(req.body.freeCancellationHours) || 48,
      breakfastIncluded: req.body.breakfastIncluded === 'true',
      rating: 0
    };
    const hotel = await prisma.hotel.create({ data });
    await logAudit(req, 'HOTEL_CREATED', 'Hotel', hotel.id, {
      description: `Added ${hotel.name} hotel`,
      name: hotel.name,
    });
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /hotels/:id
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const data = {
      name: req.body.name,
      location: req.body.location,
      district: req.body.district,
      pricePerNight: parseFloat(req.body.pricePerNight),
      amenities,
      checkIn: req.body.checkIn || '2:00 PM',
      checkOut: req.body.checkOut || '12:00 PM',
      freeCancellationHours: parseInt(req.body.freeCancellationHours) || 48,
      breakfastIncluded: req.body.breakfastIncluded === 'true',
    };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
    }
    const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'HOTEL_UPDATED', 'Hotel', hotel.id, {
      description: `Updated ${hotel.name} hotel`,
      name: hotel.name,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE hotel (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
  await prisma.hotel.delete({ where: { id: req.params.id } });
  await logAudit(req, 'HOTEL_DELETED', 'Hotel', req.params.id, {
    description: `Deleted ${hotel?.name || req.params.id} hotel`,
    name: hotel?.name,
  });
  res.json({ message: 'Hotel deleted' });
});

module.exports = router;
