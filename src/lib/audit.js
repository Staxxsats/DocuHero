import prisma, { createAuditLog } from './database.js';
import winston from 'winston';

/**
 * HIPAA-compliant audit logging system
 * Tracks all access to PHI and system operations
 */

// Configure audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: 'logs/audit-error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],
});

// Risk level mapping for different actions
const ACTION_RISK_LEVELS = {
  // High-risk actions
  'PATIENT_PHI_EXPORT': 'HIGH',
  'BULK_DATA_EXPORT': 'HIGH',
  'PATIENT_DELETE': 'HIGH',
  'USER_ROLE_CHANGE': 'HIGH',
  'SYSTEM_CONFIG_CHANGE': 'HIGH',
  
  // Critical actions
  'ADMIN_ACCESS': 'CRITICAL',
  'ENCRYPTION_KEY_ACCESS': 'CRITICAL',
  'AUDIT_LOG_MODIFY': 'CRITICAL',
  'BACKUP_RESTORE': 'CRITICAL',
  
  // Medium-risk actions
  'PATIENT_CREATE': 'MEDIUM',
  'PATIENT_UPDATE': 'MEDIUM',
  'DOCUMENT_CREATE': 'MEDIUM',
  'DOCUMENT_UPDATE': 'MEDIUM',
  'USER_LOGIN_FAILED': 'MEDIUM',
  
  // Low-risk actions (default)
  'USER_LOGIN': 'LOW',
  'USER_LOGOUT': 'LOW',
  'PATIENT_READ': 'LOW',
  'DOCUMENT_READ': 'LOW',
  'DASHBOARD_VIEW': 'LOW'
};

/**
 * Log user action with automatic risk assessment
 * @param {Object} params - Audit parameters
 * @returns {Promise<Object>} - Created audit log
 */
export async function logUserAction({
  userId,
  userEmail,
  action,
  resource,
  resourceId,
  details = {},
  oldValues = null,
  newValues = null,
  patientId = null,
  agencyId = null,
  documentId = null,
  progressNoteId = null,
  ipAddress = null,
  userAgent = null,
  req = null // Express request object
}) {
  try {
    // Extract IP and user agent from request if provided
    if (req) {
      ipAddress = ipAddress || req.ip || req.connection.remoteAddress;
      userAgent = userAgent || req.get('User-Agent');
    }
    
    // Determine risk level
    const riskLevel = ACTION_RISK_LEVELS[action] || 'LOW';
    
    // Check for suspicious patterns
    const flagged = await detectSuspiciousActivity({
      userId,
      action,
      ipAddress,
      userAgent
    });
    
    // Create audit log entry
    const auditData = {
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      oldValues,
      newValues,
      patientId,
      agencyId,
      documentId,
      progressNoteId,
      ipAddress,
      userAgent,
      riskLevel,
      flagged
    };
    
    const auditLog = await createAuditLog(auditData);
    
    // Log to Winston for additional monitoring
    auditLogger.info('User action logged', {
      auditLogId: auditLog.id,
      userId,
      action,
      resource,
      riskLevel,
      flagged,
      timestamp: auditLog.timestamp
    });
    
    // Alert on high-risk or flagged activities
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL' || flagged) {
      await alertSecurityTeam({
        auditLog,
        reason: flagged ? 'Suspicious activity detected' : `${riskLevel} risk activity`
      });
    }
    
    return auditLog;
  } catch (error) {
    auditLogger.error('Failed to log user action', {
      error: error.message,
      userId,
      action,
      resource
    });
    throw error;
  }
}

/**
 * Log patient data access (PHI access)
 * @param {Object} params - PHI access parameters
 * @returns {Promise<Object>} - Created audit log
 */
export async function logPHIAccess({
  userId,
  userEmail,
  patientId,
  action, // READ, UPDATE, CREATE, DELETE, EXPORT
  fieldAccessed = null, // Specific field accessed
  purpose = null, // Treatment, payment, operations, etc.
  ipAddress = null,
  userAgent = null,
  req = null
}) {
  const details = {
    type: 'PHI_ACCESS',
    fieldAccessed,
    purpose,
    timestamp: new Date().toISOString()
  };
  
  return await logUserAction({
    userId,
    userEmail,
    action: `PATIENT_${action}`,
    resource: 'PATIENT_PHI',
    resourceId: patientId,
    patientId,
    details,
    ipAddress,
    userAgent,
    req
  });
}

