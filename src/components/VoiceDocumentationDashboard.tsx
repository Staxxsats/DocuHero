import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  Clock,
  User,
  FileText,
  Mic,
  Download,
  Edit,
  Trash2,
  Copy,
  Eye,
  Upload,
  Archive,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Timer,
  DollarSign,
  RefreshCw,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';
import VoiceDocumentation from './VoiceDocumentation';

interface SessionSummary {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  startTime: string;
  duration: number;
  sessionType: 'evaluation' | 'treatment' | 'progress_note' | 'discharge' | 'consultation';
  provider: string;
  status: 'draft' | 'review' | 'signed' | 'submitted';
  billable: boolean;
  hasAudio: boolean;
  hasTranscript: boolean;
  hasStructuredNote: boolean;
  cptCodes: string[];
  lastModified: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DashboardStats {
  totalSessions: number;
  todaySessions: number;
  pendingReview: number;
  completedToday: number;
  totalDuration: number;
  billableHours: number;
  averageSessionTime: number;
  transcriptionAccuracy: number;
}

interface FilterOptions {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  status: 'all' | 'draft' | 'review' | 'signed' | 'submitted';
  sessionType: 'all' | 'evaluation' | 'treatment' | 'progress_note' | 'discharge' | 'consultation';
  provider: 'all' | string;
  billable: 'all' | 'yes' | 'no';
  customDateStart?: string;
  customDateEnd?: string;
}

export default function VoiceDocumentationDashboard() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewSession, setShowNewSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'patient' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'week',
    status: 'all',
    sessionType: 'all',
    provider: 'all',
    billable: 'all'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [sessions, searchQuery, filters, sortBy, sortOrder]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [sessionsResponse, statsResponse] = await Promise.all([
        fetch('/api/sessions/summary'),
        fetch('/api/dashboard/stats')
      ]);

      if (!sessionsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const [sessionsData, statsData] = await Promise.all([
        sessionsResponse.json(),
        statsResponse.json()
      ]);

      setSessions(sessionsData);
      setStats(statsData);

    } catch (error: any) {
      setError(`Failed to load dashboard: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...sessions];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.patientName.toLowerCase().includes(query) ||
        session.provider.toLowerCase().includes(query) ||
        session.sessionType.toLowerCase().includes(query) ||
        session.cptCodes.some(code => code.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    if (filters.sessionType !== 'all') {
      filtered = filtered.filter(session => session.sessionType === filters.sessionType);
    }

    if (filters.billable !== 'all') {
      const billableFilter = filters.billable === 'yes';
      filtered = filtered.filter(session => session.billable === billableFilter);
    }

    // Apply date range filter
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(session => session.date === today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(session => session.date >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(session => session.date >= monthAgo);
        break;
      case 'custom':
        if (filters.customDateStart) {
          filtered = filtered.filter(session => session.date >= filters.customDateStart!);
        }
        if (filters.customDateEnd) {
          filtered = filtered.filter(session => session.date <= filters.customDateEnd!);
        }
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(`${a.date} ${a.startTime}`).getTime();
          bValue = new Date(`${b.date} ${b.startTime}`).getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'patient':
          aValue = a.patientName.toLowerCase();
          bValue = b.patientName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSessions(filtered);
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      } else {
        return [...prev, sessionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(s => s.id));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'export' | 'submit') => {
    if (selectedSessions.length === 0) return;

    try {
      const response = await fetch(`/api/sessions/bulk-${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionIds: selectedSessions }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} sessions`);

      await loadDashboardData();
      setSelectedSessions([]);
      setShowBulkActions(false);

    } catch (error: any) {
      setError(`Failed to ${action} sessions: ${error.message}`);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete session');

      await loadDashboardData();
    } catch (error: any) {
      setError(`Failed to delete session: ${error.message}`);
    }
  };

  const duplicateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate session');

      await loadDashboardData();
    } catch (error: any) {
      setError(`Failed to duplicate session: ${error.message}`);
    }
  };

  const exportSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/export`);
      if (!response.ok) throw new Error('Failed to export session');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      setError(`Failed to export session: ${error.message}`);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status: SessionSummary['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      signed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return colors[status];
  };

