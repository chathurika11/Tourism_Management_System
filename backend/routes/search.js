const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search?q=district
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ packages: [], hotels: [], vehicles: [], guides: [] });
    }
    const searchTerm = q.trim();
    // Case-insensitive search using MongoDB regex
    const regex = new RegExp(searchTerm, 'i');

    const [packages, hotels, vehicles, guides] = await Promise.all([
      prisma.tourPackage.findMany({
        where: { district: { $regex: regex } },
        take: 20,
      }),
      prisma.hotel.findMany({
        where: { district: { $regex: regex } },
        take: 20,
      }),
      prisma.vehicle.findMany({
        where: { district: { $regex: regex } },
        take: 20,
      }),
      prisma.guide.findMany({
        where: { district: { $regex: regex } },
        take: 20,
      }),
    ]);

    res.json({ packages, hotels, vehicles, guides });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;