class RealTimeDashboardService {
  constructor() {
    this.metricsCache = new Map();
    this.alertsCache = new Map();
    this.subscribers = new Map();
    this.updateInterval = 30000; // 30 seconds
    
    // Start real-time updates
    this.startRealTimeUpdates();
  }

  async getMetrics(agencyId) {
    try {
      // Check cache first
      const cached = this.metricsCache.get(agencyId);
      if (cached && Date.now() - cached.timestamp < this.updateInterval) {
        return cached.data;
      }

      // Generate/fetch fresh metrics
      const metrics = await this.generateMetrics(agencyId);
      
      // Cache the results
      this.metricsCache.set(agencyId, {
        data: metrics,
        timestamp: Date.now()
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  async generateMetrics(agencyId) {
    // Simulate real data - replace with actual database queries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      agencyId,
      timestamp: now,
      overview: {
        totalClients: this.randomBetween(45, 67),
        activeEmployees: this.randomBetween(12, 18),
        documentsToday: this.randomBetween(8, 25),
        complianceScore: this.randomBetween(92, 98, 1),
        avgResponseTime: this.randomBetween(15, 45), // minutes
        systemUptime: '99.9%'
      },
      documentation: {
        completedToday: this.randomBetween(15, 32),
        pendingReview: this.randomBetween(3, 8),
        overdue: this.randomBetween(0, 3),
        avgCompletionTime: this.randomBetween(12, 28), // minutes
        qualityScore: this.randomBetween(88, 96, 1),
        topDocumentTypes: [
          { type: 'Care Plans', count: this.randomBetween(8, 15) },
          { type: 'Progress Notes', count: this.randomBetween(10, 20) },
          { type: 'Incident Reports', count: this.randomBetween(1, 4) },
          { type: 'Assessments', count: this.randomBetween(5, 12) }
        ]
      },
      compliance: {
        overallScore: this.randomBetween(94, 98, 1),
        recentAudits: this.randomBetween(2, 5),
        pendingCorrections: this.randomBetween(0, 2),
        certificationStatus: 'Current',
        nextAuditDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days
        criticalIssues: this.randomBetween(0, 1),
        byCategory: {
          documentation: this.randomBetween(95, 99, 1),
          staffing: this.randomBetween(92, 97, 1),
          safety: this.randomBetween(96, 100, 1),
          medicationManagement: this.randomBetween(93, 98, 1)
        }
      },
      staffing: {
        onDutyNow: this.randomBetween(8, 14),
        scheduledToday: this.randomBetween(15, 22),
        callOuts: this.randomBetween(0, 2),
        overtime: this.randomBetween(2, 8), // hours
        staffingRatio: '1:4.2',
        nextShiftChange: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours
        certificationExpiring: this.randomBetween(0, 3) // within 30 days
      },
      financial: {
        dailyRevenue: this.randomBetween(8500, 12000),
        monthlyTarget: 285000,
        monthlyActual: this.randomBetween(180000, 220000),
        outstandingInvoices: this.randomBetween(15, 35),
        collectionsRate: this.randomBetween(92, 97, 1),
        avgPaymentDelay: this.randomBetween(18, 35), // days
        reimbursementPending: this.randomBetween(25000, 45000)
      },
      clientSatisfaction: {
        averageRating: this.randomBetween(4.2, 4.8, 1),
        totalResponses: this.randomBetween(28, 45),
        recentFeedback: this.randomBetween(5, 12),
        complaintsThisMonth: this.randomBetween(0, 2),
        recommendationRate: this.randomBetween(88, 95, 1),
        responseRate: this.randomBetween(65, 85, 1)
      },
      trends: {
        documentationGrowth: this.randomBetween(-5, 15, 1), // % change
        complianceImprovement: this.randomBetween(0, 8, 1),
        clientGrowth: this.randomBetween(-2, 12, 1),
        efficiencyGain: this.randomBetween(2, 18, 1),
        costReduction: this.randomBetween(0, 12, 1)
      }
    };
  }

  async getAlerts(agencyId) {
    try {
      // Check cache first
      const cached = this.alertsCache.get(agencyId);
      if (cached && Date.now() - cached.timestamp < this.updateInterval / 2) {
        return cached.data;
      }

      // Generate/fetch fresh alerts
      const alerts = await this.generateAlerts(agencyId);
      
      // Cache the results
      this.alertsCache.set(agencyId, {
        data: alerts,
        timestamp: Date.now()
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  async generateAlerts(agencyId) {
    const alerts = [];
    const now = new Date();

    // Generate dynamic alerts based on metrics
    const metrics = await this.getMetrics(agencyId);

    // Critical alerts
    if (metrics.compliance.criticalIssues > 0) {
      alerts.push({
        id: `alert_${Date.now()}_critical`,
        type: 'critical',
        category: 'compliance',
        title: 'Critical Compliance Issue',
        message: `${metrics.compliance.criticalIssues} critical compliance issue(s) require immediate attention`,
        timestamp: now,
        actionRequired: true,
        link: '/compliance/issues'
      });
    }

    if (metrics.documentation.overdue > 2) {
      alerts.push({
        id: `alert_${Date.now()}_overdue`,
        type: 'critical',
        category: 'documentation',
        title: 'Overdue Documentation',
        message: `${metrics.documentation.overdue} documents are overdue and may affect compliance`,
        timestamp: now,
        actionRequired: true,
        link: '/documentation/overdue'
      });
    }

    // Warning alerts
    if (metrics.staffing.callOuts > 1) {
      alerts.push({
        id: `alert_${Date.now()}_staffing`,
        type: 'warning',
        category: 'staffing',
        title: 'Staffing Shortage',
        message: `${metrics.staffing.callOuts} staff call-outs today may impact service delivery`,
        timestamp: now,
        actionRequired: false,
        link: '/staffing/schedule'
      });
    }

    if (metrics.compliance.overallScore < 95) {
      alerts.push({
        id: `alert_${Date.now()}_compliance`,
        type: 'warning',
        category: 'compliance',
        title: 'Compliance Score Below Target',
        message: `Current compliance score is ${metrics.compliance.overallScore}%, below 95% target`,
        timestamp: now,
        actionRequired: false,
        link: '/compliance/dashboard'
      });
    }

    // Info alerts
    if (metrics.staffing.certificationExpiring > 0) {
      alerts.push({
        id: `alert_${Date.now()}_cert`,
        type: 'info',
        category: 'staffing',
        title: 'Certifications Expiring',
        message: `${metrics.staffing.certificationExpiring} staff certification(s) expire within 30 days`,
        timestamp: now,
        actionRequired: false,
        link: '/staff/certifications'
      });
    }

    if (metrics.financial.outstandingInvoices > 25) {
      alerts.push({
        id: `alert_${Date.now()}_billing`,
        type: 'info',
        category: 'financial',
        title: 'Outstanding Invoices',
        message: `${metrics.financial.outstandingInvoices} invoices are outstanding`,
        timestamp: now,
        actionRequired: false,
        link: '/billing/outstanding'
      });
    }

    // Success alerts
    if (metrics.clientSatisfaction.averageRating > 4.5) {
      alerts.push({
        id: `alert_${Date.now()}_satisfaction`,
        type: 'success',
        category: 'quality',
        title: 'High Client Satisfaction',
        message: `Client satisfaction rating is ${metrics.clientSatisfaction.averageRating}/5.0 - Excellent!`,
        timestamp: now,
        actionRequired: false,
        link: '/quality/satisfaction'
      });
    }

    return alerts.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1, success: 0 };
      return priority[b.type] - priority[a.type];
    });
  }

  startRealTimeUpdates() {
    setInterval(() => {
      this.updateAllMetrics();
    }, this.updateInterval);
  }

  async updateAllMetrics() {
    try {
      // Update cached metrics for all agencies
      for (const agencyId of this.metricsCache.keys()) {
        await this.getMetrics(agencyId);
        await this.getAlerts(agencyId);
      }

      // Notify subscribers of updates
      this.notifySubscribers();
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  notifySubscribers() {
    for (const [agencyId, subscribers] of this.subscribers.entries()) {
      const metrics = this.metricsCache.get(agencyId);
      const alerts = this.alertsCache.get(agencyId);

      if (metrics && alerts) {
        subscribers.forEach(callback => {
          try {
            callback({
              type: 'metrics_update',
              agencyId,
              metrics: metrics.data,
              alerts: alerts.data,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Error notifying subscriber:', error);
          }
        });
      }
    }
  }

  subscribe(agencyId, callback) {
    if (!this.subscribers.has(agencyId)) {
      this.subscribers.set(agencyId, []);
    }
    this.subscribers.get(agencyId).push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(agencyId);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  // Historical data methods
  async getHistoricalMetrics(agencyId, timeRange = '7d') {
    // Mock historical data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const historical = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      historical.push({
        date: date.toISOString().split('T')[0],
        documentation: this.randomBetween(15, 35),
        compliance: this.randomBetween(92, 98, 1),
        clientSatisfaction: this.randomBetween(4.0, 4.9, 1),
        staffingRatio: this.randomBetween(1.3, 1.6, 1)
      });
    }

    return historical;
  }

  async exportMetrics(agencyId, format = 'json', timeRange = '30d') {
    const metrics = await this.getMetrics(agencyId);
    const historical = await this.getHistoricalMetrics(agencyId, timeRange);

    const exportData = {
      agencyId,
      exportedAt: new Date(),
      timeRange,
      currentMetrics: metrics,
      historicalData: historical
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return exportData;
  }

  convertToCSV(data) {
    // Simple CSV conversion for historical data
    const csv = ['Date,Documentation,Compliance,Client Satisfaction,Staffing Ratio'];
    
    data.historicalData.forEach(row => {
      csv.push(`${row.date},${row.documentation},${row.compliance},${row.clientSatisfaction},${row.staffingRatio}`);
    });

    return csv.join('\n');
  }

  // Utility methods
  randomBetween(min, max, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  }

  clearCache(agencyId) {
    if (agencyId) {
      this.metricsCache.delete(agencyId);
      this.alertsCache.delete(agencyId);
    } else {
      this.metricsCache.clear();
      this.alertsCache.clear();
    }
  }

  getSystemHealth() {
    return {
      status: 'healthy',
      uptime: '99.9%',
      memoryUsage: '45%',
      cpuUsage: '23%',
      databaseConnections: 'stable',
      lastUpdate: new Date(),
      services: {
        dashboard: 'online',
        compliance: 'online',
        documentation: 'online',
        staffing: 'online',
        billing: 'online'
      }
    };
  }
}

module.exports = new RealTimeDashboardService();