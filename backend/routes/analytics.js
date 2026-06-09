const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Helper to get user role from token
const getRole = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role;
  } catch {
    return null;
  }
};

// Admin only middleware
const adminOnly = async (req, res, next) => {
  const role = getRole(req);
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

// GET /api/analytics/commission-summary
router.get('/commission-summary', adminOnly, async (req, res) => {
  try {
    const allConfirmedBookings = await prisma.booking.findMany({
      where: { status: 'confirmed' },
      select: { totalAmount: true, startDate: true, confirmedAt: true }
    });

    let totalCommission = 0;
    const monthlyCommission = {};

    for (const booking of allConfirmedBookings) {
      // Assume 22% commission for demo (adjust as needed)
      const commission = booking.totalAmount * 0.22;
      totalCommission += commission;

      const month = booking.confirmedAt
        ? booking.confirmedAt.toLocaleString('default', { month: 'short' })
        : new Date(booking.startDate).toLocaleString('default', { month: 'short' });
      monthlyCommission[month] = (monthlyCommission[month] || 0) + commission;
    }

    res.json({ totalCommission, monthlyCommission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch commission summary' });
  }
});

// GET /api/analytics/reports – counts of booked hotels, vehicles, guides
router.get('/reports', adminOnly, async (req, res) => {
  try {
    // This is a simplified aggregation. For actual counts, you would need to store
    // which hotel/vehicle/guide was booked. Here we assume bookings have a `destinations` JSON field
    // that contains the selected items. For demo, we return counts from all bookings.

    const bookings = await prisma.booking.findMany({
      select: { destinations: true }
    });

    let hotelCounts = {};
    let vehicleCounts = {};
    let guideCounts = {};

    bookings.forEach(booking => {
      if (booking.destinations && Array.isArray(booking.destinations)) {
        booking.destinations.forEach(dest => {
          if (dest.hotel && dest.hotel.name) {
            hotelCounts[dest.hotel.name] = (hotelCounts[dest.hotel.name] || 0) + 1;
          }
          if (dest.vehicle && dest.vehicle.model) {
            vehicleCounts[dest.vehicle.model] = (vehicleCounts[dest.vehicle.model] || 0) + 1;
          }
          if (dest.guide && dest.guide.name) {
            guideCounts[dest.guide.name] = (guideCounts[dest.guide.name] || 0) + 1;
          }
        });
      }
    });

    res.json({ hotelCounts, vehicleCounts, guideCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;