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

// GET all tour packages (public)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const [packages, total] = await Promise.all([
    prisma.tourPackage.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { hotel: true, vehicle: true, guide: true }
    }),
    prisma.tourPackage.count()
  ]);
  res.json({ data: packages, total, page, totalPages: Math.ceil(total / limit) });
});

// GET single tour package
router.get('/:id', async (req, res) => {
  const pkg = await prisma.tourPackage.findUnique({
    where: { id: req.params.id },
    include: { hotel: true, vehicle: true, guide: true }
  });
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  res.json(pkg);
});

// GET hotels by district (for dropdown)
router.get('/reference/hotels/:district', adminOnly, async (req, res) => {
  const hotels = await prisma.hotel.findMany({
    where: { district: req.params.district },
    select: { id: true, name: true, district: true }
  });
  res.json(hotels);
});

// GET vehicles by district
router.get('/reference/vehicles/:district', adminOnly, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { district: req.params.district },
    select: { id: true, model: true, type: true, district: true }
  });
  res.json(vehicles);
});

// GET guides by district
router.get('/reference/guides/:district', adminOnly, async (req, res) => {
  const guides = await prisma.guide.findMany({
    where: { district: req.params.district },
    select: { id: true, name: true, specialty: true, district: true }
  });
  res.json(guides);
});

// CREATE tour package (admin only)
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const inclusionsArray = req.body.inclusions ? req.body.inclusions.split(',').map(s => s.trim()) : [];
    const data = {
      name: req.body.name,
      district: req.body.district,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      maxPeople: parseInt(req.body.maxPeople),
      bestSeason: req.body.bestSeason,
      mealPlan: req.body.mealPlan,
      inclusions: inclusionsArray,
      price: parseFloat(req.body.price),
      popular: req.body.popular === 'true',
      image: imageUrl,
      hotelId: req.body.hotelId || null,
      vehicleId: req.body.vehicleId || null,
      guideId: req.body.guideId || null,
    };
    const pkg = await prisma.tourPackage.create({ data });
    res.status(201).json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE tour package
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const inclusionsArray = req.body.inclusions ? req.body.inclusions.split(',').map(s => s.trim()) : [];
    const data = {
      name: req.body.name,
      district: req.body.district,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      maxPeople: parseInt(req.body.maxPeople),
      bestSeason: req.body.bestSeason,
      mealPlan: req.body.mealPlan,
      inclusions: inclusionsArray,
      price: parseFloat(req.body.price),
      popular: req.body.popular === 'true',
      hotelId: req.body.hotelId || null,
      vehicleId: req.body.vehicleId || null,
      guideId: req.body.guideId || null,
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const pkg = await prisma.tourPackage.update({
      where: { id: req.params.id },
      data
    });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tour package
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.tourPackage.delete({ where: { id: req.params.id } });
  res.json({ message: 'Package deleted' });
});

module.exports = router;