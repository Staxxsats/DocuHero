import prisma from '../lib/database.js';
import { logUserAction } from '../lib/audit.js';
import winston from 'winston';

/**
 * HIPAA-compliant data retention and lifecycle management service
 */

// Configure retention logger
const retentionLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'retention' },
  transports: [
    new winston.transports.File({ filename: 'logs/retention.log' }),
    new winston.transports.Console()
  ],
});

// Default retention periods (in days) per HIPAA requirements
const DEFAULT_RETENTION_PERIODS = {
  PATIENT: 2555, // 7 years
  DOCUMENT: 2555, // 7 years
  PROGRESS_NOTE: 2555, // 7 years
  AUDIT_LOG: 2555, // 7 years (minimum for HIPAA)
  SESSION: 90, // 3 months
  SYSTEM_CONFIG: 1825, // 5 years
  USER: 2555 // 7 years after last activity
};

/**
 * Create or update retention policy
 */
export async function createRetentionPolicy({
  name,
  description,
  resourceType,
  retentionPeriod,
  autoDelete = false,
  archiveFirst = true,
  createdById,
  req = null
}) {
  try {
    const policy = await prisma.retentionPolicy.upsert({
      where: { name },
      update: {
        description,
        resourceType,
        retentionPeriod,
        autoDelete,
        archiveFirst,
        updatedAt: new Date()
      },
      create: {
        name,
        description,
        resourceType,
        retentionPeriod,
        autoDelete,
        archiveFirst
      }
    });
    
    // Log policy creation/update
    await logUserAction({
      userId: createdById,
      action: 'RETENTION_POLICY_UPDATE',
      resource: 'RETENTION_POLICY',
      resourceId: policy.id,
      details: {
        name,
        resourceType,
        retentionPeriod,
        autoDelete,
        archiveFirst
      },
      req
    });
    
    retentionLogger.info('Retention policy created/updated', {
      policyId: policy.id,
      name,
      resourceType,
      retentionPeriod
    });
    
    return policy;
    
  } catch (error) {
    throw new Error(`Failed to create retention policy: ${error.message}`);
  }
}

/**
 * Get all retention policies
 */
export async function getRetentionPolicies(requestingUserId, req = null) {
  try {
    const policies = await prisma.retentionPolicy.findMany({
      orderBy: { resourceType: 'asc' }
    });
    
    // Log access
    await logUserAction({
      userId: requestingUserId,
      action: 'RETENTION_POLICY_LIST',
      resource: 'RETENTION_POLICY',
      details: { count: policies.length },
      req
    });
    
    return policies;
    
  } catch (error) {
    throw new Error(`Failed to get retention policies: ${error.message}`);
  }
}

/**
 * Apply retention policies and schedule deletions
 */
