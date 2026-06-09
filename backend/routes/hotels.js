const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const router = express.Router();
const prisma = new PrismaClient();

const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all hotels (public) with pagination and optional filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { district, minPrice, maxPrice } = req.query;
    const where = {};
    if (district) where.district = district;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        select: {
          id: true, name: true, location: true, district: true, pricePerNight: true,
          rating: true, image: true, checkIn: true, checkOut: true,
          freeCancellationHours: true, popular: true, breakfastIncluded: true, amenities: true,
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.hotel.count({ where }),
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

// CREATE hotel (admin only)
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const hotel = await prisma.hotel.create({
      data: {
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
      },
    });
    res.status(201).json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE hotel (admin only)
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const existing = await prisma.hotel.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Hotel not found' });
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : existing.amenities;
    const data = {
      name: req.body.name ?? existing.name,
      location: req.body.location ?? existing.location,
      district: req.body.district ?? existing.district,
      pricePerNight: req.body.pricePerNight ? parseFloat(req.body.pricePerNight) : existing.pricePerNight,
      amenities,
      checkIn: req.body.checkIn ?? existing.checkIn,
      checkOut: req.body.checkOut ?? existing.checkOut,
      freeCancellationHours: req.body.freeCancellationHours ? parseInt(req.body.freeCancellationHours) : existing.freeCancellationHours,
      breakfastIncluded: req.body.breakfastIncluded !== undefined ? req.body.breakfastIncluded === 'true' : existing.breakfastIncluded,
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data });
    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE hotel (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.hotel.delete({ where: { id: req.params.id } });
  res.json({ message: 'Hotel deleted' });
});

module.exports = router;