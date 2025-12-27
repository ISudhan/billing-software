const AuditLog = require('../models/AuditLog');

/**
 * Log admin actions for audit trail
 */
const logAuditAction = async ({
  action,
  performedBy,
  performedByName,
  targetModel,
  targetId,
  details = {},
  ipAddress = null,
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      performedByName,
      targetModel,
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('❌ Audit log failed:', error.message);
    // Don't throw - audit logging should not break the main flow
  }
};

module.exports = { logAuditAction };