  const getSessionTypeColor = (type: SessionSummary['sessionType']) => {
    const colors = {
      evaluation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      treatment: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      progress_note: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      discharge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      consultation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[type];
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500'
    };
    return priority ? colors[priority as keyof typeof colors] : '';
  };

  if (showNewSession) {
    return (
      <VoiceDocumentation
        onSave={() => {
          setShowNewSession(false);
          loadDashboardData();
        }}
        onSubmit={() => {
          setShowNewSession(false);
          loadDashboardData();
        }}
      />
    );
  }

  if (selectedSession) {
    return (
      <VoiceDocumentation
        patientId={sessions.find(s => s.id === selectedSession)?.patientId}
        onSave={() => {
          setSelectedSession(null);
          loadDashboardData();
        }}
        onSubmit={() => {
          setSelectedSession(null);
          loadDashboardData();
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Voice Documentation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your voice recordings and documentation workflow
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadDashboardData()}
            className="btn-ghost flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowNewSession(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{stats.todaySessions} today</span>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReview}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{stats.completedToday} completed today</span>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.billableHours.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Timer className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">Avg: {stats.averageSessionTime}min</span>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.transcriptionAccuracy}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">Excellent quality</span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient, provider, or session type..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost flex items-center space-x-2 ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="duration">Sort by Duration</option>
              <option value="patient">Sort by Patient</option>
              <option value="status">Sort by Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-ghost p-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="signed">Signed</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Type</label>
                <select
                  value={filters.sessionType}
                  onChange={(e) => setFilters({...filters, sessionType: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="treatment">Treatment</option>
                  <option value="progress_note">Progress Note</option>
                  <option value="discharge">Discharge</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Billable</label>
                <select
                  value={filters.billable}
                  onChange={(e) => setFilters({...filters, billable: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Sessions</option>
                  <option value="yes">Billable Only</option>
                  <option value="no">Non-Billable</option>
                </select>
              </div>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.customDateStart || ''}
                    onChange={(e) => setFilters({...filters, customDateStart: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.customDateEnd || ''}
                    onChange={(e) => setFilters({...filters, customDateEnd: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedSessions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedSessions.length} session{selectedSessions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="btn-ghost text-sm"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="btn-ghost text-sm"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="btn-ghost text-sm text-red-600 dark:text-red-400"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedSessions([])}
                className="btn-ghost text-sm p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sessions ({filteredSessions.length})
            </h3>
            {filteredSessions.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSessions.length === filteredSessions.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-500 bg-gray-100 dark:bg-dark-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No sessions found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== 'week')
                ? 'Try adjusting your search or filters'
                : 'Create your first voice documentation session'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSessions.length === filteredSessions.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-500 bg-gray-100 dark:bg-dark-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSessionSelect(session.id)}
                        className="w-4 h-4 text-primary-500 bg-gray-100 dark:bg-dark-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.patientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {session.provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionTypeColor(session.sessionType)}`}>
                          {session.sessionType.replace('_', ' ').toUpperCase()}
                        </span>
                        {session.billable && (
                          <span className="text-xs text-green-600 dark:text-green-400 mt-1">Billable</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{session.startTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDuration(session.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status.toUpperCase()}
                      </span>
                      {session.priority && (
                        <div className={`text-xs mt-1 ${getPriorityColor(session.priority)}`}>
                          {session.priority} priority
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {session.hasAudio && <Mic className="w-4 h-4 text-green-500" title="Has Audio" />}
                        {session.hasTranscript && <FileText className="w-4 h-4 text-blue-500" title="Has Transcript" />}
                        {session.hasStructuredNote && <CheckCircle className="w-4 h-4 text-purple-500" title="Structured Note Complete" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSession(session.id)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportSession(session.id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}