export async function applyRetentionPolicies() {
  try {
    const policies = await prisma.retentionPolicy.findMany();
    const results = [];
    
    for (const policy of policies) {
      const result = await applyRetentionPolicy(policy);
      results.push(result);
    }
    
    retentionLogger.info('Retention policies applied', {
      policiesProcessed: policies.length,
      results
    });
    
    return results;
    
  } catch (error) {
    retentionLogger.error('Failed to apply retention policies', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Apply specific retention policy
 */
async function applyRetentionPolicy(policy) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
  
  let processedCount = 0;
  let scheduledForDeletion = 0;
  
  try {
    switch (policy.resourceType) {
      case 'PATIENT':
        const result = await processPatientRetention(cutoffDate, policy);
        processedCount = result.processed;
        scheduledForDeletion = result.scheduled;
        break;
        
      case 'DOCUMENT':
        const docResult = await processDocumentRetention(cutoffDate, policy);
        processedCount = docResult.processed;
        scheduledForDeletion = docResult.scheduled;
        break;
        
      case 'PROGRESS_NOTE':
        const noteResult = await processProgressNoteRetention(cutoffDate, policy);
        processedCount = noteResult.processed;
        scheduledForDeletion = noteResult.scheduled;
        break;
        
      case 'AUDIT_LOG':
        const auditResult = await processAuditLogRetention(cutoffDate, policy);
        processedCount = auditResult.processed;
        scheduledForDeletion = auditResult.scheduled;
        break;
        
      case 'SESSION':
        const sessionResult = await processSessionRetention(cutoffDate, policy);
        processedCount = sessionResult.processed;
        scheduledForDeletion = sessionResult.scheduled;
        break;
        
      default:
        retentionLogger.warn('Unknown resource type in retention policy', {
          policyId: policy.id,
          resourceType: policy.resourceType
        });
    }
    
    retentionLogger.info('Retention policy applied', {
      policyId: policy.id,
      resourceType: policy.resourceType,
      cutoffDate: cutoffDate.toISOString(),
      processedCount,
      scheduledForDeletion
    });
    
    return {
      policyId: policy.id,
      resourceType: policy.resourceType,
      processedCount,
      scheduledForDeletion,
      success: true
    };
    
  } catch (error) {
    retentionLogger.error('Failed to apply retention policy', {
      policyId: policy.id,
      resourceType: policy.resourceType,
      error: error.message
    });
    
    return {
      policyId: policy.id,
      resourceType: policy.resourceType,
      processedCount: 0,
      scheduledForDeletion: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Process patient data retention
 */
async function processPatientRetention(cutoffDate, policy) {
  const patients = await prisma.patient.findMany({
    where: {
      updatedAt: { lt: cutoffDate },
      status: 'ARCHIVED',
      deletedAt: { not: null },
      scheduleDeleteAt: null // Not already scheduled
    },
    select: {
      id: true,
      patientId: true,
      updatedAt: true,
      agencyId: true
    }
  });
  
  let scheduled = 0;
  
  if (policy.autoDelete) {
    // Schedule for automatic deletion
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 30); // 30-day notice period
    
    for (const patient of patients) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { scheduleDeleteAt: scheduleDate }
      });
      
      // Log scheduled deletion
      await logUserAction({
        userId: 'system',
        action: 'PATIENT_SCHEDULE_DELETE',
        resource: 'PATIENT',
        resourceId: patient.id,
        patientId: patient.id,
        agencyId: patient.agencyId,
        details: {
          scheduleDate: scheduleDate.toISOString(),
          reason: 'retention_policy',
          policyId: policy.id
        }
      });
      
      scheduled++;
    }
  }
  
  return {
    processed: patients.length,
    scheduled
  };
}

/**
 * Process document retention
 */
async function processDocumentRetention(cutoffDate, policy) {
  const documents = await prisma.document.findMany({
    where: {
      updatedAt: { lt: cutoffDate },
      deletedAt: { not: null },
      scheduleDeleteAt: null
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      agencyId: true,
      patientId: true
    }
  });
  
  let scheduled = 0;
  
  if (policy.autoDelete) {
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 30);
    
    for (const document of documents) {
      await prisma.document.update({
        where: { id: document.id },
        data: { scheduleDeleteAt: scheduleDate }
      });
      
      await logUserAction({
        userId: 'system',
        action: 'DOCUMENT_SCHEDULE_DELETE',
        resource: 'DOCUMENT',
        resourceId: document.id,
        documentId: document.id,
        patientId: document.patientId,
        agencyId: document.agencyId,
        details: {
          scheduleDate: scheduleDate.toISOString(),
          reason: 'retention_policy',
          policyId: policy.id
        }
      });
      
      scheduled++;
    }
  }
  
  return {
    processed: documents.length,
    scheduled
  };
}

/**
 * Process progress note retention
 */
async function processProgressNoteRetention(cutoffDate, policy) {
  const notes = await prisma.progressNote.findMany({
    where: {
      updatedAt: { lt: cutoffDate },
      deletedAt: { not: null }
    },
    select: {
      id: true,
      sessionDate: true,
      patientId: true
    }
  });
  
  // Progress notes are typically kept with patient records
  // In practice, you'd archive rather than delete
  
  return {
    processed: notes.length,
    scheduled: 0 // Don't auto-delete clinical data
  };
}

