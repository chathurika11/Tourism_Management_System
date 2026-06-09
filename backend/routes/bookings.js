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

// Get all bookings (admin sees all, users see their own) with pagination
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const where = decoded.role === 'admin' ? {} : { userId: decoded.id };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { user: true },  // includes full user details for admin
        orderBy: { bookingDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      data: bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create a booking with date validation
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { startDate, endDate, numberOfDays, passengers, totalAmount, type, packageName, status, paymentStatus } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !numberOfDays || !passengers || totalAmount === undefined || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past date validation
    if (start < today) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }
    // 24‑hour advance validation
    const hoursDiff = (start - now) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Booking must be made at least 24 hours before the tour start date' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const booking = await prisma.booking.create({
      data: {
        type,
        packageName: packageName || null,
        startDate: start,
        endDate: end,
        numberOfDays: parseInt(numberOfDays),
        passengers: parseInt(passengers),
        totalAmount: parseFloat(totalAmount),
        status: status || 'pending',
        paymentStatus: paymentStatus || 'unpaid',
        userId: decoded.id,
        bookingDate: new Date(),
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking (owner or admin)
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== decoded.id && decoded.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.userId !== decoded.id && decoded.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Payment processing endpoint
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
    if (booking.userId !== decoded.id && decoded.role !== 'admin')
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
        }
      });
      return res.json({ success: true, transactionId, booking: updatedBooking });
    }

    // Card payment
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
      }
    });

    res.json({ success: true, transactionId, booking: updatedBooking });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;