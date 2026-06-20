const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const { logAudit } = require('../services/auditLog');

const router = express.Router();
const prisma = new PrismaClient();

const adminOrStaff = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Admin or staff only' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const toList = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildRequestData = (body, imageUrls) => {
  const base = {
    providerType: body.providerType,
    requesterName: body.requesterName,
    requesterEmail: body.requesterEmail,
    requesterPhone: body.requesterPhone,
    businessName: body.businessName || body.name || body.model || '',
    district: body.district,
    location: body.location,
    price: body.price ? parseNumber(body.price) : null,
    message: body.message || '',
    images: imageUrls,
  };

  if (body.providerType === 'guide') {
    return {
      ...base,
      data: {
        name: body.businessName || body.name || body.requesterName,
        specialty: body.specialty || '',
        district: body.district,
        location: body.location || '',
        language: body.language || '',
        experience: body.experience || '',
        certification: body.certification || '',
        pricePerDay: parseNumber(body.pricePerDay || body.price),
        description: body.description || body.message || '',
      },
    };
  }

  if (body.providerType === 'hotel') {
    return {
      ...base,
      data: {
        name: body.businessName || body.name,
        location: body.location,
        district: body.district,
        pricePerNight: parseNumber(body.pricePerNight || body.price),
        amenities: toList(body.amenities),
        checkIn: body.checkIn || '2:00 PM',
        checkOut: body.checkOut || '12:00 PM',
        freeCancellationHours: parseInt(body.freeCancellationHours, 10) || 48,
        breakfastIncluded: body.breakfastIncluded === 'true',
      },
    };
  }

  return {
    ...base,
    data: {
      type: body.type || 'Car',
      model: body.businessName || body.model,
      pricePerDay: parseNumber(body.pricePerDay || body.price),
      passengers: parseInt(body.passengers, 10) || 1,
      fuelType: body.fuelType || '',
      fuelEfficiency: body.fuelEfficiency || '',
      year: body.year || '',
      insuranceIncluded: body.insuranceIncluded !== 'false',
      supportHours: body.supportHours || '24/7',
      pickupLocations: toList(body.pickupLocations || body.location),
      includedFeatures: toList(body.includedFeatures),
      securityDeposit: parseNumber(body.securityDeposit),
      depositRefundable: body.depositRefundable !== 'false',
      location: body.location,
      district: body.district,
      status: 'available',
    },
  };
};

const createEntityFromRequest = async (request) => {
  const image = request.images?.[0] || '';
  const data = request.data || {};

  if (request.providerType === 'guide') {
    return prisma.guide.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        district: data.district,
        location: data.location || '',
        language: data.language || '',
        experience: data.experience || '',
        certification: data.certification || '',
        pricePerDay: parseNumber(data.pricePerDay),
        popular: false,
        description: data.description || '',
        image,
        rating: 0,
        reviews: 0,
      },
    });
  }

  if (request.providerType === 'hotel') {
    return prisma.hotel.create({
      data: {
        name: data.name,
        location: data.location,
        district: data.district,
        pricePerNight: parseNumber(data.pricePerNight),
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        image,
        checkIn: data.checkIn || '2:00 PM',
        checkOut: data.checkOut || '12:00 PM',
        freeCancellationHours: parseInt(data.freeCancellationHours, 10) || 48,
        breakfastIncluded: Boolean(data.breakfastIncluded),
        rating: 0,
      },
    });
  }

  return prisma.vehicle.create({
    data: {
      type: data.type,
      model: data.model,
      pricePerDay: parseNumber(data.pricePerDay),
      passengers: parseInt(data.passengers, 10) || 1,
      fuelType: data.fuelType || '',
      fuelEfficiency: data.fuelEfficiency || '',
      year: data.year || '',
      insuranceIncluded: data.insuranceIncluded !== false,
      supportHours: data.supportHours || '24/7',
      pickupLocations: Array.isArray(data.pickupLocations) ? data.pickupLocations : [],
      includedFeatures: Array.isArray(data.includedFeatures) ? data.includedFeatures : [],
      securityDeposit: parseNumber(data.securityDeposit),
      depositRefundable: data.depositRefundable !== false,
      location: data.location,
      district: data.district,
      status: 'available',
      image,
      rating: 0,
    },
  });
};

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!['guide', 'hotel', 'vehicle'].includes(req.body.providerType)) {
      return res.status(400).json({ error: 'Provider type must be guide, hotel, or vehicle' });
    }

    const requiredFields = ['requesterName', 'requesterEmail', 'requesterPhone', 'district', 'location'];
    const missing = requiredFields.filter((field) => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }

    const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const payload = buildRequestData(req.body, imageUrls);
    const request = await prisma.providerRequest.create({ data: payload });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',').map((id) => id.trim()).filter(Boolean) : [];
    const email = req.query.email?.trim();

    if (!ids.length && !email) {
      return res.status(400).json({ error: 'Provide request ids or email' });
    }

    const requests = await prisma.providerRequest.findMany({
      where: {
        OR: [
          ...(ids.length ? [{ id: { in: ids } }] : []),
          ...(email ? [{ requesterEmail: { equals: email, mode: 'insensitive' } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', adminOrStaff, async (req, res) => {
  try {
    const { status, providerType } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (providerType && providerType !== 'all') where.providerType = providerType;

    const requests = await prisma.providerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', adminOrStaff, async (req, res) => {
  try {
    const request = await prisma.providerRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already reviewed' });

    const entity = await createEntityFromRequest(request);
    const updated = await prisma.providerRequest.update({
      where: { id: request.id },
      data: {
        status: 'approved',
        createdEntityId: entity.id,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit(req, 'PROVIDER_REQUEST_APPROVED', 'ProviderRequest', request.id, {
      description: `Approved ${request.providerType} request`,
      providerType: request.providerType,
      createdEntityId: entity.id,
    });

    res.json({ request: updated, entity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reject', adminOrStaff, async (req, res) => {
  try {
    const request = await prisma.providerRequest.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already reviewed' });

    const updated = await prisma.providerRequest.update({
      where: { id: request.id },
      data: {
        status: 'rejected',
        rejectionReason: req.body.rejectionReason || 'Request rejected by the SerendiGo team.',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    await logAudit(req, 'PROVIDER_REQUEST_REJECTED', 'ProviderRequest', request.id, {
      description: `Rejected ${request.providerType} request`,
      providerType: request.providerType,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
