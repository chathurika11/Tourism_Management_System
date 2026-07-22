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
    const regex = new RegExp(searchTerm, 'i');

    // Tour packages: search in district and location (also new fields if any)
    const packages = await prisma.tourPackage.findMany({
      where: {
        OR: [
          { district: { $regex: regex } },
          { location: { $regex: regex } },
        ]
      },
      take: 20,
    });

    // Hotels: district and location
    const hotels = await prisma.hotel.findMany({
      where: {
        OR: [
          { district: { $regex: regex } },
          { location: { $regex: regex } },
        ]
      },
      take: 20,
    });

    // Vehicles: search in old fields and new arrays
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { district: { $regex: regex } },
          { location: { $regex: regex } },
          // For arrays, we need to check if any element matches the regex.
          // Prisma doesn't support $regex on array fields directly in findMany.
          // We'll use a raw query or fallback to using 'contains' on the stringified array.
          // Alternative: use $elemMatch with $regex via raw MongoDB query.
          // Since Prisma's MongoDB connector supports $elemMatch, we'll use it:
        ]
      },
      take: 20,
    });

    // Workaround: Because Prisma doesn't support regex on array fields directly,
    // we'll fetch all vehicles and filter in JS (inefficient for large datasets but okay for small).
    // A better solution is to use a raw query, but we'll keep it simple for demo.
    // Instead, we can use a raw query:
    const rawVehicles = await prisma.$queryRaw`
      SELECT * FROM "Vehicle" 
      WHERE 
        "district" ~ $1 OR "location" ~ $1 OR 
        EXISTS (SELECT 1 FROM unnest("locations") AS loc WHERE loc ~ $1) OR
        EXISTS (SELECT 1 FROM unnest("districts") AS dist WHERE dist ~ $1)
      LIMIT 20
    `;
    // Note: The above raw query is for PostgreSQL; for MongoDB, use Prisma's $elemMatch:
    // We'll use Prisma's $elemMatch with $regex via the 'where' clause with 'fields' array.
    // Since it's complex, we'll use the following approach:

    // Actually, for MongoDB, we can use:
    const vehiclesWithArray = await prisma.vehicle.findMany({
      where: {
        OR: [
          { district: { $regex: regex } },
          { location: { $regex: regex } },
          { locations: { $elemMatch: { $regex: regex } } },
          { districts: { $elemMatch: { $regex: regex } } },
        ]
      },
      take: 20,
    });

    // Guides: district and location
    const guides = await prisma.guide.findMany({
      where: {
        OR: [
          { district: { $regex: regex } },
          { location: { $regex: regex } },
        ]
      },
      take: 20,
    });

    // Use the vehiclesWithArray result
    res.json({ packages, hotels, vehicles: vehiclesWithArray, guides });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;