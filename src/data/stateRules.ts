export interface StateRule {
  code: string;
  name: string;
  requiredFields: string[];
  documentationTypes: string[];
  visitFrequencyOptions: string[];
  signatureRequirements: string[];
  specialRequirements: string[];
}

export const stateRules: Record<string, StateRule> = {
  GA: {
    code: 'GA',
    name: 'Georgia',
    requiredFields: [
      'patient_demographics',
      'physician_orders',
      'care_plan',
      'medication_list',
      'emergency_contacts',
      'insurance_information'
    ],
    documentationTypes: [
      'Home Health Logs',
      'Skilled Nursing Notes',
      'Therapy Progress Notes',
      'Aide Visit Records'
    ],
    visitFrequencyOptions: ['Daily', 'BID', 'TID', 'Weekly', 'PRN'],
    signatureRequirements: [
      'Electronic signature required',
      'Supervisor co-signature for new employees',
      'Physician signature on care plans'
    ],
    specialRequirements: [
      'OASIS assessments required',
      'Quality measures reporting',
      'Incident reporting within 24 hours'
    ]
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    requiredFields: [
      'patient_demographics',
      'physician_orders',
      'care_plan',
      'medication_reconciliation',
      'fall_risk_assessment',
      'pain_assessment'
    ],
    documentationTypes: [
      'DAP Notes (Data, Assessment, Plan)',
      'Skilled Nursing Documentation',
      'Therapy Evaluation Reports',
      'Home Health Aide Records'
    ],
    visitFrequencyOptions: ['Daily', 'BID', 'TID', 'Weekly', 'Bi-weekly', 'Monthly'],
    signatureRequirements: [
      'Digital signature with timestamp',
      'Supervisor review within 48 hours',
      'Physician approval for care plan changes'
    ],
    specialRequirements: [
      'Texas-specific OASIS requirements',
      'Mandatory infection control protocols',
      'Cultural competency documentation'
    ]
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    requiredFields: [
      'patient_demographics',
      'physician_orders',
      'comprehensive_assessment',
      'medication_management',
      'safety_assessment',
      'discharge_planning'
    ],
    documentationTypes: [
      'Comprehensive Care Plans',
      'Progress Notes',
      'Incident Reports',
      'Quality Assurance Records'
    ],
    visitFrequencyOptions: ['Daily', 'BID', 'TID', 'Weekly', 'PRN', 'As needed'],
    signatureRequirements: [
      'Electronic signature with biometric verification',
      'Supervisor attestation',
      'Physician electronic approval'
    ],
    specialRequirements: [
      'Hurricane preparedness plans',
      'Heat-related illness protocols',
      'Multilingual documentation support'
    ]
  },
  CA: {
    code: 'CA',
    name: 'California',
    requiredFields: [
      'patient_demographics',
      'physician_orders',
      'individualized_care_plan',
      'medication_administration_record',
      'cultural_preferences',
      'advance_directives'
    ],
    documentationTypes: [
      'Person-Centered Care Plans',
      'Clinical Progress Notes',
      'Behavioral Intervention Plans',
      'Quality Metrics Reports'
    ],
    visitFrequencyOptions: ['Continuous', 'Daily', 'BID', 'TID', 'Weekly', 'Monthly'],
    signatureRequirements: [
      'Digital signature with audit trail',
      'Supervisor co-signature for critical incidents',
      'Multi-disciplinary team signatures'
    ],
    specialRequirements: [
      'Cultural competency requirements',
      'Language accessibility compliance',
      'Environmental safety protocols'
    ]
  },
  NY: {
    code: 'NY',
    name: 'New York',
    requiredFields: [
      'patient_demographics',
      'physician_orders',
      'nursing_assessment',
      'medication_profile',
      'psychosocial_assessment',
      'environmental_assessment'
    ],
    documentationTypes: [
      'Nursing Care Plans',
      'Interdisciplinary Progress Notes',
      'Quality Assurance Documentation',
      'Regulatory Compliance Reports'
    ],
    visitFrequencyOptions: ['Shift-based', 'Daily', 'BID', 'TID', 'Weekly', 'PRN'],
    signatureRequirements: [
      'Electronic signature with time stamp',
      'Supervisor review and approval',
      'Physician electronic orders'
    ],
    specialRequirements: [
      'DOH reporting requirements',
      'Infection control protocols',
      'Emergency preparedness documentation'
    ]
  }
};

export const getStateRequirements = (stateCodes: string[]): StateRule[] => {
  return stateCodes.map(code => stateRules[code]).filter(Boolean);
};

export const getMergedRequirements = (stateCodes: string[]) => {
  const states = getStateRequirements(stateCodes);
  
  return {
    allRequiredFields: [...new Set(states.flatMap(s => s.requiredFields))],
    allDocumentationTypes: [...new Set(states.flatMap(s => s.documentationTypes))],
    allVisitFrequencies: [...new Set(states.flatMap(s => s.visitFrequencyOptions))],
    allSignatureRequirements: [...new Set(states.flatMap(s => s.signatureRequirements))],
    allSpecialRequirements: [...new Set(states.flatMap(s => s.specialRequirements))]
  };
};