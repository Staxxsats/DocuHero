import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Shield,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Building,
  Globe,
  Star,
  Award,
  Activity,
  PieChart,
  LineChart,
  Settings,
  Bell,
  MessageSquare,
  Briefcase,
  CreditCard,
  UserCheck,
  FileCheck,
  Smartphone,
  Mail
} from 'lucide-react';

interface KPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  target?: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'compliance';
}

interface ReportData {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'compliance' | 'customer';
  period: string;
  status: 'generated' | 'pending' | 'failed';
  generatedDate: Date;
  fileSize: string;
  description: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  progress: number;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
}

interface Notification {
  id: string;
  type: 'alert' | 'update' | 'milestone' | 'report';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

const StakeholderPortal: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<'all' | KPI['category']>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'financial' | 'operational' | 'compliance'>('overview');

  const kpis: KPI[] = [
    {
      id: '1',
      title: 'Monthly Recurring Revenue',
      value: '$147,500',
      change: 15.2,
      trend: 'up',
      target: '$150,000',
      status: 'good',
      description: 'Total MRR from all subscription plans',
      category: 'financial'
    },
    {
      id: '2',
      title: 'Customer Acquisition Cost',
      value: '$245',
      change: -8.3,
      trend: 'up',
      target: '$200',
      status: 'warning',
      description: 'Average cost to acquire new customers',
      category: 'financial'
    },
    {
      id: '3',
      title: 'Active Users',
      value: 2847,
      change: 12.1,
      trend: 'up',
      target: 3000,
      status: 'good',
      description: 'Monthly active healthcare professionals',
      category: 'customer'
    },
    {
      id: '4',
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: 2.5,
      trend: 'up',
      target: '4.5/5',
      status: 'good',
      description: 'Average customer satisfaction score',
      category: 'customer'
    },
    {
      id: '5',
      title: 'System Uptime',
      value: '99.97%',
      change: -0.01,
      trend: 'neutral',
      target: '99.9%',
      status: 'good',
      description: 'Platform availability this month',
      category: 'operational'
    },
    {
      id: '6',
      title: 'Documents Processed',
      value: 58743,
      change: 18.7,
      trend: 'up',
      target: 60000,
      status: 'good',
      description: 'Total documents processed this month',
      category: 'operational'
    },
    {
      id: '7',
      title: 'Compliance Score',
      value: '96.2%',
      change: 1.8,
      trend: 'up',
      target: '95%',
      status: 'good',
      description: 'Average compliance across all documents',
      category: 'compliance'
    },
    {
      id: '8',
      title: 'Security Incidents',
      value: 0,
      change: -100,
      trend: 'up',
      target: 0,
      status: 'good',
      description: 'Number of security incidents this month',
      category: 'compliance'
    }
  ];

