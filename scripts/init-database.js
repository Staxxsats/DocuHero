#!/usr/bin/env node

/**
 * Database initialization script for DocuHero
 * Sets up database schema, default policies, and system configuration
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import prisma from '../src/lib/database.js';
import { initializeDefaultPolicies } from '../src/services/retentionService.js';
import { setSystemConfig } from '../src/lib/database.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing DocuHero database...\n');
    
    // 1. Generate and run Prisma migrations
    console.log('📊 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🔄 Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    // 2. Test database connection
    console.log('🔗 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // 3. Initialize system configuration
    console.log('⚙️  Setting up system configuration...');
    await initializeSystemConfig();
    
    // 4. Initialize retention policies
    console.log('📋 Setting up data retention policies...');
    await initializeDefaultPolicies();
    
    // 5. Create super admin user (optional)
    const createSuperAdmin = process.env.CREATE_SUPER_ADMIN === 'true';
    if (createSuperAdmin) {
      console.log('👤 Creating super admin user...');
      await createSuperAdminUser();
    }
    
    // 6. Set up audit logging directories
    console.log('📝 Creating audit log directories...');
    setupLogDirectories();
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with appropriate secrets');
    console.log('2. Configure your database connection');
    console.log('3. Start the development server with: npm run dev');
    
    if (createSuperAdmin) {
      console.log('4. Login with super admin credentials:');
      console.log('   Email: admin@docuhero.com');
      console.log('   Password: ChangeMe123!');
      console.log('   ⚠️  IMPORTANT: Change this password immediately!');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function initializeSystemConfig() {
  const defaultConfigs = [
    {
      key: 'system.version',
      value: '1.0.0',
      description: 'DocuHero system version',
      category: 'system'
    },
    {
      key: 'security.require_2fa',
      value: process.env.REQUIRE_2FA || 'true',
      description: 'Require two-factor authentication for all users',
      category: 'security'
    },
    {
      key: 'security.password_min_length',
      value: '12',
      description: 'Minimum password length requirement',
      category: 'security'
    },
    {
      key: 'security.session_timeout',
      value: '3600', // 1 hour in seconds
      description: 'User session timeout in seconds',
      category: 'security'
    },
    {
      key: 'hipaa.encryption_enabled',
      value: process.env.ENCRYPTION_AT_REST || 'true',
      description: 'Enable encryption at rest for PHI',
      category: 'hipaa'
    },
    {
      key: 'hipaa.audit_logging_enabled',
      value: process.env.ENABLE_AUDIT_LOGGING || 'true',
      description: 'Enable comprehensive audit logging',
      category: 'hipaa'
    },
    {
      key: 'retention.default_period_days',
      value: process.env.AUDIT_LOG_RETENTION_DAYS || '2555',
      description: 'Default data retention period in days (7 years)',
      category: 'retention'
    },
    {
      key: 'email.from_address',
      value: process.env.FROM_EMAIL || 'noreply@docuhero.com',
      description: 'Default from email address',
      category: 'email'
    },
    {
      key: 'file_upload.max_size_mb',
      value: process.env.MAX_FILE_SIZE_MB || '10',
      description: 'Maximum file upload size in MB',
      category: 'upload'
    },
    {
      key: 'compliance.enabled_states',
      value: process.env.DEFAULT_COMPLIANCE_STATES || 'GA,TX,FL,CA,NY',
      description: 'Comma-separated list of enabled compliance states',
      category: 'compliance'
    }
  ];
  
  for (const config of defaultConfigs) {
    await setSystemConfig(config.key, config.value, {
      description: config.description,
      category: config.category,
      updatedBy: 'system'
    });
  }
  
  console.log(`✅ Initialized ${defaultConfigs.length} system configuration entries`);
}

async function createSuperAdminUser() {
  const superAdminExists = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });
  
  if (superAdminExists) {
    console.log('⚠️  Super admin user already exists, skipping creation');
    return;
  }
  
  // Create default agency for super admin
  const agency = await prisma.agency.upsert({
    where: { email: 'admin@docuhero.com' },
    update: {},
    create: {
      name: 'DocuHero Administration',
      type: 'HEALTHCARE_PROVIDER',
      email: 'admin@docuhero.com',
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active',
      hipaaOfficer: 'System Administrator',
      hipaaOfficerEmail: 'admin@docuhero.com',
      baaSignedAt: new Date(),
      baaVersion: '1.0'
    }
  });
  
  // Hash default password
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 12);
  
  // Create super admin user
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@docuhero.com',
      hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
      agencyId: agency.id,
      hipaaAgreedAt: new Date(),
      hipaaAgreementVersion: '1.0',
      specialties: ['System Administration']
    }
  });
  
  console.log(`✅ Created super admin user: ${superAdmin.email}`);
}

function setupLogDirectories() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const logDir = path.join(process.cwd(), 'logs');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Create log files with proper permissions
    const logFiles = [
      'audit.log',
      'audit-error.log',
      'database.log',
      'database-error.log',
      'retention.log',
      'security.log'
    ];
    
    for (const logFile of logFiles) {
      const logPath = path.join(logDir, logFile);
      if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, '');
        // Set restrictive permissions (readable/writable by owner only)
        fs.chmodSync(logPath, 0o600);
      }
    }
    
    console.log('✅ Created audit log directories and files');
  } catch (error) {
    console.warn('⚠️  Could not create log directories:', error.message);
  }
}

// Add helpful database utilities
async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production environment');
  }
  
  console.log('🗑️  Resetting database...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('✅ Database reset completed');
}

async function seedTestData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot seed test data in production environment');
  }
  
  console.log('🌱 Seeding test data...');
  
  // Create test agency
  const testAgency = await prisma.agency.create({
    data: {
      name: 'Test Healthcare Clinic',
      type: 'HEALTHCARE_PROVIDER',
      email: 'test@docuhero.com',
      address: '123 Test Street',
      city: 'Test City',
      state: 'GA',
      zipCode: '12345',
      phone: '555-0123',
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      hipaaOfficer: 'Test Officer',
      hipaaOfficerEmail: 'hipaa@test.com',
      baaSignedAt: new Date(),
      baaVersion: '1.0'
    }
  });
  
  // Create test provider
  const hashedPassword = await bcrypt.hash('TestPass123!', 12);
  const testProvider = await prisma.user.create({
    data: {
      email: 'provider@test.com',
      hashedPassword,
      firstName: 'Test',
      lastName: 'Provider',
      role: 'PROVIDER',
      status: 'ACTIVE',
      emailVerified: new Date(),
      agencyId: testAgency.id,
      licenseNumber: 'TEST123',
      licenseState: 'GA',
      specialties: ['General Practice'],
      hipaaAgreedAt: new Date(),
      hipaaAgreementVersion: '1.0'
    }
  });
  
  console.log('✅ Test data seeded successfully');
  console.log(`   Agency: ${testAgency.name} (${testAgency.id})`);
  console.log(`   Provider: ${testProvider.email} (${testProvider.id})`);
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'reset':
    resetDatabase().then(() => initializeDatabase());
    break;
  case 'seed':
    seedTestData();
    break;
  case 'init':
  default:
    initializeDatabase();
    break;
}

export { initializeDatabase, resetDatabase, seedTestData };