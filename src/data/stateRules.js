// State-specific rules and regulations for healthcare documentation
const stateRules = {
  // Georgia Rules
  GA: {
    stateName: 'Georgia',
    licenseRequired: true,
    licenseTypes: [
      'Home Care License',
      'Nursing Home Administrator License',
      'Assisted Living License'
    ],
    backgroundCheckRequired: true,
    continuingEducationHours: 40,
    medicareReimbursement: true,
    medicaidPrograms: ['Georgia Medicaid', 'PeachCare for Kids'],
    specificRequirements: [
      {
        id: 'GA-DOC-001',
        requirement: 'Service plans must be reviewed every 90 days',
        category: 'documentation',
        penalty: 'Citation and potential license suspension'
      },
      {
        id: 'GA-STAFF-001',
        requirement: 'All direct care staff must complete 8-hour orientation',
        category: 'staffing',
        penalty: 'Staff may not provide services until completed'
      },
      {
        id: 'GA-MED-001',
        requirement: 'Medication administration requires licensed nurse',
        category: 'medication',
        penalty: 'Immediate suspension of medication services'
      }
    ],
    inspectionFrequency: 'Annual',
    complaintInvestigation: '30 days',
    renewalPeriod: '2 years',
    contactInfo: {
      agency: 'Georgia Department of Community Health',
      phone: '(404) 657-5258',
      website: 'https://dch.georgia.gov'
    }
  },

  // Florida Rules
  FL: {
    stateName: 'Florida',
    licenseRequired: true,
    licenseTypes: [
      'Home Health Agency License',
      'Assisted Living Facility License',
      'Companion Services Registration'
    ],
    backgroundCheckRequired: true,
    continuingEducationHours: 24,
    medicareReimbursement: true,
    medicaidPrograms: ['Florida Medicaid'],
    specificRequirements: [
      {
        id: 'FL-DOC-001',
        requirement: 'Patient care plans must be updated within 7 days of change',
        category: 'documentation',
        penalty: 'Administrative fine up to $5,000'
      },
      {
        id: 'FL-STAFF-001',
        requirement: 'Background screening through AHCA required',
        category: 'staffing',
        penalty: 'Immediate termination required'
      },
      {
        id: 'FL-QUAL-001',
        requirement: 'Quality assurance program must be implemented',
        category: 'quality',
        penalty: 'Corrective action plan required'
      }
    ],
    inspectionFrequency: 'Every 15 months',
    complaintInvestigation: '20 days',
    renewalPeriod: '2 years',
    contactInfo: {
      agency: 'Florida Agency for Health Care Administration',
      phone: '(850) 412-4928',
      website: 'https://ahca.myflorida.com'
    }
  },

  // Texas Rules
  TX: {
    stateName: 'Texas',
    licenseRequired: true,
    licenseTypes: [
      'Home and Community Support Services License',
      'Assisted Living Facility License',
      'Home Health Services License'
    ],
    backgroundCheckRequired: true,
    continuingEducationHours: 20,
    medicareReimbursement: true,
    medicaidPrograms: ['Texas Medicaid', 'CHIP'],
    specificRequirements: [
      {
        id: 'TX-DOC-001',
        requirement: 'Individual service plans must be person-centered',
        category: 'documentation',
        penalty: 'Corrective action and potential fine'
      },
      {
        id: 'TX-STAFF-001',
        requirement: 'Direct service staff training within 30 days',
        category: 'staffing',
        penalty: 'Staff suspension until training completed'
      },
      {
        id: 'TX-SAFE-001',
        requirement: 'Emergency preparedness plan required',
        category: 'safety',
        penalty: 'Class B violation - $500 fine'
      }
    ],
    inspectionFrequency: 'Annual minimum',
    complaintInvestigation: '45 days',
    renewalPeriod: '1 year',
    contactInfo: {
      agency: 'Texas Department of State Health Services',
      phone: '(512) 834-6600',
      website: 'https://dshs.texas.gov'
    }
  },

  // California Rules
  CA: {
    stateName: 'California',
    licenseRequired: true,
    licenseTypes: [
      'Home Care Services Consumer Protection Act Registration',
      'Residential Care Facility License',
      'Home Health Agency License'
    ],
    backgroundCheckRequired: true,
    continuingEducationHours: 12,
    medicareReimbursement: true,
    medicaidPrograms: ['Medi-Cal'],
    specificRequirements: [
      {
        id: 'CA-DOC-001',
        requirement: 'Written care agreements required for all clients',
        category: 'documentation',
        penalty: 'Civil penalty up to $2,500'
      },
      {
        id: 'CA-STAFF-001',
        requirement: 'Criminal background check and Trustline registration',
        category: 'staffing',
        penalty: 'Immediate removal from service'
      },
      {
        id: 'CA-TRAIN-001',
        requirement: 'Orientation training within 2 weeks of hire',
        category: 'training',
        penalty: 'Staff may not work unsupervised'
      }
    ],
    inspectionFrequency: 'Every 2 years',
    complaintInvestigation: '30 days',
    renewalPeriod: '2 years',
    contactInfo: {
      agency: 'California Department of Social Services',
      phone: '(916) 651-8848',
      website: 'https://cdss.ca.gov'
    }
  },

  // New York Rules
  NY: {
    stateName: 'New York',
    licenseRequired: true,
    licenseTypes: [
      'Home Care Services Agency License',
      'Long Term Home Health Care Program Certification',
      'Assisted Living Program License'
    ],
    backgroundCheckRequired: true,
    continuingEducationHours: 36,
    medicareReimbursement: true,
    medicaidPrograms: ['New York Medicaid'],
    specificRequirements: [
      {
        id: 'NY-DOC-001',
        requirement: 'Care plans must be approved by RN within 48 hours',
        category: 'documentation',
        penalty: 'Immediate correction required'
      },
      {
        id: 'NY-STAFF-001',
        requirement: 'Home care aide certification required',
        category: 'staffing',
        penalty: 'Services may not be provided'
      },
      {
        id: 'NY-QUAL-001',
        requirement: 'Supervisory visits every 14 days minimum',
        category: 'quality',
        penalty: 'Plan of correction required'
      }
    ],
    inspectionFrequency: 'Annual',
    complaintInvestigation: '30 days',
    renewalPeriod: '3 years',
    contactInfo: {
      agency: 'New York State Department of Health',
      phone: '(518) 474-2011',
      website: 'https://health.ny.gov'
    }
  }
};

