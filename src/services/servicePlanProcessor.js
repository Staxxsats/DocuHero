const industryCompliance = require('../data/industryCompliance');

class ServicePlanProcessor {
  constructor() {
    this.templates = {
      'home-health': {
        name: 'Home Health Service Plan',
        sections: [
          'Patient Information',
          'Diagnosis & Medical History',
          'Goals & Objectives',
          'Services Required',
          'Frequency & Duration',
          'Provider Assignments',
          'Emergency Protocols'
        ],
        requiredFields: [
          'patient.name',
          'patient.dob',
          'patient.address',
          'diagnosis.primary',
          'services.nursing',
          'physician.name',
          'physician.contact'
        ]
      },
      'assisted-living': {
        name: 'Assisted Living Care Plan',
        sections: [
          'Resident Profile',
          'Care Needs Assessment',
          'Daily Living Activities',
          'Medication Management',
          'Social & Recreation Activities',
          'Healthcare Coordination',
          'Emergency Contacts'
        ],
        requiredFields: [
          'resident.name',
          'resident.dob',
          'assessment.adl',
          'medications.current',
          'contacts.emergency',
          'physician.primary'
        ]
      },
      'skilled-nursing': {
        name: 'Skilled Nursing Facility Plan',
        sections: [
          'Admission Assessment',
          'Medical Orders',
          'Nursing Care Plan',
          'Therapy Services',
          'Dietary Requirements',
          'Discharge Planning',
          'Quality Metrics'
        ],
        requiredFields: [
          'patient.admission.date',
          'orders.physician',
          'nursing.care.level',
          'therapy.pt',
          'therapy.ot',
          'diet.restrictions'
        ]
      }
    };
  }

  async processServicePlan(planData, providerInfo) {
    try {
      console.log('Processing service plan:', planData.type);

      // Validate input
      if (!planData || !planData.type) {
        throw new Error('Service plan type is required');
      }

      const template = this.templates[planData.type];
      if (!template) {
        throw new Error(`Unknown service plan type: ${planData.type}`);
      }

      // Process the plan
      const processedPlan = {
        id: `plan_${Date.now()}`,
        type: planData.type,
        template: template.name,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: providerInfo,
        data: planData,
        validation: this.validatePlan(planData, template),
        compliance: await this.checkCompliance(planData, providerInfo),
        sections: this.generateSections(planData, template),
        metadata: {
          version: '1.0',
          processor: 'ServicePlanProcessor',
          requiredApprovals: this.getRequiredApprovals(planData.type),
          estimatedCompletionTime: this.estimateCompletionTime(planData)
        }
      };

      // Auto-save to database (mock)
      await this.savePlan(processedPlan);

      return {
        success: true,
        planId: processedPlan.id,
        plan: processedPlan,
        nextSteps: this.getNextSteps(processedPlan),
        warnings: processedPlan.validation.warnings || []
      };

    } catch (error) {
      console.error('Service plan processing error:', error);
      return {
        success: false,
        error: error.message,
        code: 'PROCESSING_ERROR'
      };
    }
  }

