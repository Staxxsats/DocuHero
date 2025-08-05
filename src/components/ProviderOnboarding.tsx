import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Eye,
  Download,
  Shield,
  Award,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Info,
  AlertTriangle,
  Globe,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  Star
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  required: boolean;
  estimatedTime: number; // in minutes
}

interface ProviderProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;
  };
  professionalInfo: {
    license: string;
    specialty: string;
    experience: number;
    education: string;
    certifications: string[];
  };
  organizationInfo: {
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    taxId: string;
    website: string;
  };
  serviceAreas: string[];
  insurance: {
    liability: boolean;
    malpractice: boolean;
    workers: boolean;
  };
  background: {
    criminalCheck: 'pending' | 'approved' | 'rejected';
    referenceCheck: 'pending' | 'approved' | 'rejected';
  };
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  required: boolean;
  uploadedAt?: string;
  approvedAt?: string;
  comments?: string;
}

const ProviderOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<ProviderProfile>>({
    personalInfo: {},
    professionalInfo: { certifications: [] },
    organizationInfo: {},
    serviceAreas: [],
    insurance: { liability: false, malpractice: false, workers: false },
    background: { criminalCheck: 'pending', referenceCheck: 'pending' }
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details and contact information',
      status: 'completed',
      required: true,
      estimatedTime: 5
    },
    {
      id: 'professional',
      title: 'Professional Credentials',
      description: 'Licenses, certifications, and experience',
      status: 'in-progress',
      required: true,
      estimatedTime: 10
    },
    {
      id: 'organization',
      title: 'Organization Details',
      description: 'Practice or organization information',
      status: 'pending',
      required: true,
      estimatedTime: 8
    },
    {
      id: 'service-areas',
      title: 'Service Areas',
      description: 'Geographic areas and service types',
      status: 'pending',
      required: true,
      estimatedTime: 5
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Required licenses, insurance, and certifications',
      status: 'pending',
      required: true,
      estimatedTime: 15
    },
    {
      id: 'background',
      title: 'Background Verification',
      description: 'Criminal background and reference checks',
      status: 'pending',
      required: true,
      estimatedTime: 20
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review all information and submit application',
      status: 'pending',
      required: true,
      estimatedTime: 10
    }
  ];

  const requiredDocuments = [
    { id: 'license', name: 'Professional License', type: 'pdf', required: true },
    { id: 'liability', name: 'Liability Insurance', type: 'pdf', required: true },
    { id: 'malpractice', name: 'Malpractice Insurance', type: 'pdf', required: true },
    { id: 'certificate', name: 'Board Certification', type: 'pdf', required: false },
    { id: 'resume', name: 'Professional Resume/CV', type: 'pdf', required: true },
    { id: 'references', name: 'Professional References', type: 'pdf', required: true }
  ];

  const specialties = [
    'Primary Care',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Mental Health',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Nursing',
    'Home Health Aide',
    'Social Work',
    'Case Management'
  ];

  const organizationTypes = [
    'Solo Practice',
    'Group Practice',
    'Hospital System',
    'Home Health Agency',
    'Assisted Living Facility',
    'Skilled Nursing Facility',
    'Rehabilitation Center',
    'Mental Health Clinic',
    'Independent Contractor'
  ];

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const mockDocuments: Document[] = requiredDocuments.map(doc => ({
      ...doc,
      status: Math.random() > 0.7 ? 'uploaded' : 'pending',
      uploadedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined
    }));
    setDocuments(mockDocuments);
  };

  const validateStep = (stepId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepId) {
      case 'personal':
        if (!profile.personalInfo?.firstName) newErrors.firstName = 'First name is required';
        if (!profile.personalInfo?.lastName) newErrors.lastName = 'Last name is required';
        if (!profile.personalInfo?.email) newErrors.email = 'Email is required';
        if (!profile.personalInfo?.phone) newErrors.phone = 'Phone number is required';
        break;
      
      case 'professional':
        if (!profile.professionalInfo?.license) newErrors.license = 'License number is required';
        if (!profile.professionalInfo?.specialty) newErrors.specialty = 'Specialty is required';
        if (!profile.professionalInfo?.experience) newErrors.experience = 'Years of experience is required';
        break;
      
      case 'organization':
        if (!profile.organizationInfo?.name) newErrors.orgName = 'Organization name is required';
        if (!profile.organizationInfo?.type) newErrors.orgType = 'Organization type is required';
        if (!profile.organizationInfo?.address) newErrors.address = 'Address is required';
        if (!profile.organizationInfo?.city) newErrors.city = 'City is required';
        if (!profile.organizationInfo?.state) newErrors.state = 'State is required';
        if (!profile.organizationInfo?.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
      
      case 'service-areas':
        if (!profile.serviceAreas?.length) newErrors.serviceAreas = 'At least one service area is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const currentStepId = onboardingSteps[currentStep].id;
    
    if (validateStep(currentStepId)) {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (section: keyof ProviderProfile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'uploaded', uploadedAt: new Date().toISOString() }
        : doc
    ));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message or redirect
      alert('Application submitted successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-500" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={profile.personalInfo?.firstName || ''}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={profile.personalInfo?.lastName || ''}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={profile.personalInfo?.email || ''}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={profile.personalInfo?.phone || ''}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date of Birth *
        </label>
        <input
          type="date"
          value={profile.personalInfo?.dateOfBirth || ''}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Privacy Notice</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your personal information is encrypted and stored securely. We comply with all HIPAA and state privacy regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Number *
          </label>
          <input
            type="text"
            value={profile.professionalInfo?.license || ''}
            onChange={(e) => handleInputChange('professionalInfo', 'license', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.license ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Enter your license number"
          />
          {errors.license && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.license}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialty *
          </label>
          <select
            value={profile.professionalInfo?.specialty || ''}
            onChange={(e) => handleInputChange('professionalInfo', 'specialty', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.specialty ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            <option value="">Select your specialty</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          {errors.specialty && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specialty}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={profile.professionalInfo?.experience || ''}
            onChange={(e) => handleInputChange('professionalInfo', 'experience', parseInt(e.target.value))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="0"
          />
          {errors.experience && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.experience}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Highest Education
          </label>
          <input
            type="text"
            value={profile.professionalInfo?.education || ''}
            onChange={(e) => handleInputChange('professionalInfo', 'education', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., MD, RN, BSN, MSW"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Certifications
        </label>
        <textarea
          rows={3}
          value={profile.professionalInfo?.certifications?.join('\n') || ''}
          onChange={(e) => handleInputChange('professionalInfo', 'certifications', e.target.value.split('\n').filter(Boolean))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="List your certifications (one per line)"
        />
      </div>
    </div>
  );

  const renderOrganizationInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            value={profile.organizationInfo?.name || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.orgName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Enter organization name"
          />
          {errors.orgName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.orgName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Type *
          </label>
          <select
            value={profile.organizationInfo?.type || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'type', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.orgType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            <option value="">Select organization type</option>
            {organizationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.orgType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.orgType}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Street Address *
        </label>
        <input
          type="text"
          value={profile.organizationInfo?.address || ''}
          onChange={(e) => handleInputChange('organizationInfo', 'address', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Enter street address"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City *
          </label>
          <input
            type="text"
            value={profile.organizationInfo?.city || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'city', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Enter city"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State *
          </label>
          <select
            value={profile.organizationInfo?.state || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'state', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            <option value="">Select state</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            value={profile.organizationInfo?.zipCode || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'zipCode', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="12345"
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax ID/EIN
          </label>
          <input
            type="text"
            value={profile.organizationInfo?.taxId || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'taxId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="XX-XXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={profile.organizationInfo?.website || ''}
            onChange={(e) => handleInputChange('organizationInfo', 'website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );

  const renderServiceAreas = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Service Areas *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {states.slice(0, 12).map(state => (
            <label key={state} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profile.serviceAreas?.includes(state) || false}
                onChange={(e) => {
                  const areas = profile.serviceAreas || [];
                  if (e.target.checked) {
                    handleInputChange('serviceAreas', '', [...areas, state]);
                  } else {
                    handleInputChange('serviceAreas', '', areas.filter(area => area !== state));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{state}</span>
            </label>
          ))}
        </div>
        {errors.serviceAreas && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.serviceAreas}</p>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Service Area Coverage</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Select all areas where you can provide services. This helps us match you with patients in your coverage area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Document Requirements</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              All documents must be current, clearly legible, and in PDF format. File size limit is 10MB per document.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map(doc => (
          <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {doc.name}
                  {doc.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Accepted formats: PDF • Max size: 10MB
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {doc.status === 'uploaded' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {doc.status === 'pending' && (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                {doc.status === 'approved' && (
                  <Award className="w-5 h-5 text-blue-500" />
                )}
                {doc.status === 'rejected' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {doc.status === 'pending' && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drop file here or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(doc.id, file);
                  }}
                  className="hidden"
                  id={`file-${doc.id}`}
                />
                <label
                  htmlFor={`file-${doc.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </div>
            )}

            {doc.status === 'uploaded' && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      Uploaded on {new Date(doc.uploadedAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-800">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {doc.comments && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                {doc.comments}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackground = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Background Verification</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We conduct thorough background checks to ensure patient safety and regulatory compliance. This process typically takes 3-5 business days.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Criminal Background Check
            </h4>
            <div className="flex items-center space-x-2">
              {profile.background?.criminalCheck === 'approved' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {profile.background?.criminalCheck === 'pending' && (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              {profile.background?.criminalCheck === 'rejected' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.background?.criminalCheck === 'approved' ? 'bg-green-100 text-green-800' :
                profile.background?.criminalCheck === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {profile.background?.criminalCheck || 'pending'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive background check including federal and state criminal records.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Professional References
            </h4>
            <div className="flex items-center space-x-2">
              {profile.background?.referenceCheck === 'approved' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {profile.background?.referenceCheck === 'pending' && (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              {profile.background?.referenceCheck === 'rejected' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.background?.referenceCheck === 'approved' ? 'bg-green-100 text-green-800' :
                profile.background?.referenceCheck === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {profile.background?.referenceCheck || 'pending'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verification of professional references and previous employment history.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Insurance Requirements</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={profile.insurance?.liability || false}
              onChange={(e) => handleInputChange('insurance', 'liability', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              General Liability Insurance (minimum $1M coverage)
            </span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={profile.insurance?.malpractice || false}
              onChange={(e) => handleInputChange('insurance', 'malpractice', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Professional Malpractice Insurance (minimum $1M coverage)
            </span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={profile.insurance?.workers || false}
              onChange={(e) => handleInputChange('insurance', 'workers', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Workers' Compensation Insurance (if applicable)
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ready to Submit
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          Please review all information below before submitting your application. Once submitted, you'll receive a confirmation email and our team will begin the review process.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Personal Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white">
                  {profile.personalInfo?.firstName} {profile.personalInfo?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white">{profile.personalInfo?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="text-gray-900 dark:text-white">{profile.personalInfo?.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Professional Credentials
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">License:</span>
                <span className="text-gray-900 dark:text-white">{profile.professionalInfo?.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Specialty:</span>
                <span className="text-gray-900 dark:text-white">{profile.professionalInfo?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                <span className="text-gray-900 dark:text-white">{profile.professionalInfo?.experience} years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Organization Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white">{profile.organizationInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">{profile.organizationInfo?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="text-gray-900 dark:text-white">
                  {profile.organizationInfo?.city}, {profile.organizationInfo?.state}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Documents Status
            </h4>
            <div className="space-y-2 text-sm">
              {documents.filter(d => d.required).map(doc => (
                <div key={doc.id} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">{doc.name}:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                    doc.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Next Steps</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              After submission, expect a confirmation email within 24 hours. Our credentialing team will review your application within 5-7 business days. You'll be notified of any additional requirements or approval status.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="terms"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
          I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
        </label>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (onboardingSteps[currentStep].id) {
      case 'personal':
        return renderPersonalInfo();
      case 'professional':
        return renderProfessionalInfo();
      case 'organization':
        return renderOrganizationInfo();
      case 'service-areas':
        return renderServiceAreas();
      case 'documents':
        return renderDocuments();
      case 'background':
        return renderBackground();
      case 'review':
        return renderReview();
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Provider Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your registration to join the DocuHero network
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                {getStepIcon(step)}
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.estimatedTime} min</p>
                </div>
              </div>
              {index < onboardingSteps.length - 1 && (
                <div className={`hidden md:block w-full h-px mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
          <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
          <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {onboardingSteps[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {onboardingSteps[currentStep].description}
          </p>
        </div>

        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-4">
          {currentStep < onboardingSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@docuhero.com" className="text-blue-600 hover:text-blue-800">
            support@docuhero.com
          </a>{' '}
          or{' '}
          <a href="tel:+1-555-123-4567" className="text-blue-600 hover:text-blue-800">
            (555) 123-4567
          </a>
        </p>
      </div>
    </div>
  );
};

export default ProviderOnboarding;