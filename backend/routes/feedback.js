const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Helper to get user ID from token
const getUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== HOTEL FEEDBACK ====================

// Submit hotel feedback & update hotel rating
router.post('/hotel', async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.hotelFeedback.create({
      data: {
        hotelId,
        userId,
        rating: parseInt(rating),
        comment
      }
    });

    const feedbacks = await prisma.hotelFeedback.findMany({ where: { hotelId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.hotel.update({
      where: { id: hotelId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.json({ success: true, message: 'Feedback submitted, rating updated' });
  } catch (error) {
    console.error('Hotel feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get hotel feedbacks (public)
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const feedbacks = await prisma.hotelFeedback.findMany({
      where: { hotelId: req.params.hotelId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all hotel feedbacks with user & hotel details
router.get('/hotel/all', adminOnly, async (req, res) => {
  try {
    const feedbacks = await prisma.hotelFeedback.findMany({
      include: { user: { select: { name: true, email: true } }, hotel: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reply to hotel feedback
router.put('/hotel/:id/reply', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const updated = await prisma.hotelFeedback.update({
      where: { id },
      data: { reply, repliedAt: new Date() }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GUIDE FEEDBACK ====================

// Submit guide feedback & update rating and review count
router.post('/guide', async (req, res) => {
  try {
    const { guideId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.guideFeedback.create({
      data: {
        guideId,
        userId,
        rating: parseInt(rating),
        comment
      }
    });

    const feedbacks = await prisma.guideFeedback.findMany({ where: { guideId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    const reviewCount = feedbacks.length;
    await prisma.guide.update({
      where: { id: guideId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        reviews: reviewCount
      }
    });

    res.json({ success: true, message: 'Feedback submitted, rating and reviews updated' });
  } catch (error) {
    console.error('Guide feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get guide feedbacks (public)
router.get('/guide/:guideId', async (req, res) => {
  try {
    const feedbacks = await prisma.guideFeedback.findMany({
      where: { guideId: req.params.guideId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all guide feedbacks
router.get('/guide/all', adminOnly, async (req, res) => {
  try {
    const feedbacks = await prisma.guideFeedback.findMany({
      include: { user: { select: { name: true, email: true } }, guide: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reply to guide feedback
router.put('/guide/:id/reply', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const updated = await prisma.guideFeedback.update({
      where: { id },
      data: { reply, repliedAt: new Date() }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VEHICLE FEEDBACK ====================

// Submit vehicle feedback & update vehicle rating
router.post('/vehicle', async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.vehicleFeedback.create({
      data: {
        vehicleId,
        userId,
        rating: parseInt(rating),
        comment
      }
    });

    const feedbacks = await prisma.vehicleFeedback.findMany({ where: { vehicleId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.json({ success: true, message: 'Feedback submitted, rating updated' });
  } catch (error) {
    console.error('Vehicle feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle feedbacks (public)
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const feedbacks = await prisma.vehicleFeedback.findMany({
      where: { vehicleId: req.params.vehicleId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: get all vehicle feedbacks
router.get('/vehicle/all', adminOnly, async (req, res) => {
  try {
    const feedbacks = await prisma.vehicleFeedback.findMany({
      include: { user: { select: { name: true, email: true } }, vehicle: { select: { model: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reply to vehicle feedback
router.put('/vehicle/:id/reply', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const updated = await prisma.vehicleFeedback.update({
      where: { id },
      data: { reply, repliedAt: new Date() }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CUSTOMER: GET MY ALL FEEDBACKS ====================

router.get('/my-feedbacks', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const hotelFeedbacks = await prisma.hotelFeedback.findMany({
      where: { userId },
      include: { hotel: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const guideFeedbacks = await prisma.guideFeedback.findMany({
      where: { userId },
      include: { guide: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const vehicleFeedbacks = await prisma.vehicleFeedback.findMany({
      where: { userId },
      include: { vehicle: { select: { model: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ hotelFeedbacks, guideFeedbacks, vehicleFeedbacks });
  } catch (error) {
    console.error('Get my feedbacks error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;