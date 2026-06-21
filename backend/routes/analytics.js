const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// ---- Helper functions ----
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

// Extract name from destination object with fallback
const extractName = (dest, type) => {
  if (!dest) return null;
  if (type === 'hotel') {
    return dest.hotelName || dest.hotel?.name || dest.selectedHotel?.name ||
           dest.hotel?.hotelName || dest.selectedHotel?.hotelName ||
           dest.hotelTitle || dest.hotelId;
  }
  if (type === 'vehicle') {
    return dest.vehicle?.model || dest.vehicle?.type || dest.vehicleName ||
           dest.vehicle?.name || dest.vehicle?.vehicleName ||
           dest.selectedVehicle?.name || dest.selectedVehicle?.vehicleName ||
           dest.vehicleId;
  }
  if (type === 'guide') {
    return dest.guideName || dest.guide?.name || dest.selectedGuide?.name ||
           dest.guide?.fullName || dest.selectedGuide?.fullName ||
           dest.guideId;
  }
  return null;
};

// Check if a booking includes a service (for splitting commission)
const hasService = (booking, service) => {
  if (!booking.destinations) return false;
  const text = JSON.stringify(booking.destinations).toLowerCase();
  if (service === 'hotel') {
    return text.includes('hotel') || text.includes('hotelid') || text.includes('hotelname');
  }
  if (service === 'vehicle') {
    return text.includes('vehicle') || text.includes('vehicleid') || text.includes('vehiclename') || text.includes('model');
  }
  if (service === 'guide') {
    return text.includes('guide') || text.includes('guideid') || text.includes('guidename');
  }
  return false;
};

// Get package services (hotelId, vehicleId, guideId) from package name
const getPackageServices = async (booking) => {
  try {
    if (!booking.packageName) return null;
    return await prisma.tourPackage.findFirst({
      where: { name: { equals: booking.packageName, mode: 'insensitive' } },
      select: { hotelId: true, vehicleId: true, guideId: true }
    });
  } catch {
    return null;
  }
};

// ---- Middleware ----
const checkAdmin = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Admin only' });
      return null;
    }
    return decoded;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
};

