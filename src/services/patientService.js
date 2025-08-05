import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/database.js';
import { logUserAction, logPHIAccess } from '../lib/audit.js';
import { encryptPatientData, decryptPatientData, generateSecureToken } from '../lib/encryption.js';

/**
 * Patient/Client data service with HIPAA-compliant PHI handling
 */

/**
 * Create a new patient record
 */
export async function createPatient({
  firstName,
  lastName,
  email = null,
  phone = null,
  address = null,
  city = null,
  state = null,
  zipCode = null,
  dateOfBirth = null,
  gender = null,
  medicalRecordNumber = null,
  insuranceInfo = null,
  emergencyContact = null,
  agencyId,
  createdById,
  req = null
}) {
  try {
    // Generate unique patient ID
    const patientId = `P-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Encrypt sensitive data
    const encryptedData = encryptPatientData({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      medicalRecordNumber,
      insuranceInfo,
      emergencyContact
    });
    
    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        ...encryptedData,
        patientId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        agencyId,
        createdById,
        status: 'ACTIVE',
        consentGivenAt: new Date(), // Assuming consent is given at creation
        consentVersion: '1.0'
      }
    });
    
    // Automatically assign patient to creating provider
    await prisma.patientAssignment.create({
      data: {
        patientId: patient.id,
        providerId: createdById,
        role: 'primary'
      }
    });
    
    // Log patient creation (PHI access)
    await logPHIAccess({
      userId: createdById,
      patientId: patient.id,
      action: 'CREATE',
      purpose: 'treatment',
      req
    });
    
    // Return patient without encrypted fields for display
    return await getPatientById(patient.id, createdById, req);
    
  } catch (error) {
    throw new Error(`Failed to create patient: ${error.message}`);
  }
}

/**
 * Get patient by ID with decryption
 */
export async function getPatientById(patientId, requestingUserId, req = null) {
  try {
    // Check if user has access to this patient
    const hasAccess = await checkPatientAccess(patientId, requestingUserId);
    if (!hasAccess) {
      throw new Error('Access denied to patient record');
    }
    
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        agency: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignments: {
          where: { unassignedAt: null },
          include: {
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        progressNotes: {
          select: {
            id: true,
            sessionDate: true,
            sessionType: true,
            status: true,
            createdAt: true
          },
          take: 10,
          orderBy: { sessionDate: 'desc' }
        }
      }
    });
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Update last accessed time
    await prisma.patient.update({
      where: { id: patientId },
      data: { lastAccessedAt: new Date() }
    });
    
    // Log PHI access
    await logPHIAccess({
      userId: requestingUserId,
      patientId: patient.id,
      action: 'READ',
      purpose: 'treatment',
      req
    });
    
    // Decrypt patient data for display
    const decryptedPatient = decryptPatientData(patient);
    
    return decryptedPatient;
    
  } catch (error) {
    throw new Error(`Failed to get patient: ${error.message}`);
  }
}

/**
 * Update patient information
 */
export async function updatePatient(patientId, updateData, updatedById, req = null) {
  try {
    // Check access
    const hasAccess = await checkPatientAccess(patientId, updatedById);
    if (!hasAccess) {
      throw new Error('Access denied to patient record');
    }
    
    // Get current patient data for audit trail
    const currentPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!currentPatient) {
      throw new Error('Patient not found');
    }
    
    // Decrypt current data for comparison
    const currentDecrypted = decryptPatientData(currentPatient);
    
    // Prepare update data with encryption
    const processedUpdate = {};
    
    // Encrypt sensitive fields if they're being updated
    const sensitiveFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'city', 'state', 'zipCode', 'medicalRecordNumber',
      'insuranceInfo', 'emergencyContact'
    ];
    
    sensitiveFields.forEach(field => {
      if (updateData[field] !== undefined) {
        const encryptedField = `encrypted${field.charAt(0).toUpperCase() + field.slice(1)}`;
        processedUpdate[encryptedField] = updateData[field] ? 
          encryptPatientData({ [field]: updateData[field] })[encryptedField] : null;
      }
    });
    
    // Handle non-sensitive fields
    const nonSensitiveFields = ['dateOfBirth', 'gender', 'status'];
    nonSensitiveFields.forEach(field => {
      if (updateData[field] !== undefined) {
        processedUpdate[field] = updateData[field];
      }
    });
    
    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...processedUpdate,
        updatedAt: new Date()
      }
    });
    
    // Log PHI update
    await logPHIAccess({
      userId: updatedById,
      patientId: patientId,
      action: 'UPDATE',
      purpose: 'treatment',
      req
    });
    
    // Also log detailed changes
    await logUserAction({
      userId: updatedById,
      action: 'PATIENT_UPDATE',
      resource: 'PATIENT',
      resourceId: patientId,
      patientId: patientId,
      oldValues: {
        // Only log non-PHI fields for audit
        status: currentPatient.status,
        dateOfBirth: currentPatient.dateOfBirth,
        gender: currentPatient.gender
      },
      newValues: {
        status: updatedPatient.status,
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: updatedPatient.gender
      },
      agencyId: currentPatient.agencyId,
      req
    });
    
    // Return decrypted patient data
    return decryptPatientData(updatedPatient);
    
  } catch (error) {
    throw new Error(`Failed to update patient: ${error.message}`);
  }
}

/**
 * Search patients with encrypted field support
 */
export async function searchPatients({
  agencyId,
  query = '',
  status = 'ACTIVE',
  providerId = null,
  page = 1,
  limit = 20
}, requestingUserId, req = null) {
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      agencyId,
      deletedAt: null,
      status
    };
    
    // If searching by provider, include assignment filter
    if (providerId) {
      where.assignments = {
        some: {
          providerId,
          unassignedAt: null
        }
      };
    } else {
      // Check if user has agency-wide access or only assigned patients
      const hasAgencyAccess = await checkAgencyAccess(requestingUserId, agencyId);
      if (!hasAgencyAccess) {
        where.assignments = {
          some: {
            providerId: requestingUserId,
            unassignedAt: null
          }
        };
      }
    }
    
    // For encrypted search, we need to get all records and filter after decryption
    // In a production system, you'd implement encrypted search indexes
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          assignments: {
            where: { unassignedAt: null },
            include: {
              provider: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);
    
    // Decrypt and filter by search query if provided
    let filteredPatients = patients;
    if (query) {
      filteredPatients = patients.filter(patient => {
        try {
          const decrypted = decryptPatientData(patient);
          const searchTarget = `${decrypted.firstName} ${decrypted.lastName} ${decrypted.patientId}`.toLowerCase();
          return searchTarget.includes(query.toLowerCase());
        } catch (error) {
          return false; // Skip patients that can't be decrypted
        }
      });
    }
    
    // Log search
    await logUserAction({
      userId: requestingUserId,
      action: 'PATIENT_SEARCH',
      resource: 'PATIENT',
      agencyId,
      details: {
        query,
        status,
        providerId,
        page,
        limit,
        resultCount: filteredPatients.length
      },
      req
    });
    
    // Decrypt patient data for response
    const decryptedPatients = filteredPatients.map(patient => {
      try {
        const decrypted = decryptPatientData(patient);
        // Return limited fields for list view
        return {
          id: decrypted.id,
          patientId: decrypted.patientId,
          firstName: decrypted.firstName,
          lastName: decrypted.lastName,
          dateOfBirth: decrypted.dateOfBirth,
          gender: decrypted.gender,
          status: decrypted.status,
          createdAt: decrypted.createdAt,
          assignments: decrypted.assignments
        };
      } catch (error) {
        return {
          id: patient.id,
          patientId: patient.patientId,
          firstName: '[ENCRYPTED]',
          lastName: '[ENCRYPTED]',
          status: patient.status,
          error: 'Decryption failed'
        };
      }
    });
    
    return {
      patients: decryptedPatients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to search patients: ${error.message}`);
  }
}

