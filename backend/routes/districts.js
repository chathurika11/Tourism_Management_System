const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Admin middleware
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

// ---------- PUBLIC: get all districts with places ----------
router.get('/', async (req, res) => {
  const districts = await prisma.district.findMany({
    include: { places: true },
    orderBy: { name: 'asc' }
  });
  res.json(districts);
});

// ---------- ADMIN: create district ----------
router.post('/', adminOnly, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const district = await prisma.district.create({ data: { name } });
  res.status(201).json(district);
});

// ---------- ADMIN: update district ----------
router.put('/:id', adminOnly, async (req, res) => {
  const { name } = req.body;
  const district = await prisma.district.update({
    where: { id: req.params.id },
    data: { name }
  });
  res.json(district);
});

// ---------- ADMIN: delete district (cascades places) ----------
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.district.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

// ---------- ADMIN: create place ----------
router.post('/places', adminOnly, async (req, res) => {
  const { name, coordinates, districtId } = req.body;
  if (!name || !districtId) return res.status(400).json({ error: 'Missing fields' });
  const place = await prisma.place.create({
    data: { name, coordinates: coordinates || null, districtId }
  });
  res.status(201).json(place);
});

// ---------- ADMIN: update place ----------
router.put('/places/:id', adminOnly, async (req, res) => {
  const { name, coordinates } = req.body;
  const place = await prisma.place.update({
    where: { id: req.params.id },
    data: { name, coordinates }
  });
  res.json(place);
});

// ---------- ADMIN: delete place ----------
router.delete('/places/:id', adminOnly, async (req, res) => {
  await prisma.place.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

module.exports = router;