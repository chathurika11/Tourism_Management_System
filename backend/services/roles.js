const { PrismaClient } = require('@prisma/client');
const { normalizeRole, toLegacyRole } = require('../middleware/auth');

const prisma = new PrismaClient();
const DEFAULT_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'];

const ensureRoles = async () => {
  for (const name of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
};

const assignRoleToUser = async (userId, roleName) => {
  const normalized = normalizeRole(roleName);
  const role = await prisma.role.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });

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
