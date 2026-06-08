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

router.post('/process', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { bookingId, cardNumber, cardExpiry, cardCvv, cardHolder } = req.body;
    if (!bookingId || !cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== decoded.id && decoded.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ error: 'Already paid' });

    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const lastFour = cardNumber.slice(-4);
    const cardType = detectCardType(cardNumber);

    const updated = await prisma.booking.update({
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

    res.json({ success: true, transactionId, booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;