/**
 * Log authentication events
 * @param {Object} params - Authentication parameters
 * @returns {Promise<Object>} - Created audit log
 */
export async function logAuthEvent({
  userId = null,
  userEmail,
  action, // LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_RESET, etc.
  details = {},
  ipAddress = null,
  userAgent = null,
  req = null
}) {
  return await logUserAction({
    userId,
    userEmail,
    action: `USER_${action}`,
    resource: 'USER_AUTH',
    resourceId: userId,
    details: {
      ...details,
      type: 'AUTHENTICATION',
      timestamp: new Date().toISOString()
    },
    ipAddress,
    userAgent,
    req
  });
}

/**
 * Log system configuration changes
 * @param {Object} params - Configuration change parameters
 * @returns {Promise<Object>} - Created audit log
 */
export async function logSystemChange({
  userId,
  userEmail,
  configKey,
  oldValue,
  newValue,
  ipAddress = null,
  userAgent = null,
  req = null
}) {
  return await logUserAction({
    userId,
    userEmail,
    action: 'SYSTEM_CONFIG_CHANGE',
    resource: 'SYSTEM_CONFIG',
    resourceId: configKey,
    details: {
      type: 'SYSTEM_CHANGE',
      configKey,
      timestamp: new Date().toISOString()
    },
    oldValues: { [configKey]: oldValue },
    newValues: { [configKey]: newValue },
    ipAddress,
    userAgent,
    req
  });
}

/**
 * Detect suspicious activity patterns
 * @param {Object} params - Activity parameters
 * @returns {Promise<boolean>} - True if activity is suspicious
 */
async function detectSuspiciousActivity({ userId, action, ipAddress, userAgent }) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Check for multiple failed login attempts
    if (action === 'USER_LOGIN_FAILED') {
      const recentFailures = await prisma.auditLog.count({
        where: {
          action: 'USER_LOGIN_FAILED',
          userId,
          timestamp: { gte: oneHourAgo }
        }
      });
      
      if (recentFailures >= 5) {
        return true; // Suspicious: Too many failed attempts
      }
    }
    
    // Check for unusual IP address
    if (userId && ipAddress) {
      const recentLogins = await prisma.auditLog.findMany({
        where: {
          userId,
          action: 'USER_LOGIN',
          timestamp: { gte: oneDayAgo }
        },
        select: { ipAddress: true },
        distinct: ['ipAddress']
      });
      
      const knownIPs = recentLogins.map(log => log.ipAddress).filter(Boolean);
      
      if (knownIPs.length > 0 && !knownIPs.includes(ipAddress)) {
        return true; // Suspicious: New IP address
      }
    }
    
    // Check for excessive PHI access
    if (action.startsWith('PATIENT_')) {
      const recentAccess = await prisma.auditLog.count({
        where: {
          userId,
          action: { startsWith: 'PATIENT_' },
          timestamp: { gte: oneHourAgo }
        }
      });
      
      if (recentAccess >= 50) {
        return true; // Suspicious: Too much patient data access
      }
    }
    
    // Check for after-hours access
    const hour = now.getHours();
    if ((hour < 6 || hour > 22) && action.startsWith('PATIENT_')) {
      return true; // Suspicious: After-hours PHI access
    }
    
    return false;
  } catch (error) {
    auditLogger.error('Error detecting suspicious activity', {
      error: error.message,
      userId,
      action
    });
    return false;
  }
}

/**
 * Alert security team about suspicious activity
 * @param {Object} params - Alert parameters
 */
