import { v4 as uuidv4 } from 'uuid';
import prisma, { withTransaction } from '../lib/database.js';
import { logUserAction, logPHIAccess } from '../lib/audit.js';
import { encryptDocument, decryptDocument, createHash } from '../lib/encryption.js';

/**
 * Document management service with version control and HIPAA compliance
 */

/**
 * Create a new document
 */
export async function createDocument({
  title,
  content,
  type,
  category = null,
  templateId = null,
  tags = [],
  patientId = null,
  agencyId,
  createdById,
  status = 'DRAFT',
  req = null
}) {
  try {
    return await withTransaction(async (tx) => {
      // Encrypt document content
      const { encryptedContent, contentHash } = encryptDocument(content);
      
      // Create document
      const document = await tx.document.create({
        data: {
          title,
          type,
          category,
          encryptedContent,
          contentHash,
          templateId,
          tags,
          status,
          patientId,
          agencyId,
          createdById,
          version: 1
        },
        include: {
          patient: {
            select: {
              patientId: true
            }
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Create initial version record
      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          encryptedContent,
          contentHash,
          changeDescription: 'Initial version',
          createdBy: createdById
        }
      });
      
      // Log document creation
      if (patientId) {
        await logPHIAccess({
          userId: createdById,
          patientId,
          action: 'CREATE',
          fieldAccessed: 'document',
          purpose: 'treatment',
          req
        });
      }
      
      await logUserAction({
        userId: createdById,
        action: 'DOCUMENT_CREATE',
        resource: 'DOCUMENT',
        resourceId: document.id,
        patientId,
        agencyId,
        documentId: document.id,
        details: {
          title,
          type,
          status,
          hasPatientData: !!patientId
        },
        req
      });
      
      return {
        ...document,
        content: content // Return decrypted content
      };
    });
    
  } catch (error) {
    throw new Error(`Failed to create document: ${error.message}`);
  }
}

/**
 * Get document by ID with decryption
 */
export async function getDocumentById(documentId, requestingUserId, req = null) {
  try {
    // Check access
    const hasAccess = await checkDocumentAccess(documentId, requestingUserId);
    if (!hasAccess) {
      throw new Error('Access denied to document');
    }
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true
          }
        },
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
            lastName: true
          }
        },
        versions: {
          select: {
            id: true,
            version: true,
            changeDescription: true,
            createdAt: true,
            createdBy: true
          },
          orderBy: { version: 'desc' },
          take: 10
        },
        signatures: {
          select: {
            id: true,
            signerName: true,
            signerRole: true,
            signedAt: true
          }
        }
      }
    });
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Decrypt content and verify integrity
    let decryptedContent;
    try {
      decryptedContent = decryptDocument(document.encryptedContent, document.contentHash);
    } catch (error) {
      throw new Error('Document integrity check failed - content may have been tampered with');
    }
    
    // Log document access
    if (document.patientId) {
      await logPHIAccess({
        userId: requestingUserId,
        patientId: document.patientId,
        action: 'READ',
        fieldAccessed: 'document',
        purpose: 'treatment',
        req
      });
    }
    
    await logUserAction({
      userId: requestingUserId,
      action: 'DOCUMENT_READ',
      resource: 'DOCUMENT',
      resourceId: documentId,
      patientId: document.patientId,
      agencyId: document.agencyId,
      documentId,
      req
    });
    
    return {
      ...document,
      content: decryptedContent
    };
    
  } catch (error) {
    throw new Error(`Failed to get document: ${error.message}`);
  }
}

/**
 * Update document with version control
 */
export async function updateDocument(documentId, updateData, updatedById, changeDescription = null, req = null) {
  try {
    return await withTransaction(async (tx) => {
      // Check access
      const hasAccess = await checkDocumentAccess(documentId, updatedById);
      if (!hasAccess) {
        throw new Error('Access denied to document');
      }
      
      // Get current document
      const currentDocument = await tx.document.findUnique({
        where: { id: documentId }
      });
      
      if (!currentDocument) {
        throw new Error('Document not found');
      }
      
      // Prepare update data
      const processedUpdate = { ...updateData };
      let newVersion = currentDocument.version;
      let newContentHash = currentDocument.contentHash;
      
      // If content is being updated, encrypt it and create new version
      if (updateData.content) {
        const { encryptedContent, contentHash } = encryptDocument(updateData.content);
        processedUpdate.encryptedContent = encryptedContent;
        processedUpdate.contentHash = contentHash;
        newVersion = currentDocument.version + 1;
        newContentHash = contentHash;
        
        // Create version record
        await tx.documentVersion.create({
          data: {
            documentId,
            version: newVersion,
            encryptedContent,
            contentHash,
            changeDescription: changeDescription || 'Content updated',
            createdBy: updatedById
          }
        });
        
        delete processedUpdate.content; // Remove from update data
      }
      
      // Update document
      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: {
          ...processedUpdate,
          version: newVersion,
          updatedAt: new Date()
        },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true
            }
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Log update
      if (updatedDocument.patientId) {
        await logPHIAccess({
          userId: updatedById,
          patientId: updatedDocument.patientId,
          action: 'UPDATE',
          fieldAccessed: 'document',
          purpose: 'treatment',
          req
        });
      }
      
      await logUserAction({
        userId: updatedById,
        action: 'DOCUMENT_UPDATE',
        resource: 'DOCUMENT',
        resourceId: documentId,
        patientId: updatedDocument.patientId,
        agencyId: updatedDocument.agencyId,
        documentId,
        oldValues: {
          title: currentDocument.title,
          status: currentDocument.status,
          version: currentDocument.version
        },
        newValues: {
          title: updatedDocument.title,
          status: updatedDocument.status,
          version: updatedDocument.version
        },
        details: {
          changeDescription,
          contentUpdated: !!updateData.content
        },
        req
      });
      
      return {
        ...updatedDocument,
        content: updateData.content || decryptDocument(updatedDocument.encryptedContent, newContentHash)
      };
    });
    
  } catch (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }
}

