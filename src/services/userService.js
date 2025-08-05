import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import prisma from '../lib/database.js';
import { logUserAction, logAuthEvent } from '../lib/audit.js';
import { encrypt, decrypt, generateSecureToken } from '../lib/encryption.js';

/**
 * User management service with HIPAA compliance
 */

const SALT_ROUNDS = 12;

/**
 * Create a new user account
 */
export async function createUser({
  email,
  password,
  firstName,
  lastName,
  phone = null,
  role = 'PROVIDER',
  licenseNumber = null,
  licenseState = null,
  specialties = [],
  agencyId = null,
  createdBy = null,
  req = null
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate email verification token
    const emailVerifiedToken = generateSecureToken();
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        licenseNumber,
        licenseState,
        specialties,
        agencyId,
        emailVerifiedToken,
        status: 'PENDING_VERIFICATION'
      }
    });
    
    // Log user creation
    await logUserAction({
      userId: createdBy,
      userEmail: createdBy ? null : email, // Use email if self-registration
      action: 'USER_CREATE',
      resource: 'USER',
      resourceId: user.id,
      agencyId,
      details: {
        newUserEmail: email,
        newUserRole: role,
        selfRegistration: !createdBy
      },
      req
    });
    
    // Return user without sensitive data
    const { hashedPassword: _, emailVerifiedToken: __, ...safeUser } = user;
    return safeUser;
    
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Authenticate user login
 */
export async function authenticateUser(email, password, req = null) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { agency: true }
    });
    
    if (!user) {
      await logAuthEvent({
        userEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'User not found' },
        req
      });
      throw new Error('Invalid credentials');
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE') {
      await logAuthEvent({
        userId: user.id,
        userEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'Account not active', status: user.status },
        req
      });
      throw new Error('Account is not active');
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isValidPassword) {
      await logAuthEvent({
        userId: user.id,
        userEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'Invalid password' },
        req
      });
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Log successful login
    await logAuthEvent({
      userId: user.id,
      userEmail: email,
      action: 'LOGIN',
      details: { agencyId: user.agencyId },
      req
    });
    
    // Return user without sensitive data
    const { hashedPassword: _, emailVerifiedToken: __, passwordResetToken: ___, ...safeUser } = user;
    return safeUser;
    
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Update user profile
 */
export async function updateUser(userId, updateData, updatedBy = null, req = null) {
  try {
    // Get current user data for audit trail
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Prepare update data
    const processedUpdate = { ...updateData };
    
    // Hash password if provided
    if (updateData.password) {
      processedUpdate.hashedPassword = await bcrypt.hash(updateData.password, SALT_ROUNDS);
      delete processedUpdate.password;
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...processedUpdate,
        updatedAt: new Date()
      }
    });
    
    // Log update
    await logUserAction({
      userId: updatedBy || userId,
      userEmail: updatedBy ? null : currentUser.email,
      action: 'USER_UPDATE',
      resource: 'USER',
      resourceId: userId,
      oldValues: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone,
        role: currentUser.role,
        status: currentUser.status
      },
      newValues: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status
      },
      agencyId: currentUser.agencyId,
      req
    });
    
    // Return user without sensitive data
    const { hashedPassword: _, emailVerifiedToken: __, passwordResetToken: ___, ...safeUser } = updatedUser;
    return safeUser;
    
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

/**
 * Get user by ID with role-based access control
 */
export async function getUserById(userId, requestingUserId = null, req = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
        assignedPatients: {
          include: {
            patient: {
              select: {
                id: true,
                patientId: true,
                status: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Log access
    if (requestingUserId && requestingUserId !== userId) {
      await logUserAction({
        userId: requestingUserId,
        action: 'USER_READ',
        resource: 'USER',
        resourceId: userId,
        agencyId: user.agencyId,
        req
      });
    }
    
    // Return user without sensitive data
    const { hashedPassword: _, emailVerifiedToken: __, passwordResetToken: ___, twoFactorSecret: ____, ...safeUser } = user;
    return safeUser;
    
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Setup two-factor authentication
 */
export async function setupTwoFactor(userId, req = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DocuHero (${user.email})`,
      issuer: 'DocuHero'
    });
    
    // Store encrypted secret
    const encryptedSecret = encrypt(secret.base32);
    
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret }
    });
    
    // Log 2FA setup
    await logUserAction({
      userId,
      userEmail: user.email,
      action: 'USER_2FA_SETUP',
      resource: 'USER_SECURITY',
      resourceId: userId,
      agencyId: user.agencyId,
      req
    });
    
    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url
    };
    
  } catch (error) {
    throw new Error(`Failed to setup 2FA: ${error.message}`);
  }
}

/**
 * Verify two-factor authentication token
 */
export async function verifyTwoFactor(userId, token, req = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not set up for this user');
    }
    
    // Decrypt secret
    const secret = decrypt(user.twoFactorSecret);
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
    
    if (verified) {
      // Enable 2FA if this is the first verification
      if (!user.twoFactorEnabled) {
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorEnabled: true }
        });
        
        await logUserAction({
          userId,
          userEmail: user.email,
          action: 'USER_2FA_ENABLED',
          resource: 'USER_SECURITY',
          resourceId: userId,
          agencyId: user.agencyId,
          req
        });
      }
      
      return { verified: true };
    } else {
      await logUserAction({
        userId,
        userEmail: user.email,
        action: 'USER_2FA_FAILED',
        resource: 'USER_SECURITY',
        resourceId: userId,
        agencyId: user.agencyId,
        details: { reason: 'Invalid token' },
        req
      });
      
      return { verified: false };
    }
    
  } catch (error) {
    throw new Error(`2FA verification failed: ${error.message}`);
  }
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email, req = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Don't reveal that user doesn't exist
      return { success: true };
    }
    
    const resetToken = generateSecureToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expires
      }
    });
    
    // Log password reset request
    await logAuthEvent({
      userId: user.id,
      userEmail: email,
      action: 'PASSWORD_RESET_REQUEST',
      details: { expiresAt: expires.toISOString() },
      req
    });
    
    return { success: true, resetToken };
    
  } catch (error) {
    throw new Error(`Failed to create password reset token: ${error.message}`);
  }
}

/**
 * Reset password using token
 */
export async function resetPassword(token, newPassword, req = null) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    });
    
    // Log password reset
    await logAuthEvent({
      userId: user.id,
      userEmail: user.email,
      action: 'PASSWORD_RESET_COMPLETE',
      req
    });
    
    return { success: true };
    
  } catch (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

/**
 * Soft delete user (HIPAA requires data retention)
 */
export async function deleteUser(userId, deletedBy, req = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Soft delete
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Log deletion
    await logUserAction({
      userId: deletedBy,
      action: 'USER_DELETE',
      resource: 'USER',
      resourceId: userId,
      oldValues: { status: user.status },
      newValues: { status: 'INACTIVE', deletedAt: deletedUser.deletedAt },
      agencyId: user.agencyId,
      req
    });
    
    return { success: true };
    
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Get users by agency with pagination
 */
export async function getUsersByAgency(agencyId, { page = 1, limit = 20, role = null, status = 'ACTIVE' } = {}, requestingUserId = null, req = null) {
  try {
    const skip = (page - 1) * limit;
    
    const where = {
      agencyId,
      deletedAt: null
    };
    
    if (role) where.role = role;
    if (status) where.status = status;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          licenseNumber: true,
          licenseState: true,
          specialties: true,
          createdAt: true,
          lastLoginAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    // Log access
    if (requestingUserId) {
      await logUserAction({
        userId: requestingUserId,
        action: 'USER_LIST',
        resource: 'USER',
        agencyId,
        details: { page, limit, role, status, resultCount: users.length },
        req
      });
    }
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
}

export default {
  createUser,
  authenticateUser,
  updateUser,
  getUserById,
  setupTwoFactor,
  verifyTwoFactor,
  createPasswordResetToken,
  resetPassword,
  deleteUser,
  getUsersByAgency
};