/**
 * Assign patient to provider
 */
export async function assignPatientToProvider(patientId, providerId, assignedById, role = 'secondary', req = null) {
  try {
    // Check if assigner has access to patient
    const hasAccess = await checkPatientAccess(patientId, assignedById);
    if (!hasAccess) {
      throw new Error('Access denied to patient record');
    }
    
    // Check if assignment already exists
    const existingAssignment = await prisma.patientAssignment.findUnique({
      where: {
        patientId_providerId: {
          patientId,
          providerId
        }
      }
    });
    
    if (existingAssignment && !existingAssignment.unassignedAt) {
      throw new Error('Provider is already assigned to this patient');
    }
    
    // Create or reactivate assignment
    const assignment = await prisma.patientAssignment.upsert({
      where: {
        patientId_providerId: {
          patientId,
          providerId
        }
      },
      update: {
        role,
        assignedAt: new Date(),
        unassignedAt: null
      },
      create: {
        patientId,
        providerId,
        role,
        assignedAt: new Date()
      },
      include: {
        provider: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        patient: {
          select: {
            patientId: true,
            agencyId: true
          }
        }
      }
    });
    
    // Log assignment
    await logUserAction({
      userId: assignedById,
      action: 'PATIENT_ASSIGN',
      resource: 'PATIENT_ASSIGNMENT',
      resourceId: assignment.id,
      patientId,
      agencyId: assignment.patient.agencyId,
      details: {
        providerId,
        providerName: `${assignment.provider.firstName} ${assignment.provider.lastName}`,
        role
      },
      req
    });
    
    return assignment;
    
  } catch (error) {
    throw new Error(`Failed to assign patient: ${error.message}`);
  }
}

