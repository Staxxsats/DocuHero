import CryptoJS from 'crypto-js';
import crypto from 'crypto';

/**
 * HIPAA-compliant encryption utilities
 * Uses AES-256-GCM for authenticated encryption
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-256-bit-secret-key-here-change-in-production';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data with AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text with IV and auth tag
 */
export function encrypt(text) {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from('DocuHero-HIPAA', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV and auth tag
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAAD(Buffer.from('DocuHero-HIPAA', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Create SHA-256 hash for integrity verification
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash
 */
export function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify data integrity using SHA-256 hash
 * @param {string} data - Original data
 * @param {string} hash - Expected hash
 * @returns {boolean} - True if hash matches
 */
export function verifyHash(data, hash) {
  const computedHash = createHash(data);
  return computedHash === hash;
}

/**
 * Generate cryptographically secure random string
 * @param {number} length - Length of random string
 * @returns {string} - Random string
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt patient data with additional metadata
 * @param {Object} patientData - Patient data object
 * @returns {Object} - Encrypted patient data
 */
export function encryptPatientData(patientData) {
  const encryptedData = {};
  
  // Fields that should be encrypted
  const sensitiveFields = [
    'firstName', 'lastName', 'email', 'phone', 'address', 
    'city', 'state', 'zipCode', 'medicalRecordNumber', 
    'insuranceInfo', 'emergencyContact'
  ];
  
  // Encrypt sensitive fields
  sensitiveFields.forEach(field => {
    if (patientData[field]) {
      encryptedData[`encrypted${field.charAt(0).toUpperCase() + field.slice(1)}`] = encrypt(patientData[field]);
    }
  });
  
  // Copy non-sensitive fields as-is
  const nonSensitiveFields = ['patientId', 'dateOfBirth', 'gender', 'status'];
  nonSensitiveFields.forEach(field => {
    if (patientData[field] !== undefined) {
      encryptedData[field] = patientData[field];
    }
  });
  
  return encryptedData;
}

/**
 * Decrypt patient data for display
 * @param {Object} encryptedPatientData - Encrypted patient data
 * @returns {Object} - Decrypted patient data
 */
export function decryptPatientData(encryptedPatientData) {
  const decryptedData = { ...encryptedPatientData };
  
  // Fields that should be decrypted
  const encryptedFields = [
    'encryptedFirstName', 'encryptedLastName', 'encryptedEmail', 
    'encryptedPhone', 'encryptedAddress', 'encryptedCity', 
    'encryptedState', 'encryptedZipCode', 'encryptedMedicalRecordNumber',
    'encryptedInsuranceInfo', 'encryptedEmergencyContact'
  ];
  
  encryptedFields.forEach(field => {
    if (encryptedPatientData[field]) {
      const originalField = field.replace('encrypted', '').toLowerCase();
      const capitalizedField = originalField.charAt(0).toLowerCase() + originalField.slice(1);
      
      try {
        decryptedData[capitalizedField] = decrypt(encryptedPatientData[field]);
        delete decryptedData[field]; // Remove encrypted version
      } catch (error) {
        console.error(`Failed to decrypt ${field}:`, error);
        decryptedData[capitalizedField] = '[ENCRYPTED]';
      }
    }
  });
  
  return decryptedData;
}

/**
 * Encrypt document content with integrity check
 * @param {string} content - Document content
 * @returns {Object} - Encrypted content with hash
 */
export function encryptDocument(content) {
  const encryptedContent = encrypt(content);
  const contentHash = createHash(content);
  
  return {
    encryptedContent,
    contentHash
  };
}

/**
 * Decrypt and verify document content
 * @param {string} encryptedContent - Encrypted content
 * @param {string} expectedHash - Expected content hash
 * @returns {string} - Decrypted content
 * @throws {Error} - If integrity check fails
 */
export function decryptDocument(encryptedContent, expectedHash) {
  const decryptedContent = decrypt(encryptedContent);
  const actualHash = createHash(decryptedContent);
  
  if (actualHash !== expectedHash) {
    throw new Error('Document integrity check failed - content may have been tampered with');
  }
  
  return decryptedContent;
}