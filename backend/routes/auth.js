const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const router = express.Router();

const prisma = new PrismaClient();

// Configure email transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✓ Email transporter configured');
} else {
  console.log('⚠ Email not configured – OTP will be shown in console only');
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, phone, address, country, password, role, idNumber, idType } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        username, 
        email, 
        phone, 
        address, 
        country, 
        idNumber: idNumber || null,
        idType: idType || null,
        password: hashed, 
        role: role === 'admin' ? 'admin' : 'user'
      }
    });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGIN (no hardcoded admin) ====================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FORGOT PASSWORD ====================
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!user.email) return res.status(400).json({ error: 'No email associated with this account' });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { username },
      data: { resetToken: otp, resetExpires: expires }
    });

    console.log('========================================');
    console.log(`🔐 OTP for ${username}: ${otp}`);
    console.log(`📧 Send to email: ${user.email}`);
    console.log('========================================');

    let emailSent = false;
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"SerendiGo" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Password Reset OTP - SerendiGo',
          html: `<div>Your OTP is: <strong>${otp}</strong></div>`
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Email send failed:', emailError.message);
      }
    }

    res.json({ 
      success: true,
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check server console)',
      email: user.email,
      devMode: !emailSent
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ==================== RESET PASSWORD ====================
router.post('/reset-password', async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        username,
        resetToken: otp,
        resetExpires: { gt: new Date() }
      }
    });
    
    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { password: hashed, resetToken: null, resetExpires: null }
    });
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GET ALL USERS (ADMIN ONLY) ====================
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        username: true, 
        email: true, 
        phone: true, 
        address: true, 
        country: true, 
        idNumber: true,
        idType: true,
        role: true, 
        createdAt: true 
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPDATE ANY USER (Admin only) ====================
router.put('/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { id } = req.params;
    const { name, username, email, phone, address, country } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const existingUser = await prisma.user.findFirst({
      where: { username, NOT: { id } }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, username, email, phone, address, country }
    });
    
    res.json({ 
      message: 'User updated successfully', 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        country: updatedUser.country,
        role: updatedUser.role,
        idNumber: updatedUser.idNumber,
        idType: updatedUser.idType,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DELETE ANY USER (Admin only) ====================
// DELETE ANY USER (Admin only) – with cascade delete of bookings
router.delete('/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // First delete all bookings belonging to this user
    await prisma.booking.deleteMany({ where: { userId: id } });
    
    // Then delete the user
    await prisma.user.delete({ where: { id } });
    
    res.json({ message: 'User and all associated bookings deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;