// ---- GET /reports ----
router.get('/reports', async (req, res) => {
  try {
    const admin = checkAdmin(req, res);
    if (!admin) return;

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        bookingDate: { gte: startOfYear, lte: endOfYear }
      }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const typeCounts = { hotel: 0, vehicle: 0, guide: 0, tour: 0 };
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyByType = {};
    months.forEach(m => {
      monthlyByType[m] = { hotel: 0, vehicle: 0, guide: 0, tour: 0 };
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

        if (hasHotel) { typeCounts.hotel++; monthlyByType[month].hotel++; }
        if (hasVehicle) { typeCounts.vehicle++; monthlyByType[month].vehicle++; }
        if (hasGuide) { typeCounts.guide++; monthlyByType[month].guide++; }
      } else {
        if (typeCounts[category] !== undefined) typeCounts[category]++;
        if (monthlyByType[month] && monthlyByType[month][category] !== undefined) {
          monthlyByType[month][category]++;
        }
      }
    }

    const total = bookings.length;
    const serviceTotal = typeCounts.hotel + typeCounts.vehicle + typeCounts.guide + typeCounts.tour || 1;
    const typePercentages = {
      hotel: parseFloat(((typeCounts.hotel / serviceTotal) * 100).toFixed(1)),
      vehicle: parseFloat(((typeCounts.vehicle / serviceTotal) * 100).toFixed(1)),
      guide: parseFloat(((typeCounts.guide / serviceTotal) * 100).toFixed(1)),
      tour: parseFloat(((typeCounts.tour / serviceTotal) * 100).toFixed(1))
    };

    res.json({ typeCounts, typePercentages, monthlyByType, total, totalRevenue, year });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---- GET /commission-summary ----
router.get('/commission-summary', async (req, res) => {
  try {
    const admin = checkAdmin(req, res);
    if (!admin) return;

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        bookingDate: { gte: startOfYear, lte: endOfYear }
      }
    });

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyCommission = {};
    const monthlyBreakdown = {};
    months.forEach(m => {
      monthlyCommission[m] = 0;
      monthlyBreakdown[m] = { hotel: 0, guide: 0, vehicle: 0, tour: 0 };
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

    const totalCommission = totalHotelCommission + totalGuideCommission + totalVehicleCommission + totalTourCommission;

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

// ---- GET /most-booked-items (item-level commission) ----
router.get('/most-booked-items', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        bookingDate: { gte: startOfYear, lte: endOfYear }
      }
    });

    // Aggregators for item-level commission
    const hotelCommission = {};
    const vehicleCommission = {};
    const guideCommission = {};
    const packageCommission = {};

    // Also track counts for "Most Booked" charts
    const hotelCounts = {};
    const vehicleCounts = {};
    const guideCounts = {};
    const packageCounts = {};

    const addCount = (obj, name) => {
      if (!name) return;
      const key = String(name).trim();
      obj[key] = (obj[key] || 0) + 1;
    };

    const addMoney = (obj, name, amount) => {
      if (!name) return;
      const key = String(name).trim();
      obj[key] = (obj[key] || 0) + amount;
    };

    // Helper to extract name from a destination
    const getItemName = (dest, type) => {
      if (!dest) return null;
      if (type === 'hotel') {
        return dest.hotelName || dest.hotel?.name || dest.selectedHotel?.name ||
               dest.hotel?.hotelName || dest.selectedHotel?.hotelName ||
               dest.hotelTitle || dest.hotelId;
      }
      if (type === 'vehicle') {
        return dest.vehicle?.model || dest.vehicle?.type || dest.vehicleName ||
               dest.vehicle?.name || dest.vehicle?.vehicleName ||
               dest.selectedVehicle?.name || dest.selectedVehicle?.vehicleName ||
               dest.vehicleId;
      }
      if (type === 'guide') {
        return dest.guideName || dest.guide?.name || dest.selectedGuide?.name ||
               dest.guide?.fullName || dest.selectedGuide?.fullName ||
               dest.guideId;
      }
      return null;
    };

    for (const b of bookings) {
      const amount = b.totalAmount || 0;

      // ---- Package bookings ----
      if (b.packageName) {
        const pkgName = b.packageName.trim();
        addCount(packageCounts, pkgName);
        addMoney(packageCommission, pkgName, amount * 0.25);
      }

      // ---- Custom tour destinations ----
      const destinations = b.destinations;
      if (destinations) {
        const data = Array.isArray(destinations) ? destinations : [destinations];
        for (const d of data) {
          if (!d) continue;

          // Determine which services are present in this destination
          const hasHotel = d.hotel || d.hotelId || d.hotelName || d.selectedHotel;
          const hasVehicle = d.vehicle || d.vehicleId || d.vehicleName || d.selectedVehicle;
          const hasGuide = d.guide || d.guideId || d.guideName || d.selectedGuide;

          // Count services for the "Most Booked" charts
          const hotelName = getItemName(d, 'hotel');
          const vehicleName = getItemName(d, 'vehicle');
          const guideName = getItemName(d, 'guide');

          addCount(hotelCounts, hotelName);
          addCount(vehicleCounts, vehicleName);
          addCount(guideCounts, guideName);

          // For commission, split the booking amount among the services present
          let parts = 1; // at least the "tour" itself
          if (hasHotel) parts++;
          if (hasVehicle) parts++;
          if (hasGuide) parts++;

          const partAmount = amount / parts;

          // Always add tour commission (25% of part)
          // But we don't track per-item tour commission here; we already track package commissions.
          // For custom tours, we attribute commission to the individual services.

          if (hasHotel && hotelName) {
            addMoney(hotelCommission, hotelName, partAmount * 0.25);
          }
          if (hasVehicle && vehicleName) {
            addMoney(vehicleCommission, vehicleName, partAmount * 0.15);
          }
          if (hasGuide && guideName) {
            addMoney(guideCommission, guideName, partAmount * 0.25);
          }
        }
      }
    }

    // Format helper
    const format = (obj) =>
      Object.entries(obj)
        .map(([name, value]) => ({ name, count: value }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const formatMoney = (obj) =>
      Object.entries(obj)
        .map(([name, amount]) => ({ name, amount: Math.round(amount) }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    res.json({
      hotels: format(hotelCounts),
      vehicles: format(vehicleCounts),
      guides: format(guideCounts),
      packages: format(packageCounts),

      hotelCommissions: formatMoney(hotelCommission),
      vehicleCommissions: formatMoney(vehicleCommission),
      guideCommissions: formatMoney(guideCommission),
      packageCommissions: formatMoney(packageCommission),

      year
    });
  } catch (err) {
    console.error('Most booked items error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;