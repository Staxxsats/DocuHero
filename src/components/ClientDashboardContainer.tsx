import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Activity,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Download,
  Upload,
  Settings,
  Building,
  MapPin,
  CreditCard,
  Shield,
  Bell,
  BarChart3,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: Date;
  lastActive: Date;
  documentsCount: number;
  complianceScore: number;
  billingStatus: 'current' | 'overdue' | 'pending';
  plan: 'basic' | 'professional' | 'enterprise';
  location: string;
  avatar?: string;
  notes?: string;
  tags: string[];
}

interface ClientActivity {
  id: string;
  clientId: string;
  type: 'login' | 'document_created' | 'document_updated' | 'billing' | 'support';
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  churnRate: number;
  averageDocuments: number;
  averageComplianceScore: number;
}

const ClientDashboardContainer: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Client['status']>('all');
  const [planFilter, setPlanFilter] = useState<'all' | Client['plan']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastActive' | 'documentsCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientActivities, setClientActivities] = useState<ClientActivity[]>([]);
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    churnRate: 0,
    averageDocuments: 0,
    averageComplianceScore: 0
  });

  // Mock data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@healthcenter.com',
      phone: '+1 (555) 123-4567',
      organization: 'Metro Health Center',
      role: 'Primary Care Physician',
      status: 'active',
      joinDate: new Date('2024-01-15'),
      lastActive: new Date('2024-01-20'),
      documentsCount: 247,
      complianceScore: 96,
      billingStatus: 'current',
      plan: 'professional',
      location: 'New York, NY',
      tags: ['healthcare', 'primary-care', 'premium'],
      notes: 'High-volume user, excellent compliance record'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      email: 'marcus.r@specialed.edu',
      phone: '+1 (555) 234-5678',
      organization: 'Lincoln Elementary School',
      role: 'Special Education Teacher',
      status: 'active',
      joinDate: new Date('2023-11-20'),
      lastActive: new Date('2024-01-19'),
      documentsCount: 189,
      complianceScore: 94,
      billingStatus: 'current',
      plan: 'enterprise',
      location: 'Chicago, IL',
      tags: ['education', 'special-needs', 'iep'],
      notes: 'Specializes in IEP documentation'
    },
    {
      id: '3',
      name: 'Jennifer Walsh',
      email: 'j.walsh@behavioralhealth.org',
      phone: '+1 (555) 345-6789',
      organization: 'Wellness Behavioral Health',
      role: 'Clinical Therapist',
      status: 'pending',
      joinDate: new Date('2024-01-18'),
      lastActive: new Date('2024-01-18'),
      documentsCount: 12,
      complianceScore: 87,
      billingStatus: 'pending',
      plan: 'basic',
      location: 'Los Angeles, CA',
      tags: ['mental-health', 'therapy', 'new-user'],
      notes: 'Recently onboarded, needs training'
    },
    {
      id: '4',
      name: 'Robert Kim',
      email: 'rkim@communitysupport.org',
      phone: '+1 (555) 456-7890',
      organization: 'Community Support Services',
      role: 'Case Manager',
      status: 'inactive',
      joinDate: new Date('2023-08-10'),
      lastActive: new Date('2024-01-05'),
      documentsCount: 156,
      complianceScore: 78,
      billingStatus: 'overdue',
      plan: 'professional',
      location: 'Seattle, WA',
      tags: ['case-management', 'community', 'inactive'],
      notes: 'Payment issues, needs follow-up'
    }
  ];

  const mockActivities: ClientActivity[] = [
    {
      id: '1',
      clientId: '1',
      type: 'document_created',
      description: 'Created SOAP note for patient consultation',
      timestamp: new Date('2024-01-20T10:30:00'),
      metadata: { documentType: 'SOAP', patientId: 'P123' }
    },
    {
      id: '2',
      clientId: '2',
      type: 'document_updated',
      description: 'Updated IEP document for student assessment',
      timestamp: new Date('2024-01-20T09:15:00'),
      metadata: { documentType: 'IEP', studentId: 'S456' }
    },
    {
      id: '3',
      clientId: '1',
      type: 'login',
      description: 'Logged into the platform',
      timestamp: new Date('2024-01-20T08:45:00')
    }
  ];

  useEffect(() => {
    setClients(mockClients);
    setClientActivities(mockActivities);
    
    // Calculate metrics
    const activeClients = mockClients.filter(c => c.status === 'active').length;
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    const newThisMonth = mockClients.filter(c => c.joinDate > thisMonth).length;
    const totalDocs = mockClients.reduce((sum, c) => sum + c.documentsCount, 0);
    const totalCompliance = mockClients.reduce((sum, c) => sum + c.complianceScore, 0);

    setMetrics({
      totalClients: mockClients.length,
      activeClients,
      newThisMonth,
      churnRate: 2.3,
      averageDocuments: Math.round(totalDocs / mockClients.length),
      averageComplianceScore: Math.round(totalCompliance / mockClients.length)
    });
  }, []);

  useEffect(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.organization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesPlan = planFilter === 'all' || client.plan === planFilter;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'joinDate' || sortBy === 'lastActive') {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, planFilter, sortBy, sortOrder]);

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPlanColor = (plan: Client['plan']) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'professional':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBillingStatusColor = (status: Client['billingStatus']) => {
    switch (status) {
      case 'current':
        return 'text-green-600 dark:text-green-400';
      case 'overdue':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const exportClientData = () => {
    const dataToExport = selectedClients.length > 0 
      ? clients.filter(c => selectedClients.includes(c.id))
      : filteredClients;
    
    const csv = [
      ['Name', 'Email', 'Organization', 'Status', 'Plan', 'Documents', 'Compliance Score', 'Join Date'],
      ...dataToExport.map(client => [
        client.name,
        client.email,
        client.organization,
        client.status,
        client.plan,
        client.documentsCount.toString(),
        client.complianceScore.toString(),
        client.joinDate.toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
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
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              Client Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor client accounts and activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddClient(true)}
              className="btn-primary flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Client
            </button>
            <button className="btn-secondary flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalClients}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeClients}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.newThisMonth}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.churnRate}%</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.averageDocuments}</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Compliance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.averageComplianceScore}%</p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full sm:w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedClients.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                  {selectedClients.length} selected
                </span>
              )}
              <button
                onClick={exportClientData}
                className="btn-secondary text-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button className="btn-secondary text-sm flex items-center">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleSelectClient(client.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{client.organization}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{client.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(client.plan)}`}>
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {client.documentsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                          {client.complianceScore}%
                        </div>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              client.complianceScore >= 95 ? 'bg-green-500' :
                              client.complianceScore >= 85 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${client.complianceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {client.lastActive.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 text-blue-500 mr-2" />
              Recent Client Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {clientActivities.map((activity) => {
              const client = clients.find(c => c.id === activity.clientId);
              return (
                <div key={activity.id} className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {client ? client.name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{client?.name}</span> {activity.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type === 'document_created' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                        activity.type === 'document_updated' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        activity.type === 'login' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {activity.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Client Details: {selectedClient.name}
              </h3>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Information</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedClient.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedClient.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4 mr-2" />
                        {selectedClient.organization}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedClient.location}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedClient.status)}`}>
                          {selectedClient.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(selectedClient.plan)}`}>
                          {selectedClient.plan}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Billing:</span>
                        <span className={`text-sm font-medium ${getBillingStatusColor(selectedClient.billingStatus)}`}>
                          {selectedClient.billingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedClient.documentsCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedClient.complianceScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compliance</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor((new Date().getTime() - selectedClient.joinDate.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Days Active</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedClient.tags.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tags</div>
                </div>
              </div>

              {/* Tags */}
              {selectedClient.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedClient.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardContainer;