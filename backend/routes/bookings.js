const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

function detectCardType(cardNumber) {
  const first = cardNumber.charAt(0);
  if (first === '4') return 'Visa';
  if (first === '5') return 'Mastercard';
  if (first === '3') return 'Amex';
  if (first === '6') return 'Discover';
  return 'Card';
}

// ---------- GET all bookings (safe fields + separate user fetch) ----------
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = ['admin', 'staff'].includes(decoded.role) ? {} : { userId: decoded.id };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          type: true,
          packageName: true,
          startDate: true,
          endDate: true,
          numberOfDays: true,
          passengers: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          bookingDate: true,
          confirmedAt: true,
          cardLastFour: true,
          cardType: true,
          paymentMethod: true,
          transactionId: true,
          isRead: true,
          cancellationMessage: true,
          destinations: true,
          userId: true,
        },
        orderBy: { bookingDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    const userIds = [...new Set(bookings.map(b => b.userId).filter(id => id))];
    let usersMap = {};
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          country: true,
        },
      });
      usersMap = users.reduce((acc, user) => { acc[user.id] = user; return acc; }, {});
    }

    const bookingsWithUser = bookings.map(booking => ({
      ...booking,
      user: usersMap[booking.userId] || null,
    }));

    res.json({
      data: bookingsWithUser,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ GET /bookings error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
});

// ---------- CREATE booking ----------
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { startDate, endDate, numberOfDays, passengers, totalAmount, type, packageName, status, paymentStatus } = req.body;

    if (!startDate || !endDate || !numberOfDays || !passengers || totalAmount === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    const hoursDiff = (start - now) / (1000 * 60 * 60);
    if (hoursDiff < 48) {
      return res.status(400).json({ error: 'Booking must be made at least 48 hours before the tour start date' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const booking = await prisma.booking.create({
      data: {
        type,
        packageName: packageName || null,
        destinations: req.body.destinations || null,
        startDate: start,
        endDate: end,
        numberOfDays: parseInt(numberOfDays),
        passengers: parseInt(passengers),
        totalAmount: parseFloat(totalAmount),
        status: status || 'pending',
        paymentStatus: paymentStatus || 'unpaid',
        userId: decoded.id,
        bookingDate: new Date(),
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- UPDATE booking (allows customers to edit dates, passengers, destinations) ----------
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== decoded.id && !['admin', 'staff'].includes(decoded.role))
      return res.status(403).json({ error: 'Forbidden' });

    const isOwner = booking.userId === decoded.id && !['admin', 'staff'].includes(decoded.role);
    if (isOwner) {
      const start = new Date(booking.startDate);
      const now = new Date();
      const diffHours = (start - now) / (1000 * 60 * 60);
      if (diffHours <= 48) {
        return res.status(400).json({ error: 'Cannot modify booking within 48 hours of start date' });
      }
    }

    const { startDate, endDate, passengers, destinations, packageName, type } = req.body;
    const updateData = {};
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (passengers) updateData.passengers = parseInt(passengers);
    if (destinations) updateData.destinations = destinations;
    if (packageName) updateData.packageName = packageName;
    if (type) updateData.type = type;

    // If owner edits a confirmed booking, revert to pending and clear confirmedAt
    if (isOwner && booking.status === 'confirmed') {
      updateData.status = 'pending';
      updateData.confirmedAt = null;
    }
    // Always mark as unread so admin reviews changes
    updateData.isRead = false;

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updated);
  } catch (error) {
    console.error('❌ PUT /bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- DELETE booking (permanent) ----------
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Not found' });

    if (booking.userId === decoded.id && !['admin', 'staff'].includes(decoded.role)) {
      const start = new Date(booking.startDate);
      const now = new Date();
      const diffHours = (start - now) / (1000 * 60 * 60);
      if (diffHours <= 48) {
        return res.status(400).json({ error: 'Cannot cancel booking within 48 hours of start date' });
      }
      await prisma.booking.delete({ where: { id: req.params.id } });
      return res.json({ message: 'Booking cancelled successfully' });
    }

    if (!['admin', 'staff'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: 'Booking permanently deleted' });
  } catch (error) {
    console.error('❌ DELETE /bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Admin cancel booking with message (soft cancel) ----------
router.put('/:id/cancel', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ error: 'Admin or staff only' });

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        cancellationMessage: req.body.reason || req.body.message || null,
        isRead: false,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: decoded.id,
          action: 'cancel_booking',
          entity: 'Booking',
          entityId: req.params.id,
          metadata: { reason: req.body.reason || null },
          ipAddress: req.ip,
        },
      });
    } catch (e) { console.warn('Audit log failed', e.message); }

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Admin confirm booking ----------
router.put('/:id/confirm', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ error: 'Admin or staff only' });

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'confirmed', confirmedAt: new Date() },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: decoded.id,
          action: 'confirm_booking',
          entity: 'Booking',
          entityId: req.params.id,
          metadata: { note: req.body.note || null },
          ipAddress: req.ip,
        },
      });
    } catch (e) { console.warn('Audit log failed', e.message); }

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Toggle read status ----------
router.put('/:id/mark-read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ error: 'Admin or staff only' });

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isRead = req.body.isRead === false ? false : true;
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { isRead },
    });

    await prisma.auditLog.create({
      data: {
        actorId: decoded.id,
        action: isRead ? 'mark_read' : 'mark_unread',
        entity: 'Booking',
        entityId: req.params.id,
        metadata: { isRead },
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, isRead, booking: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Get audit logs for a booking ----------
router.get('/:id/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { entity: 'Booking', entityId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Payment processing endpoint ----------
router.post('/process', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { bookingId, paymentMethod, cardNumber, cardExpiry, cardCvv, cardHolder } = req.body;
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ error: 'Missing bookingId or paymentMethod' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== decoded.id && !['admin', 'staff'].includes(decoded.role))
      return res.status(403).json({ error: 'Forbidden' });
    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ error: 'Already paid' });

    let transactionId;
    let updatedBooking;

    if (paymentMethod === 'paypal') {
      transactionId = 'PAYPAL_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'paypal',
          confirmedAt: new Date(),
          transactionId,
        },
      });
      return res.json({ success: true, transactionId, booking: updatedBooking });
    }

    if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      return res.status(400).json({ error: 'Missing card details' });
    }
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.length < 15 || rawCardNumber.length > 19) {
      return res.status(400).json({ error: 'Invalid card number' });
    }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      return res.status(400).json({ error: 'Expiry must be MM/YY' });
    }
    if (!cardCvv.match(/^\d{3,4}$/)) {
      return res.status(400).json({ error: 'CVV must be 3 or 4 digits' });
    }
    if (!cardHolder.trim()) {
      return res.status(400).json({ error: 'Cardholder name is required' });
    }

    transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const lastFour = rawCardNumber.slice(-4);
    const cardType = detectCardType(rawCardNumber);

    updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        cardLastFour: lastFour,
        cardType,
        paymentMethod: 'card',
        confirmedAt: new Date(),
        transactionId,
      },
    });

    res.json({ success: true, transactionId, booking: updatedBooking });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;