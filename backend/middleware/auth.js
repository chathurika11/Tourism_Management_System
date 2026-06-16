const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROLE_ALIASES = {
  admin: 'ADMIN',
  staff: 'STAFF',
  user: 'CUSTOMER',
  customer: 'CUSTOMER',
};

const normalizeRole = (role) => {
  if (!role) return 'CUSTOMER';
  const key = String(role).trim();
  return ROLE_ALIASES[key.toLowerCase()] || key.toUpperCase();
};

const toLegacyRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'ADMIN') return 'admin';
  if (normalized === 'STAFF') return 'staff';
  return 'user';
};

const getUserRoles = async (userId, legacyRole) => {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  const roles = userRoles.map((userRole) => normalizeRole(userRole.role.name));
  if (roles.length === 0) roles.push(normalizeRole(legacyRole));
  return [...new Set(roles)];
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.status && user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const roles = await getUserRoles(user.id, user.role);
    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: toLegacyRole(roles[0]),
      roles,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const allowed = allowedRoles.map(normalizeRole);
  const roles = req.user?.roles || [];
  if (!roles.some((role) => allowed.includes(normalizeRole(role)))) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  normalizeRole,
  toLegacyRole,
  getUserRoles,
};
