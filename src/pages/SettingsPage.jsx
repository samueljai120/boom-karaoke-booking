import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import EmailManager from '../components/EmailManager';
import FeedbackSystem from '../components/FeedbackSystem';
import CalendarIntegration from '../components/CalendarIntegration';
import PushNotifications from '../components/PushNotifications';
import SecurityPrivacy from '../components/SecurityPrivacy';
import DatabaseManagement from '../components/DatabaseManagement';
import ThirdPartyIntegrations from '../components/ThirdPartyIntegrations';
import UserManagement from '../components/UserManagement';
import AnalyticsReporting from '../components/AnalyticsReporting';
import BillingSubscriptions from '../components/BillingSubscriptions';
import ApiKeys from '../components/ApiKeys';
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Bell,
  Shield,
  Database,
  Globe,
  Users,
  BarChart3,
  CreditCard,
  Key
} from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('email');

  const settingsSections = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Configure email templates and notifications',
      icon: Mail,
      component: EmailManager
    },
    {
      id: 'feedback',
      title: 'User Feedback',
      description: 'Collect feedback and schedule user interviews',
      icon: MessageSquare,
      component: FeedbackSystem
    },
    {
      id: 'calendar',
      title: 'Calendar Integration',
      description: 'Sync with Google Calendar and Outlook',
      icon: Calendar,
      component: CalendarIntegration
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Configure real-time notifications',
      icon: Bell,
      component: PushNotifications
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage security settings and data privacy',
      icon: Shield,
      component: SecurityPrivacy
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Manage database connections and migrations',
      icon: Database,
      component: DatabaseManagement
    },
    {
      id: 'integrations',
      title: 'Third-party Integrations',
      description: 'Connect with external services',
      icon: Globe,
      component: ThirdPartyIntegrations
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      component: UserManagement
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Configure analytics and reporting settings',
      icon: BarChart3,
      component: AnalyticsReporting
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Manage billing and subscription settings',
      icon: CreditCard,
      component: BillingSubscriptions
    },
    {
      id: 'api',
      title: 'API Keys',
      description: 'Manage API keys and access tokens',
      icon: Key,
      component: ApiKeys
    }
  ];

  const activeSectionData = settingsSections.find(section => section.id === activeSection);
  const ActiveComponent = activeSectionData?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-8 h-8 mr-3 text-blue-600" />
                Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure your Boom Booking application settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-start p-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className={`text-xs mt-1 ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {section.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card className="min-h-[600px]">
              {ActiveComponent && <ActiveComponent />}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
