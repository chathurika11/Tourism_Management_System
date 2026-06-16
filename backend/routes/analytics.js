const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();

// Helper
const getUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch { return null; }
};

const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ---------- Submit Feedback (logged-in users only) ----------
router.post('/hotel', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { hotelId, rating, comment } = req.body;
  if (!hotelId || !rating || !comment) return res.status(400).json({ error: 'Missing fields' });
  try {
    await prisma.hotelFeedback.create({ data: { hotelId, userId, rating: parseInt(rating), comment } });
    const feedbacks = await prisma.hotelFeedback.findMany({ where: { hotelId } });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await prisma.hotel.update({ where: { id: hotelId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/guide', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { guideId, rating, comment } = req.body;
  try {
    await prisma.guideFeedback.create({ data: { guideId, userId, rating: parseInt(rating), comment } });
    const feedbacks = await prisma.guideFeedback.findMany({ where: { guideId } });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await prisma.guide.update({ where: { id: guideId }, data: { rating: parseFloat(avgRating.toFixed(1)), reviews: feedbacks.length } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/vehicle', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { vehicleId, rating, comment } = req.body;
  try {
    await prisma.vehicleFeedback.create({ data: { vehicleId, userId, rating: parseInt(rating), comment } });
    const feedbacks = await prisma.vehicleFeedback.findMany({ where: { vehicleId } });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tour', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { tourId, rating, comment } = req.body;
  try {
    await prisma.tourFeedback.create({ data: { tourId, userId, rating: parseInt(rating), comment } });
    const feedbacks = await prisma.tourFeedback.findMany({ where: { tourId } });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await prisma.tourPackage.update({ where: { id: tourId }, data: { rating: parseFloat(avgRating.toFixed(1)) } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------- Public Get Feedbacks (no user details) ----------
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const feedbacks = await prisma.hotelFeedback.findMany({ where: { hotelId: req.params.hotelId }, orderBy: { createdAt: 'desc' } });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/guide/:guideId', async (req, res) => {
  const feedbacks = await prisma.guideFeedback.findMany({ where: { guideId: req.params.guideId }, orderBy: { createdAt: 'desc' } });
  res.json(feedbacks);
});
router.get('/vehicle/:vehicleId', async (req, res) => {
  const feedbacks = await prisma.vehicleFeedback.findMany({ where: { vehicleId: req.params.vehicleId }, orderBy: { createdAt: 'desc' } });
  res.json(feedbacks);
});
router.get('/tour/:tourId', async (req, res) => {
  const feedbacks = await prisma.tourFeedback.findMany({ where: { tourId: req.params.tourId }, orderBy: { createdAt: 'desc' } });
  res.json(feedbacks);
});

// ---------- Admin Get All Feedbacks (with user info) ----------
router.get('/hotel/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.hotelFeedback.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, hotel: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
router.get('/guide/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.guideFeedback.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, guide: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
router.get('/vehicle/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.vehicleFeedback.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, vehicle: { select: { id: true, model: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});
router.get('/tour/all', adminOnly, async (req, res) => {
  const feedbacks = await prisma.tourFeedback.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, tour: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(feedbacks);
});

// ---------- Admin Reply to Feedback ----------
router.put('/hotel/:id/reply', adminOnly, async (req, res) => {
  const { reply } = req.body;
  const updated = await prisma.hotelFeedback.update({ where: { id: req.params.id }, data: { reply, repliedAt: new Date() } });
  res.json(updated);
});
router.put('/guide/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.guideFeedback.update({ where: { id: req.params.id }, data: { reply: req.body.reply, repliedAt: new Date() } });
  res.json(updated);
});
router.put('/vehicle/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.vehicleFeedback.update({ where: { id: req.params.id }, data: { reply: req.body.reply, repliedAt: new Date() } });
  res.json(updated);
});
router.put('/tour/:id/reply', adminOnly, async (req, res) => {
  const updated = await prisma.tourFeedback.update({ where: { id: req.params.id }, data: { reply: req.body.reply, repliedAt: new Date() } });
  res.json(updated);
});

// ---------- Customer: Get My Feedbacks (with replies) ----------
router.get('/my-feedbacks', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