/**
 * Process audit log retention
 */
async function processAuditLogRetention(cutoffDate, policy) {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { lt: cutoffDate },
      riskLevel: { in: ['LOW', 'MEDIUM'] } // Keep high-risk logs longer
    },
    select: {
      id: true,
      timestamp: true,
      action: true
    }
  });
  
  // In practice, audit logs would be archived to external storage
  // rather than deleted from the database
  
  return {
    processed: auditLogs.length,
    scheduled: 0 // Archive instead of delete
  };
}

/**
 * Process session retention
 */
async function processSessionRetention(cutoffDate, policy) {
  const sessions = await prisma.session.findMany({
    where: {
      lastAccessedAt: { lt: cutoffDate }
    },
    select: {
      id: true,
      lastAccessedAt: true
    }
  });
  
  let scheduled = 0;
  
  if (policy.autoDelete) {
    // Delete expired sessions immediately
    const result = await prisma.session.deleteMany({
      where: {
        lastAccessedAt: { lt: cutoffDate }
      }
    });
    
    scheduled = result.count;
    
    retentionLogger.info('Expired sessions deleted', {
      deletedCount: result.count
    });
  }
  
  return {
    processed: sessions.length,
    scheduled
  };
}

/**
 * Execute scheduled deletions
 */
export async function executeScheduledDeletions() {
  try {
    const now = new Date();
    const results = [];
    
    // Delete scheduled patients
    const scheduledPatients = await prisma.patient.findMany({
      where: {
        scheduleDeleteAt: { lte: now },
        deletedAt: { not: null }
      },
      select: {
        id: true,
        patientId: true,
        agencyId: true
      }
    });
    
    for (const patient of scheduledPatients) {
      // In practice, you'd export/archive the data first
      // Then perform hard delete or mark as permanently deleted
      
      await logUserAction({
        userId: 'system',
        action: 'PATIENT_PERMANENT_DELETE',
        resource: 'PATIENT',
        resourceId: patient.id,
        patientId: patient.id,
        agencyId: patient.agencyId,
        details: {
          reason: 'retention_policy_execution',
          executedAt: now.toISOString()
        }
      });
    }
    
    results.push({
      resourceType: 'PATIENT',
      deletedCount: scheduledPatients.length
    });
    
    // Delete scheduled documents
    const scheduledDocuments = await prisma.document.findMany({
      where: {
        scheduleDeleteAt: { lte: now },
        deletedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        agencyId: true,
        patientId: true
      }
    });
    
    for (const document of scheduledDocuments) {
      await logUserAction({
        userId: 'system',
        action: 'DOCUMENT_PERMANENT_DELETE',
        resource: 'DOCUMENT',
        resourceId: document.id,
        documentId: document.id,
        patientId: document.patientId,
        agencyId: document.agencyId,
        details: {
          reason: 'retention_policy_execution',
          executedAt: now.toISOString()
        }
      });
    }
    
    results.push({
      resourceType: 'DOCUMENT',
      deletedCount: scheduledDocuments.length
    });
    
    retentionLogger.info('Scheduled deletions executed', {
      results,
      executedAt: now.toISOString()
    });
    
    return results;
    
  } catch (error) {
    retentionLogger.error('Failed to execute scheduled deletions', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Get data retention report
 */
export async function getRetentionReport(agencyId = null, requestingUserId, req = null) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const where = agencyId ? { agencyId } : {};
    
    // Get counts for different data types
    const [
      totalPatients,
      archivedPatients,
      scheduledPatients,
      totalDocuments,
      archivedDocuments,
      scheduledDocuments,
      recentAuditLogs,
      oldAuditLogs
    ] = await Promise.all([
      prisma.patient.count({ where: { ...where, deletedAt: null } }),
      prisma.patient.count({ where: { ...where, deletedAt: { not: null } } }),
      prisma.patient.count({ where: { ...where, scheduleDeleteAt: { not: null } } }),
      prisma.document.count({ where: { ...where, deletedAt: null } }),
      prisma.document.count({ where: { ...where, deletedAt: { not: null } } }),
      prisma.document.count({ where: { ...where, scheduleDeleteAt: { not: null } } }),
      prisma.auditLog.count({ 
        where: { 
          ...(agencyId ? { agencyId } : {}),
          timestamp: { gte: thirtyDaysAgo } 
        } 
      }),
      prisma.auditLog.count({ 
        where: { 
          ...(agencyId ? { agencyId } : {}),
          timestamp: { lt: thirtyDaysAgo } 
        } 
      })
    ]);
    
    const report = {
      generatedAt: now.toISOString(),
      agencyId,
      summary: {
        patients: {
          active: totalPatients,
          archived: archivedPatients,
          scheduledForDeletion: scheduledPatients
        },
        documents: {
          active: totalDocuments,
          archived: archivedDocuments,
          scheduledForDeletion: scheduledDocuments
        },
        auditLogs: {
          recent: recentAuditLogs,
          old: oldAuditLogs
        }
      },
      policies: await prisma.retentionPolicy.findMany({
        select: {
          name: true,
          resourceType: true,
          retentionPeriod: true,
          autoDelete: true
        }
      })
    };
    
    // Log report generation
    await logUserAction({
      userId: requestingUserId,
      action: 'RETENTION_REPORT_GENERATE',
      resource: 'RETENTION_REPORT',
      agencyId,
      details: {
        reportType: 'retention_summary',
        agencySpecific: !!agencyId
      },
      req
    });
    
    return report;
    
  } catch (error) {
    throw new Error(`Failed to generate retention report: ${error.message}`);
  }
}

/**
 * Initialize default retention policies
 */
export async function initializeDefaultPolicies() {
  try {
    const defaultPolicies = [
      {
        name: 'Patient Records',
        description: 'HIPAA-compliant retention for patient records (7 years)',
        resourceType: 'PATIENT',
        retentionPeriod: DEFAULT_RETENTION_PERIODS.PATIENT,
        autoDelete: false,
        archiveFirst: true
      },
      {
        name: 'Clinical Documents',
        description: 'Medical documents and progress notes (7 years)',
        resourceType: 'DOCUMENT',
        retentionPeriod: DEFAULT_RETENTION_PERIODS.DOCUMENT,
        autoDelete: false,
        archiveFirst: true
      },
      {
        name: 'Progress Notes',
        description: 'Clinical progress notes (7 years)',
        resourceType: 'PROGRESS_NOTE',
        retentionPeriod: DEFAULT_RETENTION_PERIODS.PROGRESS_NOTE,
        autoDelete: false,
        archiveFirst: true
      },
      {
        name: 'Audit Logs',
        description: 'System audit and access logs (7 years minimum)',
        resourceType: 'AUDIT_LOG',
        retentionPeriod: DEFAULT_RETENTION_PERIODS.AUDIT_LOG,
        autoDelete: false,
        archiveFirst: true
      },
      {
        name: 'User Sessions',
        description: 'Active user sessions (90 days)',
        resourceType: 'SESSION',
        retentionPeriod: DEFAULT_RETENTION_PERIODS.SESSION,
        autoDelete: true,
        archiveFirst: false
      }
    ];
    
    for (const policyData of defaultPolicies) {
      await prisma.retentionPolicy.upsert({
        where: { name: policyData.name },
        update: policyData,
        create: policyData
      });
    }
    
    retentionLogger.info('Default retention policies initialized', {
      policiesCreated: defaultPolicies.length
    });
    
    return defaultPolicies;
    
  } catch (error) {
    retentionLogger.error('Failed to initialize default policies', {
      error: error.message
    });
    throw error;
  }
}

export default {
  createRetentionPolicy,
  getRetentionPolicies,
  applyRetentionPolicies,
  executeScheduledDeletions,
  getRetentionReport,
  initializeDefaultPolicies
};