/**
 * Get document version history
 */
export async function getDocumentVersions(documentId, requestingUserId, req = null) {
  try {
    // Check access
    const hasAccess = await checkDocumentAccess(documentId, requestingUserId);
    if (!hasAccess) {
      throw new Error('Access denied to document');
    }
    
    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        changeDescription: true,
        createdAt: true,
        createdBy: true
      }
    });
    
    // Get creator names
    const creatorIds = [...new Set(versions.map(v => v.createdBy))];
    const creators = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });
    
    const creatorMap = creators.reduce((acc, creator) => {
      acc[creator.id] = `${creator.firstName} ${creator.lastName}`;
      return acc;
    }, {});
    
    // Log version history access
    await logUserAction({
      userId: requestingUserId,
      action: 'DOCUMENT_VERSION_HISTORY',
      resource: 'DOCUMENT',
      resourceId: documentId,
      documentId,
      details: {
        versionCount: versions.length
      },
      req
    });
    
    return versions.map(version => ({
      ...version,
      createdByName: creatorMap[version.createdBy] || 'Unknown'
    }));
    
  } catch (error) {
    throw new Error(`Failed to get document versions: ${error.message}`);
  }
}

/**
 * Get specific version of document
 */
export async function getDocumentVersion(documentId, version, requestingUserId, req = null) {
  try {
    // Check access
    const hasAccess = await checkDocumentAccess(documentId, requestingUserId);
    if (!hasAccess) {
      throw new Error('Access denied to document');
    }
    
    const documentVersion = await prisma.documentVersion.findUnique({
      where: {
        documentId_version: {
          documentId,
          version
        }
      },
      include: {
        document: {
          select: {
            title: true,
            type: true,
            patientId: true,
            agencyId: true
          }
        }
      }
    });
    
    if (!documentVersion) {
      throw new Error('Document version not found');
    }
    
    // Decrypt content
    const decryptedContent = decryptDocument(
      documentVersion.encryptedContent, 
      documentVersion.contentHash
    );
    
    // Log version access
    if (documentVersion.document.patientId) {
      await logPHIAccess({
        userId: requestingUserId,
        patientId: documentVersion.document.patientId,
        action: 'READ',
        fieldAccessed: 'document_version',
        purpose: 'treatment',
        req
      });
    }
    
    await logUserAction({
      userId: requestingUserId,
      action: 'DOCUMENT_VERSION_READ',
      resource: 'DOCUMENT_VERSION',
      resourceId: documentVersion.id,
      patientId: documentVersion.document.patientId,
      agencyId: documentVersion.document.agencyId,
      documentId,
      details: {
        version
      },
      req
    });
    
    return {
      ...documentVersion,
      content: decryptedContent
    };
    
  } catch (error) {
    throw new Error(`Failed to get document version: ${error.message}`);
  }
}

/**
 * Search documents
 */
