const industryCompliance = require('../data/industryCompliance');

class IntelligentComplianceEngine {
  constructor() {
    this.ruleEngine = new Map();
    this.complianceCache = new Map();
    this.violationHistory = new Map();
    this.auditTrail = [];
    this.aiModels = {
      textAnalysis: 'compliance-nlp-v2',
      riskAssessment: 'risk-analyzer-v1',
      anomalyDetection: 'anomaly-detector-v3'
    };
    
    this.initializeRules();
    this.startPeriodicChecks();
  }

  initializeRules() {
    // HIPAA Rules
    this.ruleEngine.set('HIPAA_PHI_PROTECTION', {
      id: 'HIPAA_PHI_PROTECTION',
      category: 'privacy',
      severity: 'critical',
      description: 'Protected Health Information must be secured and access-controlled',
      checkFunction: this.checkPHIProtection.bind(this),
      remediation: 'Ensure PHI is encrypted, access is logged, and minimum necessary principle is applied'
    });

    this.ruleEngine.set('HIPAA_BREACH_NOTIFICATION', {
      id: 'HIPAA_BREACH_NOTIFICATION',
      category: 'security',
      severity: 'critical',
      description: 'Data breaches must be reported within 60 days',
      checkFunction: this.checkBreachNotification.bind(this),
      remediation: 'Implement breach detection and notification procedures'
    });

    // CMS Rules
    this.ruleEngine.set('CMS_DOCUMENTATION_STANDARDS', {
      id: 'CMS_DOCUMENTATION_STANDARDS', 
      category: 'documentation',
      severity: 'high',
      description: 'Documentation must meet CMS standards for reimbursement',
      checkFunction: this.checkCMSDocumentation.bind(this),
      remediation: 'Ensure all required fields are completed and signatures are present'
    });

    this.ruleEngine.set('CMS_CARE_PLAN_REQUIREMENTS', {
      id: 'CMS_CARE_PLAN_REQUIREMENTS',
      category: 'care_planning',
      severity: 'high',
      description: 'Care plans must be updated every 60 days or when condition changes',
      checkFunction: this.checkCarePlanUpdates.bind(this),
      remediation: 'Schedule regular care plan reviews and updates'
    });

    // State-specific rules
    this.ruleEngine.set('STATE_MEDICATION_MANAGEMENT', {
      id: 'STATE_MEDICATION_MANAGEMENT',
      category: 'medication',
      severity: 'high',
      description: 'Medication administration requires proper documentation and oversight',
      checkFunction: this.checkMedicationCompliance.bind(this),
      remediation: 'Ensure licensed personnel oversee medication administration'
    });

    this.ruleEngine.set('STATE_STAFFING_RATIOS', {
      id: 'STATE_STAFFING_RATIOS',
      category: 'staffing',
      severity: 'medium',
      description: 'Maintain required staff-to-patient ratios',
      checkFunction: this.checkStaffingRatios.bind(this),
      remediation: 'Adjust staffing schedules to meet minimum requirements'
    });
  }

