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

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.hotel.count()
  ]);
  res.json({ data: hotels, total, page, totalPages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
  res.json(hotel);
});

router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const hotelData = {
      ...req.body,
      image: imageUrl,
      pricePerNight: parseFloat(req.body.pricePerNight),
      freeCancellationHours: parseInt(req.body.freeCancellationHours),
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      breakfastIncluded: req.body.breakfastIncluded === 'true'
    };
    const hotel = await prisma.hotel.create({ data: hotelData });
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    if (req.body.pricePerNight) updateData.pricePerNight = parseFloat(req.body.pricePerNight);
    if (req.body.freeCancellationHours) updateData.freeCancellationHours = parseInt(req.body.freeCancellationHours);
    if (req.body.amenities) updateData.amenities = JSON.parse(req.body.amenities);
    if (req.body.breakfastIncluded) updateData.breakfastIncluded = req.body.breakfastIncluded === 'true';
    const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data: updateData });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.hotel.delete({ where: { id: req.params.id } });
  res.json({ message: 'Hotel deleted' });
});

module.exports = router;