/**
 * Unassign patient from provider
 */
export async function unassignPatientFromProvider(patientId, providerId, unassignedById, req = null) {
  try {
    // Check access
    const hasAccess = await checkPatientAccess(patientId, unassignedById);
    if (!hasAccess) {
      throw new Error('Access denied to patient record');
    }
    
    // Find assignment
    const assignment = await prisma.patientAssignment.findUnique({
      where: {
        patientId_providerId: {
          patientId,
          providerId
        }
      },
      include: {
        patient: {
          select: {
            patientId: true,
            agencyId: true
          }
        }
      }
    });
    
    if (!assignment || assignment.unassignedAt) {
      throw new Error('Assignment not found or already inactive');
    }
    
    // Cannot unassign primary provider if there are no other providers
    if (assignment.role === 'primary') {
      const otherAssignments = await prisma.patientAssignment.count({
        where: {
          patientId,
          providerId: { not: providerId },
          unassignedAt: null
        }
      });
      
      if (otherAssignments === 0) {
        throw new Error('Cannot unassign primary provider without assigning another provider first');
      }
    }
    
    // Update assignment
    const updatedAssignment = await prisma.patientAssignment.update({
      where: { id: assignment.id },
      data: { unassignedAt: new Date() }
    });
    
    // Log unassignment
    await logUserAction({
      userId: unassignedById,
      action: 'PATIENT_UNASSIGN',
      resource: 'PATIENT_ASSIGNMENT',
      resourceId: assignment.id,
      patientId,
      agencyId: assignment.patient.agencyId,
      details: {
        providerId,
        role: assignment.role
      },
      req
    });
    
    return updatedAssignment;
    
  } catch (error) {
    throw new Error(`Failed to unassign patient: ${error.message}`);
  }
}

/**
 * Soft delete patient (HIPAA compliance)
 */
export async function deletePatient(patientId, deletedById, req = null) {
  try {
    // Check access
    const hasAccess = await checkPatientAccess(patientId, deletedById);
    if (!hasAccess) {
      throw new Error('Access denied to patient record');
    }
    
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Soft delete patient
    const deletedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Log deletion
    await logPHIAccess({
      userId: deletedById,
      patientId: patientId,
      action: 'DELETE',
      purpose: 'administrative',
      req
    });
    
    return { success: true };
    
  } catch (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }
}

/**
 * Check if user has access to patient
 */
async function checkPatientAccess(patientId, userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, agencyId: true }
    });
    
    if (!user) return false;
    
    // Super admins have access to all patients
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Agency admins have access to all patients in their agency
    if (user.role === 'AGENCY_ADMIN') {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { agencyId: true }
      });
      
      return patient && patient.agencyId === user.agencyId;
    }
    
    // Providers have access to assigned patients
    const assignment = await prisma.patientAssignment.findFirst({
      where: {
        patientId,
        providerId: userId,
        unassignedAt: null
      }
    });
    
    return !!assignment;
    
  } catch (error) {
    return false;
  }
}

/**
 * Check if user has agency-wide access
 */
async function checkAgencyAccess(userId, agencyId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, agencyId: true }
    });
    
    if (!user) return false;
    
    return (user.role === 'SUPER_ADMIN') || 
           (user.role === 'AGENCY_ADMIN' && user.agencyId === agencyId);
           
  } catch (error) {
    return false;
  }
}

export default {
  createPatient,
  getPatientById,
  updatePatient,
  searchPatients,
  assignPatientToProvider,
  unassignPatientFromProvider,
  deletePatient
};