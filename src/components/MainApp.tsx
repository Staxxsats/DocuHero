import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import LoginForm from './LoginForm';
import SignupFlow from './SignupFlow';
import Dashboard from './Dashboard';
// Removed circular import - will create Landing component instead

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading DocuHero...</p>
        </div>
      </div>
    );
  }

  // Show landing page if no user and not in auth flow
  if (!user && !showSignup && window.location.pathname === '/') {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to DocuHero</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Turn Your Voice into Compliant Documentation</p>
            <button 
              onClick={() => setShowSignup(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if user is logged in
  if (user) {
    return <Dashboard />;
  }

  // Show signup flow
  if (showSignup) {
    return (
      <SignupFlow 
        onComplete={(data) => {
          console.log('Signup completed:', data);
          // Handle signup completion
        }} 
      />
    );
  }

  // Show login form
  return <LoginForm onSwitchToSignup={() => setShowSignup(true)} />;
}

export default function MainApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}