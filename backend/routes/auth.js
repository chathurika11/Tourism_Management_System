const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { authenticateUser, authorizeRoles, normalizeRole, toLegacyRole, getUserRoles } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimit');
const { logAudit } = require('../services/auditLog');
const { ensureRoles, assignRoleToUser } = require('../services/roles');
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
const ADMIN_MANAGED_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'];

const buildAuthUser = async (user) => {
  const roles = await getUserRoles(user.id, user.role);
  const primaryRole = roles[0] || normalizeRole(user.role);
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: toLegacyRole(primaryRole),
    roles,
    status: user.status || 'ACTIVE',
    emailVerified: user.emailVerified || false,
    mustChangePassword: user.mustChangePassword || false,
  };
};

const signToken = (user, authUser) => jwt.sign(
  { id: user.id, role: authUser.role, roles: authUser.roles },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    await ensureRoles();
    const { name, username, email, phone, address, country, password, idNumber, idType } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const verifyToken = crypto.randomBytes(24).toString('hex');
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
        passwordHash: hashed,
        status: 'ACTIVE',
        emailVerified: false,
        mustChangePassword: false,
        verifyToken,
        role: 'user'
      }
    });
    await assignRoleToUser(user.id, 'CUSTOMER');
    await logAudit(req, 'USER_CREATED', 'User', user.id, {
      source: 'public_register',
      role: 'CUSTOMER',
      username: user.username,
      description: `Registered customer ${user.username}`,
    });
    
    const authUser = await buildAuthUser(user);
    const token = signToken(user, authUser);
    res.json({ token, user: authUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CREATE USER (ADMIN ONLY) ====================
router.post('/users', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    await ensureRoles();
    const { name, username, email, phone, address, country, password, role, idNumber, idType, status } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const normalizedRole = normalizeRole(role);
    if (!ADMIN_MANAGED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email: email || null,
        phone: phone || null,
        address: address || null,
        country: country || null,
        idNumber: idNumber || null,
        idType: idType || null,
        password: hashed,
        passwordHash: hashed,
        status: status || 'ACTIVE',
        emailVerified: normalizedRole !== 'CUSTOMER',
        mustChangePassword: normalizedRole === 'STAFF',
        role: toLegacyRole(normalizedRole)
      },
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
        mustChangePassword: true,
        createdAt: true
      }
    });
    await assignRoleToUser(user.id, normalizedRole);
    await logAudit(req, 'USER_CREATED', 'User', user.id, {
      role: normalizedRole,
      username: user.username,
      description: `Added ${normalizedRole.toLowerCase()} account ${user.username}`,
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGIN (no hardcoded admin) ====================
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    await ensureRoles();
    const { username, password } = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (user.status && user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const authUser = await buildAuthUser(user);
    const token = signToken(user, authUser);
    await logAudit({ ...req, user: authUser }, 'LOGIN_SUCCESS', 'User', user.id, { role: authUser.role });
    res.json({ token, user: authUser });
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
      data: { password: hashed, passwordHash: hashed, resetToken: null, resetExpires: null }
    });
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GET ALL USERS (ADMIN ONLY) ====================
router.get('/users', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  try {
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
        status: true,
        emailVerified: true,
        mustChangePassword: true,
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
router.put('/users/:id', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, phone, address, country, status, role, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const existingUser = await prisma.user.findFirst({
      where: { username, NOT: { id } }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const normalizedUpdateRole = role ? normalizeRole(role) : null;
    if (normalizedUpdateRole && !ADMIN_MANAGED_ROLES.includes(normalizedUpdateRole)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    const data = { name, username, email, phone, address, country };
    if (status) data.status = status;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      data.password = hashed;
      data.passwordHash = hashed;
      data.mustChangePassword = role
        ? normalizedUpdateRole === 'STAFF'
        : user.role === 'staff';
    }
    if (normalizedUpdateRole) {
      data.role = toLegacyRole(normalizedUpdateRole);
      if (normalizedUpdateRole !== 'STAFF') data.mustChangePassword = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });
    if (role) await assignRoleToUser(id, role);
    await logAudit(req, role ? 'ROLE_ASSIGNED' : 'USER_UPDATED', 'User', id, {
      role: role ? normalizeRole(role) : undefined,
      username: updatedUser.username,
      description: role
        ? `Changed ${updatedUser.username} role to ${normalizeRole(role)}`
        : `Updated user ${updatedUser.username}`,
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
        status: updatedUser.status,
        mustChangePassword: updatedUser.mustChangePassword,
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
router.delete('/users/:id', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // First delete all bookings belonging to this user
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.userRole.deleteMany({ where: { userId: id } });
    
    // Then delete the user
    await prisma.user.delete({ where: { id } });
    await logAudit(req, 'USER_DELETED', 'User', id, {
      username: user.username,
      role: user.role,
      description: `Deleted user ${user.username}`,
    });
    
    res.json({ message: 'User and all associated bookings deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROLES (ADMIN ONLY) ====================
router.get('/roles', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  await ensureRoles();
  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
  res.json(roles);
});

router.post('/users/:id/roles', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  const { role } = req.body;
  await assignRoleToUser(req.params.id, role);
  await logAudit(req, 'ROLE_ASSIGNED', 'User', req.params.id, {
    role: normalizeRole(role),
    description: `Assigned role ${normalizeRole(role)}`,
  });
  res.json({ message: 'Role assigned successfully' });
});

router.delete('/users/:id/roles/:role', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  const role = await prisma.role.findUnique({ where: { name: normalizeRole(req.params.role) } });
  if (role) {
    await prisma.userRole.deleteMany({ where: { userId: req.params.id, roleId: role.id } });
  }
  const remainingRole = await prisma.userRole.findFirst({
    where: { userId: req.params.id },
    include: { role: true },
  });
  await prisma.user.update({
    where: { id: req.params.id },
    data: { role: remainingRole ? toLegacyRole(remainingRole.role.name) : 'user' },
  });
  await logAudit(req, 'ROLE_REMOVED', 'User', req.params.id, {
    role: normalizeRole(req.params.role),
    description: `Removed role ${normalizeRole(req.params.role)}`,
  });
  res.json({ message: 'Role removed successfully' });
});

// ==================== AUDIT LOGS (ADMIN ONLY) ====================
router.get('/logs', authenticateUser, authorizeRoles('ADMIN'), async (req, res) => {
  const { q = '', action = '' } = req.query;
  const logs = await prisma.auditLog.findMany({
    where: {
      AND: [
        action ? { action } : {},
        q ? {
          OR: [
            { action: { contains: q } },
            { entity: { contains: q } },
          ],
        } : {},
      ],
    },
    include: { actor: { select: { id: true, username: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(logs);
});

// ==================== PROFILE ====================
router.get('/profile', authenticateUser, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, username: true, email: true, phone: true, address: true, country: true, status: true, emailVerified: true, mustChangePassword: true, role: true },
  });
  res.json(user);
});

router.put('/profile', authenticateUser, async (req, res) => {
  const { name, email, phone, address, country } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email, phone, address, country },
    select: { id: true, name: true, username: true, email: true, phone: true, address: true, country: true, status: true, emailVerified: true, mustChangePassword: true, role: true },
  });
  await logAudit(req, 'USER_UPDATED', 'User', req.user.id, {
    source: 'profile',
    username: user.username,
    description: `Updated profile ${user.username}`,
  });
  res.json(user);
});

router.put('/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash || user.password);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed, passwordHash: hashed, mustChangePassword: false },
    select: { id: true, name: true, username: true, email: true, phone: true, address: true, country: true, status: true, emailVerified: true, mustChangePassword: true, role: true },
  });
  await logAudit(req, 'PASSWORD_CHANGED', 'User', req.user.id, {
    source: 'profile',
    username: updatedUser.username,
    description: `Changed password for ${updatedUser.username}`,
  });
  res.json({ message: 'Password changed successfully', user: updatedUser });
});

router.get('/verify-email/:token', async (req, res) => {
  const user = await prisma.user.findFirst({ where: { verifyToken: req.params.token } });
  if (!user) return res.status(400).json({ error: 'Invalid verification token' });
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });
  res.json({ message: 'Email verified successfully' });
});

module.exports = router;
