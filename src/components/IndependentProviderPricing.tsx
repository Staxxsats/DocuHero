import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Star,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Clock,
  DollarSign,
  Zap,
  Crown,
  Sparkles,
  Calculator,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Award,
  BarChart3,
  Headphones,
  Globe,
  Lock,
  RefreshCw,
  Target,
  ArrowRight
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  popular: boolean;
  features: {
    included: string[];
    excluded: string[];
  };
  limits: {
    patients: number | 'unlimited';
    documentation: number | 'unlimited';
    storage: string;
    support: string;
  };
  customizations: string[];
  badge?: string;
  color: string;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'documentation' | 'storage' | 'support' | 'compliance';
}

interface ProviderProfile {
  type: 'solo' | 'small-group' | 'large-group' | 'enterprise';
  specialty: string;
  patientVolume: number;
  currentSoftware?: string;
  priorities: string[];
}

const IndependentProviderPricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [providerProfile, setProviderProfile] = useState<Partial<ProviderProfile>>({
    type: 'solo',
    patientVolume: 50,
    priorities: []
  });
  const [showCalculator, setShowCalculator] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual practitioners just getting started',
      price: billingCycle === 'monthly' ? 49 : 490,
      billingCycle,
      popular: false,
      features: {
        included: [
          'Up to 25 patients',
          'Basic voice documentation',
          'Standard templates (SOAP, DAR)',
          'PDF export',
          'Email support',
          '5GB cloud storage',
          'Basic compliance features',
          'Mobile app access'
        ],
        excluded: [
          'Advanced AI insights',
          'Custom templates',
          'Priority support',
          'Advanced integrations',
          'Team collaboration',
          'Advanced reporting'
        ]
      },
      limits: {
        patients: 25,
        documentation: 200,
        storage: '5GB',
        support: 'Email only'
      },
      customizations: ['Basic template customization'],
      color: 'border-gray-200 dark:border-gray-700',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for established independent practitioners',
      price: billingCycle === 'monthly' ? 99 : 990,
      billingCycle,
      popular: true,
      features: {
        included: [
          'Up to 100 patients',
          'Advanced voice-to-text with AI',
          'All template types (SOAP, BIRP, IEP)',
          'Multi-format export (PDF, CSV, XML)',
          'Priority email & chat support',
          '25GB cloud storage',
          'HIPAA compliance suite',
          'Mobile & web app access',
          'Basic analytics dashboard',
          'Billing code suggestions',
          'Custom template builder',
          'Automated backup'
        ],
        excluded: [
          'Team collaboration features',
          'Advanced integrations',
          'White-label options',
          'Dedicated account manager'
        ]
      },
      limits: {
        patients: 100,
        documentation: 1000,
        storage: '25GB',
        support: 'Email & Chat'
      },
      customizations: [
        'Custom templates',
        'Personalized workflows',
        'Custom fields'
      ],
      badge: 'Most Popular',
      color: 'border-blue-500',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For growing practices with advanced needs',
      price: billingCycle === 'monthly' ? 199 : 1990,
      billingCycle,
      popular: false,
      features: {
        included: [
          'Up to 500 patients',
          'AI-powered documentation with insights',
          'All premium templates & custom builder',
          'Advanced export & API access',
          'Priority phone, chat & email support',
          '100GB cloud storage',
          'Advanced compliance & audit tools',
          'Multi-device access',
          'Comprehensive analytics suite',
          'Advanced billing integration',
          'Team collaboration tools',
          'Custom branding options',
          'Advanced automation',
          'Integration with major EHRs',
          'Telehealth documentation'
        ],
        excluded: [
          'Unlimited everything',
          'Dedicated account manager',
          'Custom development'
        ]
      },
      limits: {
        patients: 500,
        documentation: 5000,
        storage: '100GB',
        support: 'Phone, Chat & Email'
      },
      customizations: [
        'Full template customization',
        'Custom workflows',
        'Branding options',
        'API integrations'
      ],
      color: 'border-purple-500',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Unlimited everything for large practices and organizations',
      price: billingCycle === 'monthly' ? 399 : 3990,
      billingCycle,
      popular: false,
      features: {
        included: [
          'Unlimited patients',
          'Enterprise AI with custom models',
          'Unlimited templates & full customization',
          'Complete API access & webhooks',
          'Dedicated account manager',
          'Unlimited cloud storage',
          'Enterprise compliance & security',
          'All device access',
          'Advanced analytics & reporting',
          'Complete billing suite integration',
          'Advanced team management',
          'White-label options',
          'Custom automation & workflows',
          'All EHR integrations',
          'Priority feature requests',
          'Custom development hours',
          '24/7 phone support',
          'On-site training available'
        ],
        excluded: []
      },
      limits: {
        patients: 'unlimited',
        documentation: 'unlimited',
        storage: 'Unlimited',
        support: '24/7 Dedicated'
      },
      customizations: [
        'Complete customization',
        'Custom development',
        'White-label options',
        'Enterprise integrations'
      ],
      badge: 'Enterprise',
      color: 'border-gradient-to-r from-yellow-400 to-orange-500',
    }
  ];

  const addOns: AddOn[] = [
    {
      id: 'extra-patients',
      name: 'Additional Patient Slots',
      description: 'Add more patient capacity to your plan',
      price: 2,
      unit: 'per patient/month',
      category: 'documentation'
    },
    {
      id: 'extra-storage',
      name: 'Extra Storage',
      description: 'Additional cloud storage for your documents',
      price: 5,
      unit: 'per 10GB/month',
      category: 'storage'
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      description: '24/7 phone support with 1-hour response time',
      price: 50,
      unit: 'per month',
      category: 'support'
    },
    {
      id: 'compliance-plus',
      name: 'Compliance Plus',
      description: 'Advanced audit trails and compliance reporting',
      price: 30,
      unit: 'per month',
      category: 'compliance'
    },
    {
      id: 'ehr-integration',
      name: 'Custom EHR Integration',
      description: 'Direct integration with your existing EHR system',
      price: 100,
      unit: 'per month',
      category: 'documentation'
    },
    {
      id: 'training-package',
      name: 'Professional Training',
      description: 'Comprehensive onboarding and training sessions',
      price: 200,
      unit: 'one-time',
      category: 'support'
    }
  ];

  const specialties = [
    'Primary Care',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Mental Health',
    'Physical Therapy',
    'Occupational Therapy',
    'Home Health',
    'Case Management',
    'Other'
  ];

  const currentSoftwareOptions = [
    'Epic',
    'Cerner',
    'Allscripts',
    'NextGen',
    'eClinicalWorks',
    'AthenaHealth',
    'Paper-based',
    'Other',
    'None'
  ];

  const priorities = [
    'Time savings',
    'Compliance',
    'Cost reduction',
    'Better documentation',
    'Patient care quality',
    'Billing accuracy',
    'Team collaboration',
    'Mobile access'
  ];

  const calculateTotal = () => {
    const selectedTierData = pricingTiers.find(tier => tier.id === selectedTier);
    if (!selectedTierData) return 0;

    let total = selectedTierData.price;
    
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(ao => ao.id === addOnId);
      if (addOn && !addOn.unit.includes('one-time')) {
        total += addOn.price;
      }
    });

    return total;
  };

  const calculateAnnualSavings = () => {
    const monthlyTotal = calculateTotal();
    const yearlyDiscount = Math.floor(monthlyTotal * 12 * 0.17); // ~17% discount
    return yearlyDiscount;
  };

  const getRecommendedTier = () => {
    if (providerProfile.patientVolume <= 25) return 'starter';
    if (providerProfile.patientVolume <= 100) return 'professional';
    if (providerProfile.patientVolume <= 500) return 'premium';
    return 'enterprise';
  };

  const handleAddOnToggle = (addOnId: string) => {
    const newAddOns = new Set(selectedAddOns);
    if (newAddOns.has(addOnId)) {
      newAddOns.delete(addOnId);
    } else {
      newAddOns.add(addOnId);
    }
    setSelectedAddOns(newAddOns);
  };

  const handlePriorityToggle = (priority: string) => {
    const currentPriorities = providerProfile.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    setProviderProfile(prev => ({
      ...prev,
      priorities: newPriorities
    }));
  };

  useEffect(() => {
    const recommended = getRecommendedTier();
    setSelectedTier(recommended);
  }, [providerProfile.patientVolume]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Independent Provider Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Choose the perfect plan for your practice. All plans include voice documentation, 
          HIPAA compliance, and our mobile app.
        </p>
      </div>

      {/* Provider Profile Questionnaire */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Get Personalized Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Type
            </label>
            <select
              value={providerProfile.type}
              onChange={(e) => setProviderProfile(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solo">Solo Practice</option>
              <option value="small-group">Small Group (2-5 providers)</option>
              <option value="large-group">Large Group (6+ providers)</option>
              <option value="enterprise">Enterprise/Hospital System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Average Monthly Patients
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={providerProfile.patientVolume}
              onChange={(e) => setProviderProfile(prev => ({ ...prev, patientVolume: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specialty
            </label>
            <select
              value={providerProfile.specialty}
              onChange={(e) => setProviderProfile(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select your specialty</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What are your top priorities? (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {priorities.map(priority => (
              <button
                key={priority}
                onClick={() => handlePriorityToggle(priority)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  providerProfile.priorities?.includes(priority)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex items-center">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Annually
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
              selectedTier === tier.id
                ? tier.color + ' shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } ${tier.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
          >
            {tier.badge && (
              <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                tier.popular ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-yellow-900'
              }`}>
                {tier.badge}
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {tier.description}
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${tier.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-green-600 text-sm">
                  Save ${Math.floor((tier.price / 0.83) * 12 - tier.price)} annually
                </p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Plan Limits
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Patients:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.patients === 'unlimited' ? 'Unlimited' : tier.limits.patients}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.storage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Support:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.support}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setExpandedFeatures(expandedFeatures === tier.id ? null : tier.id)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Features Included
                  {expandedFeatures === tier.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {expandedFeatures === tier.id && (
                  <div className="space-y-2">
                    {tier.features.included.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                    {tier.features.included.length > 6 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{tier.features.included.length - 6} more features
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedTier(tier.id)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                selectedTier === tier.id
                  ? 'bg-blue-600 text-white'
                  : tier.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {selectedTier === tier.id ? 'Selected' : `Choose ${tier.name}`}
            </button>

            {tier.id === getRecommendedTier() && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended for you
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add-ons Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Add-ons & Extras
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enhance your plan with additional features and capacity
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                selectedAddOns.has(addOn.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleAddOnToggle(addOn.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {addOn.name}
                </h4>
                <input
                  type="checkbox"
                  checked={selectedAddOns.has(addOn.id)}
                  onChange={() => handleAddOnToggle(addOn.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {addOn.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${addOn.price} {addOn.unit}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  addOn.category === 'documentation' ? 'bg-blue-100 text-blue-800' :
                  addOn.category === 'storage' ? 'bg-green-100 text-green-800' :
                  addOn.category === 'support' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {addOn.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Calculator */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cost Summary
          </h3>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {showCalculator ? 'Hide' : 'Show'} Calculator
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {pricingTiers.find(t => t.id === selectedTier)?.name} Plan
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${pricingTiers.find(t => t.id === selectedTier)?.price || 0}
                </span>
              </div>

              {Array.from(selectedAddOns).map(addOnId => {
                const addOn = addOns.find(ao => ao.id === addOnId);
                return addOn ? (
                  <div key={addOn.id} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {addOn.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${addOn.price}
                    </span>
                  </div>
                ) : null;
              })}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Total {billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                  </span>
                  <span className="text-blue-600">
                    ${calculateTotal()}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 mt-1">
                    You save ${calculateAnnualSavings()} compared to monthly billing
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                ROI Estimate
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time saved per day:</span>
                  <span className="font-medium text-gray-900 dark:text-white">2-3 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hourly rate savings:</span>
                  <span className="font-medium text-gray-900 dark:text-white">$150-250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly savings:</span>
                  <span className="font-medium text-green-600">$9,000-15,000</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    30-Day Free Trial
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Try any plan risk-free for 30 days. No setup fees, cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Feature Comparison
          </h3>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>
        </div>

        {showComparison && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Feature
                  </th>
                  {pricingTiers.map(tier => (
                    <th key={tier.id} className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Voice Documentation',
                  'HIPAA Compliance',
                  'Mobile App',
                  'Custom Templates',
                  'Analytics Dashboard',
                  'Team Collaboration',
                  'Priority Support',
                  'API Access',
                  'White-label Options'
                ].map((feature, index) => (
                  <tr key={feature} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {feature}
                    </td>
                    {pricingTiers.map(tier => {
                      const hasFeature = tier.features.included.some(f => 
                        f.toLowerCase().includes(feature.toLowerCase()) ||
                        feature.toLowerCase().includes(f.toLowerCase().split(' ')[0])
                      );
                      return (
                        <td key={tier.id} className="py-3 px-4 text-center">
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">
          Ready to Transform Your Documentation?
        </h3>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of healthcare providers who save 2-3 hours daily with DocuHero
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            <Calendar className="w-5 h-5 mr-2" />
            Start Free Trial
          </button>
          <button className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
            <Headphones className="w-5 h-5 mr-2" />
            Schedule Demo
          </button>
        </div>
        <p className="text-sm mt-4 opacity-75">
          No credit card required • 30-day free trial • Cancel anytime
        </p>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Can I change plans anytime?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate the billing accordingly.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Is my data secure and HIPAA compliant?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Absolutely. All plans include enterprise-grade security, encryption, and full HIPAA compliance. 
              We maintain SOC 2 Type II certification.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Do you offer training and support?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All plans include comprehensive onboarding and documentation. Higher-tier plans include 
              live training sessions and priority support.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              What integrations are available?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We integrate with major EHR systems, billing platforms, and practice management software. 
              Custom integrations are available for Premium and Enterprise plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndependentProviderPricing;