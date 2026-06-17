const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Helper to map booking type to a category
const getCategory = (type) => {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('tour')) return 'tour';
  if (lowerType.includes('hotel')) return 'hotel';
  if (lowerType.includes('vehicle')) return 'vehicle';
  if (lowerType.includes('guide')) return 'guide';
  // Fallback – check if it's a custom tour with destinations
  return 'tour'; // default to tour
};

// ---------- Admin Reports ----------
router.get('/reports', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Only confirmed/completed & paid bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'completed'] },
        paymentStatus: 'paid',
        OR: [
          { confirmedAt: { gte: startOfYear, lte: endOfYear } },
          { AND: [{ confirmedAt: null }, { bookingDate: { gte: startOfYear, lte: endOfYear } }] }
        ]
      }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const typeCounts = { hotel: 0, vehicle: 0, guide: 0, tour: 0 };
    const monthlyByType = {};
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    months.forEach(m => { monthlyByType[m] = { hotel: 0, vehicle: 0, guide: 0, tour: 0 }; });

    bookings.forEach(b => {
      const category = getCategory(b.type);
      const month = months[new Date(b.bookingDate).getMonth()];
      if (typeCounts[category] !== undefined) typeCounts[category]++;
      if (monthlyByType[month] && monthlyByType[month][category] !== undefined) {
        monthlyByType[month][category]++;
      }
    });

    const total = bookings.length || 1;
    const typePercentages = {
      hotel: parseFloat(((typeCounts.hotel / total) * 100).toFixed(1)),
      vehicle: parseFloat(((typeCounts.vehicle / total) * 100).toFixed(1)),
      guide: parseFloat(((typeCounts.guide / total) * 100).toFixed(1)),
      tour: parseFloat(((typeCounts.tour / total) * 100).toFixed(1)),
    };

    res.json({
      typeCounts,
      typePercentages,
      monthlyByType,
      total,
      totalRevenue,
      year
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Admin Commission Summary ----------
router.get('/commission-summary', async (req, res) => {
  // ... (same as before, uses the same bookings query)
  // We also need to use getCategory() for commission rates
  // Let's keep the commission logic as before (based on type)
  // We'll also map type to category for consistency.
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['confirmed', 'completed'] },
        paymentStatus: 'paid',
        OR: [
          { confirmedAt: { gte: startOfYear, lte: endOfYear } },
          { AND: [{ confirmedAt: null }, { bookingDate: { gte: startOfYear, lte: endOfYear } }] }
        ]
      }
    });

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyCommission = {};
    const monthlyBreakdown = {};
    months.forEach(m => {
      monthlyCommission[m] = 0;
      monthlyBreakdown[m] = { hotel: 0, guide: 0, vehicle: 0 };
    });

    let totalHotelCommission = 0;
    let totalGuideCommission = 0;
    let totalVehicleCommission = 0;

    bookings.forEach(b => {
      const amount = b.totalAmount || 0;
      const category = getCategory(b.type);
      const month = months[new Date(b.bookingDate).getMonth()];
      let commission = 0;
      if (category === 'hotel') {
        commission = amount * 0.25;
        totalHotelCommission += commission;
        monthlyBreakdown[month].hotel += commission;
      } else if (category === 'guide' || category === 'tour') {
        commission = amount * 0.25;
        totalGuideCommission += commission;
        monthlyBreakdown[month].guide += commission;
      } else if (category === 'vehicle') {
        commission = amount * 0.15;
        totalVehicleCommission += commission;
        monthlyBreakdown[month].vehicle += commission;
      }
      monthlyCommission[month] += commission;
    });

    const totalCommission = totalHotelCommission + totalGuideCommission + totalVehicleCommission;

    res.json({
      totalCommission: Math.round(totalCommission),
      totalHotelCommission: Math.round(totalHotelCommission),
      totalGuideCommission: Math.round(totalGuideCommission),
      totalVehicleCommission: Math.round(totalVehicleCommission),
      monthlyCommission: Object.fromEntries(
        Object.entries(monthlyCommission).map(([k, v]) => [k, Math.round(v)])
      ),
      monthlyBreakdown: Object.fromEntries(
        Object.entries(monthlyBreakdown).map(([k, v]) => [
          k,
          {
            hotel: Math.round(v.hotel),
            guide: Math.round(v.guide),
            vehicle: Math.round(v.vehicle)
          }
        ])
      ),
      year,
    });
  } catch (err) {
    console.error('Commission error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;