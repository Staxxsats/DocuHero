import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  Trash2,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import type { InviteToken, User, Employee, Client } from '../types/auth';

interface InviteSystemProps {
  agencyId: string;
  currentUser: User;
  onInviteSent: (invite: InviteToken) => void;
}

export default function InviteSystem({ agencyId, currentUser, onInviteSent }: InviteSystemProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'pending' | 'history'>('send');
  const [inviteType, setInviteType] = useState<'employee' | 'client' | 'guardian'>('employee');
  const [pendingInvites, setPendingInvites] = useState<InviteToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee' as 'employee' | 'client' | 'guardian',
    position: '',
    permissions: [] as string[],
    clientId: '',
    message: ''
  });

  useEffect(() => {
    loadPendingInvites();
  }, [agencyId]);

  const loadPendingInvites = async () => {
    // Load pending invites from backend
    // Placeholder implementation
    const mockInvites: InviteToken[] = [
      {
        id: '1',
        email: 'nurse@example.com',
        role: 'employee',
        agencyId,
        createdBy: currentUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        used: false
      },
      {
        id: '2',
        email: 'client@example.com',
        role: 'client',
        agencyId,
        createdBy: currentUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        used: false
      }
    ];
    setPendingInvites(mockInvites);
  };

  const sendInvite = async () => {
    setIsLoading(true);
    
    try {
      // Create invite token
      const invite: InviteToken = {
        id: crypto.randomUUID(),
        email: inviteForm.email,
        role: inviteForm.role,
        agencyId,
        createdBy: currentUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        used: false
      };

      // Send email invitation
      await sendInviteEmail(invite);

      // Update pending invites
      setPendingInvites(prev => [...prev, invite]);
      
      // Reset form
      setInviteForm({
        email: '',
        role: 'employee',
        position: '',
        permissions: [],
        clientId: '',
        message: ''
      });

      onInviteSent(invite);
      
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInviteEmail = async (invite: InviteToken) => {
    // Send email with invite link
    // Would integrate with email service (SendGrid, AWS SES, etc.)
    const inviteLink = `${window.location.origin}/signup?invite=${invite.id}`;
    
    console.log('Sending invite email:', {
      to: invite.email,
      inviteLink,
      role: invite.role
    });
  };

  const copyInviteLink = async (inviteId: string) => {
    const inviteLink = `${window.location.origin}/signup?invite=${inviteId}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(inviteId);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  const revokeInvite = async (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
    // Would also update backend
  };

  const resendInvite = async (invite: InviteToken) => {
    await sendInviteEmail(invite);
    // Show success message
  };

  const renderSendInvite = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Send New Invitation</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Invite team members or clients to join your agency on DocuHero
        </p>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Invitation Type
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'employee', label: 'Employee', icon: Users, desc: 'Healthcare professionals and staff' },
            { value: 'client', label: 'Client', icon: UserPlus, desc: 'Patients receiving care' },
            { value: 'guardian', label: 'Guardian', icon: Eye, desc: 'Family members or caregivers' }
          ].map((type) => (
            <div
              key={type.value}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                inviteForm.role === type.value
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary-500/50 bg-white dark:bg-transparent'
              }`}
              onClick={() => setInviteForm({...inviteForm, role: type.value as any})}
            >
              <type.icon className="w-6 h-6 text-primary-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">{type.label}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={inviteForm.email}
          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter email address"
        />
      </div>

      {/* Role-specific fields */}
      {inviteForm.role === 'employee' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position/Title
            </label>
            <input
              type="text"
              value={inviteForm.position}
              onChange={(e) => setInviteForm({...inviteForm, position: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="e.g., Registered Nurse, Case Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'View Client Records',
                'Create Documentation',
                'Edit Care Plans',
                'Generate Reports',
                'Manage Schedules',
                'Access Billing'
              ].map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={inviteForm.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInviteForm({
                          ...inviteForm,
                          permissions: [...inviteForm.permissions, permission]
                        });
                      } else {
                        setInviteForm({
                          ...inviteForm,
                          permissions: inviteForm.permissions.filter(p => p !== permission)
                        });
                      }
                    }}
                    className="w-4 h-4 text-primary-500 bg-gray-100 dark:bg-dark-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{permission}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {(inviteForm.role === 'client' || inviteForm.role === 'guardian') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Associated Client
          </label>
          <select
            value={inviteForm.clientId}
            onChange={(e) => setInviteForm({...inviteForm, clientId: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          >
            <option value="">Select a client...</option>
            <option value="client1">John Doe</option>
            <option value="client2">Jane Smith</option>
          </select>
        </div>
      )}

      {/* Personal Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Personal Message (Optional)
        </label>
        <textarea
          value={inviteForm.message}
          onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          rows={3}
          placeholder="Add a personal message to the invitation..."
        />
      </div>

      {/* Send Button */}
      <button
        onClick={sendInvite}
        disabled={!inviteForm.email || isLoading}
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          !inviteForm.email || isLoading
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sending Invitation...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Send className="w-5 h-5 mr-2" />
            Send Invitation
          </div>
        )}
      </button>
    </div>
  );

  const renderPendingInvites = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Invitations</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage invitations that haven't been accepted yet
        </p>
      </div>

      {pendingInvites.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Pending Invitations</h4>
          <p className="text-gray-500 dark:text-gray-500">Send your first invitation to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="bg-white dark:bg-dark-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                      {invite.role === 'employee' ? (
                        <Users className="w-4 h-4 text-primary-400" />
                      ) : invite.role === 'client' ? (
                        <UserPlus className="w-4 h-4 text-primary-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-primary-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{invite.email}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{invite.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {invite.used ? 'Accepted' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyInviteLink(invite.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Copy invite link"
                  >
                    {copiedInvite === invite.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => resendInvite(invite)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Resend invitation"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => revokeInvite(invite.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Revoke invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInviteHistory = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Invitation History</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View all past invitations and their status
        </p>
      </div>

      {/* Placeholder for invite history */}
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No History Yet</h4>
        <p className="text-gray-500 dark:text-gray-500">Invitation history will appear here</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-200 dark:bg-dark-800 rounded-lg p-1">
        {[
          { key: 'send', label: 'Send Invite', icon: Send },
          { key: 'pending', label: 'Pending', icon: Clock },
          { key: 'history', label: 'History', icon: Eye }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-dark-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-dark-800/50 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
        {activeTab === 'send' && renderSendInvite()}
        {activeTab === 'pending' && renderPendingInvites()}
        {activeTab === 'history' && renderInviteHistory()}
      </div>
    </div>
  );
}