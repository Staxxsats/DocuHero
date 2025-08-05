// Backend Authentication Service
// This would be implemented in Node.js/Express or similar backend framework

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();

// Mock database - replace with actual database
const users = new Map();
const agencies = new Map();
const inviteTokens = new Map();
const auditLogs = [];

// JWT Secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Encryption key for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Helper Functions
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateJWT = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      agencyId: user.agencyId 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

const verifyJWT = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Encryption helpers for HIPAA compliance
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedData) => {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipher('aes-256-gcm', ENCRYPTION_KEY);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Audit logging
const logAuditEvent = (userId, action, resource, success, details = {}) => {
  const auditLog = {
    id: crypto.randomUUID(),
    userId,
    action,
    resource,
    timestamp: new Date(),
    success,
    details,
    ipAddress: '127.0.0.1', // Would get from request
    userAgent: 'User-Agent' // Would get from request headers
  };
  
  auditLogs.push(auditLog);
  
  // In production, store in secure audit database
  console.log('Audit Log:', auditLog);
};

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    logAuditEvent(null, 'TOKEN_VALIDATION_FAILED', 'auth', false, { error: error.message });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Routes

// Agency Signup
router.post('/signup', async (req, res) => {
  try {
    const { 
      accountType, 
      agency, 
      states, 
      adminUser, 
      securitySettings, 
      complianceRequirements 
    } = req.body;

    // Validate required fields
    if (!agency.businessName || !agency.npi || !adminUser.email || !adminUser.password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = Array.from(users.values()).find(u => u.email === adminUser.email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create agency
    const agencyId = crypto.randomUUID();
    const newAgency = {
      id: agencyId,
      businessName: agency.businessName,
      npi: agency.npi,
      ein: agency.ein,
      states,
      adminUserId: null, // Will be set after user creation
      isActive: true,
      complianceSettings: {
        requiredFields: complianceRequirements.allRequiredFields,
        documentationTypes: complianceRequirements.allDocumentationTypes,
        signatureRequirements: complianceRequirements.allSignatureRequirements,
        auditSettings: {
          logAllAccess: securitySettings.auditLogging,
          retentionPeriodDays: 2555, // 7 years for HIPAA
          requireSupervisorReview: securitySettings.requireSupervisorReview,
          encryptionLevel: securitySettings.encryptionLevel
        }
      },
      createdAt: new Date()
    };

    // Create admin user
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(adminUser.password);
    
    const newUser = {
      id: userId,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: 'agency_admin',
      agencyId,
      isActive: true,
      twoFactorEnabled: securitySettings.twoFactorEnabled,
      twoFactorSecret: null, // Will be set during 2FA setup
      createdAt: new Date(),
      passwordHash: hashedPassword
    };

    // Store in database (mock)
    agencies.set(agencyId, newAgency);
    users.set(userId, newUser);
    
    // Update agency with admin user ID
    newAgency.adminUserId = userId;

    // Generate JWT
    const token = generateJWT(newUser);

    // Log audit event
    logAuditEvent(userId, 'AGENCY_SIGNUP', `agency:${agencyId}`, true, {
      businessName: agency.businessName,
      states
    });

    // Return response (exclude sensitive data)
    const { passwordHash, twoFactorSecret, ...safeUser } = newUser;
    
    res.status(201).json({
      token,
      user: safeUser,
      agency: newAgency,
      requiresTwoFactorSetup: securitySettings.twoFactorEnabled && !newUser.twoFactorSecret
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      logAuditEvent(null, 'LOGIN_FAILED', 'auth', false, { email, reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      logAuditEvent(user.id, 'LOGIN_FAILED', 'auth', false, { reason: 'invalid_password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorToken) {
        return res.status(200).json({ requiresTwoFactor: true });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });

      if (!verified) {
        logAuditEvent(user.id, 'LOGIN_FAILED', 'auth', false, { reason: 'invalid_2fa' });
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }

    // Update last login
    user.lastLogin = new Date();

    // Get agency data
    const agency = agencies.get(user.agencyId);

    // Generate JWT
    const token = generateJWT(user);

    // Log successful login
    logAuditEvent(user.id, 'LOGIN_SUCCESS', 'auth', true);

    // Return response (exclude sensitive data)
    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    
    res.json({
      token,
      user: safeUser,
      agency
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token validation
router.get('/validate', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.userId);
    const agency = agencies.get(user.agencyId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    
    res.json({
      user: safeUser,
      agency
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticateToken, async (req, res) => {
  try {
    const user = users.get(req.user.userId);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DocuHero (${user.email})`,
      issuer: 'DocuHero'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (would be confirmed after verification)
    user.tempTwoFactorSecret = secret.base32;

    logAuditEvent(user.id, '2FA_SETUP_INITIATED', 'auth', true);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', authenticateToken, (req, res) => {
  try {
    const { token } = req.body;
    const user = users.get(req.user.userId);

    if (!user.tempTwoFactorSecret) {
      return res.status(400).json({ error: '2FA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.tempTwoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      logAuditEvent(user.id, '2FA_VERIFICATION_FAILED', 'auth', false);
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.twoFactorEnabled = true;
    delete user.tempTwoFactorSecret;

    logAuditEvent(user.id, '2FA_ENABLED', 'auth', true);

    res.json({ success: true });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create invite token
router.post('/invite', authenticateToken, (req, res) => {
  try {
    const { email, role, permissions } = req.body;
    const user = users.get(req.user.userId);

    // Verify user has permission to invite
    if (user.role !== 'agency_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Create invite token
    const inviteId = crypto.randomUUID();
    const invite = {
      id: inviteId,
      email,
      role,
      agencyId: user.agencyId,
      createdBy: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      used: false,
      permissions
    };

    inviteTokens.set(inviteId, invite);

    logAuditEvent(user.id, 'INVITE_CREATED', `invite:${inviteId}`, true, { email, role });

    res.json({ invite });

  } catch (error) {
    console.error('Invite creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload with security scanning
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    // In production, implement:
    // 1. File type validation
    // 2. Virus scanning
    // 3. Size limits
    // 4. Encryption before storage
    // 5. Access control

    const user = users.get(req.user.userId);
    const fileId = crypto.randomUUID();

    // Mock file processing
    const fileData = {
      id: fileId,
      originalName: req.body.fileName,
      size: req.body.fileSize,
      type: req.body.fileType,
      uploadedBy: user.id,
      agencyId: user.agencyId,
      encrypted: true,
      uploadedAt: new Date()
    };

    logAuditEvent(user.id, 'FILE_UPLOAD', `file:${fileId}`, true, {
      fileName: fileData.originalName,
      fileSize: fileData.size
    });

    res.json({ fileId, success: true });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit logs (admin only)
router.get('/audit-logs', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.userId);
    
    if (user.role !== 'agency_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Filter logs for user's agency
    const agencyLogs = auditLogs.filter(log => {
      const logUser = users.get(log.userId);
      return logUser && logUser.agencyId === user.agencyId;
    });

    res.json({ logs: agencyLogs });

  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;