export async function searchDocuments({
  agencyId,
  patientId = null,
  type = null,
  status = null,
  query = '',
  tags = [],
  createdById = null,
  startDate = null,
  endDate = null,
  page = 1,
  limit = 20
}, requestingUserId, req = null) {
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      agencyId,
      deletedAt: null
    };
    
    if (patientId) where.patientId = patientId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (createdById) where.createdById = createdById;
    if (tags.length > 0) where.tags = { hasSome: tags };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    // Filter by user access permissions
    if (patientId) {
      const hasPatientAccess = await checkPatientAccess(patientId, requestingUserId);
      if (!hasPatientAccess) {
        throw new Error('Access denied to patient documents');
      }
    } else {
      // If no specific patient, filter by user's accessible patients
      const userRole = await getUserRole(requestingUserId);
      if (userRole !== 'SUPER_ADMIN' && userRole !== 'AGENCY_ADMIN') {
        // Get user's assigned patients
        const assignments = await prisma.patientAssignment.findMany({
          where: {
            providerId: requestingUserId,
            unassignedAt: null
          },
          select: { patientId: true }
        });
        
        const accessiblePatientIds = assignments.map(a => a.patientId);
        where.OR = [
          { patientId: null }, // Documents without patient association
          { patientId: { in: accessiblePatientIds } }
        ];
      }
    }
    
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          type: true,
          category: true,
          status: true,
          version: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              patientId: true
            }
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);
    
    // Filter by title/content search if query provided
    // Note: In production, you'd implement proper search indexing
    let filteredDocuments = documents;
    if (query) {
      filteredDocuments = documents.filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Log search
    await logUserAction({
      userId: requestingUserId,
      action: 'DOCUMENT_SEARCH',
      resource: 'DOCUMENT',
      patientId,
      agencyId,
      details: {
        query,
        type,
        status,
        tags,
        page,
        limit,
        resultCount: filteredDocuments.length
      },
      req
    });
    
    return {
      documents: filteredDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to search documents: ${error.message}`);
  }
}

/**
 * Add digital signature to document
 */
export async function signDocument(documentId, signerData, signedById, req = null) {
  try {
    return await withTransaction(async (tx) => {
      // Check access
      const hasAccess = await checkDocumentAccess(documentId, signedById);
      if (!hasAccess) {
        throw new Error('Access denied to document');
      }
      
      const document = await tx.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          title: true,
          encryptedContent: true,
          contentHash: true,
          patientId: true,
          agencyId: true
        }
      });
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Create cryptographic signature hash
      const signatureData = `${documentId}:${document.contentHash}:${signerData.signerName}:${new Date().toISOString()}`;
      const signatureHash = createHash(signatureData);
      
      // Create signature record
      const signature = await tx.documentSignature.create({
        data: {
          documentId,
          signerName: signerData.signerName,
          signerEmail: signerData.signerEmail,
          signerRole: signerData.signerRole,
          signatureHash,
          ipAddress: req?.ip,
          userAgent: req?.get('User-Agent')
        }
      });
      
      // Update document status if needed
      if (document.status === 'APPROVED' || document.status === 'IN_REVIEW') {
        await tx.document.update({
          where: { id: documentId },
          data: { status: 'PUBLISHED' }
        });
      }
      
      // Log signature
      if (document.patientId) {
        await logPHIAccess({
          userId: signedById,
          patientId: document.patientId,
          action: 'UPDATE',
          fieldAccessed: 'document_signature',
          purpose: 'treatment',
          req
        });
      }
      
      await logUserAction({
        userId: signedById,
        action: 'DOCUMENT_SIGN',
        resource: 'DOCUMENT',
        resourceId: documentId,
        patientId: document.patientId,
        agencyId: document.agencyId,
        documentId,
        details: {
          signerName: signerData.signerName,
          signerRole: signerData.signerRole,
          signatureHash
        },
        req
      });
      
      return signature;
    });
    
  } catch (error) {
    throw new Error(`Failed to sign document: ${error.message}`);
  }
}

/**
 * Soft delete document
 */
export async function deleteDocument(documentId, deletedById, req = null) {
  try {
    // Check access
    const hasAccess = await checkDocumentAccess(documentId, deletedById);
    if (!hasAccess) {
      throw new Error('Access denied to document');
    }
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        patientId: true,
        agencyId: true,
        status: true
      }
    });
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Cannot delete published documents with signatures
    const signatureCount = await prisma.documentSignature.count({
      where: { documentId }
    });
    
    if (document.status === 'PUBLISHED' && signatureCount > 0) {
      throw new Error('Cannot delete published document with signatures');
    }
    
    // Soft delete
    const deletedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Log deletion
    if (document.patientId) {
      await logPHIAccess({
        userId: deletedById,
        patientId: document.patientId,
        action: 'DELETE',
        fieldAccessed: 'document',
        purpose: 'administrative',
        req
      });
    }
    
    await logUserAction({
      userId: deletedById,
      action: 'DOCUMENT_DELETE',
      resource: 'DOCUMENT',
      resourceId: documentId,
      patientId: document.patientId,
      agencyId: document.agencyId,
      documentId,
      oldValues: { status: document.status },
      newValues: { status: 'ARCHIVED', deletedAt: deletedDocument.deletedAt },
      req
    });
    
    return { success: true };
    
  } catch (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Check if user has access to document
 */
async function checkDocumentAccess(documentId, userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, agencyId: true }
    });
    
    if (!user) return false;
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { 
        agencyId: true, 
        patientId: true,
        createdById: true
      }
    });
    
    if (!document) return false;
    
    // Super admins have access to all documents
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Users can access their own documents
    if (document.createdById === userId) return true;
    
    // Agency admins have access to all documents in their agency
    if (user.role === 'AGENCY_ADMIN' && document.agencyId === user.agencyId) return true;
    
    // If document has patient association, check patient access
    if (document.patientId) {
      return await checkPatientAccess(document.patientId, userId);
    }
    
    // For agency documents without patient association
    return document.agencyId === user.agencyId;
    
  } catch (error) {
    return false;
  }
}

/**
 * Check patient access (shared with patient service)
 */
async function checkPatientAccess(patientId, userId) {
  try {
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
 * Get user role
 */
async function getUserRole(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role;
  } catch (error) {
    return null;
  }
}

export default {
  createDocument,
  getDocumentById,
  updateDocument,
  getDocumentVersions,
  getDocumentVersion,
  searchDocuments,
  signDocument,
  deleteDocument
};