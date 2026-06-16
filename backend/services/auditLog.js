const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const logAudit = async (req, action, entity, entityId = null, metadata = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id || null,
        action,
        entity,
        entityId,
        metadata,
        ipAddress: req.ip,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

module.exports = { logAudit };
