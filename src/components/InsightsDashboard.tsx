import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Brain, Target, Users, Clock, Calendar, BarChart3, LineChart, PieChart, Activity } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface Insight {
  id: string;
  type: 'suggestion' | 'alert' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const InsightsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'Client Satisfaction',
      value: '4.8/5',
      change: 5.2,
      trend: 'up',
      icon: <Users className="w-6 h-6" />
    },
    {
      label: 'Session Completion Rate',
      value: '94%',
      change: 2.1,
      trend: 'up',
      icon: <Target className="w-6 h-6" />
    },
    {
      label: 'Avg. Documentation Time',
      value: '12 min',
      change: -15.3,
      trend: 'down',
      icon: <Clock className="w-6 h-6" />
    },
    {
      label: 'Weekly Sessions',
      value: '156',
      change: 8.7,
      trend: 'up',
      icon: <Calendar className="w-6 h-6" />
    }
  ]);

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'suggestion',
      title: 'Optimize Thursday Schedule',
      description: 'You have 3 hours of downtime on Thursdays. Consider scheduling group sessions to maximize efficiency.',
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'alert',
      title: 'High No-Show Rate Detected',
      description: 'Monday morning appointments have a 25% no-show rate. Consider sending additional reminders.',
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Documentation Excellence',
      description: 'Your average note completion time has decreased by 30% this month!',
      priority: 'low',
      timestamp: new Date()
    }
  ]);

  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('satisfaction');

  // Simulated real-time data update
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          change: metric.change + (Math.random() - 0.5) * 0.5
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    satisfaction: [4.5, 4.6, 4.7, 4.6, 4.8, 4.7, 4.8],
    sessions: [145, 152, 148, 155, 160, 158, 156],
    completion: [91, 92, 93, 92, 94, 93, 94],
    documentation: [15, 14, 13, 13, 12, 12, 12]
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'achievement':
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Insights & Analytics</h1>
        <p className="text-gray-600">AI-powered recommendations to optimize your practice</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 text-green-500" />
          <span>Live updates enabled</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedMetric(metric.label.toLowerCase().split(' ')[0])}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(metric.change).toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Performance Trends</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <LineChart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <PieChart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Simulated Chart */}
          <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="w-16 h-16 text-indigo-600 mx-auto mb-3" />
              <p className="text-gray-600">Interactive chart showing {selectedMetric} trends</p>
              <p className="text-sm text-gray-500 mt-2">Data updates in real-time</p>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">+12%</p>
              <p className="text-sm text-gray-600">Growth Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-gray-600">Goal Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">4.2h</p>
              <p className="text-sm text-gray-600">Time Saved</p>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            AI Insights
          </h2>
          
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.type === 'alert' 
                    ? 'border-red-200 bg-red-50' 
                    : insight.type === 'achievement'
                    ? 'border-green-200 bg-green-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {insight.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            View All Insights →
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Optimize Scheduling
            </h3>
            <p className="text-indigo-100 text-sm">
              Consider implementing buffer time between sessions to reduce stress and improve documentation quality.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Client Engagement
            </h3>
            <p className="text-indigo-100 text-sm">
              Clients who receive appointment reminders 24h in advance show 40% better attendance rates.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Optimization
            </h3>
            <p className="text-indigo-100 text-sm">
              Adding group therapy sessions on Tuesday evenings could increase weekly revenue by 15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;