  const reports: ReportData[] = [
    {
      id: '1',
      title: 'Q1 2024 Financial Report',
      type: 'financial',
      period: 'Q1 2024',
      status: 'generated',
      generatedDate: new Date('2024-01-15'),
      fileSize: '2.4 MB',
      description: 'Comprehensive financial analysis including revenue, costs, and projections'
    },
    {
      id: '2',
      title: 'HIPAA Compliance Audit',
      type: 'compliance',
      period: 'January 2024',
      status: 'generated',
      generatedDate: new Date('2024-01-10'),
      fileSize: '1.8 MB',
      description: 'Monthly HIPAA compliance audit results and recommendations'
    },
    {
      id: '3',
      title: 'Customer Growth Analysis',
      type: 'customer',
      period: 'Last 30 Days',
      status: 'pending',
      generatedDate: new Date('2024-01-20'),
      fileSize: 'Pending',
      description: 'Customer acquisition, retention, and satisfaction metrics'
    },
    {
      id: '4',
      title: 'Operational Performance',
      type: 'operational',
      period: 'January 2024',
      status: 'generated',
      generatedDate: new Date('2024-01-18'),
      fileSize: '3.1 MB',
      description: 'System performance, uptime, and operational efficiency metrics'
    }
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'SOC 2 Type II Certification',
      description: 'Complete SOC 2 Type II audit and certification process',
      dueDate: new Date('2024-03-31'),
      status: 'in_progress',
      progress: 75,
      assignee: 'Security Team',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Mobile App Launch',
      description: 'Launch iOS and Android mobile applications',
      dueDate: new Date('2024-02-28'),
      status: 'in_progress',
      progress: 60,
      assignee: 'Development Team',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Enterprise API v2.0',
      description: 'Release enhanced API with new features for enterprise clients',
      dueDate: new Date('2024-04-15'),
      status: 'pending',
      progress: 25,
      assignee: 'Product Team',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'European Market Expansion',
      description: 'Launch operations in European markets with GDPR compliance',
      dueDate: new Date('2024-06-30'),
      status: 'pending',
      progress: 15,
      assignee: 'Business Development',
      priority: 'medium'
    }
  ];

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'High Revenue Growth',
      message: 'Monthly revenue exceeded target by 12% this month',
      timestamp: new Date('2024-01-20T10:30:00'),
      priority: 'high',
      read: false
    },
    {
      id: '2',
      type: 'milestone',
      title: 'SOC 2 Audit Progress',
      message: 'SOC 2 Type II audit reached 75% completion milestone',
      timestamp: new Date('2024-01-19T14:15:00'),
      priority: 'medium',
      read: false
    },
    {
      id: '3',
      type: 'report',
      title: 'Q1 Financial Report Ready',
      message: 'Q1 2024 financial report has been generated and is ready for review',
      timestamp: new Date('2024-01-18T09:00:00'),
      priority: 'medium',
      read: true
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getKPIStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getTrendIcon = (trend: KPI['trend'], change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getReportStatusColor = (status: ReportData['status']) => {
    switch (status) {
      case 'generated':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getReportIcon = (type: ReportData['type']) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'operational':
        return <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'customer':
        return <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const exportReport = (report: ReportData) => {
    // Simulate report download
    const blob = new Blob([`${report.title} - ${report.description}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              Stakeholder Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Executive dashboard and business intelligence
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'alert' ? 'bg-red-100 dark:bg-red-900/20' :
                            notification.type === 'milestone' ? 'bg-blue-100 dark:bg-blue-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            {notification.type === 'alert' && <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />}
                            {notification.type === 'milestone' && <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                            {notification.type === 'report' && <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button className="btn-primary text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'operational', label: 'Operational', icon: Settings },
              { id: 'compliance', label: 'Compliance', icon: Shield }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id as any)}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Key Performance Indicators
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="customer">Customer</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredKPIs.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getKPIStatusColor(kpi.status)}`}>
                    {kpi.status}
                  </div>
                  {getTrendIcon(kpi.trend, kpi.change)}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {kpi.value}
                    </span>
                    <span className={`text-sm font-medium ${
                      kpi.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                    </span>
                  </div>
                  {kpi.target && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Target: {kpi.target}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {kpi.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h3>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Monthly Growth Rate</span>
                <span className="font-medium text-green-600 dark:text-green-400">+15.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Quarterly Projection</span>
                <span className="font-medium text-gray-900 dark:text-white">$465,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Annual Run Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">$1.77M</span>
              </div>
            </div>
            
            {/* Simplified chart representation */}
            <div className="mt-6 h-32 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg flex items-end justify-between p-4">
              {[60, 75, 85, 92, 88, 95, 100].map((height, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${height}%`, width: '12%' }}
                />
              ))}
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Distribution
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {[
                { category: 'Healthcare Providers', percentage: 45, color: 'bg-blue-500' },
                { category: 'Educational Institutions', percentage: 30, color: 'bg-green-500' },
                { category: 'Mental Health Clinics', percentage: 15, color: 'bg-purple-500' },
                { category: 'Other Organizations', percentage: 10, color: 'bg-orange-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.percentage}%
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="w-5 h-5 text-blue-500 mr-2" />
                Strategic Milestones
              </h3>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {milestone.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        milestone.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {milestone.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {milestone.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {milestone.dueDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {milestone.assignee}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {milestone.progress}%
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          milestone.progress >= 75 ? 'bg-green-500' :
                          milestone.progress >= 50 ? 'bg-blue-500' :
                          milestone.progress >= 25 ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                Executive Reports
              </h3>
              <button className="btn-primary text-sm">
                <Download className="w-4 h-4 mr-1" />
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getReportIcon(report.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>Period: {report.period}</span>
                        <span>•</span>
                        <span>Generated: {report.generatedDate.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Size: {report.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium ${getReportStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    {report.status === 'generated' && (
                      <button
                        onClick={() => exportReport(report)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Board Meeting Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Access and manage board meeting documentation
            </p>
            <button className="btn-secondary w-full text-sm">
              Access Notes
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Investor Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate and send investor update reports
            </p>
            <button className="btn-secondary w-full text-sm">
              Create Update
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Custom Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Build custom reports and analytics dashboards
            </p>
            <button className="btn-secondary w-full text-sm">
              Build Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderPortal;