export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'agency_admin' | 'employee' | 'client' | 'guardian';
  agencyId?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Agency {
  id: string;
  businessName: string;
  npi: string;
  ein?: string;
  states: string[];
  adminUserId: string;
  isActive: boolean;
  complianceSettings: ComplianceSettings;
  createdAt: Date;
}

export interface ComplianceSettings {
  requiredFields: string[];
  documentationTypes: string[];
  signatureRequirements: string[];
  auditSettings: AuditSettings;
}

export interface AuditSettings {
  logAllAccess: boolean;
  retentionPeriodDays: number;
  requireSupervisorReview: boolean;
  encryptionLevel: 'standard' | 'enhanced';
}

export interface Employee {
  id: string;
  userId: string;
  agencyId: string;
  position: string;
  licenseNumber?: string;
  assignedClients: string[];
  permissions: Permission[];
  supervisorId?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  assignedEmployees: string[];
  guardianIds: string[];
  carePlan: CarePlan;
  isActive: boolean;
}

export interface CarePlan {
  id: string;
  clientId: string;
  goals: Goal[];
  medications: Medication[];
  visitSchedule: VisitSchedule;
  specialInstructions: string;
  lastUpdated: Date;
  approvedBy: string;
}

export interface Goal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'discontinued';
  progress: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
}

export interface VisitSchedule {
  frequency: string;
  duration: number;
  specialRequirements: string[];
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'approve')[];
}

export interface InviteToken {
  id: string;
  email: string;
  role: 'employee' | 'client' | 'guardian';
  agencyId: string;
  createdBy: string;
  expiresAt: Date;
  used: boolean;
}