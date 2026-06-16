const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
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

// GET all districts with places
router.get('/', async (req, res) => {
  try {
    const districts = await prisma.district.findMany({
      include: { places: true },
      orderBy: { name: 'asc' }
    });
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE district
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const district = await prisma.district.create({ data: { name } });
    await logAudit(req, 'DISTRICT_CREATED', 'District', district.id, {
      description: `Added destination ${district.name}`,
      name: district.name,
    });
    res.status(201).json(district);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE district
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const district = await prisma.district.update({
      where: { id: req.params.id },
      data: { name }
    });
    await logAudit(req, 'DISTRICT_UPDATED', 'District', district.id, {
      description: `Updated destination ${district.name}`,
      name: district.name,
    });
    res.json(district);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE district (cascade places)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const district = await prisma.district.findUnique({ where: { id: req.params.id } });
    await prisma.district.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DISTRICT_DELETED', 'District', req.params.id, {
      description: `Deleted destination ${district?.name || req.params.id}`,
      name: district?.name,
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE place
router.post('/places', adminOnly, async (req, res) => {
  try {
    const { name, coordinates, districtId } = req.body;
    if (!name || !districtId) return res.status(400).json({ error: 'Missing fields' });
    const place = await prisma.place.create({
      data: { name, coordinates: coordinates || null, districtId }
    });
    await logAudit(req, 'PLACE_CREATED', 'Place', place.id, {
      description: `Added place ${place.name}`,
      name: place.name,
    });
    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE place
router.put('/places/:id', adminOnly, async (req, res) => {
  try {
    const { name, coordinates } = req.body;
    const place = await prisma.place.update({
      where: { id: req.params.id },
      data: { name, coordinates: coordinates || null }
    });
    await logAudit(req, 'PLACE_UPDATED', 'Place', place.id, {
      description: `Updated place ${place.name}`,
      name: place.name,
    });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE place
router.delete('/places/:id', adminOnly, async (req, res) => {
  try {
    const place = await prisma.place.findUnique({ where: { id: req.params.id } });
    await prisma.place.delete({ where: { id: req.params.id } });
    await logAudit(req, 'PLACE_DELETED', 'Place', req.params.id, {
      description: `Deleted place ${place?.name || req.params.id}`,
      name: place?.name,
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
