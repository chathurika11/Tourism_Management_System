const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../services/auditLog');
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

const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'staff'].includes(decoded.role)) return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const userSelect = { select: { id: true, name: true, email: true } };
const parseRating = (rating) => {
  const parsed = parseInt(rating, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) return null;
  return parsed;
};

const requireFeedbackFields = (res, itemId, rating, comment) => {
  const parsedRating = parseRating(rating);
  if (!itemId || !parsedRating || !comment?.trim()) {
    res.status(400).json({ error: 'Please provide item, rating, and comment' });
    return null;
  }
  return parsedRating;
};

// ==================== HOTEL FEEDBACK ====================
router.post('/hotel', async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const parsedRating = requireFeedbackFields(res, hotelId, rating, comment);
    if (!parsedRating) return;
    await prisma.hotelFeedback.create({ data: { hotelId, userId, rating: parsedRating, comment: comment.trim() } });
    const feedbacks = await prisma.hotelFeedback.findMany({ where: { hotelId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.hotel.update({ where: { id: hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/hotel/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.hotelFeedback.findMany({
    include: { user: userSelect, hotel: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
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
router.put('/hotel/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.hotelFeedback.update({
    where: { id: req.params.id },
    data: { reply: req.body.reply, repliedAt: new Date() }
  });
  await logAudit(req, 'FEEDBACK_REPLIED', 'HotelFeedback', updated.id, {
    description: 'Replied to hotel feedback',
    feedbackType: 'hotel',
  });
  res.json(updated);
});

// ==================== GUIDE FEEDBACK ====================
router.post('/guide', async (req, res) => {
  try {
    const { guideId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const parsedRating = requireFeedbackFields(res, guideId, rating, comment);
    if (!parsedRating) return;
    await prisma.guideFeedback.create({ data: { guideId, userId, rating: parsedRating, comment: comment.trim() } });
    const feedbacks = await prisma.guideFeedback.findMany({ where: { guideId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.guide.update({ where: { id: guideId }, data: { rating: parseFloat(avgRating.toFixed(1)), reviews: feedbacks.length } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/guide/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.guideFeedback.findMany({
    include: { user: userSelect, guide: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
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
router.put('/guide/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.guideFeedback.update({
    where: { id: req.params.id },
    data: { reply: req.body.reply, repliedAt: new Date() }
  });
  await logAudit(req, 'FEEDBACK_REPLIED', 'GuideFeedback', updated.id, {
    description: 'Replied to guide feedback',
    feedbackType: 'guide',
  });
  res.json(updated);
});

// ==================== VEHICLE FEEDBACK ====================
router.post('/vehicle', async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const parsedRating = requireFeedbackFields(res, vehicleId, rating, comment);
    if (!parsedRating) return;
    await prisma.vehicleFeedback.create({ data: { vehicleId, userId, rating: parsedRating, comment: comment.trim() } });
    const feedbacks = await prisma.vehicleFeedback.findMany({ where: { vehicleId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/vehicle/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.vehicleFeedback.findMany({
    include: { user: userSelect, vehicle: { select: { id: true, model: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
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
router.put('/vehicle/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.vehicleFeedback.update({
    where: { id: req.params.id },
    data: { reply: req.body.reply, repliedAt: new Date() }
  });
  await logAudit(req, 'FEEDBACK_REPLIED', 'VehicleFeedback', updated.id, {
    description: 'Replied to vehicle feedback',
    feedbackType: 'vehicle',
  });
  res.json(updated);
});

// ==================== TOUR PACKAGE FEEDBACK ====================
router.post('/tour', async (req, res) => {
  try {
    const { tourId, rating, comment } = req.body;
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const parsedRating = requireFeedbackFields(res, tourId, rating, comment);
    if (!parsedRating) return;
    await prisma.tourFeedback.create({ data: { tourId, userId, rating: parsedRating, comment: comment.trim() } });
    const feedbacks = await prisma.tourFeedback.findMany({ where: { tourId } });
    const avgRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length;
    await prisma.tourPackage.update({ where: { id: tourId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/tour/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.tourFeedback.findMany({
    include: { user: userSelect, tour: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
router.get('/tour/:tourId', async (req, res) => {
  try {
    const feedbacks = await prisma.tourFeedback.findMany({
      where: { tourId: req.params.tourId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/tour/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.tourFeedback.update({
    where: { id: req.params.id },
    data: { reply: req.body.reply, repliedAt: new Date() }
  });
  await logAudit(req, 'FEEDBACK_REPLIED', 'TourFeedback', updated.id, {
    description: 'Replied to tour package feedback',
    feedbackType: 'tour',
  });
  res.json(updated);
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
    const tourFeedbacks = await prisma.tourFeedback.findMany({
      where: { userId },
      include: { tour: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ hotelFeedbacks, guideFeedbacks, vehicleFeedbacks, tourFeedbacks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