async function alertSecurityTeam({ auditLog, reason }) {
  try {
    auditLogger.warn('Security alert triggered', {
      auditLogId: auditLog.id,
      reason,
      userId: auditLog.userId,
      action: auditLog.action,
      resource: auditLog.resource,
      riskLevel: auditLog.riskLevel,
      ipAddress: auditLog.ipAddress,
      timestamp: auditLog.timestamp
    });
    
    // In a real implementation, you would:
    // 1. Send email alerts to security team
    // 2. Create tickets in security system
    // 3. Trigger automated responses (account lockouts, etc.)
    // 4. Send notifications to SIEM systems
    
    console.warn(`SECURITY ALERT: ${reason}`, {
      auditLogId: auditLog.id,
      userId: auditLog.userId,
      action: auditLog.action
    });
  } catch (error) {
    auditLogger.error('Failed to send security alert', {
      error: error.message,
      auditLogId: auditLog.id
    });
  }
}

/**
 * Generate audit report for compliance
 * @param {Object} params - Report parameters
 * @returns {Promise<Object>} - Audit report
 */
export async function generateAuditReport({
  startDate,
  endDate,
  userId = null,
  patientId = null,
  action = null,
  riskLevel = null
}) {
  try {
    const where = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (userId) where.userId = userId;
    if (patientId) where.patientId = patientId;
    if (action) where.action = action;
    if (riskLevel) where.riskLevel = riskLevel;
    
    const [logs, totalCount, riskCounts] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          patient: {
            select: {
              patientId: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 1000 // Limit for performance
      }),
      
      prisma.auditLog.count({ where }),
      
      prisma.auditLog.groupBy({
        by: ['riskLevel'],
        where,
        _count: true
      })
    ]);
    
    const report = {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: {
        totalEvents: totalCount,
        riskDistribution: riskCounts.reduce((acc, item) => {
          acc[item.riskLevel] = item._count;
          return acc;
        }, {}),
        flaggedEvents: logs.filter(log => log.flagged).length
      },
      logs: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        action: log.action,
        resource: log.resource,
        user: log.user ? {
          name: `${log.user.firstName} ${log.user.lastName}`,
          email: log.user.email,
          role: log.user.role
        } : null,
        patientId: log.patient?.patientId,
        riskLevel: log.riskLevel,
        flagged: log.flagged,
        ipAddress: log.ipAddress
      }))
    };
    
    auditLogger.info('Audit report generated', {
      startDate,
      endDate,
      totalEvents: totalCount,
      reportSize: logs.length
    });
    
    return report;
  } catch (error) {
    auditLogger.error('Failed to generate audit report', {
      error: error.message,
      startDate,
      endDate
    });
    throw error;
  }
}

/**
 * Middleware to automatically log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function auditMiddleware(req, res, next) {
  // Skip audit logging for certain routes
  const skipPaths = ['/health', '/favicon.ico', '/static'];
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path));
  
  if (shouldSkip) {
    return next();
  }
  
  // Store request start time
  req.auditStartTime = Date.now();
  
  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(data) {
    req.auditResponseData = data;
    return originalJson.call(this, data);
  };
  
  // Log request completion
  res.on('finish', async () => {
    try {
      const duration = Date.now() - req.auditStartTime;
      
      // Determine action based on method and path
      let action = `HTTP_${req.method}`;
      let resource = 'HTTP_REQUEST';
      
      if (req.path.includes('/patients')) {
        resource = 'PATIENT_API';
        action = `PATIENT_${req.method}`;
      } else if (req.path.includes('/documents')) {
        resource = 'DOCUMENT_API';
        action = `DOCUMENT_${req.method}`;
      } else if (req.path.includes('/auth')) {
        resource = 'AUTH_API';
        action = `AUTH_${req.method}`;
      }
      
      await logUserAction({
        userId: req.user?.id,
        userEmail: req.user?.email,
        action,
        resource,
        resourceId: req.params?.id,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        req
      });
    } catch (error) {
      auditLogger.error('Failed to log HTTP request', {
        error: error.message,
        method: req.method,
        path: req.path
      });
    }
  });
  
  next();
}

export default {
  logUserAction,
  logPHIAccess,
  logAuthEvent,
  logSystemChange,
  generateAuditReport,
  auditMiddleware
};