import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('docuhero-cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('docuhero-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('docuhero-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const customizeSettings = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl max-w-2xl mx-4 mb-0 pointer-events-auto animate-slide-up">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                We value your privacy
              </h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>

          {showDetails && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Cookie Categories:</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Necessary</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Required for basic site functionality</p>
                  </div>
                  <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve our services</p>
                  </div>
                  <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Marketing</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Personalized ads and content</p>
                  </div>
                  <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptAll}
              className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
            >
              Accept All
            </button>
            <button
              onClick={acceptNecessary}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Necessary Only
            </button>
            <button
              onClick={customizeSettings}
              className="flex items-center justify-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showDetails ? 'Hide' : 'Customize'}
            </button>
          </div>

          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3 mr-1" />
            <span>Your data is protected by our privacy policy and HIPAA compliance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;