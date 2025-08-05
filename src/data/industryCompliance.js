// JavaScript version of industry compliance data for backward compatibility
const complianceRequirements = [
  // HIPAA Requirements
  {
    id: 'HIPAA-001',
    title: 'Patient Health Information Privacy',
    description: 'All patient health information must be protected and access must be logged and auditable.',
    category: 'privacy',
    severity: 'critical',
    states: ['ALL'],
    regulations: ['HIPAA Privacy Rule', '45 CFR 164.502'],
    checkpoints: [
      'PHI access logging enabled',
      'User authentication implemented',
      'Minimum necessary standard applied',
      'Patient authorization obtained when required'
    ],
    penalties: '$100 - $50,000 per violation, up to $1.5M annually',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'HIPAA-002',
    title: 'Electronic Health Records Security',
    description: 'Electronic PHI must be secured with appropriate technical safeguards.',
    category: 'security',
    severity: 'critical',
    states: ['ALL'],
    regulations: ['HIPAA Security Rule', '45 CFR 164.312'],
    checkpoints: [
      'Data encryption at rest and in transit',
      'Access controls implemented',
      'Audit logs maintained',
      'Risk assessments conducted'
    ],
    penalties: '$100 - $50,000 per violation, up to $1.5M annually',
    lastUpdated: '2024-01-15'
  },

  // CMS Requirements
  {
    id: 'CMS-001',
    title: 'Medicare Documentation Standards',
    description: 'Home health services must be documented according to CMS guidelines for reimbursement.',
    category: 'documentation',
    severity: 'high',
    states: ['ALL'],
    regulations: ['42 CFR 484', 'Medicare Benefit Policy Manual'],
    checkpoints: [
      'Plan of care established by physician',
      'Skilled nursing or therapy services documented',
      'Patient homebound status verified',
      'Face-to-face encounter documented'
    ],
    penalties: 'Claim denial, potential exclusion from Medicare',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'CMS-002',
    title: 'OASIS Assessment Requirements',
    description: 'Outcome and Assessment Information Set must be completed for Medicare/Medicaid patients.',
    category: 'quality',
    severity: 'high',
    states: ['ALL'],
    regulations: ['42 CFR 484.55'],
    checkpoints: [
      'OASIS assessment completed within timeframes',
      'Qualified clinician conducts assessment',
      'Data submitted to state agency',
      'Clinical record supports OASIS responses'
    ],
    penalties: 'Payment reduction, quality measure penalties',
    lastUpdated: '2024-01-10'
  },

  // Georgia Specific Requirements
  {
    id: 'GA-001',
    title: 'Georgia Home Care License Requirements',
    description: 'Home care agencies must maintain valid Georgia state licensure.',
    category: 'staffing',
    severity: 'critical',
    states: ['GA'],
    regulations: ['O.C.G.A. § 31-7-150', 'Rules 111-8-40-.07'],
    checkpoints: [
      'Current license on file',
      'Administrator meets qualification requirements',
      'Staff background checks completed',
      'Continuing education requirements met'
    ],
    penalties: 'License suspension or revocation, civil penalties up to $1,000 per day',
    lastUpdated: '2024-01-12'
  },
  {
    id: 'GA-002',
    title: 'Georgia Medicaid Documentation',
    description: 'Services provided to Georgia Medicaid recipients must meet state-specific documentation requirements.',
    category: 'documentation',
    severity: 'high',
    states: ['GA'],
    regulations: ['Georgia Medicaid Provider Manual'],
    checkpoints: [
      'Prior authorization obtained when required',
      'Service notes include all required elements',
      'Physician orders current and specific',
      'Medicaid ID verified'
    ],
    penalties: 'Claim denial, overpayment recovery, provider sanctions',
    lastUpdated: '2024-01-12'
  },

  // Florida Specific Requirements
  {
    id: 'FL-001',
    title: 'Florida Home Health License',
    description: 'Home health agencies must comply with Florida Agency for Health Care Administration requirements.',
    category: 'staffing',
    severity: 'critical',
    states: ['FL'],
    regulations: ['Florida Statutes 400.462', 'Florida Administrative Code 59A-8'],
    checkpoints: [
      'AHCA license current and displayed',
      'Administrator holds required credentials',
      'Clinical staff properly licensed',
      'Background screening completed'
    ],
    penalties: 'Administrative fines up to $5,000 per violation',
    lastUpdated: '2024-01-08'
  },

  // Quality and Safety Requirements
  {
    id: 'QS-001',
    title: 'Medication Management',
    description: 'Proper documentation and administration of medications in home care settings.',
    category: 'quality',
    severity: 'high',
    states: ['ALL'],
    regulations: ['State Nursing Practice Acts', 'DEA Regulations'],
    checkpoints: [
      'Medication reconciliation performed',
      'Administration documented immediately',
      'Controlled substances properly secured',
      'Adverse reactions reported'
    ],
    penalties: 'Professional discipline, DEA sanctions',
    lastUpdated: '2024-01-20'
  },

  // Billing and Reimbursement
  {
    id: 'BR-001',
    title: 'Accurate Billing Documentation',
    description: 'All services billed must be supported by appropriate documentation.',
    category: 'billing',
    severity: 'critical',
    states: ['ALL'],
    regulations: ['False Claims Act', 'Anti-Kickback Statute'],
    checkpoints: [
      'Services documented match billed services',
      'Provider signatures and credentials verified',
      'Time spent accurately reported',
      'Medical necessity established'
    ],
    penalties: 'Treble damages, $11,000+ per false claim, exclusion',
    lastUpdated: '2024-01-25'
  }
];

