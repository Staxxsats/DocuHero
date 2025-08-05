import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Maximize2,
  Bell,
  Target,
  DollarSign,
  Shield,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Smartphone
} from 'lucide-react';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: Date;
  status: 'completed' | 'in_progress' | 'failed';
}

const RealTimeDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock data for real-time metrics
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      id: 'active_sessions',
      title: 'Active Sessions',
      value: 247,
      change: 12.5,
      trend: 'up',
      icon: Activity,
      color: 'blue',
      description: 'Current active documentation sessions'
    },
    {
      id: 'users_online',
      title: 'Users Online',
      value: 89,
      change: -2.3,
      trend: 'down',
      icon: Users,
      color: 'green',
      description: 'Healthcare professionals currently online'
    },
    {
      id: 'documents_processed',
      title: 'Documents Today',
      value: 1847,
      change: 18.7,
      trend: 'up',
      icon: FileText,
      color: 'purple',
      description: 'Documents processed in the last 24 hours'
    },
    {
      id: 'compliance_score',
      title: 'Compliance Score',
      value: '94.2%',
      change: 1.8,
      trend: 'up',
      icon: Shield,
      color: 'orange',
      description: 'Average compliance score across all documents'
    },
    {
      id: 'revenue_today',
      title: "Today's Revenue",
      value: '$12,847',
      change: 23.1,
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
      description: 'Revenue generated from documentation services'
    },
    {
      id: 'response_time',
      title: 'Avg Response Time',
      value: '1.2s',
      change: -8.4,
      trend: 'up',
      icon: Zap,
      color: 'yellow',
      description: 'Average AI processing response time'
    }
  ]);

  const documentTypesData: ChartData[] = [
    { name: 'SOAP Notes', value: 45, color: '#3B82F6' },
    { name: 'Progress Notes', value: 25, color: '#10B981' },
    { name: 'IEP Documents', value: 15, color: '#F59E0B' },
    { name: 'Assessment Reports', value: 10, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ];

  const complianceData: ChartData[] = [
    { name: 'HIPAA Compliant', value: 94, color: '#10B981' },
    { name: 'FERPA Compliant', value: 97, color: '#3B82F6' },
    { name: 'State Regulations', value: 91, color: '#F59E0B' },
    { name: 'Internal Policies', value: 89, color: '#8B5CF6' }
  ];

  const hourlyData: ChartData[] = [
    { name: '00:00', value: 12 },
    { name: '04:00', value: 8 },
    { name: '08:00', value: 45 },
    { name: '12:00', value: 67 },
    { name: '16:00', value: 89 },
    { name: '20:00', value: 34 }
  ];

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    // Simulate WebSocket connection
    const simulateWebSocket = () => {
      setInterval(() => {
        // Update metrics with random variations
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: typeof metric.value === 'number' 
            ? Math.max(0, metric.value + Math.floor(Math.random() * 10) - 5)
            : metric.value,
          change: (Math.random() - 0.5) * 20
        })));

        // Add random alerts
        if (Math.random() < 0.1) {
          const newAlert: AlertItem = {
            id: Date.now().toString(),
            type: ['error', 'warning', 'info', 'success'][Math.floor(Math.random() * 4)] as any,
            title: 'System Update',
            message: 'New compliance check completed',
            timestamp: new Date(),
            priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        }

        // Add random activities
        if (Math.random() < 0.2) {
          const actions = ['created', 'updated', 'reviewed', 'approved', 'exported'];
          const resources = ['SOAP note', 'Progress report', 'IEP document', 'Assessment'];
          const users = ['Dr. Smith', 'Nurse Johnson', 'Teacher Brown', 'Therapist Wilson'];
          
          const newActivity: ActivityItem = {
            id: Date.now().toString(),
            user: users[Math.floor(Math.random() * users.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            resource: resources[Math.floor(Math.random() * resources.length)],
            timestamp: new Date(),
            status: ['completed', 'in_progress', 'failed'][Math.floor(Math.random() * 3)] as any
          };
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        }
      }, 3000);
    };

    simulateWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getMetricIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const exportDashboardData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      activities,
      chartData: {
        documentTypes: documentTypesData,
        compliance: complianceData,
        hourly: hourlyData
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
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
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              Real-Time Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Live monitoring and analytics for DocuHero platform
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Last updated: {currentTime.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`p-2 rounded-lg border transition-colors ${
                  isAutoRefresh 
                    ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              </button>
              
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              <button
                onClick={exportDashboardData}
                className="btn-secondary text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              
              <button className="btn-primary text-sm">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedWidget(selectedWidget === metric.id ? null : metric.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                    <IconComponent className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                  {getMetricIcon(metric.trend)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    <span className={`text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {metric.description}
                  </p>
                </div>
                
                {selectedWidget === metric.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-500">Target</span>
                        <span className="text-gray-900 dark:text-white">95%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-500">Benchmark</span>
                        <span className="text-gray-900 dark:text-white">87%</span>
                      </div>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View Details →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Document Types Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document Types
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {documentTypesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.value}%
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Compliance Scores
              </h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {complianceData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                    <span className={`text-sm font-medium ${
                      item.value >= 95 ? 'text-green-600 dark:text-green-400' :
                      item.value >= 90 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.value >= 95 ? 'bg-green-500' :
                        item.value >= 90 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Timeline
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {hourlyData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 dark:text-gray-500 w-12">
                    {item.name}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-900 dark:text-white w-8">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bell className="w-5 h-5 text-orange-500 mr-2" />
                  System Alerts
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {alerts.length} active
                  </span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                    View All
                  </button>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              alert.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                              alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {alert.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Activity className="w-5 h-5 text-blue-500 mr-2" />
                  Recent Activity
                </h3>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                  View All
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'in_progress' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.user}</span>{' '}
                            {activity.action} a{' '}
                            <span className="font-medium">{activity.resource}</span>
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {activity.timestamp.toLocaleTimeString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                              activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Target className="w-5 h-5 text-green-500 mr-2" />
            System Health
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'API Response Time', value: '124ms', status: 'good', target: '< 200ms' },
              { name: 'Database Performance', value: '98.5%', status: 'excellent', target: '> 95%' },
              { name: 'Voice Processing', value: '99.2%', status: 'excellent', target: '> 99%' },
              { name: 'Security Score', value: '95/100', status: 'good', target: '> 90/100' }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  metric.status === 'excellent' ? 'bg-green-100 dark:bg-green-900/20' :
                  metric.status === 'good' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-yellow-100 dark:bg-yellow-900/20'
                }`}>
                  <div className={`w-8 h-8 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-500' :
                    metric.status === 'good' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  } animate-pulse`} />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Target: {metric.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;