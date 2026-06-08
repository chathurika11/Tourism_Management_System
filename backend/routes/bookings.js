const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// NOTE: Add these fields to your Prisma Booking model before using this endpoint:
//   cardLastFour    String?
//   cardType        String?
//   paymentMethod   String?
//   transactionId   String?   (optional)
// Then run: npx prisma generate && npx prisma db push

const formatPrismaError = (error) => {
  if (error.code === 'P2012') {
    const missingField = error.meta?.path || 'unknown field';
    return { status: 400, message: `Missing required field: ${missingField}. Please fill all required fields.` };
  }
  if (error.code === 'P2025') {
    return { status: 404, message: 'Record not found.' };
  }
  console.error('Unhandled Prisma error:', error);
  return { status: 500, message: 'Database error. Please try again.' };
};

// ---------- Existing CRUD endpoints ----------

// Get all bookings (admin sees all, users see their own) – with pagination
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
        include: { user: true },
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
    const { status, message } = formatPrismaError(error);
    res.status(status).json({ error: message });
  }
});

// Create a booking
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const booking = await prisma.booking.create({
      data: { ...req.body, userId: decoded.id, status: 'pending' }
    });
    res.json(booking);
  } catch (error) {
    const { status, message } = formatPrismaError(error);
    res.status(status).json({ error: message });
  }
});

// Update booking (only owner or admin)
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
    const { status, message } = formatPrismaError(error);
    res.status(status).json({ error: message });
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
    const { status, message } = formatPrismaError(error);
    res.status(status).json({ error: message });
  }
});

// ---------- NEW: Payment processing endpoint ----------
router.post('/process', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { bookingId, cardNumber, cardExpiry, cardCvv, cardHolder } = req.body;
    
    if (!bookingId || !cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify that the booking belongs to the logged-in user (or admin can process any)
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== decoded.id && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Simulate payment gateway (replace with Stripe/PayHere)
    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    
    const lastFour = cardNumber.slice(-4);
    const cardType = detectCardType(cardNumber);
    
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        cardLastFour: lastFour,
        cardType: cardType,
        paymentMethod: 'card',
        confirmedAt: new Date(),
        transactionId: transactionId,   // optional – add to schema if needed
      }
    });

    res.json({ success: true, transactionId, booking: updatedBooking });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed. Please try again.' });
  }
});

// Helper: detect card type from first digit(s)
function detectCardType(cardNumber) {
  const firstDigit = cardNumber.charAt(0);
  if (firstDigit === '4') return 'Visa';
  if (firstDigit === '5') return 'Mastercard';
  if (firstDigit === '3') return 'Amex';
  if (firstDigit === '6') return 'Discover';
  return 'Card';
}

module.exports = router;