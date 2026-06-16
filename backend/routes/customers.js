const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { assignRoleToUser } = require('../services/roles');
const { logAudit } = require('../services/auditLog');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN', 'STAFF'), async (req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'user' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      address: true,
      country: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(customers);
});

router.post('/', authorizeRoles('ADMIN'), async (req, res) => {
  const { name, username, email, phone, address, country, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ error: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email: email || null,
      phone: phone || null,
      address: address || null,
      country: country || null,
      password: hashed,
      passwordHash: hashed,
      status: 'ACTIVE',
      emailVerified: false,
      role: 'user',
    },
    select: { id: true, name: true, username: true, email: true, phone: true, address: true, country: true, status: true, role: true },
  });
  await assignRoleToUser(user.id, 'CUSTOMER');
  await logAudit(req, 'USER_CREATED', 'User', user.id, { role: 'CUSTOMER', source: 'customers_api' });
  res.status(201).json(user);
});

router.put('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  const { name, email, phone, address, country, status } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.role !== 'user') return res.status(404).json({ error: 'Customer not found' });

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, email, phone, address, country, status },
    select: { id: true, name: true, username: true, email: true, phone: true, address: true, country: true, status: true, role: true },
  });
  await logAudit(req, 'USER_UPDATED', 'User', req.params.id, { source: 'customers_api' });
  res.json(updated);
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.role !== 'user') return res.status(404).json({ error: 'Customer not found' });

  await prisma.booking.deleteMany({ where: { userId: req.params.id } });
  await prisma.userRole.deleteMany({ where: { userId: req.params.id } });
  await prisma.user.delete({ where: { id: req.params.id } });
  await logAudit(req, 'USER_DELETED', 'User', req.params.id, { source: 'customers_api' });
  res.json({ message: 'Customer deleted successfully' });
});

module.exports = router;
