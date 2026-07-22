const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const { logAudit } = require('../services/auditLog');

const router = express.Router();
const prisma = new PrismaClient();

// ---- helper functions ----
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

  // vehicle
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

// ---- Middleware ----
function adminOrStaff(req, res, next) {
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
}

// ---- ROUTES ----

// POST – submit a provider request
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    if (!prisma.providerRequest) {
      console.error('❌ ProviderRequest model missing. Run `npx prisma generate`.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

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
    console.error('❌ Provider request creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /mine – fetch requests by email or IDs
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

// GET / – admin/staff list (with filters)
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

// ---- NEW: GET prefill data without approving ----
router.get('/:id/prefill', adminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.providerRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Build prefill data
    const prefill = {
      ...request.data,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone,
      businessName: request.businessName,
      district: request.district,
      location: request.location,
      price: request.price,
      message: request.message,
      images: request.images,
    };

    res.json({
      providerType: request.providerType,
      prefill: prefill,
      requestId: request.id,
    });
  } catch (error) {
    console.error('❌ Prefill error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- APPROVE (used after add form submission) ----
router.put('/:id/approve', adminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.providerRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    const updated = await prisma.providerRequest.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
    });

    // Build prefill data (for logging or response)
    const prefill = {
      ...request.data,
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      requesterPhone: request.requesterPhone,
      businessName: request.businessName,
      district: request.district,
      location: request.location,
      price: request.price,
      message: request.message,
      images: request.images,
    };

    await logAudit(req, 'PROVIDER_REQUEST_APPROVED', 'ProviderRequest', id, {
      providerType: request.providerType,
      businessName: request.businessName,
    });

    res.json({
      providerType: request.providerType,
      prefill: prefill,
      request: updated,
    });
  } catch (error) {
    console.error('❌ Approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- REJECT ----
router.put('/:id/reject', adminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const request = await prisma.providerRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    const updated = await prisma.providerRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
    });

    await logAudit(req, 'PROVIDER_REQUEST_REJECTED', 'ProviderRequest', id, {
      providerType: request.providerType,
      businessName: request.businessName,
      rejectionReason: rejectionReason.trim(),
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ Reject error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- UPDATE (Edit) request ----
router.put('/:id', adminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.providerRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot edit an approved or rejected request' });
    }

    const { requesterName, requesterPhone, businessName, district, location, price, ...otherData } = req.body;
    const updateData = {
      requesterName: requesterName || request.requesterName,
      requesterPhone: requesterPhone || request.requesterPhone,
      businessName: businessName || request.businessName,
      district: district || request.district,
      location: location || request.location,
      price: price !== undefined ? parseNumber(price) : request.price,
      data: { ...request.data, ...otherData },
      message: otherData.message || request.message,
    };

    const updated = await prisma.providerRequest.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ PUT /provider-requests/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- DELETE (Cancel) request ----
router.delete('/:id', adminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.providerRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete an approved or rejected request' });
    }

    await prisma.providerRequest.delete({ where: { id } });
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE /provider-requests/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;