  validatePlan(planData, template) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      missingFields: []
    };

    // Check required fields
    template.requiredFields.forEach(fieldPath => {
      if (!this.getNestedValue(planData, fieldPath)) {
        validation.missingFields.push(fieldPath);
        validation.errors.push(`Required field missing: ${fieldPath}`);
        validation.isValid = false;
      }
    });

    // Check data quality
    if (planData.patient) {
      if (planData.patient.dob) {
        const age = this.calculateAge(planData.patient.dob);
        if (age < 0 || age > 120) {
          validation.warnings.push('Patient age seems unusual, please verify date of birth');
        }
      }
    }

    // Check for completeness
    const completionScore = this.calculateCompletionScore(planData, template);
    if (completionScore < 0.8) {
      validation.warnings.push(`Plan is ${Math.round(completionScore * 100)}% complete. Consider adding more details.`);
    }

    return validation;
  }

  async checkCompliance(planData, providerInfo) {
    try {
      // Get state-specific requirements
      const state = providerInfo.state || 'GA';
      const stateRequirements = industryCompliance.getRequirements(state);

      const compliance = {
        state: state,
        overallScore: 85, // Mock score
        requirements: [],
        gaps: [],
        recommendations: []
      };

      // Check specific compliance requirements
      if (stateRequirements) {
        stateRequirements.forEach(req => {
          const met = this.checkRequirement(planData, req);
          compliance.requirements.push({
            id: req.id,
            description: req.description,
            met: met,
            severity: req.severity || 'medium'
          });

          if (!met) {
            compliance.gaps.push(req.description);
            compliance.recommendations.push(`Address: ${req.description}`);
          }
        });
      }

      return compliance;
    } catch (error) {
      console.error('Compliance check error:', error);
      return {
        state: 'unknown',
        overallScore: 0,
        error: 'Compliance check failed',
        requirements: []
      };
    }
  }

  generateSections(planData, template) {
    return template.sections.map(sectionName => ({
      name: sectionName,
      completed: this.isSectionCompleted(planData, sectionName),
      data: this.extractSectionData(planData, sectionName),
      lastUpdated: new Date()
    }));
  }

  getRequiredApprovals(planType) {
    const approvals = {
      'home-health': ['physician', 'case-manager', 'administrator'],
      'assisted-living': ['care-coordinator', 'administrator'],
      'skilled-nursing': ['physician', 'director-of-nursing', 'administrator']
    };

    return approvals[planType] || ['administrator'];
  }

  estimateCompletionTime(planData) {
    // Base time in minutes
    let baseTime = 30;

    // Add time based on complexity
    if (planData.services && planData.services.length > 3) {
      baseTime += 15;
    }

    if (planData.medications && planData.medications.length > 5) {
      baseTime += 10;
    }

    if (planData.specialNeeds) {
      baseTime += 20;
    }

    return baseTime;
  }

  getNextSteps(processedPlan) {
    const steps = [];

    if (!processedPlan.validation.isValid) {
      steps.push({
        action: 'Complete required fields',
        priority: 'high',
        fields: processedPlan.validation.missingFields
      });
    }

    if (processedPlan.compliance.gaps.length > 0) {
      steps.push({
        action: 'Address compliance gaps',
        priority: 'high',
        items: processedPlan.compliance.gaps
      });
    }

    steps.push({
      action: 'Review and approve plan',
      priority: 'medium',
      approvers: processedPlan.metadata.requiredApprovals
    });

    steps.push({
      action: 'Schedule implementation',
      priority: 'low',
      estimatedTime: processedPlan.metadata.estimatedCompletionTime
    });

    return steps;
  }

  getTemplate(category) {
    const template = this.templates[category];
    if (!template) {
      throw new Error(`Template not found for category: ${category}`);
    }

    return {
      ...template,
      fields: this.generateTemplateFields(template),
      examples: this.getTemplateExamples(category)
    };
  }

  generateTemplateFields(template) {
    return template.requiredFields.map(field => ({
      path: field,
      label: this.fieldPathToLabel(field),
      type: this.inferFieldType(field),
      required: true
    }));
  }

  getTemplateExamples(category) {
    const examples = {
      'home-health': {
        'patient.name': 'John Doe',
        'patient.dob': '1950-05-15',
        'diagnosis.primary': 'Diabetes Type 2',
        'services.nursing': 'Skilled Nursing 3x/week'
      },
      'assisted-living': {
        'resident.name': 'Mary Smith',
        'resident.dob': '1940-12-03',
        'assessment.adl': 'Requires assistance with bathing and dressing'
      },
      'skilled-nursing': {
        'patient.admission.date': '2024-01-15',
        'orders.physician': 'Dr. Johnson - Cardiology',
        'nursing.care.level': 'Skilled'
      }
    };

    return examples[category] || {};
  }

  // Helper methods
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  calculateCompletionScore(planData, template) {
    const totalFields = template.requiredFields.length;
    const completedFields = template.requiredFields.filter(field => 
      this.getNestedValue(planData, field)
    ).length;

    return completedFields / totalFields;
  }

  checkRequirement(planData, requirement) {
    // Mock compliance check - replace with actual logic
    return Math.random() > 0.3; // 70% chance of meeting requirement
  }

  isSectionCompleted(planData, sectionName) {
    // Mock section completion check
    return Math.random() > 0.4; // 60% chance of completion
  }

  extractSectionData(planData, sectionName) {
    // Extract relevant data for section
    const sectionMapping = {
      'Patient Information': planData.patient,
      'Resident Profile': planData.resident,
      'Diagnosis & Medical History': planData.diagnosis,
      'Care Needs Assessment': planData.assessment,
      'Services Required': planData.services,
      'Medication Management': planData.medications
    };

    return sectionMapping[sectionName] || {};
  }

  fieldPathToLabel(fieldPath) {
    return fieldPath
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  inferFieldType(fieldPath) {
    if (fieldPath.includes('date') || fieldPath.includes('dob')) {
      return 'date';
    }
    if (fieldPath.includes('email')) {
      return 'email';
    }
    if (fieldPath.includes('phone') || fieldPath.includes('contact')) {
      return 'tel';
    }
    if (fieldPath.includes('address')) {
      return 'textarea';
    }
    return 'text';
  }

  async savePlan(plan) {
    // Mock database save
    console.log(`Saving service plan ${plan.id} to database...`);
    return Promise.resolve(true);
  }
}

module.exports = new ServicePlanProcessor();