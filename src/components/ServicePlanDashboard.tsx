import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Filter,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Archive,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Activity,
  Target,
  Award
} from 'lucide-react';

interface ServicePlan {
  id: string;
  patientName: string;
  planType: string;
  status: 'active' | 'pending' | 'completed' | 'expired' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  provider: string;
  startDate: string;
  endDate: string;
  progress: number;
  nextReview: string;
  location: string;
  contact: string;
  goals: number;
  completedGoals: number;
  complianceScore: number;
  lastUpdated: string;
  alerts: string[];
}

interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  completedThisMonth: number;
  complianceRate: number;
  avgCompletionTime: number;
  overdueReviews: number;
}

const ServicePlanDashboard: React.FC = () => {
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ServicePlan[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const planTypes = [
    { id: 'home-health', label: 'Home Health', color: 'bg-blue-100 text-blue-800' },
    { id: 'assisted-living', label: 'Assisted Living', color: 'bg-green-100 text-green-800' },
    { id: 'skilled-nursing', label: 'Skilled Nursing', color: 'bg-purple-100 text-purple-800' },
    { id: 'behavioral-health', label: 'Behavioral Health', color: 'bg-orange-100 text-orange-800' },
    { id: 'rehabilitation', label: 'Rehabilitation', color: 'bg-red-100 text-red-800' }
  ];

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    completed: { color: 'bg-blue-100 text-blue-800', icon: Award },
    expired: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    'on-hold': { color: 'bg-gray-100 text-gray-800', icon: Clock }
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-600', indicator: 'border-gray-300' },
    medium: { color: 'bg-blue-100 text-blue-600', indicator: 'border-blue-400' },
    high: { color: 'bg-orange-100 text-orange-600', indicator: 'border-orange-400' },
    urgent: { color: 'bg-red-100 text-red-600', indicator: 'border-red-400' }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterAndSortPlans();
  }, [servicePlans, selectedStatus, selectedPriority, searchTerm, sortBy]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPlans: ServicePlan[] = [
        {
          id: 'plan_001',
          patientName: 'John Smith',
          planType: 'home-health',
          status: 'active',
          priority: 'high',
          provider: 'Dr. Sarah Johnson',
          startDate: '2024-01-15',
          endDate: '2024-07-15',
          progress: 75,
          nextReview: '2024-02-15',
          location: 'Atlanta, GA',
          contact: '(555) 123-4567',
          goals: 8,
          completedGoals: 6,
          complianceScore: 92,
          lastUpdated: '2024-01-10T10:30:00Z',
          alerts: ['Review due soon', 'Medication compliance check needed']
        },
        {
          id: 'plan_002',
          patientName: 'Mary Davis',
          planType: 'assisted-living',
          status: 'pending',
          priority: 'medium',
          provider: 'Care Team Alpha',
          startDate: '2024-02-01',
          endDate: '2024-08-01',
          progress: 25,
          nextReview: '2024-02-20',
          location: 'Savannah, GA',
          contact: '(555) 987-6543',
          goals: 6,
          completedGoals: 2,
          complianceScore: 88,
          lastUpdated: '2024-01-12T14:45:00Z',
          alerts: ['Waiting for physician approval']
        },
        {
          id: 'plan_003',
          patientName: 'Robert Wilson',
          planType: 'skilled-nursing',
          status: 'completed',
          priority: 'low',
          provider: 'Dr. Michael Brown',
          startDate: '2023-10-01',
          endDate: '2024-01-01',
          progress: 100,
          nextReview: '2024-04-01',
          location: 'Augusta, GA',
          contact: '(555) 456-7890',
          goals: 10,
          completedGoals: 10,
          complianceScore: 96,
          lastUpdated: '2024-01-05T09:15:00Z',
          alerts: []
        },
        {
          id: 'plan_004',
          patientName: 'Lisa Anderson',
          planType: 'behavioral-health',
          status: 'active',
          priority: 'urgent',
          provider: 'Dr. Jennifer Lee',
          startDate: '2024-01-08',
          endDate: '2024-06-08',
          progress: 40,
          nextReview: '2024-02-08',
          location: 'Columbus, GA',
          contact: '(555) 321-0987',
          goals: 12,
          completedGoals: 5,
          complianceScore: 78,
          lastUpdated: '2024-01-13T16:20:00Z',
          alerts: ['High priority intervention needed', 'Crisis plan activation required']
        },
        {
          id: 'plan_005',
          patientName: 'David Johnson',
          planType: 'rehabilitation',
          status: 'on-hold',
          priority: 'medium',
          provider: 'Therapy Plus',
          startDate: '2023-12-15',
          endDate: '2024-06-15',
          progress: 60,
          nextReview: '2024-01-25',
          location: 'Macon, GA',
          contact: '(555) 654-3210',
          goals: 7,
          completedGoals: 4,
          complianceScore: 85,
          lastUpdated: '2024-01-08T11:00:00Z',
          alerts: ['Insurance authorization needed']
        }
      ];

      const mockStats: DashboardStats = {
        totalPlans: mockPlans.length,
        activePlans: mockPlans.filter(p => p.status === 'active').length,
        completedThisMonth: mockPlans.filter(p => p.status === 'completed').length,
        complianceRate: 88,
        avgCompletionTime: 45,
        overdueReviews: mockPlans.filter(p => new Date(p.nextReview) < new Date()).length
      };

      setServicePlans(mockPlans);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPlans = () => {
    let filtered = [...servicePlans];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(plan => plan.priority === selectedPriority);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.patientName.toLowerCase().includes(term) ||
        plan.provider.toLowerCase().includes(term) ||
        plan.location.toLowerCase().includes(term)
      );
    }

    // Sort plans
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'patientName':
          return a.patientName.localeCompare(b.patientName);
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'nextReview':
          return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
        case 'lastUpdated':
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

    setFilteredPlans(filtered);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPlanTypeLabel = (type: string) => {
    return planTypes.find(pt => pt.id === type)?.label || type;
  };

  const getPlanTypeColor = (type: string) => {
    return planTypes.find(pt => pt.id === type)?.color || 'bg-gray-100 text-gray-800';
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Plan Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage healthcare service plans across your organization
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalPlans || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.activePlans || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedThisMonth || 0}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compliance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.complianceRate || 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.avgCompletionTime || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.overdueReviews || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Plans
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Patient, provider, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="patientName">Patient Name</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="nextReview">Next Review</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredPlans.length} of {servicePlans.length} plans
          </p>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Service Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map(plan => {
          const StatusIcon = statusConfig[plan.status].icon;
          
          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${priorityConfig[plan.priority].indicator} border-r border-t border-b border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {plan.patientName}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanTypeColor(plan.planType)}`}>
                      {getPlanTypeLabel(plan.planType)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[plan.status].color}`}>
                      {plan.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <StatusIcon className="w-5 h-5 text-gray-400" />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[plan.priority].color}`}>
                    {plan.priority}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan.provider}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Next Review:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(plan.nextReview)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Goals:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.completedGoals}/{plan.goals}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Compliance:</span>
                    <span className={`font-medium ${getComplianceColor(plan.complianceScore)}`}>
                      {plan.complianceScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {plan.alerts.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      {plan.alerts.map((alert, index) => (
                        <p key={index} className="text-xs text-yellow-800 dark:text-yellow-300">
                          {alert}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {formatDate(plan.lastUpdated)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No service plans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first service plan.'}
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicePlanDashboard;