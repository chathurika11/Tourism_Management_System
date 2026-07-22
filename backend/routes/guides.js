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

// GET guides – with optional district filter and pagination
router.get('/', async (req, res) => {
  try {
    const { district } = req.query;

    if (district) {
      const guides = await prisma.guide.findMany({
        where: {
          OR: [
            { district: { contains: district, mode: 'insensitive' } },
            { location: { contains: district, mode: 'insensitive' } }
          ]
        },
        orderBy: { rating: 'desc' }
      });
      return res.json(guides);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.guide.count()
    ]);

    res.json({ data: guides, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('❌ GET /guides error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single guide
router.get('/:id', async (req, res) => {
  try {
    const guide = await prisma.guide.findUnique({ where: { id: req.params.id } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
  } catch (error) {
    console.error('❌ GET /guide/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create guide
router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');
    const data = {
      name: req.body.name,
      specialty: req.body.specialty,
      district: req.body.district,
      location: req.body.location || '',
      rating: 0,
      reviews: 0,
      language: req.body.language || '',
      experience: req.body.experience || '',
      certification: req.body.certification || '',
      pricePerDay: parseFloat(req.body.pricePerDay),
      popular: req.body.popular === 'true',
      description: req.body.description || '',
      image: imageUrl,
      status: req.body.status || 'available',
      phone: req.body.phone || '',
      email: req.body.email || '',
      whatsapp: req.body.whatsapp === 'true',   // ✅ added contact fields
    };
    const guide = await prisma.guide.create({ data });
    await logAudit(req, 'GUIDE_CREATED', 'Guide', guide.id, {
      description: `Added ${guide.name} guide`,
      name: guide.name,
    });
    res.status(201).json(guide);
  } catch (error) {
    console.error('❌ POST /guides error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update guide
router.put('/:id', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      specialty: req.body.specialty,
      district: req.body.district,
      location: req.body.location || '',
      language: req.body.language || '',
      experience: req.body.experience || '',
      certification: req.body.certification || '',
      pricePerDay: parseFloat(req.body.pricePerDay),
      popular: req.body.popular === 'true',
      description: req.body.description || '',
      status: req.body.status || 'available',
      phone: req.body.phone || '',
      email: req.body.email || '',
      whatsapp: req.body.whatsapp === 'true',   // ✅ updated
    };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
    }
    const guide = await prisma.guide.update({ where: { id: req.params.id }, data });
    await logAudit(req, 'GUIDE_UPDATED', 'Guide', guide.id, {
      description: `Updated ${guide.name} guide`,
      name: guide.name,
    });
    res.json(guide);
  } catch (error) {
    console.error('❌ PUT /guides/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});


// DELETE guide (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const guide = await prisma.guide.findUnique({ where: { id: req.params.id } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });

    // Set guideId to null in referencing TourPackages
    await prisma.tourPackage.updateMany({
      where: { guideId: req.params.id },
      data: { guideId: null }
    });
    // Delete associated feedbacks
    await prisma.guideFeedback.deleteMany({ where: { guideId: req.params.id } });
    await prisma.guide.delete({ where: { id: req.params.id } });
    await logAudit(req, 'GUIDE_DELETED', 'Guide', req.params.id, {
      description: `Deleted ${guide.name} guide`,
      name: guide.name,
    });
    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /guides/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;