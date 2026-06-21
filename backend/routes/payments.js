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

// POST /api/payments/process
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
    if (booking.userId !== decoded.id && !['admin', 'staff'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    let transactionId;
    let updatedBooking;

    // ---- PayPal ----
    if (paymentMethod === 'paypal') {
      transactionId = 'PAYPAL_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'paid',
          paymentMethod: 'paypal',
          transactionId,
          // status remains unchanged (still pending)
        }
      });
      return res.json({ success: true, transactionId, booking: updatedBooking });
    }

    // ---- Card payment ----
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
        paymentStatus: 'paid',
        cardLastFour: lastFour,
        cardType,
        paymentMethod: 'card',
        transactionId,
        // status remains unchanged (still pending)
      }
    });

    res.json({ success: true, transactionId, booking: updatedBooking });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment failed. Please try again.' });
  }
});

module.exports = router;