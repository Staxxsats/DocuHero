import React, { useState } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  FileText, 
  Mic, 
  Phone, 
  Mail, 
  MessageSquare,
  Crown,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  enterprise?: boolean;
  limits: {
    employees: string;
    clients: string;
  };
}

interface AddOn {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: React.ComponentType<any>;
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$149' : '$1,490',
      description: 'Perfect for small agencies getting started with voice documentation',
      limits: {
        employees: 'Up to 5 employees',
        clients: 'Up to 25 clients'
      },
      features: [
        'Voice-to-Text Documentation',
        'State Compliance Templates',
        'Two-Factor Authentication',
        'Care Plan Uploads',
        'Email Support',
        'Basic Audit Logging',
        'Mobile App Access',
        'HIPAA Compliance'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'monthly' ? '$399' : '$3,990',
      description: 'Ideal for growing agencies with advanced compliance needs',
      popular: true,
      limits: {
        employees: 'Up to 20 employees',
        clients: 'Up to 100 clients'
      },
      features: [
        'Everything in Starter',
        'AI Compliance Checker',
        'CSV Billing Export',
        'Priority Support',
        'Advanced Audit Tracking',
        'Custom Form Builder',
        'Team Collaboration Tools',
        'Automated Reminders',
        'Multi-State Operations',
        'API Access (Basic)'
      ],
      buttonText: 'Start Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'Comprehensive solution for large healthcare organizations',
      enterprise: true,
      limits: {
        employees: 'Unlimited staff',
        clients: 'Unlimited clients'
      },
      features: [
        'Everything in Professional',
        'Full API Integration',
        'Dedicated Account Manager',
        'Custom Integrations',
        'Advanced Analytics',
        'White-Label Options',
        'SLA Guarantees',
        'Custom Training',
        'On-Premise Deployment',
        'Advanced Security Features'
      ],
      buttonText: 'Contact Sales'
    }
  ];

  const addOns: AddOn[] = [
    {
      id: 'extra-clients',
      name: 'Extra Clients',
      price: '$20',
      description: '10 additional client slots',
      icon: Users
    },
    {
      id: 'extra-employees',
      name: 'Extra Employees',
      price: '$50',
      description: '5 additional employee accounts',
      icon: Users
    },
    {
      id: 'billing-integration',
      name: 'Billing Integration',
      price: '$129',
      description: 'Advanced billing and insurance integration',
      icon: FileText
    },
    {
      id: 'sms-notifications',
      name: 'SMS Notification Pack',
      price: '$30',
      description: 'SMS alerts and reminders for staff and clients',
      icon: MessageSquare
    }
  ];

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    if (!selectedTier) return 0;
    
    const tier = pricingTiers.find(t => t.id === selectedTier);
    if (!tier || tier.enterprise) return 0;
    
    const basePrice = parseInt(tier.price.replace('$', '').replace(',', ''));
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn ? parseInt(addOn.price.replace('$', '')) : 0);
    }, 0);
    
    return basePrice + addOnTotal;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white font-space">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-16 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              DocuHero
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your healthcare documentation with voice-powered compliance
          </p>
          
          <div className="text-lg font-semibold text-primary-400 mb-12">
            "Speak It. DocuHero It."
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-200 dark:bg-dark-800 rounded-full p-1 flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  billingCycle === 'annual'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.id}
                className={`relative rounded-3xl border-2 transition-all duration-500 hover:scale-105 cursor-pointer ${
                  tier.popular
                    ? 'border-primary-500 bg-gradient-to-b from-primary-500/10 to-secondary-500/10 shadow-2xl shadow-primary-500/20'
                    : tier.enterprise
                    ? 'border-secondary-500 bg-gradient-to-b from-secondary-500/10 to-primary-500/10'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-800/50 hover:border-primary-500/50'
                } ${selectedTier === tier.id ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Most Popular
                    </div>
                  </div>
                )}

                {tier.enterprise && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                      <Crown className="w-4 h-4 mr-2" />
                      Enterprise
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{tier.description}</p>
                    
                    <div className="mb-6">
                      {tier.enterprise ? (
                        <div>
                          <div className="text-4xl font-bold text-primary-400">Custom</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Starting at $999/mo</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl font-bold text-primary-400">
                            {tier.price}
                            <span className="text-lg text-gray-600 dark:text-gray-400">
                              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          </div>
                          {billingCycle === 'annual' && (
                            <div className="text-sm text-green-400">
                              Save ${Math.round(parseInt(tier.price.replace('$', '').replace(',', '')) * 0.2)} annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="bg-gray-100 dark:bg-dark-700/50 rounded-lg p-4 mb-6">
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <div className="flex items-center justify-center">
                          <Users className="w-4 h-4 mr-2 text-primary-400" />
                          {tier.limits.employees}
                        </div>
                        <div className="flex items-center justify-center">
                          <FileText className="w-4 h-4 mr-2 text-secondary-400" />
                          {tier.limits.clients}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-primary-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transform hover:scale-105'
                        : tier.enterprise
                        ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:shadow-lg hover:shadow-secondary-500/25 transform hover:scale-105'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-500/10'
                    }`}
                  >
                    {tier.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="bg-white dark:bg-dark-800/50 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-400 mr-3" />
                Power-Up Your Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Enhance your DocuHero experience with these optional add-ons
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedAddOns.includes(addOn.id)
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-700/50 hover:border-primary-500/50'
                  }`}
                  onClick={() => toggleAddOn(addOn.id)}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <addOn.icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="font-semibold mb-2">{addOn.name}</h3>
                    <div className="text-2xl font-bold text-primary-400 mb-2">
                      {addOn.price}<span className="text-sm text-gray-600 dark:text-gray-400">/mo</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{addOn.description}</p>
                    
                    {selectedAddOns.includes(addOn.id) && (
                      <div className="mt-4">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculator */}
            {selectedTier && !pricingTiers.find(t => t.id === selectedTier)?.enterprise && (
              <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-6 border border-primary-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Your Monthly Total</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {pricingTiers.find(t => t.id === selectedTier)?.name} plan
                      {selectedAddOns.length > 0 && ` + ${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-400">
                      ${calculateTotal().toLocaleString()}
                      <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-green-400">
                        Annual: ${(calculateTotal() * 12 * 0.8).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-primary-400 mb-2" />
                <h4 className="font-semibold mb-1">HIPAA Compliant</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-grade security</p>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 text-secondary-400 mb-2" />
                <h4 className="font-semibold mb-1">99.9% Uptime</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reliable and fast</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 text-primary-400 mb-2" />
                <h4 className="font-semibold mb-1">24/7 Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Always here to help</p>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-secondary-400 mb-2" />
                <h4 className="font-semibold mb-1">5-Star Rated</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loved by healthcare pros</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, we offer a 14-day free trial for all plans. No credit card required to start.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What about data security?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">We're fully HIPAA compliant with end-to-end encryption and regular security audits.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Do you offer training?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, we provide comprehensive onboarding and training for all team members.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I integrate with existing systems?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Professional and Enterprise plans include API access for seamless integrations.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">We accept all major credit cards and ACH transfers for annual plans.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl p-12 border border-primary-500/20">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Documentation?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare professionals who trust DocuHero for secure, compliant documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
                <button className="px-8 py-4 rounded-full text-lg font-semibold border-2 border-primary-500 text-primary-500 dark:text-primary-400 hover:bg-primary-500/10 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}