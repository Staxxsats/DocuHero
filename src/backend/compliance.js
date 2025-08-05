// Compliance Engine - State-specific rules and validation
const stateRules = require('../data/stateRules');

class ComplianceEngine {
  constructor() {
    this.stateRules = stateRules;
  }

  // Get merged requirements for multiple states
  getMergedRequirements(stateCodes) {
    const states = this.getStateRequirements(stateCodes);
    
    return {
      allRequiredFields: [...new Set(states.flatMap(s => s.requiredFields))],
      allDocumentationTypes: [...new Set(states.flatMap(s => s.documentationTypes))],
      allVisitFrequencies: [...new Set(states.flatMap(s => s.visitFrequencyOptions))],
      allSignatureRequirements: [...new Set(states.flatMap(s => s.signatureRequirements))],
      allSpecialRequirements: [...new Set(states.flatMap(s => s.specialRequirements))]
    };
  }

  // Get requirements for specific states
  getStateRequirements(stateCodes) {
    return stateCodes.map(code => this.stateRules.stateRules[code]).filter(Boolean);
  }

  // Validate documentation against state requirements
  validateDocumentation(documentation, stateCodes) {
    const requirements = this.getMergedRequirements(stateCodes);
    const errors = [];
    const warnings = [];

    // Check required fields
    requirements.allRequiredFields.forEach(field => {
      if (!documentation[field] || documentation[field].trim() === '') {
        errors.push(`Required field missing: ${field.replace(/_/g, ' ')}`);
      }
    });

    // Validate documentation type
    if (!requirements.allDocumentationTypes.includes(documentation.type)) {
      warnings.push(`Documentation type '${documentation.type}' may not be compliant in all operating states`);
    }

    // Check signature requirements
    if (documentation.requiresSignature) {
      const hasValidSignature = this.validateSignature(documentation.signature, requirements.allSignatureRequirements);
      if (!hasValidSignature) {
        errors.push('Invalid or missing required signature');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceScore: this.calculateComplianceScore(documentation, requirements)
    };
  }

  // Validate signature against requirements
  validateSignature(signature, requirements) {
    if (!signature) return false;

    // Check if signature meets requirements
    const hasTimestamp = signature.timestamp && new Date(signature.timestamp).getTime() > 0;
    const hasSignerId = signature.signerId && signature.signerId.trim() !== '';
    const hasSignatureData = signature.data && signature.data.trim() !== '';

    return hasTimestamp && hasSignerId && hasSignatureData;
  }

  // Calculate compliance score (0-100)
  calculateComplianceScore(documentation, requirements) {
    let score = 0;
    let totalChecks = 0;

    // Required fields check (40% of score)
    const requiredFieldsScore = requirements.allRequiredFields.reduce((acc, field) => {
      totalChecks++;
      return acc + (documentation[field] && documentation[field].trim() !== '' ? 1 : 0);
    }, 0);
    score += (requiredFieldsScore / requirements.allRequiredFields.length) * 40;

    // Documentation type check (20% of score)
    totalChecks++;
    if (requirements.allDocumentationTypes.includes(documentation.type)) {
      score += 20;
    }

    // Signature check (20% of score)
    totalChecks++;
    if (documentation.signature && this.validateSignature(documentation.signature, requirements.allSignatureRequirements)) {
      score += 20;
    }

    // Timestamp check (10% of score)
    totalChecks++;
    if (documentation.timestamp && new Date(documentation.timestamp).getTime() > 0) {
      score += 10;
    }

    // Completeness check (10% of score)
    totalChecks++;
    const completenessScore = this.calculateCompleteness(documentation);
    score += completenessScore * 10;

    return Math.round(score);
  }

  // Calculate documentation completeness
  calculateCompleteness(documentation) {
    const fields = Object.keys(documentation);
    const filledFields = fields.filter(field => {
      const value = documentation[field];
      return value !== null && value !== undefined && value !== '';
    });

    return filledFields.length / fields.length;
  }

  // Generate compliance report
  generateComplianceReport(agencyId, stateCodes, timeRange = 30) {
    // This would query actual documentation from database
    // For now, return mock data
    
    const requirements = this.getMergedRequirements(stateCodes);
    
    return {
      agencyId,
      reportDate: new Date(),
      timeRange: `Last ${timeRange} days`,
      states: stateCodes,
      summary: {
        totalDocuments: 150,
        compliantDocuments: 142,
        complianceRate: 94.7,
        averageComplianceScore: 96.2
      },
      requirements: {
        requiredFields: requirements.allRequiredFields.length,
        documentationTypes: requirements.allDocumentationTypes.length,
        signatureRequirements: requirements.allSignatureRequirements.length
      },
      issues: [
        {
          type: 'missing_field',
          field: 'emergency_contacts',
          count: 5,
          severity: 'high'
        },
        {
          type: 'invalid_signature',
          count: 3,
          severity: 'critical'
        }
      ],
      recommendations: [
        'Ensure all emergency contact information is collected during intake',
        'Review signature validation process with staff',
        'Consider implementing automated compliance checks'
      ]
    };
  }

  // Get state-specific form template
  generateFormTemplate(stateCodes, documentationType) {
    const requirements = this.getMergedRequirements(stateCodes);
    
    const template = {
      documentationType,
      states: stateCodes,
      sections: [],
      requiredFields: requirements.allRequiredFields,
      validationRules: this.getValidationRules(requirements)
    };

    // Generate form sections based on requirements
    if (requirements.allRequiredFields.includes('patient_demographics')) {
      template.sections.push({
        title: 'Patient Demographics',
        fields: [
          { name: 'firstName', type: 'text', required: true, label: 'First Name' },
          { name: 'lastName', type: 'text', required: true, label: 'Last Name' },
          { name: 'dateOfBirth', type: 'date', required: true, label: 'Date of Birth' },
          { name: 'address', type: 'textarea', required: true, label: 'Address' },
          { name: 'phone', type: 'tel', required: true, label: 'Phone Number' }
        ]
      });
    }

    if (requirements.allRequiredFields.includes('physician_orders')) {
      template.sections.push({
        title: 'Physician Orders',
        fields: [
          { name: 'physicianName', type: 'text', required: true, label: 'Physician Name' },
          { name: 'orderDate', type: 'date', required: true, label: 'Order Date' },
          { name: 'orders', type: 'textarea', required: true, label: 'Orders' },
          { name: 'frequency', type: 'select', required: true, label: 'Visit Frequency', options: requirements.allVisitFrequencies }
        ]
      });
    }

    if (requirements.allRequiredFields.includes('care_plan')) {
      template.sections.push({
        title: 'Care Plan',
        fields: [
          { name: 'goals', type: 'textarea', required: true, label: 'Care Goals' },
          { name: 'interventions', type: 'textarea', required: true, label: 'Interventions' },
          { name: 'expectedOutcomes', type: 'textarea', required: true, label: 'Expected Outcomes' }
        ]
      });
    }

    // Add signature section if required
    if (requirements.allSignatureRequirements.length > 0) {
      template.sections.push({
        title: 'Signatures',
        fields: [
          { name: 'nurseSignature', type: 'signature', required: true, label: 'Nurse Signature' },
          { name: 'supervisorSignature', type: 'signature', required: false, label: 'Supervisor Signature' },
          { name: 'signatureDate', type: 'datetime-local', required: true, label: 'Signature Date' }
        ]
      });
    }

    return template;
  }

  // Get validation rules for form fields
  getValidationRules(requirements) {
    const rules = {};

    requirements.allRequiredFields.forEach(field => {
      rules[field] = {
        required: true,
        minLength: field.includes('name') ? 2 : 1
      };
    });

    // Add specific validation rules
    rules.phone = { ...rules.phone, pattern: /^\(\d{3}\) \d{3}-\d{4}$/ };
    rules.email = { ...rules.email, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
    rules.dateOfBirth = { ...rules.dateOfBirth, maxDate: new Date() };

    return rules;
  }

  // Validate form data against template
  validateFormData(formData, template) {
    const errors = {};
    const warnings = [];

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.name];
        const rules = template.validationRules[field.name] || {};

        // Required field check
        if (field.required && (!value || value.toString().trim() === '')) {
          errors[field.name] = `${field.label} is required`;
        }

        // Pattern validation
        if (value && rules.pattern && !rules.pattern.test(value)) {
          errors[field.name] = `${field.label} format is invalid`;
        }

        // Length validation
        if (value && rules.minLength && value.length < rules.minLength) {
          errors[field.name] = `${field.label} must be at least ${rules.minLength} characters`;
        }

        // Date validation
        if (value && rules.maxDate && new Date(value) > rules.maxDate) {
          errors[field.name] = `${field.label} cannot be in the future`;
        }
      });
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }
}

module.exports = new ComplianceEngine();