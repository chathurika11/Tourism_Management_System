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

// ---------- PUBLIC: get tour packages with pagination ----------
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { district, popular } = req.query;
    const where = {};
    if (district) where.district = district;
    if (popular !== undefined) where.popular = popular === 'true';

    const [packages, total] = await Promise.all([
      prisma.tourPackage.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          district: true,
          maxPeople: true,
          bestSeason: true,
          price: true,
          rating: true,
          image: true,
          popular: true,
          mealPlan: true,
          inclusions: true,
          // include hotel/vehicle/guide only if needed for display
          hotel: { select: { id: true, name: true } },
          vehicle: { select: { id: true, model: true, type: true } },
          guide: { select: { id: true, name: true, specialty: true } },
        },
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tourPackage.count({ where }),
    ]);
    res.json({ data: packages, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single package (full details)
router.get('/:id', async (req, res) => {
  const pkg = await prisma.tourPackage.findUnique({
    where: { id: req.params.id },
    include: { hotel: true, vehicle: true, guide: true }
  });
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  res.json(pkg);
});

// Reference endpoints (unchanged but ensure they use indexes)
router.get('/reference/hotels/:district', adminOnly, async (req, res) => {
  const hotels = await prisma.hotel.findMany({
    where: {
      OR: [
        { district: { contains: req.params.district, mode: 'insensitive' } },
        { location: { contains: req.params.district, mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, district: true },
    orderBy: { name: 'asc' }
  });
  res.json(hotels);
});

router.get('/reference/vehicles/:district', adminOnly, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { district: { contains: req.params.district, mode: 'insensitive' } },
        { location: { contains: req.params.district, mode: 'insensitive' } }
      ]
    },
    select: { id: true, model: true, type: true, district: true },
    orderBy: { model: 'asc' }
  });
  res.json(vehicles);
});

router.get('/reference/guides/:district', adminOnly, async (req, res) => {
  const guides = await prisma.guide.findMany({
    where: {
      OR: [
        { district: { contains: req.params.district, mode: 'insensitive' } },
        { location: { contains: req.params.district, mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, specialty: true, district: true },
    orderBy: { name: 'asc' }
  });
  res.json(guides);
});

// ---------- ADMIN CRUD ----------
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const mealPlan = req.body.mealPlan ? JSON.parse(req.body.mealPlan) : [];
    const inclusions = req.body.inclusions ? JSON.parse(req.body.inclusions) : [];
    const hotelIds = req.body.hotelIds ? JSON.parse(req.body.hotelIds) : [];
    const vehicleIds = req.body.vehicleIds ? JSON.parse(req.body.vehicleIds) : [];
    const guideIds = req.body.guideIds ? JSON.parse(req.body.guideIds) : [];
     
    console.log(req.body);

    const selectedDistrict =
  req.body.district ||
  req.body.location ||
  (req.body.destinations ? JSON.parse(req.body.destinations)?.[0]?.district : null);

const data = {
  name: req.body.name,
  description: req.body.description,
  duration: req.body.duration,
  district: selectedDistrict || 'Kandy',
  maxPeople: req.body.maxPeople || "10",
  bestSeason: req.body.bestSeason || null,
  location: selectedDistrict || 'Kandy',
  price: parseFloat(req.body.price),
  popular: req.body.popular === 'true',
  image: imageUrl,
  mealPlan: mealPlan.join(', '),
  inclusions: inclusions,
  hotelId: hotelIds[0] || null,
  vehicleId: vehicleIds[0] || null,
  guideId: guideIds[0] || null,
};
    const pkg = await prisma.tourPackage.create({ data });
    await logAudit(req, 'PACKAGE_CREATED', 'TourPackage', pkg.id, {
      description: `Added ${pkg.name} tour package`,
      name: pkg.name,
    });
    res.status(201).json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const existing = await prisma.tourPackage.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Package not found' });
    const mealPlan = req.body.mealPlan ? JSON.parse(req.body.mealPlan) : (existing.mealPlan ? existing.mealPlan.split(', ') : []);
    const inclusions = req.body.inclusions ? JSON.parse(req.body.inclusions) : existing.inclusions;
    const hotelIds = req.body.hotelIds ? JSON.parse(req.body.hotelIds) : [];
    const vehicleIds = req.body.vehicleIds ? JSON.parse(req.body.vehicleIds) : [];
    const guideIds = req.body.guideIds ? JSON.parse(req.body.guideIds) : [];

    const data = {
      name: req.body.name ?? existing.name,
      description: req.body.description ?? existing.description,
      duration: req.body.duration ?? existing.duration,
      district: req.body.district ?? existing.district,
      maxPeople: req.body.maxPeople ?? existing.maxPeople,
      bestSeason: req.body.bestSeason ?? existing.bestSeason,
      location: req.body.district ?? existing.location,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
      popular: req.body.popular !== undefined ? req.body.popular === 'true' : existing.popular,
      mealPlan: Array.isArray(mealPlan) ? mealPlan.join(', ') : mealPlan,
      inclusions: Array.isArray(inclusions) ? inclusions : existing.inclusions,
      hotelId: hotelIds[0] || null,
      vehicleId: vehicleIds[0] || null,
      guideId: guideIds[0] || null,
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const pkg = await prisma.tourPackage.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'PACKAGE_UPDATED', 'TourPackage', pkg.id, {
      description: `Updated ${pkg.name} tour package`,
      name: pkg.name,
    });
    res.json(pkg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const pkg = await prisma.tourPackage.findUnique({ where: { id: req.params.id } });
    if (!pkg) {
      return res.status(404).json({ error: 'Tour package not found' });
    }

    // Delete associated feedbacks first to prevent foreign key constraint failures
    await prisma.tourFeedback.deleteMany({ where: { tourId: req.params.id } });

    // Delete the tour package
    await prisma.tourPackage.delete({ where: { id: req.params.id } });

    await logAudit(req, 'PACKAGE_DELETED', 'TourPackage', req.params.id, {
      description: `Deleted ${pkg.name} tour package`,
      name: pkg.name,
    });

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /tour-packages/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