// Documentation type requirements by state
const documentationRequirements = {
  'care-plan': {
    GA: ['Physician orders', 'Assessment summary', 'Goals and interventions', 'Review dates'],
    FL: ['Medical necessity', 'Service frequency', 'Duration', 'Measurable goals'],
    TX: ['Person-centered goals', 'Service delivery methods', 'Risk factors', 'Preferences'],
    CA: ['Written agreement', 'Service description', 'Cost breakdown', 'Rights notice'],
    NY: ['RN assessment', 'Aide assignments', 'Supervisor schedule', 'Emergency contacts']
  },
  'progress-notes': {
    GA: ['Date and time', 'Services provided', 'Client response', 'Provider signature'],
    FL: ['Objective observations', 'Interventions performed', 'Client status', 'Any incidents'],
    TX: ['Goal progress', 'Service delivery', 'Client satisfaction', 'Next visit plan'],
    CA: ['Activities completed', 'Client condition', 'Any concerns', 'Follow-up needed'],
    NY: ['Aide activities', 'Client status', 'Supervisor contact', 'Plan modifications']
  },
  'incident-report': {
    GA: ['Date/time of incident', 'Description', 'Actions taken', 'Notifications made'],
    FL: ['Incident details', 'Witness information', 'Medical attention', 'AHCA notification'],
    TX: ['Event description', 'Injury details', 'Investigation', 'Prevention measures'],
    CA: ['Incident type', 'Contributing factors', 'Response actions', 'DSS reporting'],
    NY: ['Occurrence details', 'Medical response', 'Family notification', 'DOH reporting']
  }
};

// Medication administration rules by state
const medicationRules = {
  GA: {
    whoCanAdminister: ['Licensed Nurse', 'Trained Medication Aide'],
    trainingRequired: 'Georgia Medication Aide Training Program',
    supervisionRequired: 'Licensed Nurse oversight',
    documentationRequired: [
      'Medication administration record',
      'Physician orders',
      'Drug profile',
      'Incident reports for errors'
    ]
  },
  FL: {
    whoCanAdminister: ['Licensed Nurse', 'Certified Nursing Assistant with training'],
    trainingRequired: 'Florida CNA Medication Training',
    supervisionRequired: 'RN supervision and delegation',
    documentationRequired: [
      'MAR with all administrations',
      'PRN effectiveness notes',
      'Medication errors reported to AHCA',
      'Monthly medication review'
    ]
  },
  TX: {
    whoCanAdminister: ['Licensed Nurse', 'Qualified Medication Aide'],
    trainingRequired: 'Texas QMA Certification',
    supervisionRequired: 'Licensed Nurse delegation',
    documentationRequired: [
      'Individual medication record',
      'Prescriber orders',
      'Medication storage log',
      'Adverse reaction reporting'
    ]
  },
  CA: {
    whoCanAdminister: ['Licensed Nurse', 'Certified Hemodialysis Technician for specific meds'],
    trainingRequired: 'California Board of Nursing approved program',
    supervisionRequired: 'Direct RN supervision',
    documentationRequired: [
      'Medication administration log',
      'Physician authorization',
      'Client medication profile',
      'Error reporting to licensing board'
    ]
  },
  NY: {
    whoCanAdminister: ['Licensed Nurse', 'Home Health Aide with training'],
    trainingRequired: 'DOH approved medication aide training',
    supervisionRequired: 'RN assessment and oversight',
    documentationRequired: [
      'Medication administration record',
      'Doctor orders',
      'Monthly medication reconciliation',
      'Incident reports within 24 hours'
    ]
  }
};

