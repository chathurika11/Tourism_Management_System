const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const getCategory = (type) => {
  const lowerType = (type || '').toLowerCase();

  if (lowerType.includes('hotel')) return 'hotel';
  if (lowerType.includes('vehicle')) return 'vehicle';
  if (lowerType.includes('guide')) return 'guide';
  if (lowerType.includes('tour')) return 'tour';
  if (lowerType.includes('package')) return 'tour';
  if (lowerType.includes('custom')) return 'tour';

  return 'tour';
};

const checkAdmin = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return null;
  }

  return decoded;
};

const hasService = (booking, service) => {
  if (!booking.destinations) return false;

  const text = JSON.stringify(booking.destinations).toLowerCase();

  if (service === 'hotel') {
    return text.includes('hotel') || text.includes('hotelid') || text.includes('selecthotel');
  }

  if (service === 'vehicle') {
    return text.includes('vehicle') || text.includes('vehicleid') || text.includes('selectvehicle');
  }

  if (service === 'guide') {
    return text.includes('guide') || text.includes('guideid') || text.includes('selectguide');
  }

  return false;
};

const getPackageServices = async (booking) => {
  if (!booking.packageName) return null;

  return await prisma.tourPackage.findFirst({
    where: { name: booking.packageName },
    select: {
      hotelId: true,
      vehicleId: true,
      guideId: true
    }
  });
};

// ---------- Admin Reports ----------
router.get('/reports', async (req, res) => {
  try {
    const admin = checkAdmin(req, res);
    if (!admin) return;

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const typeCounts = {
      hotel: 0,
      vehicle: 0,
      guide: 0,
      tour: 0
    };

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyByType = {};
    months.forEach((m) => {
      monthlyByType[m] = {
        hotel: 0,
        vehicle: 0,
        guide: 0,
        tour: 0
      };
    });

    for (const b of bookings) {
      const category = getCategory(b.type);
      const month = months[new Date(b.bookingDate).getMonth()];

      if (category === 'tour') {
        typeCounts.tour++;
        monthlyByType[month].tour++;

        const pkg = await getPackageServices(b);

        const hasHotel = pkg?.hotelId || hasService(b, 'hotel');
        const hasVehicle = pkg?.vehicleId || hasService(b, 'vehicle');
        const hasGuide = pkg?.guideId || hasService(b, 'guide');

        if (hasHotel) {
          typeCounts.hotel++;
          monthlyByType[month].hotel++;
        }

        if (hasVehicle) {
          typeCounts.vehicle++;
          monthlyByType[month].vehicle++;
        }

        if (hasGuide) {
          typeCounts.guide++;
          monthlyByType[month].guide++;
        }
      } else {
        if (typeCounts[category] !== undefined) {
          typeCounts[category]++;
        }

        if (monthlyByType[month] && monthlyByType[month][category] !== undefined) {
          monthlyByType[month][category]++;
        }
      }
    }

    const total = bookings.length;
    const serviceTotal =
      typeCounts.hotel + typeCounts.vehicle + typeCounts.guide + typeCounts.tour;

    const safeTotal = serviceTotal || 1;

    const typePercentages = {
      hotel: parseFloat(((typeCounts.hotel / safeTotal) * 100).toFixed(1)),
      vehicle: parseFloat(((typeCounts.vehicle / safeTotal) * 100).toFixed(1)),
      guide: parseFloat(((typeCounts.guide / safeTotal) * 100).toFixed(1)),
      tour: parseFloat(((typeCounts.tour / safeTotal) * 100).toFixed(1))
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
  try {
    const admin = checkAdmin(req, res);
    if (!admin) return;

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyCommission = {};
    const monthlyBreakdown = {};

    months.forEach((m) => {
      monthlyCommission[m] = 0;
      monthlyBreakdown[m] = {
        hotel: 0,
        guide: 0,
        vehicle: 0,
        tour: 0
      };
    });

    let totalHotelCommission = 0;
    let totalGuideCommission = 0;
    let totalVehicleCommission = 0;
    let totalTourCommission = 0;

    for (const b of bookings) {
      const amount = b.totalAmount || 0;
      const category = getCategory(b.type);
      const month = months[new Date(b.bookingDate).getMonth()];

      if (category === 'tour') {
        const pkg = await getPackageServices(b);

        const hasHotel = pkg?.hotelId || hasService(b, 'hotel');
        const hasVehicle = pkg?.vehicleId || hasService(b, 'vehicle');
        const hasGuide = pkg?.guideId || hasService(b, 'guide');

        let parts = 1;
        if (hasHotel) parts++;
        if (hasVehicle) parts++;
        if (hasGuide) parts++;

        const partAmount = amount / parts;

        const tourCommission = partAmount * 0.25;
        totalTourCommission += tourCommission;
        monthlyBreakdown[month].tour += tourCommission;
        monthlyCommission[month] += tourCommission;

        if (hasHotel) {
          const hotelCommission = partAmount * 0.25;
          totalHotelCommission += hotelCommission;
          monthlyBreakdown[month].hotel += hotelCommission;
          monthlyCommission[month] += hotelCommission;
        }

        if (hasVehicle) {
          const vehicleCommission = partAmount * 0.15;
          totalVehicleCommission += vehicleCommission;
          monthlyBreakdown[month].vehicle += vehicleCommission;
          monthlyCommission[month] += vehicleCommission;
        }

        if (hasGuide) {
          const guideCommission = partAmount * 0.25;
          totalGuideCommission += guideCommission;
          monthlyBreakdown[month].guide += guideCommission;
          monthlyCommission[month] += guideCommission;
        }
      } else {
        let commission = 0;

        if (category === 'hotel') {
          commission = amount * 0.25;
          totalHotelCommission += commission;
          monthlyBreakdown[month].hotel += commission;
        } else if (category === 'guide') {
          commission = amount * 0.25;
          totalGuideCommission += commission;
          monthlyBreakdown[month].guide += commission;
        } else if (category === 'vehicle') {
          commission = amount * 0.15;
          totalVehicleCommission += commission;
          monthlyBreakdown[month].vehicle += commission;
        }

        monthlyCommission[month] += commission;
      }
    }

    const totalCommission =
      totalHotelCommission +
      totalGuideCommission +
      totalVehicleCommission +
      totalTourCommission;

    res.json({
      totalCommission: Math.round(totalCommission),
      totalHotelCommission: Math.round(totalHotelCommission),
      totalGuideCommission: Math.round(totalGuideCommission),
      totalVehicleCommission: Math.round(totalVehicleCommission),
      totalTourCommission: Math.round(totalTourCommission),
      monthlyCommission: Object.fromEntries(
        Object.entries(monthlyCommission).map(([k, v]) => [k, Math.round(v)])
      ),
      monthlyBreakdown: Object.fromEntries(
        Object.entries(monthlyBreakdown).map(([k, v]) => [
          k,
          {
            hotel: Math.round(v.hotel),
            guide: Math.round(v.guide),
            vehicle: Math.round(v.vehicle),
            tour: Math.round(v.tour)
          }
        ])
      ),
      year
    });
  } catch (err) {
    console.error('Commission error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;