// State-specific requirements mapping
const stateRequirements = [
  {
    state: 'GA',
    stateName: 'Georgia',
    requirements: complianceRequirements.filter(req => 
      req.states.includes('GA') || req.states.includes('ALL')
    ),
    specificRules: {
      medicareReimbursement: true,
      medicaidPrograms: ['Georgia Medicaid', 'PeachCare'],
      licenseRequirements: ['Home Care License', 'Nursing Home Administrator'],
      backgroundCheckRequired: true,
      continuingEducationHours: 40
    }
  },
  {
    state: 'FL',
    stateName: 'Florida',
    requirements: complianceRequirements.filter(req => 
      req.states.includes('FL') || req.states.includes('ALL')
    ),
    specificRules: {
      medicareReimbursement: true,
      medicaidPrograms: ['Florida Medicaid'],
      licenseRequirements: ['AHCA Home Health License'],
      backgroundCheckRequired: true,
      continuingEducationHours: 24
    }
  }
];

// Compliance assessment functions
const getRequirements = (state) => {
  const stateData = stateRequirements.find(s => s.state === state);
  return stateData?.requirements || complianceRequirements.filter(req => req.states.includes('ALL'));
};

const getMergedRequirements = (states) => {
  const allRequirements = new Map();
  
  // Add universal requirements
  complianceRequirements
    .filter(req => req.states.includes('ALL'))
    .forEach(req => allRequirements.set(req.id, req));
  
  // Add state-specific requirements
  states.forEach(state => {
    complianceRequirements
      .filter(req => req.states.includes(state))
      .forEach(req => allRequirements.set(req.id, req));
  });
  
  return Array.from(allRequirements.values());
};

const validateDocumentation = (documentation, states) => {
  const requirements = getMergedRequirements(states);
  const violations = [];
  const warnings = [];
  const recommendations = [];
  
  let passedChecks = 0;
  let totalChecks = 0;
  
  requirements.forEach(req => {
    totalChecks += req.checkpoints.length;
    
    req.checkpoints.forEach(checkpoint => {
      const passed = mockCheckpointValidation(documentation, checkpoint);
      if (passed) {
        passedChecks++;
      } else {
        if (req.severity === 'critical') {
          violations.push(req);
        } else {
          warnings.push(req);
        }
        recommendations.push(`Address: ${checkpoint}`);
      }
    });
  });
  
  const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
  const isCompliant = violations.length === 0 && score >= 90;
  
  return {
    isCompliant,
    score: Math.round(score),
    violations,
    warnings,
    recommendations: [...new Set(recommendations)]
  };
};

// Mock validation function
const mockCheckpointValidation = (documentation, checkpoint) => {
  const doc = JSON.stringify(documentation).toLowerCase();
  
  if (checkpoint.toLowerCase().includes('phi access logging')) {
    return doc.includes('user') && doc.includes('access');
  }
  if (checkpoint.toLowerCase().includes('encryption')) {
    return doc.includes('encrypted') || doc.includes('secure');
  }
  if (checkpoint.toLowerCase().includes('physician')) {
    return doc.includes('physician') || doc.includes('doctor') || doc.includes('md');
  }
  if (checkpoint.toLowerCase().includes('documentation')) {
    return doc.length > 100;
  }
  
  return Math.random() > 0.3;
};

const generateFormTemplate = (states, documentationType) => {
  const requirements = getMergedRequirements(states);
  const relevantReqs = requirements.filter(req => 
    req.category === 'documentation' || 
    (documentationType === 'care-plan' && req.category === 'quality')
  );
  
  const template = {
    documentType: documentationType,
    states: states,
    sections: [],
    requiredFields: [],
    validationRules: [],
    generatedAt: new Date().toISOString()
  };
  
  const sections = new Set();
  relevantReqs.forEach(req => {
    if (req.category === 'documentation') {
      sections.add('Patient Information');
      sections.add('Clinical Assessment');
      sections.add('Plan of Care');
    }
    if (req.category === 'quality') {
      sections.add('Quality Measures');
      sections.add('Safety Protocols');
    }
  });
  
  template.sections = Array.from(sections);
  
  return template;
};

const generateComplianceReport = (agencyId, states, timeRange) => {
  const requirements = getMergedRequirements(states);
  const criticalReqs = requirements.filter(req => req.severity === 'critical');
  
  return {
    agencyId,
    states,
    timeRange,
    generatedAt: new Date().toISOString(),
    overallScore: Math.floor(Math.random() * 15) + 85,
    totalRequirements: requirements.length,
    criticalRequirements: criticalReqs.length,
    compliance: {
      met: Math.floor(requirements.length * (0.85 + Math.random() * 0.15)),
      violations: Math.floor(Math.random() * 3),
      warnings: Math.floor(Math.random() * 5)
    },
    categories: {
      documentation: Math.floor(Math.random() * 15) + 85,
      privacy: Math.floor(Math.random() * 10) + 90,
      security: Math.floor(Math.random() * 10) + 90,
      staffing: Math.floor(Math.random() * 20) + 80,
      quality: Math.floor(Math.random() * 15) + 85,
      billing: Math.floor(Math.random() * 20) + 80
    },
    recommendations: [
      'Update staff training on HIPAA requirements',
      'Implement additional security safeguards',
      'Enhance documentation completeness',
      'Review billing procedures for accuracy'
    ].slice(0, Math.floor(Math.random() * 4) + 1)
  };
};

module.exports = {
  complianceRequirements,
  stateRequirements,
  getRequirements,
  getMergedRequirements,
  validateDocumentation,
  generateFormTemplate,
  generateComplianceReport
};