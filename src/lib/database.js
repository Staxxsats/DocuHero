import { PrismaClient } from '@prisma/client';
import winston from 'winston';

/**
 * Database connection and utility functions
 * Includes HIPAA-compliant logging and connection management
 */

// Configure logger for database operations
const dbLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({ filename: 'logs/database-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/database.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Prisma Client singleton
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });
} else {
  // In development, store Prisma client on global object to prevent hot reload issues
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });
  }
  prisma = global.__prisma;
}

// Add logging event listeners
prisma.$on('query', (e) => {
  // Only log in development to avoid performance issues
  if (process.env.NODE_ENV !== 'production') {
    dbLogger.info('Query executed', {
      query: e.query,
      params: e.params,
      duration: e.duration,
      timestamp: e.timestamp
    });
  }
});

prisma.$on('error', (e) => {
  dbLogger.error('Database error', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

prisma.$on('info', (e) => {
  dbLogger.info('Database info', {
    message: e.message,
    timestamp: e.timestamp
  });
});

prisma.$on('warn', (e) => {
  dbLogger.warn('Database warning', {
    message: e.message,
    timestamp: e.timestamp
  });
});

/**
 * Test database connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLogger.info('Database connection successful');
    return true;
  } catch (error) {
    dbLogger.error('Database connection failed', { error: error.message });
    return false;
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnect() {
  try {
    await prisma.$disconnect();
    dbLogger.info('Database disconnected successfully');
  } catch (error) {
    dbLogger.error('Error disconnecting from database', { error: error.message });
  }
}

/**
 * Execute database operations with transaction support
 * @param {Function} operation - Database operation function
 * @param {Object} options - Transaction options
 * @returns {Promise} - Operation result
 */
export async function withTransaction(operation, options = {}) {
  try {
    return await prisma.$transaction(operation, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      isolationLevel: 'ReadCommitted',
      ...options
    });
  } catch (error) {
    dbLogger.error('Transaction failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Create audit log entry
 * @param {Object} auditData - Audit log data
 * @returns {Promise<Object>} - Created audit log
 */
export async function createAuditLog(auditData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        ...auditData,
        timestamp: new Date(),
        riskLevel: auditData.riskLevel || 'LOW'
      }
    });
    
    // Log high-risk activities immediately
    if (auditData.riskLevel === 'HIGH' || auditData.riskLevel === 'CRITICAL') {
      dbLogger.warn('High-risk activity detected', {
        auditLogId: auditLog.id,
        action: auditData.action,
        userId: auditData.userId,
        resource: auditData.resource
      });
    }
    
    return auditLog;
  } catch (error) {
    dbLogger.error('Failed to create audit log', {
      error: error.message,
      auditData
    });
    throw error;
  }
}

/**
 * Get system configuration value
 * @param {string} key - Configuration key
 * @param {string} defaultValue - Default value if not found
 * @returns {Promise<string>} - Configuration value
 */
export async function getSystemConfig(key, defaultValue = null) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });
    
    if (!config) {
      return defaultValue;
    }
    
    // Decrypt if necessary
    if (config.encrypted) {
      const { decrypt } = await import('./encryption.js');
      return decrypt(config.value);
    }
    
    return config.value;
  } catch (error) {
    dbLogger.error('Failed to get system config', {
      error: error.message,
      key
    });
    return defaultValue;
  }
}

/**
 * Set system configuration value
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @param {Object} options - Options (encrypted, description, category)
 * @returns {Promise<Object>} - Updated configuration
 */
export async function setSystemConfig(key, value, options = {}) {
  try {
    let processedValue = value;
    
    // Encrypt if requested
    if (options.encrypted) {
      const { encrypt } = await import('./encryption.js');
      processedValue = encrypt(value);
    }
    
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: processedValue,
        encrypted: options.encrypted || false,
        description: options.description,
        category: options.category || 'general',
        updatedBy: options.updatedBy
      },
      create: {
        key,
        value: processedValue,
        encrypted: options.encrypted || false,
        description: options.description,
        category: options.category || 'general',
        updatedBy: options.updatedBy
      }
    });
    
    dbLogger.info('System config updated', {
      key,
      encrypted: options.encrypted || false,
      updatedBy: options.updatedBy
    });
    
    return config;
  } catch (error) {
    dbLogger.error('Failed to set system config', {
      error: error.message,
      key
    });
    throw error;
  }
}

/**
 * Clean up expired sessions
 * @returns {Promise<number>} - Number of sessions deleted
 */
export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    
    dbLogger.info('Expired sessions cleaned up', {
      deletedCount: result.count
    });
    
    return result.count;
  } catch (error) {
    dbLogger.error('Failed to cleanup expired sessions', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Archive old audit logs based on retention policy
 * @param {number} retentionDays - Number of days to retain logs
 * @returns {Promise<number>} - Number of logs archived
 */
export async function archiveOldAuditLogs(retentionDays = 2555) { // 7 years default
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // In a real implementation, you'd move these to an archive table
    // For now, we'll just count them
    const oldLogs = await prisma.auditLog.count({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
    
    dbLogger.info('Old audit logs identified for archival', {
      count: oldLogs,
      cutoffDate: cutoffDate.toISOString()
    });
    
    return oldLogs;
  } catch (error) {
    dbLogger.error('Failed to archive old audit logs', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Health check for database
 * @returns {Promise<Object>} - Health status
 */
export async function healthCheck() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now();
    
    const stats = {
      status: 'healthy',
      responseTime: end - start,
      timestamp: new Date().toISOString()
    };
    
    // Check for any critical issues
    const recentErrors = await prisma.auditLog.count({
      where: {
        riskLevel: 'CRITICAL',
        timestamp: {
          gte: new Date(Date.now() - 60000) // Last minute
        }
      }
    });
    
    if (recentErrors > 0) {
      stats.status = 'warning';
      stats.criticalErrors = recentErrors;
    }
    
    return stats;
  } catch (error) {
    dbLogger.error('Database health check failed', {
      error: error.message
    });
    
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export default prisma;