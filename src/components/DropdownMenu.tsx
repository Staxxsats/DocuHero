import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, NotebookPen, BarChart3, Users, Shield, Zap, Building2, Heart, Info, Phone, Briefcase, FileText } from 'lucide-react';

interface DropdownItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

interface DropdownMenuProps {
  title: string;
  items: DropdownItem[];
  icon?: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ title, items, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        onMouseEnter={() => setIsOpen(true)}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-4 z-50 animate-fade-in-up"
          onMouseLeave={() => setIsOpen(false)}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <a
                  href={item.href}
                  className="flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors group"
                >
                  {item.icon && (
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </a>
              ) : (
                <button
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors group text-left"
                >
                  {item.icon && (
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Predefined dropdown configurations
export const SolutionsDropdown: React.FC<{
  onProgressNotes: () => void;
  onInsights: () => void;
}> = ({ onProgressNotes, onInsights }) => {
  const items: DropdownItem[] = [
    {
      label: "Progress Notes",
      description: "AI-powered voice transcription for clinical documentation",
      icon: <NotebookPen className="w-5 h-5 text-primary-600" />,
      onClick: onProgressNotes
    },
    {
      label: "Real-Time Insights",
      description: "Analytics dashboard with personalized recommendations",
      icon: <BarChart3 className="w-5 h-5 text-primary-600" />,
      onClick: onInsights
    },
    {
      label: "Group Practice Management",
      description: "Multi-tier account system for agencies and teams",
      icon: <Users className="w-5 h-5 text-primary-600" />,
      href: "#group-features"
    },
    {
      label: "HIPAA Compliance",
      description: "Enterprise-grade security and compliance features",
      icon: <Shield className="w-5 h-5 text-primary-600" />,
      href: "#security"
    },
    {
      label: "API Integration",
      description: "Connect with your existing EHR and billing systems",
      icon: <Zap className="w-5 h-5 text-primary-600" />,
      href: "#integrations"
    }
  ];

  return <DropdownMenu title="Solutions" items={items} />;
};

export const CompanyDropdown: React.FC<{
  onMission: () => void;
}> = ({ onMission }) => {
  const items: DropdownItem[] = [
    {
      label: "About Us",
      description: "Our mission, team, and company story",
      icon: <Info className="w-5 h-5 text-primary-600" />,
      onClick: onMission
    },
    {
      label: "Careers",
      description: "Join our team of healthcare technology innovators",
      icon: <Briefcase className="w-5 h-5 text-primary-600" />,
      href: "#careers"
    },
    {
      label: "Healthcare Focus",
      description: "Dedicated solutions for healthcare providers",
      icon: <Heart className="w-5 h-5 text-primary-600" />,
      href: "#healthcare"
    },
    {
      label: "Enterprise",
      description: "Solutions for large healthcare organizations",
      icon: <Building2 className="w-5 h-5 text-primary-600" />,
      href: "#enterprise"
    },
    {
      label: "Contact Us",
      description: "Get in touch with our team",
      icon: <Phone className="w-5 h-5 text-primary-600" />,
      href: "#contact"
    },
    {
      label: "Press & Media",
      description: "Latest news and press resources",
      icon: <FileText className="w-5 h-5 text-primary-600" />,
      href: "#press"
    }
  ];

  return <DropdownMenu title="Company" items={items} />;
};

export default DropdownMenu;