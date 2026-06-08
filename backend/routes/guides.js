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
  const [guides, total] = await Promise.all([
    prisma.guide.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.guide.count()
  ]);
  res.json({ data: guides, total, page, totalPages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const guide = await prisma.guide.findUnique({ where: { id: req.params.id } });
  if (!guide) return res.status(404).json({ error: 'Guide not found' });
  res.json(guide);
});

router.post('/', adminOnly, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
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
      image: imageUrl
    };
    const guide = await prisma.guide.create({ data });
    res.status(201).json(guide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

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
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const guide = await prisma.guide.update({ where: { id: req.params.id }, data });
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.guide.delete({ where: { id: req.params.id } });
  res.json({ message: 'Guide deleted' });
});

module.exports = router;