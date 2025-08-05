import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Archive,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  Phone,
  Activity,
  FileText,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Award,
  Target
} from 'lucide-react';

interface ServicePlan {
  id: string;
  patientName: string;
  patientId: string;
  planType: string;
  status: 'active' | 'pending' | 'completed' | 'expired' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  provider: string;
  startDate: string;
  endDate: string;
  nextReview: string;
  progress: number;
  location: string;
  contact: string;
  complianceScore: number;
  createdAt: string;
  lastUpdated: string;
  goals: number;
  completedGoals: number;
  totalCost: number;
  department: string;
  tags: string[];
}

interface ServicePlanListProps {
  onPlanSelect?: (plan: ServicePlan) => void;
  onPlanEdit?: (plan: ServicePlan) => void;
  onPlanDelete?: (planId: string) => void;
}

const ServicePlanList: React.FC<ServicePlanListProps> = ({
  onPlanSelect,
  onPlanEdit,
  onPlanDelete
}) => {
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof ServicePlan>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const planTypes = [
    { id: 'home-health', label: 'Home Health', color: 'bg-blue-100 text-blue-800' },
    { id: 'assisted-living', label: 'Assisted Living', color: 'bg-green-100 text-green-800' },
    { id: 'skilled-nursing', label: 'Skilled Nursing', color: 'bg-purple-100 text-purple-800' },
    { id: 'behavioral-health', label: 'Behavioral Health', color: 'bg-orange-100 text-orange-800' },
    { id: 'rehabilitation', label: 'Rehabilitation', color: 'bg-red-100 text-red-800' },
    { id: 'hospice', label: 'Hospice', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    completed: { color: 'bg-blue-100 text-blue-800', icon: Award },
    expired: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    'on-hold': { color: 'bg-gray-100 text-gray-800', icon: Clock },
    cancelled: { color: 'bg-red-100 text-red-800', icon: Trash2 }
  };

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-600' },
    medium: { color: 'bg-blue-100 text-blue-600' },
    high: { color: 'bg-orange-100 text-orange-600' },
    urgent: { color: 'bg-red-100 text-red-600' }
  };

  const departments = [
    'Home Health',
    'Assisted Living',
    'Skilled Nursing',
    'Behavioral Health',
    'Rehabilitation',
    'Administration'
  ];

  useEffect(() => {
    loadServicePlans();
  }, []);

  useEffect(() => {
    filterAndSortPlans();
  }, [servicePlans, searchTerm, selectedStatus, selectedPriority, selectedDepartment, sortField, sortDirection]);

  const loadServicePlans = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPlans: ServicePlan[] = [
        {
          id: 'plan_001',
          patientName: 'John Smith',
          patientId: 'PT001',
          planType: 'home-health',
          status: 'active',
          priority: 'high',
          provider: 'Dr. Sarah Johnson',
          startDate: '2024-01-15',
          endDate: '2024-07-15',
          nextReview: '2024-02-15',
          progress: 75,
          location: 'Atlanta, GA',
          contact: '(555) 123-4567',
          complianceScore: 92,
          createdAt: '2024-01-10T08:00:00Z',
          lastUpdated: '2024-01-13T10:30:00Z',
          goals: 8,
          completedGoals: 6,
          totalCost: 4500,
          department: 'Home Health',
          tags: ['diabetes', 'wound-care', 'medication-management']
        },
        {
          id: 'plan_002',
          patientName: 'Mary Davis',
          patientId: 'PT002',
          planType: 'assisted-living',
          status: 'pending',
          priority: 'medium',
          provider: 'Care Team Alpha',
          startDate: '2024-02-01',
          endDate: '2024-08-01',
          nextReview: '2024-02-20',
          progress: 25,
          location: 'Savannah, GA',
          contact: '(555) 987-6543',
          complianceScore: 88,
          createdAt: '2024-01-08T14:00:00Z',
          lastUpdated: '2024-01-12T14:45:00Z',
          goals: 6,
          completedGoals: 2,
          totalCost: 3200,
          department: 'Assisted Living',
          tags: ['mobility', 'social-activities', 'medication-assistance']
        },
        {
          id: 'plan_003',
          patientName: 'Robert Wilson',
          patientId: 'PT003',
          planType: 'skilled-nursing',
          status: 'completed',
          priority: 'low',
          provider: 'Dr. Michael Brown',
          startDate: '2023-10-01',
          endDate: '2024-01-01',
          nextReview: '2024-04-01',
          progress: 100,
          location: 'Augusta, GA',
          contact: '(555) 456-7890',
          complianceScore: 96,
          createdAt: '2023-09-25T09:00:00Z',
          lastUpdated: '2024-01-05T09:15:00Z',
          goals: 10,
          completedGoals: 10,
          totalCost: 8750,
          department: 'Skilled Nursing',
          tags: ['post-surgical', 'physical-therapy', 'discharge-planning']
        },
        {
          id: 'plan_004',
          patientName: 'Lisa Anderson',
          patientId: 'PT004',
          planType: 'behavioral-health',
          status: 'active',
          priority: 'urgent',
          provider: 'Dr. Jennifer Lee',
          startDate: '2024-01-08',
          endDate: '2024-06-08',
          nextReview: '2024-02-08',
          progress: 40,
          location: 'Columbus, GA',
          contact: '(555) 321-0987',
          complianceScore: 78,
          createdAt: '2024-01-05T11:00:00Z',
          lastUpdated: '2024-01-13T16:20:00Z',
          goals: 12,
          completedGoals: 5,
          totalCost: 5600,
          department: 'Behavioral Health',
          tags: ['depression', 'anxiety', 'therapy', 'crisis-intervention']
        },
        {
          id: 'plan_005',
          patientName: 'David Johnson',
          patientId: 'PT005',
          planType: 'rehabilitation',
          status: 'on-hold',
          priority: 'medium',
          provider: 'Therapy Plus',
          startDate: '2023-12-15',
          endDate: '2024-06-15',
          nextReview: '2024-01-25',
          progress: 60,
          location: 'Macon, GA',
          contact: '(555) 654-3210',
          complianceScore: 85,
          createdAt: '2023-12-10T13:00:00Z',
          lastUpdated: '2024-01-08T11:00:00Z',
          goals: 7,
          completedGoals: 4,
          totalCost: 6200,
          department: 'Rehabilitation',
          tags: ['stroke-recovery', 'occupational-therapy', 'speech-therapy']
        },
        {
          id: 'plan_006',
          patientName: 'Emma Thompson',
          patientId: 'PT006',
          planType: 'hospice',
          status: 'active',
          priority: 'high',
          provider: 'Compassionate Care',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          nextReview: '2024-02-01',
          progress: 30,
          location: 'Valdosta, GA',
          contact: '(555) 789-0123',
          complianceScore: 94,
          createdAt: '2023-12-28T10:00:00Z',
          lastUpdated: '2024-01-11T15:30:00Z',
          goals: 5,
          completedGoals: 2,
          totalCost: 12000,
          department: 'Hospice',
          tags: ['comfort-care', 'pain-management', 'family-support']
        }
      ];

      setServicePlans(mockPlans);
    } catch (error) {
      console.error('Error loading service plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPlans = () => {
    let filtered = [...servicePlans];

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.patientName.toLowerCase().includes(term) ||
        plan.patientId.toLowerCase().includes(term) ||
        plan.provider.toLowerCase().includes(term) ||
        plan.location.toLowerCase().includes(term) ||
        plan.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(plan => plan.priority === selectedPriority);
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(plan => plan.department === selectedDepartment);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === 'createdAt' || sortField === 'lastUpdated' || sortField === 'startDate' || sortField === 'endDate' || sortField === 'nextReview') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPlans(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (field: keyof ServicePlan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectPlan = (planId: string) => {
    const newSelected = new Set(selectedPlans);
    if (newSelected.has(planId)) {
      newSelected.delete(planId);
    } else {
      newSelected.add(planId);
    }
    setSelectedPlans(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlans.size === paginatedPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(paginatedPlans.map(plan => plan.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  // Pagination
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlans = filteredPlans.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
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
            Service Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all healthcare service plans
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans, patients, providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                <option value="cancelled">Cancelled</option>
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
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  setSelectedDepartment('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPlans.length)} of {filteredPlans.length} plans
          </span>
          {selectedPlans.size > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              {selectedPlans.size} selected
            </span>
          )}
        </div>
        
        {selectedPlans.size > 0 && (
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              Export Selected
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              Archive Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPlans.size === paginatedPlans.length && paginatedPlans.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('patientName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Patient</span>
                    {sortField === 'patientName' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan Type
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Progress</span>
                    {sortField === 'progress' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('complianceScore')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Compliance</span>
                    {sortField === 'complianceScore' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('nextReview')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Next Review</span>
                    {sortField === 'nextReview' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedPlans.map((plan) => {
                const StatusIcon = statusConfig[plan.status].icon;
                
                return (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPlans.has(plan.id)}
                        onChange={() => handleSelectPlan(plan.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {plan.patientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {plan.patientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanTypeColor(plan.planType)}`}>
                        {getPlanTypeLabel(plan.planType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[plan.status].color}`}>
                          {plan.status.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[plan.priority].color}`}>
                        {plan.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {plan.provider}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getComplianceColor(plan.complianceScore)}`}>
                        {plan.complianceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(plan.nextReview)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === plan.id ? null : plan.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === plan.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onPlanSelect?.(plan);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  onPlanEdit?.(plan);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Plan
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </button>
                              <button
                                onClick={() => {
                                  onPlanDelete?.(plan.id);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {getPaginationRange().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No service plans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedDepartment !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first service plan.'}
          </p>
          {(!searchTerm && selectedStatus === 'all' && selectedPriority === 'all' && selectedDepartment === 'all') && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </button>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};

export default ServicePlanList;