import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  UserCheck, 
  Shield, 
  FileText, 
  Upload, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { stateRules, getMergedRequirements } from '../data/stateRules';
import type { Agency, User, ComplianceSettings } from '../types/auth';

type AccountType = 'agency' | 'employee' | 'client';
type SignupStep = 'account-type' | 'agency-details' | 'state-selection' | 'compliance-setup' | 'admin-user' | 'security-setup' | 'complete';

interface SignupFlowProps {
  onComplete: (data: any) => void;
}

export default function SignupFlow({ onComplete }: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('account-type');
  const [accountType, setAccountType] = useState<AccountType>('agency');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [agencyData, setAgencyData] = useState({
    businessName: '',
    npi: '',
    ein: '',
    address: '',
    phone: '',
    website: ''
  });

  const [adminUser, setAdminUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    encryptionLevel: 'enhanced' as 'standard' | 'enhanced',
    auditLogging: true,
    requireSupervisorReview: true
  });

  const [complianceRequirements, setComplianceRequirements] = useState<any>(null);

  useEffect(() => {
    if (selectedStates.length > 0) {
      const requirements = getMergedRequirements(selectedStates);
      setComplianceRequirements(requirements);
    }
  }, [selectedStates]);

  const handleStateToggle = (stateCode: string) => {
    setSelectedStates(prev => 
      prev.includes(stateCode) 
        ? prev.filter(s => s !== stateCode)
        : [...prev, stateCode]
    );
  };

  const validateStep = (step: SignupStep): boolean => {
    switch (step) {
      case 'agency-details':
        return agencyData.businessName && agencyData.npi && agencyData.phone;
      case 'state-selection':
        return selectedStates.length > 0;
      case 'admin-user':
        return adminUser.firstName && adminUser.lastName && adminUser.email && 
               adminUser.password && adminUser.password === adminUser.confirmPassword;
      default:
        return true;
    }
  };

  const nextStep = () => {
    const steps: SignupStep[] = ['account-type', 'agency-details', 'state-selection', 'compliance-setup', 'admin-user', 'security-setup', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1 && validateStep(currentStep)) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: SignupStep[] = ['account-type', 'agency-details', 'state-selection', 'compliance-setup', 'admin-user', 'security-setup', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const signupData = {
      accountType,
      agency: agencyData,
      states: selectedStates,
      adminUser,
      securitySettings,
      complianceRequirements
    };
    
    onComplete(signupData);
    setIsLoading(false);
  };

  const renderAccountTypeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Account Type</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Select the type of account you'd like to create</p>
      </div>

      <div className="grid gap-6">
        <div 
          className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            accountType === 'agency' 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-500/50 bg-white dark:bg-transparent'
          }`}
          onClick={() => setAccountType('agency')}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agency Account</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set up your healthcare agency with multi-state compliance, employee management, and client documentation systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-primary-400 mr-2" />Manage employees and clients</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary-400 mr-2" />State-specific compliance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary-400 mr-2" />HIPAA-compliant documentation</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary-400 mr-2" />Billing integration</li>
              </ul>
            </div>
          </div>
        </div>

        <div 
          className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 opacity-60 ${
            accountType === 'employee' 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Employee Account</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Join an existing agency as a healthcare professional or support staff member.
              </p>
              <div className="bg-yellow-500/20 dark:bg-yellow-500/20 border border-yellow-500/30 dark:border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Invite Only</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-xs">You'll need an invitation from your agency administrator</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 opacity-60 ${
            accountType === 'client' 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Client/Guardian Access</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View care documentation and communicate with your healthcare team.
              </p>
              <div className="bg-yellow-500/20 dark:bg-yellow-500/20 border border-yellow-500/30 dark:border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Invite Only</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-xs">You'll need an invitation from your healthcare provider</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgencyDetails = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Agency Information</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Tell us about your healthcare agency</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={agencyData.businessName}
            onChange={(e) => setAgencyData({...agencyData, businessName: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Your Healthcare Agency"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            NPI Number *
          </label>
          <input
            type="text"
            value={agencyData.npi}
            onChange={(e) => setAgencyData({...agencyData, npi: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            EIN (Optional)
          </label>
          <input
            type="text"
            value={agencyData.ein}
            onChange={(e) => setAgencyData({...agencyData, ein: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="12-3456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={agencyData.phone}
            onChange={(e) => setAgencyData({...agencyData, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Address
          </label>
          <textarea
            value={agencyData.address}
            onChange={(e) => setAgencyData({...agencyData, address: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={3}
            placeholder="123 Healthcare Ave, Medical City, ST 12345"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website (Optional)
          </label>
          <input
            type="url"
            value={agencyData.website}
            onChange={(e) => setAgencyData({...agencyData, website: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="https://youragency.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStateSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Operating States</h2>
        <p className="text-gray-400 text-lg">Select the states where your agency operates</p>
        <p className="text-sm text-gray-500 mt-2">This will determine your compliance requirements</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(stateRules).map((state) => (
          <div
            key={state.code}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              selectedStates.includes(state.code)
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-700 hover:border-primary-500/50'
            }`}
            onClick={() => handleStateToggle(state.code)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{state.name}</h3>
                <p className="text-sm text-gray-400">{state.code}</p>
              </div>
              {selectedStates.includes(state.code) && (
                <Check className="w-5 h-5 text-primary-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedStates.length > 0 && (
        <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            Compliance Preview
          </h3>
          <p className="text-gray-400 mb-4">
            Based on your selected states, here's what will be required:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Documentation Types</h4>
              <ul className="space-y-1 text-gray-300">
                {complianceRequirements?.allDocumentationTypes.slice(0, 4).map((type: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                    {type}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary-400 mb-2">Required Fields</h4>
              <ul className="space-y-1 text-gray-300">
                {complianceRequirements?.allRequiredFields.slice(0, 4).map((field: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderComplianceSetup = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Compliance Configuration</h2>
        <p className="text-gray-400 text-lg">Review and customize your compliance settings</p>
      </div>

      {complianceRequirements && (
        <div className="space-y-6">
          <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 text-primary-400 mr-2" />
              Documentation Requirements
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-400 mb-3">Required Documentation Types</h4>
                <div className="space-y-2">
                  {complianceRequirements.allDocumentationTypes.map((type: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-dark-800 rounded">
                      <Check className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-primary-400 mb-3">Required Fields</h4>
                <div className="space-y-2">
                  {complianceRequirements.allRequiredFields.map((field: string, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-dark-800 rounded">
                      <Check className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 text-primary-400 mr-2" />
              Signature & Security Requirements
            </h3>
            <div className="space-y-3">
              {complianceRequirements.allSignatureRequirements.map((req: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-dark-800 rounded">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Special Requirements</h3>
            <div className="space-y-3">
              {complianceRequirements.allSpecialRequirements.map((req: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-dark-800 rounded">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mr-3 mt-2"></div>
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdminUser = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Administrator Account</h2>
        <p className="text-gray-400 text-lg">Create your administrator user account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={adminUser.firstName}
            onChange={(e) => setAdminUser({...adminUser, firstName: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={adminUser.lastName}
            onChange={(e) => setAdminUser({...adminUser, lastName: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Doe"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={adminUser.email}
            onChange={(e) => setAdminUser({...adminUser, email: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="admin@youragency.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={adminUser.phone}
            onChange={(e) => setAdminUser({...adminUser, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="(555) 123-4567"
          />
        </div>

        <div></div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={adminUser.password}
              onChange={(e) => setAdminUser({...adminUser, password: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-gray-600 focus:border-primary-500 focus:outline-none text-white pr-12"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={adminUser.confirmPassword}
              onChange={(e) => setAdminUser({...adminUser, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-gray-600 focus:border-primary-500 focus:outline-none text-white pr-12"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {adminUser.password && adminUser.confirmPassword && adminUser.password !== adminUser.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <h4 className="font-medium text-yellow-400 mb-2">Password Requirements</h4>
        <ul className="text-sm text-yellow-300 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Include uppercase and lowercase letters</li>
          <li>• Include at least one number</li>
          <li>• Include at least one special character</li>
        </ul>
      </div>
    </div>
  );

  const renderSecuritySetup = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Security Configuration</h2>
        <p className="text-gray-400 text-lg">Configure your HIPAA-compliant security settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 text-primary-400 mr-2" />
            Authentication & Access
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">Required for HIPAA compliance</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
                  className="w-5 h-5 text-primary-500 bg-dark-700 border-gray-600 rounded focus:ring-primary-500"
                  disabled
                />
                <span className="ml-2 text-sm text-gray-400">Required</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
              <div>
                <h4 className="font-medium">Audit Logging</h4>
                <p className="text-sm text-gray-400">Track all system access and changes</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.auditLogging}
                onChange={(e) => setSecuritySettings({...securitySettings, auditLogging: e.target.checked})}
                className="w-5 h-5 text-primary-500 bg-dark-700 border-gray-600 rounded focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
              <div>
                <h4 className="font-medium">Supervisor Review</h4>
                <p className="text-sm text-gray-400">Require supervisor approval for critical actions</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.requireSupervisorReview}
                onChange={(e) => setSecuritySettings({...securitySettings, requireSupervisorReview: e.target.checked})}
                className="w-5 h-5 text-primary-500 bg-dark-700 border-gray-600 rounded focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Data Encryption Level</h3>
          <div className="space-y-3">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                securitySettings.encryptionLevel === 'standard' 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-gray-600 hover:border-primary-500/50'
              }`}
              onClick={() => setSecuritySettings({...securitySettings, encryptionLevel: 'standard'})}
            >
              <h4 className="font-medium">Standard Encryption (AES-256)</h4>
              <p className="text-sm text-gray-400">Industry-standard encryption for data at rest and in transit</p>
            </div>
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                securitySettings.encryptionLevel === 'enhanced' 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-gray-600 hover:border-primary-500/50'
              }`}
              onClick={() => setSecuritySettings({...securitySettings, encryptionLevel: 'enhanced'})}
            >
              <h4 className="font-medium">Enhanced Encryption (Recommended)</h4>
              <p className="text-sm text-gray-400">Advanced encryption with additional key management and blockchain timestamping</p>
            </div>
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-medium text-green-400 mb-2 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            HIPAA Compliance Ready
          </h4>
          <p className="text-sm text-green-300">
            Your configuration meets all HIPAA requirements for healthcare data protection and access control.
          </p>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-4">Account Setup Complete!</h2>
        <p className="text-gray-400 text-lg mb-8">
          Your DocuHero agency account has been successfully created and configured for HIPAA compliance.
        </p>
      </div>

      <div className="bg-dark-700/50 rounded-lg p-6 border border-gray-700 text-left max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium">Verify Your Email</h4>
              <p className="text-sm text-gray-400">Check your inbox for a verification email</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium">Set Up Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Secure your account with 2FA using your mobile device</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium">Invite Your Team</h4>
              <p className="text-sm text-gray-400">Add employees and configure their access permissions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <h4 className="font-medium">Upload Care Plan Templates</h4>
              <p className="text-sm text-gray-400">Customize documentation templates for your workflows</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
      >
        Go to Dashboard
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'account-type':
        return renderAccountTypeSelection();
      case 'agency-details':
        return renderAgencyDetails();
      case 'state-selection':
        return renderStateSelection();
      case 'compliance-setup':
        return renderComplianceSetup();
      case 'admin-user':
        return renderAdminUser();
      case 'security-setup':
        return renderSecuritySetup();
      case 'complete':
        return renderComplete();
      default:
        return renderAccountTypeSelection();
    }
  };

  const getStepNumber = () => {
    const steps = ['account-type', 'agency-details', 'state-selection', 'compliance-setup', 'admin-user', 'security-setup', 'complete'];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => 7;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Progress Bar */}
      <div className="bg-gray-100 dark:bg-dark-800 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Step {getStepNumber()} of {getTotalSteps()}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round((getStepNumber() / getTotalSteps()) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {renderStepContent()}

        {/* Navigation Buttons */}
        {currentStep !== 'complete' && (
          <div className="flex justify-between mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 'account-type'}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 'account-type'
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-600 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Previous
            </button>

            {currentStep === 'security-setup' ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !validateStep(currentStep)}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  isLoading || !validateStep(currentStep)
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  !validateStep(currentStep)
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25'
                }`}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}