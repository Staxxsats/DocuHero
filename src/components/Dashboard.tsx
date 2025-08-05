import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  Bell, 
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  UserPlus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import InviteSystem from './InviteSystem';
import type { User, Client, Employee } from '../types/auth';

export default function Dashboard() {
  const { user, agency } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user && agency) {
      loadDashboardData();
    }
  }, [user, agency]);

  const loadDashboardData = async () => {
    try {
      // Load clients, employees, and recent activity
      const [clientsRes, employeesRes, activityRes] = await Promise.all([
        fetch(`/api/agencies/${agency?.id}/clients`),
        fetch(`/api/agencies/${agency?.id}/employees`),
        fetch(`/api/agencies/${agency?.id}/activity`)
      ]);

      setClients(await clientsRes.json());
      setEmployees(await employeesRes.json());
      setRecentActivity(await activityRes.json());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Clients</p>
              <p className="text-2xl font-bold text-primary-400">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-secondary-400">{employees.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-secondary-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Documents Today</p>
              <p className="text-2xl font-bold text-green-400">24</p>
            </div>
            <FileText className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Compliance Score</p>
              <p className="text-2xl font-bold text-yellow-400">98%</p>
            </div>
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'Sarah Chen', action: 'completed documentation for John Doe', time: '2 hours ago' },
            { user: 'Marcus Rodriguez', action: 'updated care plan for Jane Smith', time: '4 hours ago' },
            { user: 'Dr. Jennifer Walsh', action: 'approved medication changes', time: '6 hours ago' },
            { user: 'Robert Kim', action: 'submitted billing documentation', time: '8 hours ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-dark-800 rounded">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Client Management</h3>
        <button className="bg-primary-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <button className="p-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-lg font-bold">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{client.firstName} {client.lastName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DOB: {new Date(client.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Assigned to: {client.assignedEmployees.length} team member(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Management</h3>
        <button className="bg-primary-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>Invite Employee</span>
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-lg font-bold">
                  {employee.userId.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{employee.position}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    License: {employee.licenseNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clients: {employee.assignedClients.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  employee.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInvites = () => (
    <InviteSystem 
      agencyId={agency?.id || ''} 
      currentUser={user!} 
      onInviteSent={(invite) => {
        console.log('Invite sent:', invite);
      }} 
    />
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Agency Settings</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agency Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
              <input
                type="text"
                value={agency?.businessName || ''}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NPI Number</label>
              <input
                type="text"
                value={agency?.npi || ''}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operating States</label>
              <div className="flex flex-wrap gap-2">
                {agency?.states.map((state) => (
                  <span key={state} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-sm">
                    {state}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Required for HIPAA compliance</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Audit Logging</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track all system access</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Data Encryption</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced AES-256 encryption</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user || !agency) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="bg-gray-100 dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{agency.businessName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Administrator Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-100 dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-6">
          <div className="space-y-2">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'clients', label: 'Clients', icon: Users },
              { key: 'employees', label: 'Team', icon: UserPlus },
              { key: 'invites', label: 'Invitations', icon: Plus },
              { key: 'documents', label: 'Documents', icon: FileText },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.key
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'clients' && renderClients()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'invites' && renderInvites()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
}