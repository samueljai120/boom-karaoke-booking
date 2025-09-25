import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  BarChart3, 
  Users, 
  CalendarIcon, 
  Brain, 
  Zap,
  HelpCircle,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const BottomMenu = ({ 
  onShowAnalytics, 
  onShowCustomerBase, 
  onShowInstructions, 
  onShowSettings,
  onShowAIBooking,
  onShowAIAnalytics,
  onShowTutorial,
  sidebarOpen = false 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Disable sticky/fixed elements when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Add class to disable sticky/fixed elements
      document.body.classList.add('menu-open');
    } else {
      // Remove class to re-enable sticky/fixed elements
      document.body.classList.remove('menu-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      action: () => {
        // Profile will be handled by parent component
        setIsMenuOpen(false);
      },
      show: true
    },
    {
      id: 'ai-booking',
      label: 'AI Assistant',
      icon: Brain,
      action: onShowAIBooking,
      show: true,
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
    },
    {
      id: 'ai-analytics',
      label: 'AI Analytics',
      icon: Zap,
      action: onShowAIAnalytics,
      show: true,
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      action: onShowAnalytics,
      show: true
    },
    {
      id: 'customer-base',
      label: 'Customer Base',
      icon: Users,
      action: onShowCustomerBase,
      show: true
    },
    {
      id: 'instructions',
      label: 'Instructions',
      icon: CalendarIcon,
      action: onShowInstructions,
      show: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: onShowSettings,
      show: true
    },
    {
      id: 'tutorial',
      label: 'Tutorial',
      icon: HelpCircle,
      action: onShowTutorial,
      show: true
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <>
      {/* Menu Toggle Button */}
      <div className="fixed bottom-6 left-6 z-[1000000] select-none menu-fixed">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center justify-center transition-all duration-200 select-none"
          aria-label="Open menu"
          type="button"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

        {/* Menu Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-[999999] menu-fixed"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

      {/* Menu Panel */}
      <div className={`fixed bottom-32 left-6 z-[1000000] transition-all duration-300 transform menu-fixed ${
        isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 min-w-[280px] max-w-[320px] overflow-hidden select-none">
          {/* User Profile Header */}
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {user?.role || 'Tenant'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.action?.();
                    setIsMenuOpen(false);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                    item.color || 'text-gray-700 hover:text-gray-900'
                  }`}
                  type="button"
                >
                  <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-150"
              type="button"
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Arrow pointing to button */}
        <div className="flex justify-center mt-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
    </>
  );
};

export default BottomMenu;