// Emergency procedures by state
const emergencyProcedures = {
  GA: {
    emergencyContact: '911',
    agencyNotification: 'Within 24 hours',
    familyNotification: 'Immediately',
    documentationRequired: 'Incident report within 48 hours',
    stateReporting: 'DCH within 24 hours for serious incidents'
  },
  FL: {
    emergencyContact: '911',
    agencyNotification: 'Immediately',
    familyNotification: 'Within 4 hours',
    documentationRequired: 'Incident report same day',
    stateReporting: 'AHCA within 24 hours'
  },
  TX: {
    emergencyContact: '911',
    agencyNotification: 'Within 2 hours',
    familyNotification: 'As soon as possible',
    documentationRequired: 'Incident report within 24 hours',
    stateReporting: 'DSHS within 24 hours for serious events'
  },
  CA: {
    emergencyContact: '911',
    agencyNotification: 'Immediately',
    familyNotification: 'Within 24 hours',
    documentationRequired: 'Incident report within 24 hours',
    stateReporting: 'DSS within 24 hours if required'
  },
  NY: {
    emergencyContact: '911',
    agencyNotification: 'Immediately',
    familyNotification: 'Immediately',
    documentationRequired: 'Incident report within 24 hours',
    stateReporting: 'DOH within 24 hours'
  }
};

// Helper functions
const getStateRules = (stateCode) => {
  return stateRules[stateCode] || null;
};

const getDocumentationRequirements = (stateCode, documentType) => {
  return documentationRequirements[documentType]?.[stateCode] || [];
};

const getMedicationRules = (stateCode) => {
  return medicationRules[stateCode] || null;
};

const getEmergencyProcedures = (stateCode) => {
  return emergencyProcedures[stateCode] || null;
};

const validateStateCompliance = (stateCode, documentation) => {
  const rules = getStateRules(stateCode);
  if (!rules) {
    return { isValid: false, error: 'State not supported' };
  }

  const violations = [];
  const warnings = [];
  
  // Check specific requirements
  rules.specificRequirements.forEach(req => {
    const compliance = checkRequirementCompliance(documentation, req);
    if (!compliance.met) {
      if (req.category === 'medication' || req.category === 'safety') {
        violations.push({
          requirement: req.requirement,
          penalty: req.penalty,
          severity: 'high'
        });
      } else {
        warnings.push({
          requirement: req.requirement,
          penalty: req.penalty,
          severity: 'medium'
        });
      }
    }
  });
  
  return {
    isValid: violations.length === 0,
    state: rules.stateName,
    violations,
    warnings,
    overallScore: Math.max(0, 100 - (violations.length * 20) - (warnings.length * 10))
  };
};

// Mock compliance checking function
const checkRequirementCompliance = (documentation, requirement) => {
  // Simple mock - replace with actual compliance logic
  const docString = JSON.stringify(documentation).toLowerCase();
  
  if (requirement.requirement.toLowerCase().includes('service plan')) {
    return { met: docString.includes('plan') || docString.includes('service') };
  }
  if (requirement.requirement.toLowerCase().includes('medication')) {
    return { met: docString.includes('medication') || docString.includes('drug') };
  }
  if (requirement.requirement.toLowerCase().includes('training')) {
    return { met: docString.includes('training') || docString.includes('education') };
  }
  if (requirement.requirement.toLowerCase().includes('background')) {
    return { met: docString.includes('background') || docString.includes('screening') };
  }
  
  // Default to random for demo
  return { met: Math.random() > 0.3 };
};

const getSupportedStates = () => {
  return Object.keys(stateRules).map(code => ({
    code,
    name: stateRules[code].stateName
  }));
};

module.exports = {
  stateRules,
  documentationRequirements,
  medicationRules,
  emergencyProcedures,
  getStateRules,
  getDocumentationRequirements,
  getMedicationRules,
  getEmergencyProcedures,
  validateStateCompliance,
  getSupportedStates
};