import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  FileText, 
  DollarSign, 
  Shield, 
  Clock, 
  Smartphone, 
  Users, 
  Heart, 
  GraduationCap, 
  Building, 
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Mail,
  Linkedin,
  Twitter,
  CreditCard,
  Brain,
  NotebookPen,
  BarChart3,
  Info
} from 'lucide-react';
import PricingPage from './components/PricingPage';
import { ThemeToggle } from './components/ThemeToggle';
import ProgressNotes from './components/ProgressNotes';
import InsightsDashboard from './components/InsightsDashboard';
import MissionSection from './components/MissionSection';
import CookieConsent from './components/CookieConsent';
import { SolutionsDropdown, CompanyDropdown } from './components/DropdownMenu';
import { smoothScrollTo } from './utils/smoothScroll';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [showProgressNotes, setShowProgressNotes] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showMission, setShowMission] = useState(false);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Registered Nurse",
      company: "HomeHealth Plus",
      content: "DocuHero has revolutionized my documentation process. I save 3 hours every day and my notes are more detailed than ever.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Marcus Rodriguez",
      role: "Special Education Teacher",
      company: "Lincoln Elementary",
      content: "Creating IEPs used to take hours. Now I can document sessions in real-time and generate reports instantly.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Dr. Jennifer Walsh",
      role: "Clinical Therapist",
      company: "Wellness Behavioral Health",
      content: "HIPAA compliance was my biggest concern. DocuHero handles everything securely while making my job so much easier.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Robert Kim",
      role: "Case Manager",
      company: "Community Support Services",
      content: "The billing integration is phenomenal. From voice notes to insurance claims in minutes, not hours.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    setEmail('');
    alert('Thank you for joining our waitlist! We\'ll be in touch soon.');
  };

  // Show different pages based on state
  if (showPricing) {
    return <PricingPage />;
  }
  
  if (showProgressNotes) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
        <nav className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowProgressNotes(false)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                DocuHero
              </span>
            </button>
            <ThemeToggle />
          </div>
        </nav>
        <ProgressNotes />
      </div>
    );
  }
  
  if (showInsights) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
        <nav className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowInsights(false)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                DocuHero
              </span>
            </button>
            <ThemeToggle />
          </div>
        </nav>
        <InsightsDashboard />
      </div>
    );
  }
  
  if (showMission) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
        <nav className="px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowMission(false)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                DocuHero
              </span>
            </button>
            <ThemeToggle />
          </div>
        </nav>
        <MissionSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white font-space overflow-x-hidden transition-colors duration-200">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-16 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              DocuHero
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => smoothScrollTo('how-it-works')}
              className="btn-ghost"
            >
              How It Works
            </button>
            <SolutionsDropdown 
              onProgressNotes={() => setShowProgressNotes(true)}
              onInsights={() => setShowInsights(true)}
            />
            <CompanyDropdown 
              onMission={() => setShowMission(true)}
            />
            <button 
              onClick={() => setShowPricing(true)}
              className="btn-ghost flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-2 icon-bounce" />
              Pricing
            </button>
            <ThemeToggle />
            <button className="btn-primary">
              Request Demo
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in-down">
            <div className="bg-white dark:bg-dark-800 w-full h-full pt-20 animate-slide-up">
              <div className="px-6 py-8 space-y-6 stagger-animation">
                <button 
                  onClick={() => {smoothScrollTo('how-it-works'); setIsMenuOpen(false);}}
                  className="flex items-center w-full p-4 text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300"
                >
                  <Brain className="w-5 h-5 mr-3 icon-bounce" />
                  How It Works
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Solutions</h3>
                  <button 
                    onClick={() => {setShowProgressNotes(true); setIsMenuOpen(false);}}
                    className="flex items-center w-full p-4 text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300"
                  >
                    <NotebookPen className="w-5 h-5 mr-3 icon-bounce" />
                    <div>
                      <p className="font-medium">Progress Notes</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered documentation</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => {setShowInsights(true); setIsMenuOpen(false);}}
                    className="flex items-center w-full p-4 text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300"
                  >
                    <BarChart3 className="w-5 h-5 mr-3 icon-bounce" />
                    <div>
                      <p className="font-medium">Insights Dashboard</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Real-time analytics</p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Company</h3>
                  <button 
                    onClick={() => {setShowMission(true); setIsMenuOpen(false);}}
                    className="flex items-center w-full p-4 text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300"
                  >
                    <Info className="w-5 h-5 mr-3 icon-bounce" />
                    <div>
                      <p className="font-medium">About Us</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Our mission & team</p>
                    </div>
                  </button>
                </div>

                <button 
                  onClick={() => {setShowPricing(true); setIsMenuOpen(false);}}
                  className="flex items-center w-full p-4 text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-all duration-300"
                >
                  <CreditCard className="w-5 h-5 mr-3 icon-bounce" />
                  Pricing
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  <button className="btn-primary w-full">
                    Request Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Turn Your Voice into{' '}
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Compliant Documentation
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              From home health to classrooms, DocuHero powers secure, voice-first note-taking and billing.
            </p>
            <div className="text-lg md:text-xl font-semibold text-primary-400 mb-12">
              "Speak It. Certifi It."
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button className="group btn-primary text-lg px-8 py-4 rounded-full">
              Try DocuHero
              <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary text-lg px-8 py-4 rounded-full">
              Request a Demo
            </button>
          </div>

          {/* Floating Voice Indicator */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center animate-pulse-slow">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary-400/30 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform your workflow in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group animate-fade-in-left">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">1. Speak</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Document in real time using voice. Our AI captures every detail as you speak naturally.
              </p>
            </div>

            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">2. DocuHero</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                AI structures your notes into SOAP, IEPs, and progress forms with blockchain timestamping.
              </p>
            </div>

            <div className="text-center group animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-600 dark:text-primary-400">3. Bill</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Export to billing formats like CSV, ready for payers. Streamline your revenue cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section id="industries" className="relative z-10 px-6 py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Industries We Serve</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering professionals across healthcare and education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Home Healthcare", desc: "SOAP notes, care plans, and billing documentation" },
              { icon: Users, title: "Behavioral Health", desc: "Treatment notes, progress tracking, and compliance reporting" },
              { icon: GraduationCap, title: "Special Education", desc: "IEPs, progress monitoring, and educational assessments" },
              { icon: FileText, title: "Case Management", desc: "Client documentation, service plans, and outcome tracking" },
              { icon: Building, title: "Nonprofits & Government", desc: "Grant reporting, client services, and program documentation" },
              { icon: Users, title: "Schools & Therapy Clinics", desc: "Session notes, treatment plans, and progress reports" }
            ].map((industry, index) => (
              <div key={index} className="bg-white dark:bg-dark-700/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 card-hover group">
                <industry.icon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-6 icon-bounce group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors" />
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{industry.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Showcase */}
      <section className="relative z-10 px-6 py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Advanced Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of healthcare documentation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Progress Notes Feature */}
            <div className="bg-white dark:bg-dark-700/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden card-hover group">
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                <NotebookPen className="w-24 h-24 text-white opacity-80 icon-bounce" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Automated Progress Notes</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Create comprehensive session notes with AI-powered transcription. Support for SOAP, DAR, and BIRP formats with automatic diagnosis coding.
                </p>
                <button
                  onClick={() => setShowProgressNotes(true)}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center transition-all duration-300 group-hover:translate-x-1"
                >
                  Explore Progress Notes
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Insights Dashboard Feature */}
            <div className="bg-white dark:bg-dark-700/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden card-hover group">
              <div className="h-48 bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center group-hover:from-green-600 group-hover:to-teal-600 transition-all duration-300">
                <BarChart3 className="w-24 h-24 text-white opacity-80 icon-bounce" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Real-Time Insights</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  AI-powered analytics dashboard with personalized recommendations to optimize your practice and improve patient outcomes.
                </p>
                <button
                  onClick={() => setShowInsights(true)}
                  className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 flex items-center transition-all duration-300 group-hover:translate-x-1"
                >
                  View Insights Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why DocuHero */}
      <section id="why-certifi" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why DocuHero?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The most secure and efficient voice documentation platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: "Save 2-3 Hours Daily", desc: "Streamline documentation workflow" },
              { icon: Shield, title: "HIPAA & FERPA Compliant", desc: "Enterprise-grade security" },
              { icon: CheckCircle, title: "Blockchain Timestamping", desc: "Immutable audit trails" },
              { icon: Smartphone, title: "Mobile-Friendly", desc: "Document anywhere, anytime" }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl p-12 border border-primary-500/20 dark:border-primary-500/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Real-Time CSV Export</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                  Seamlessly integrate with your existing billing systems. Export documentation in multiple formats ready for insurance claims and payer requirements.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                    Multiple export formats (CSV, PDF, XML)
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                    Direct integration with EHR systems
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                    Automated billing code suggestions
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-gray-100 dark:bg-dark-700 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="text-primary-600 dark:text-primary-400">Patient_ID,Service_Date,CPT_Code,Units</div>
                    <div className="text-gray-700 dark:text-gray-300">12345,2024-01-15,99213,1</div>
                    <div className="text-gray-700 dark:text-gray-300">12346,2024-01-15,90834,1</div>
                    <div className="text-gray-700 dark:text-gray-300">12347,2024-01-15,97110,2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Users Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Trusted by healthcare and education professionals nationwide
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="testimonial-card bg-white dark:bg-dark-700/50 rounded-3xl p-12 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center mb-8">
                <img 
                  src={testimonials[currentTestimonial].avatar} 
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mr-6 transition-transform duration-300 hover:scale-110"
                />
                <div>
                  <h4 className="text-xl font-bold">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-primary-600 dark:text-primary-400">{testimonials[currentTestimonial].role}</p>
                  <p className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].company}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current icon-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
              <blockquote className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
            </div>

            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial 
                      ? 'bg-primary-500 pulse-glow' 
                      : 'bg-gray-400 dark:bg-gray-600 hover:bg-primary-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl p-12 border border-primary-500/20 dark:border-primary-500/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Be the First to Certifi It</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our waitlist and be among the first to experience the future of voice documentation.
            </p>
            
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:scale-105"
                required
              />
              <button
                type="submit"
                className="btn-primary px-8 py-4 rounded-full whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </form>
            
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-sm">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  DocuHero
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Transforming voice into compliant documentation for healthcare and education professionals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a></li>
                <li>
                  <button 
                    onClick={() => setShowPricing(true)}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <button 
                    onClick={() => setShowMission(true)}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 DocuHero. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Powered by Blockchain Technology</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}

export default App;