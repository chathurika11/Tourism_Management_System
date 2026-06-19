const { PrismaClient } = require('@prisma/client');
const { normalizeRole, toLegacyRole } = require('../middleware/auth');

const prisma = new PrismaClient();
const DEFAULT_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'];

const findOrCreateRole = async (name) => {
  let role = await prisma.role.findUnique({ where: { name } });

  if (!role) {
    role = await prisma.role.create({ data: { name } });
  }

  return role;
};

const ensureRoles = async () => {
  for (const name of DEFAULT_ROLES) {
    await findOrCreateRole(name);
  }
};

const assignRoleToUser = async (userId, roleName) => {
  const normalized = normalizeRole(roleName);
  const role = await findOrCreateRole(normalized);

  await prisma.userRole.deleteMany({ where: { userId } });

  await prisma.userRole.create({
    data: { userId, roleId: role.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { role: toLegacyRole(normalized) },
  });
};

module.exports = {
  DEFAULT_ROLES,
  ensureRoles,
  assignRoleToUser,
};