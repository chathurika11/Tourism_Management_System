const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

const formatPrismaError = (error) => {
  if (error.code === 'P2025') {
    return { status: 404, message: 'User not found.' };
  }
  console.error('Unhandled Prisma error:', error);
  return { status: 500, message: 'Database error. Please try again.' };
};

// Get all users (admin only) – with pagination
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: { 
          id: true, 
          name: true, 
          username: true, 
          email: true, 
          phone: true, 
          address: true, 
          country: true, 
          role: true, 
          createdAt: true 
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    res.json({
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    const { status, message } = formatPrismaError(error);
    res.status(status).json({ error: message });
  }
});

module.exports = router;