  async analyzeDocument(document, context = {}) {
    try {
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Starting compliance analysis for document: ${document.id}`);

      const analysis = {
        id: analysisId,
        documentId: document.id,
        documentType: document.type,
        timestamp: new Date(),
        context: context,
        overallScore: 0,
        violations: [],
        warnings: [],
        recommendations: [],
        aiInsights: {},
        riskLevel: 'low',
        complianceGaps: []
      };

      // Run AI-powered text analysis
      analysis.aiInsights = await this.performAIAnalysis(document);

      // Check against all compliance rules
      for (const [ruleId, rule] of this.ruleEngine.entries()) {
        try {
          const ruleResult = await rule.checkFunction(document, context);
          
          if (!ruleResult.compliant) {
            const violation = {
              ruleId: ruleId,
              rule: rule.description,
              severity: rule.severity,
              category: rule.category,
              details: ruleResult.details,
              remediation: rule.remediation,
              affectedFields: ruleResult.affectedFields || [],
              riskScore: this.calculateRiskScore(rule.severity, ruleResult.confidence || 0.8)
            };

            if (rule.severity === 'critical' || rule.severity === 'high') {
              analysis.violations.push(violation);
            } else {
              analysis.warnings.push(violation);
            }
          }
        } catch (ruleError) {
          console.error(`Error checking rule ${ruleId}:`, ruleError);
          analysis.warnings.push({
            ruleId: ruleId,
            rule: rule.description,
            severity: 'low',
            category: 'system',
            details: 'Rule check failed - manual review recommended',
            remediation: 'Contact system administrator'
          });
        }
      }

      // Calculate overall compliance score
      analysis.overallScore = this.calculateComplianceScore(analysis);
      analysis.riskLevel = this.assessRiskLevel(analysis);
      analysis.complianceGaps = this.identifyComplianceGaps(analysis);

      // Cache results
      this.complianceCache.set(document.id, {
        timestamp: Date.now(),
        analysis: analysis
      });

      // Update violation history
      this.updateViolationHistory(document.id, analysis);

      // Add to audit trail
      this.auditTrail.push({
        timestamp: new Date(),
        action: 'compliance_analysis',
        documentId: document.id,
        analysisId: analysisId,
        score: analysis.overallScore,
        violationCount: analysis.violations.length
      });

      return analysis;

    } catch (error) {
      console.error('Compliance analysis error:', error);
      throw new Error(`Compliance analysis failed: ${error.message}`);
    }
  }

  async performAIAnalysis(document) {
    try {
      // Simulate AI-powered analysis
      const insights = {
        sentimentAnalysis: {
          score: Math.random() * 2 - 1, // -1 to 1
          confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          keyPhrases: ['patient care', 'medication administration', 'vital signs', 'care plan']
        },
        entityExtraction: {
          medications: this.extractMedications(document.content),
          diagnoses: this.extractDiagnoses(document.content),
          procedures: this.extractProcedures(document.content),
          dates: this.extractDates(document.content)
        },
        riskFactors: {
          missingInformation: Math.random() * 0.5,
          inconsistentData: Math.random() * 0.3,
          urgentIndicators: Math.random() * 0.2
        },
        qualityMetrics: {
          completeness: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          accuracy: Math.random() * 0.2 + 0.8, // 0.8 to 1.0
          timeliness: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
        }
      };

      return insights;
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        error: 'AI analysis unavailable',
        fallbackAnalysis: true
      };
    }
  }

  // Rule check functions
  async checkPHIProtection(document, context) {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // DOB patterns
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[\-\.]?\d{3}[\-\.]?\d{4}\b/ // Phone
    ];

    const violations = [];
    const content = document.content || '';

    phiPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        violations.push(`Potential PHI detected: Pattern ${index + 1}`);
      }
    });

    return {
      compliant: violations.length === 0,
      confidence: 0.85,
      details: violations.length > 0 ? `Found ${violations.length} potential PHI exposures` : 'No PHI exposure detected',
      affectedFields: violations.length > 0 ? ['content'] : []
    };
  }

  async checkBreachNotification(document, context) {
    // Check if this is a security incident report
    const isSecurityIncident = document.type === 'security_incident' || 
                               document.tags?.includes('security') ||
                               /breach|incident|violation/i.test(document.title || '');

    if (!isSecurityIncident) {
      return { compliant: true, confidence: 1.0, details: 'Not a security incident' };
    }

    const createdDate = new Date(document.createdAt);
    const incidentDate = new Date(document.incidentDate || document.createdAt);
    const daysSinceIncident = (createdDate - incidentDate) / (1000 * 60 * 60 * 24);

    return {
      compliant: daysSinceIncident <= 60,
      confidence: 0.9,
      details: daysSinceIncident > 60 ? `Incident reported ${Math.floor(daysSinceIncident)} days late` : 'Reported within required timeframe',
      affectedFields: daysSinceIncident > 60 ? ['incidentDate', 'reportedDate'] : []
    };
  }

  async checkCMSDocumentation(document, context) {
    const requiredFields = ['patientId', 'providerId', 'serviceDate', 'diagnosis', 'services'];
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!document[field] && !document.data?.[field]) {
        missingFields.push(field);
      }
    });

    // Check for signature
    const hasSignature = document.signature || document.data?.signature || document.signedBy;

    if (!hasSignature) {
      missingFields.push('signature');
    }

    return {
      compliant: missingFields.length === 0,
      confidence: 0.95,
      details: missingFields.length > 0 ? `Missing required fields: ${missingFields.join(', ')}` : 'All CMS requirements met',
      affectedFields: missingFields
    };
  }

  async checkCarePlanUpdates(document, context) {
    if (document.type !== 'care_plan') {
      return { compliant: true, confidence: 1.0, details: 'Not a care plan document' };
    }

    const lastUpdate = new Date(document.lastUpdated || document.createdAt);
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);

    return {
      compliant: daysSinceUpdate <= 60,
      confidence: 0.9,
      details: daysSinceUpdate > 60 ? `Care plan not updated for ${Math.floor(daysSinceUpdate)} days` : 'Care plan is current',
      affectedFields: daysSinceUpdate > 60 ? ['lastUpdated'] : []
    };
  }

  async checkMedicationCompliance(document, context) {
    if (!document.medications && !document.data?.medications) {
      return { compliant: true, confidence: 1.0, details: 'No medications to check' };
    }

    const medications = document.medications || document.data?.medications || [];
    const violations = [];

    medications.forEach((med, index) => {
      if (!med.prescriber) {
        violations.push(`Medication ${index + 1}: Missing prescriber`);
      }
      if (!med.dosage) {
        violations.push(`Medication ${index + 1}: Missing dosage`);
      }
      if (!med.frequency) {
        violations.push(`Medication ${index + 1}: Missing frequency`);
      }
    });

    return {
      compliant: violations.length === 0,
      confidence: 0.9,
      details: violations.length > 0 ? violations.join('; ') : 'All medication documentation complete',
      affectedFields: violations.length > 0 ? ['medications'] : []
    };
  }

  async checkStaffingRatios(document, context) {
    if (document.type !== 'staffing_report' && !context.staffingData) {
      return { compliant: true, confidence: 0.5, details: 'Unable to verify staffing ratios' };
    }

    const staffingData = context.staffingData || document.data?.staffing;
    if (!staffingData) {
      return { compliant: false, confidence: 0.8, details: 'Staffing data not provided' };
    }

    const requiredRatio = context.requiredStaffingRatio || 1.5; // 1 staff per 1.5 patients
    const actualRatio = staffingData.patients / staffingData.staff;

    return {
      compliant: actualRatio <= requiredRatio,
      confidence: 0.95,
      details: actualRatio > requiredRatio ? `Staffing ratio ${actualRatio.toFixed(1)}:1 exceeds maximum of ${requiredRatio}:1` : 'Staffing ratios meet requirements',
      affectedFields: actualRatio > requiredRatio ? ['staffing'] : []
    };
  }

  // Utility methods
  calculateComplianceScore(analysis) {
    let totalPoints = 100;
    
    analysis.violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          totalPoints -= 25;
          break;
        case 'high':
          totalPoints -= 15;
          break;
        case 'medium':
          totalPoints -= 10;
          break;
        case 'low':
          totalPoints -= 5;
          break;
      }
    });

    analysis.warnings.forEach(warning => {
      totalPoints -= 3;
    });

    return Math.max(0, Math.min(100, totalPoints));
  }

  calculateRiskScore(severity, confidence) {
    const severityWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1
    };

    return (severityWeights[severity] || 1) * confidence;
  }

  assessRiskLevel(analysis) {
    const criticalCount = analysis.violations.filter(v => v.severity === 'critical').length;
    const highCount = analysis.violations.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (analysis.overallScore < 70) return 'medium';
    return 'low';
  }

  identifyComplianceGaps(analysis) {
    const gaps = [];
    const categoryViolations = {};

    analysis.violations.forEach(violation => {
      if (!categoryViolations[violation.category]) {
        categoryViolations[violation.category] = [];
      }
      categoryViolations[violation.category].push(violation);
    });

    Object.entries(categoryViolations).forEach(([category, violations]) => {
      gaps.push({
        category: category,
        violationCount: violations.length,
        severity: violations.some(v => v.severity === 'critical') ? 'critical' : 
                 violations.some(v => v.severity === 'high') ? 'high' : 'medium',
        description: `${violations.length} compliance issues in ${category}`,
        recommendations: violations.map(v => v.remediation)
      });
    });

    return gaps;
  }

  // Text extraction methods
  extractMedications(content) {
    const medications = [];
    const medPatterns = [
      /(?:prescribed|taking|administered)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/gi,
      /([A-Za-z]+)\s+\d+\s*mg/gi
    ];

    medPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        medications.push(match[1]);
      }
    });

    return [...new Set(medications)]; // Remove duplicates
  }

  extractDiagnoses(content) {
    const diagnoses = [];
    const diagnosisKeywords = ['diagnosed with', 'diagnosis:', 'condition:', 'suffers from'];
    
    diagnosisKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}\\s+([^.]+)`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        diagnoses.push(match[1].trim());
      }
    });

    return diagnoses;
  }

  extractProcedures(content) {
    const procedures = [];
    const procedureKeywords = ['procedure:', 'performed', 'treatment:', 'intervention:'];
    
    procedureKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}\\s+([^.]+)`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        procedures.push(match[1].trim());
      }
    });

    return procedures;
  }

  extractDates(content) {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
      /\b\d{4}-\d{1,2}-\d{1,2}\b/g
    ];

    const dates = [];
    datePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    });

    return dates;
  }

  updateViolationHistory(documentId, analysis) {
    if (!this.violationHistory.has(documentId)) {
      this.violationHistory.set(documentId, []);
    }

    const history = this.violationHistory.get(documentId);
    history.push({
      timestamp: new Date(),
      score: analysis.overallScore,
      violationCount: analysis.violations.length,
      riskLevel: analysis.riskLevel
    });

    // Keep only last 10 analyses
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }

  startPeriodicChecks() {
    // Run compliance checks every hour
    setInterval(() => {
      this.performPeriodicMaintenance();
    }, 60 * 60 * 1000);
  }

  async performPeriodicMaintenance() {
    try {
      // Clean old cache entries
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const [key, value] of this.complianceCache.entries()) {
        if (value.timestamp < oneHourAgo) {
          this.complianceCache.delete(key);
        }
      }

      // Trim audit trail
      if (this.auditTrail.length > 1000) {
        this.auditTrail.splice(0, this.auditTrail.length - 1000);
      }

      console.log('Compliance engine maintenance completed');
    } catch (error) {
      console.error('Maintenance error:', error);
    }
  }

  // Public API methods
  async getComplianceReport(organizationId, timeRange = '30d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      const relevantAudits = this.auditTrail.filter(audit => 
        audit.timestamp >= startDate && audit.timestamp <= endDate
      );

      const report = {
        organizationId,
        timeRange,
        generatedAt: new Date(),
        summary: {
          totalDocumentsAnalyzed: relevantAudits.length,
          averageComplianceScore: relevantAudits.reduce((sum, audit) => sum + audit.score, 0) / relevantAudits.length || 0,
          totalViolations: relevantAudits.reduce((sum, audit) => sum + audit.violationCount, 0),
          trendsAnalysis: this.analyzeTrends(relevantAudits)
        },
        riskAssessment: this.generateRiskAssessment(relevantAudits),
        recommendations: this.generateRecommendations(relevantAudits),
        complianceByCategory: this.analyzeComplianceByCategory(relevantAudits)
      };

      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  analyzeTrends(audits) {
    if (audits.length < 2) return { trend: 'insufficient_data' };

    const scores = audits.map(a => a.score);
    const recentScores = scores.slice(-7); // Last 7 entries
    const earlierScores = scores.slice(0, 7); // First 7 entries

    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;

    const improvement = recentAvg - earlierAvg;

    return {
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      improvement: improvement.toFixed(1),
      confidence: Math.min(audits.length / 30, 1.0) // More data = higher confidence
    };
  }

  generateRiskAssessment(audits) {
    const recentAudits = audits.slice(-10);
    const avgScore = recentAudits.reduce((sum, audit) => sum + audit.score, 0) / recentAudits.length;
    const totalViolations = recentAudits.reduce((sum, audit) => sum + audit.violationCount, 0);

    let riskLevel = 'low';
    if (avgScore < 70 || totalViolations > 20) {
      riskLevel = 'high';
    } else if (avgScore < 85 || totalViolations > 10) {
      riskLevel = 'medium';
    }

    return {
      overallRisk: riskLevel,
      averageScore: avgScore.toFixed(1),
      totalViolations: totalViolations,
      keyRiskFactors: this.identifyRiskFactors(recentAudits)
    };
  }

  identifyRiskFactors(audits) {
    const factors = [];
    
    const lowScoreCount = audits.filter(a => a.score < 80).length;
    if (lowScoreCount > audits.length * 0.3) {
      factors.push('Frequent low compliance scores');
    }

    const highViolationCount = audits.filter(a => a.violationCount > 3).length;
    if (highViolationCount > audits.length * 0.2) {
      factors.push('High violation frequency');
    }

    return factors;
  }

  generateRecommendations(audits) {
    const recommendations = [];

    const avgScore = audits.reduce((sum, audit) => sum + audit.score, 0) / audits.length;
    if (avgScore < 85) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        recommendation: 'Focus on improving overall compliance processes and training',
        impact: 'High - will improve overall compliance score'
      });
    }

    const totalViolations = audits.reduce((sum, audit) => sum + audit.violationCount, 0);
    if (totalViolations > 15) {
      recommendations.push({
        priority: 'medium',
        category: 'process',
        recommendation: 'Implement automated compliance checking in workflow',
        impact: 'Medium - will reduce violation frequency'
      });
    }

    return recommendations;
  }

  analyzeComplianceByCategory(audits) {
    // This would normally analyze violations by category
    // For now, return mock data based on common healthcare compliance categories
    return {
      documentation: { score: 85, violationCount: 5, trend: 'stable' },
      privacy: { score: 92, violationCount: 2, trend: 'improving' },
      security: { score: 88, violationCount: 3, trend: 'stable' },
      care_planning: { score: 90, violationCount: 1, trend: 'improving' },
      medication: { score: 87, violationCount: 4, trend: 'declining' },
      staffing: { score: 83, violationCount: 6, trend: 'stable' }
    };
  }

  // Rule management
  addCustomRule(ruleDefinition) {
    if (!ruleDefinition.id || !ruleDefinition.checkFunction) {
      throw new Error('Rule must have an id and checkFunction');
    }

    this.ruleEngine.set(ruleDefinition.id, {
      id: ruleDefinition.id,
      category: ruleDefinition.category || 'custom',
      severity: ruleDefinition.severity || 'medium',
      description: ruleDefinition.description || 'Custom compliance rule',
      checkFunction: ruleDefinition.checkFunction,
      remediation: ruleDefinition.remediation || 'Review and address compliance issue'
    });

    console.log(`Added custom compliance rule: ${ruleDefinition.id}`);
  }

  removeRule(ruleId) {
    if (this.ruleEngine.has(ruleId)) {
      this.ruleEngine.delete(ruleId);
      console.log(`Removed compliance rule: ${ruleId}`);
      return true;
    }
    return false;
  }

  getRules() {
    return Array.from(this.ruleEngine.entries()).map(([id, rule]) => ({
      id: id,
      category: rule.category,
      severity: rule.severity,
      description: rule.description,
      remediation: rule.remediation
    }));
  }

  // Cache management
  clearCache(documentId = null) {
    if (documentId) {
      this.complianceCache.delete(documentId);
      this.violationHistory.delete(documentId);
    } else {
      this.complianceCache.clear();
      this.violationHistory.clear();
    }
  }

  getCacheStats() {
    return {
      cacheSize: this.complianceCache.size,
      historySize: this.violationHistory.size,
      auditTrailSize: this.auditTrail.length,
      rulesCount: this.ruleEngine.size
    };
  }
}

module.exports = new IntelligentComplianceEngine();