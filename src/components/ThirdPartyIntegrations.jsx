import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Settings, 
  ExternalLink,
  Zap,
  Shield,
  CreditCard,
  Mail,
  Calendar,
  BarChart3,
  MessageSquare,
  Cloud,
  Database,
  Key,
  AlertTriangle
} from 'lucide-react';

const ThirdPartyIntegrations = () => {
  const [integrations, setIntegrations] = useState({
    stripe: { enabled: true, status: 'connected', lastSync: '2 minutes ago' },
    googleCalendar: { enabled: true, status: 'connected', lastSync: '5 minutes ago' },
    outlook: { enabled: false, status: 'disconnected', lastSync: null },
    mailchimp: { enabled: true, status: 'connected', lastSync: '1 hour ago' },
    slack: { enabled: false, status: 'disconnected', lastSync: null },
    zapier: { enabled: true, status: 'connected', lastSync: '30 minutes ago' },
    analytics: { enabled: true, status: 'connected', lastSync: '1 minute ago' },
    webhooks: { enabled: true, status: 'connected', lastSync: '10 minutes ago' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    stripe: '',
    google: '',
    mailchimp: '',
    slack: '',
    zapier: ''
  });

  const integrationServices = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      icon: CreditCard,
      category: 'Payment',
      features: ['Payment Processing', 'Subscription Management', 'Webhooks', 'Analytics'],
      status: integrations.stripe.status,
      enabled: integrations.stripe.enabled
    },
    {
      id: 'googleCalendar',
      name: 'Google Calendar',
      description: 'Sync bookings with Google Calendar',
      icon: Calendar,
      category: 'Calendar',
      features: ['Two-way Sync', 'Event Creation', 'Conflict Detection', 'Reminders'],
      status: integrations.googleCalendar.status,
      enabled: integrations.googleCalendar.enabled
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Sync bookings with Outlook Calendar',
      icon: Calendar,
      category: 'Calendar',
      features: ['Two-way Sync', 'Event Creation', 'Conflict Detection', 'Reminders'],
      status: integrations.outlook.status,
      enabled: integrations.outlook.enabled
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      icon: Mail,
      category: 'Marketing',
      features: ['Email Campaigns', 'Automation', 'Audience Management', 'Analytics'],
      status: integrations.mailchimp.status,
      enabled: integrations.mailchimp.enabled
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: MessageSquare,
      category: 'Communication',
      features: ['Notifications', 'Team Updates', 'Channel Integration', 'Bot Commands'],
      status: integrations.slack.status,
      enabled: integrations.slack.enabled
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: Zap,
      category: 'Automation',
      features: ['Workflow Automation', 'Data Sync', 'Trigger Actions', 'Multi-app Integration'],
      status: integrations.zapier.status,
      enabled: integrations.zapier.enabled
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Website and user behavior analytics',
      icon: BarChart3,
      category: 'Analytics',
      features: ['User Tracking', 'Conversion Analytics', 'Custom Events', 'Reports'],
      status: integrations.analytics.status,
      enabled: integrations.analytics.enabled
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      description: 'Real-time data synchronization',
      icon: Cloud,
      category: 'Data',
      features: ['Real-time Sync', 'Event Triggers', 'Custom Endpoints', 'Retry Logic'],
      status: integrations.webhooks.status,
      enabled: integrations.webhooks.enabled
    }
  ];

  const handleToggleIntegration = async (integrationId) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIntegrations(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        enabled: !prev[integrationId].enabled,
        status: !prev[integrationId].enabled ? 'connected' : 'disconnected'
      }
    }));
    
    setIsLoading(false);
  };

  const handleConnectIntegration = async (integrationId) => {
    setIsLoading(true);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        enabled: true,
        status: 'connected',
        lastSync: 'Just now'
      }
    }));
    
    setIsLoading(false);
    alert(`${integrationId} connected successfully!`);
  };

  const handleDisconnectIntegration = async (integrationId) => {
    if (window.confirm(`Are you sure you want to disconnect ${integrationId}?`)) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => ({
        ...prev,
        [integrationId]: {
          ...prev[integrationId],
          enabled: false,
          status: 'disconnected',
          lastSync: null
        }
      }));
      
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (service, value) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const saveApiKey = async (service) => {
    if (!apiKeys[service]) {
      alert('Please enter an API key');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    alert(`${service} API key saved successfully!`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(integrationServices.map(service => service.category))];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="w-6 h-6 mr-3 text-blue-600" />
            Third-party Integrations
          </h2>
          <p className="text-gray-600 mt-1">
            Connect with external services to extend functionality
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {Object.values(integrations).filter(i => i.enabled).length}
          </div>
          <div className="text-sm text-gray-600">Active Integrations</div>
        </div>
      </div>

      {/* Integration Categories */}
      {categories.map(category => (
        <Card key={category} className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationServices
              .filter(service => service.category === category)
              .map(service => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <Icon className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {service.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {service.status === 'connected' && integrations[service.id].lastSync && (
                      <div className="text-xs text-gray-500 mb-3">
                        Last sync: {integrations[service.id].lastSync}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {service.enabled ? (
                        <>
                          <Button
                            onClick={() => handleDisconnectIntegration(service.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Disconnect
                          </Button>
                          <Button
                            onClick={() => handleToggleIntegration(service.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Settings
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleConnectIntegration(service.id)}
                          disabled={isLoading}
                          size="sm"
                          className="w-full"
                        >
                          {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      ))}

      {/* API Keys Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys Management</h3>
        <div className="space-y-4">
          {Object.entries(apiKeys).map(([service, key]) => (
            <div key={service} className="flex items-center space-x-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {service} Key
                </label>
              </div>
              <div className="flex-1">
                <Input
                  type="password"
                  value={key}
                  onChange={(e) => handleApiKeyChange(service, e.target.value)}
                  placeholder={`Enter ${service} API key`}
                />
              </div>
              <Button
                onClick={() => saveApiKey(service)}
                disabled={isLoading || !key}
                size="sm"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(integrations).filter(i => i.enabled).length}
            </div>
            <div className="text-sm text-gray-600">Active Integrations</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">2.3s</div>
            <div className="text-sm text-gray-600">Avg Sync Time</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">1,247</div>
            <div className="text-sm text-gray-600">Sync Events Today</div>
          </div>
        </div>
      </Card>

      {/* Webhook Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Webhook URL</span>
              <Button size="sm" variant="outline">
                <ExternalLink className="w-4 h-4 mr-1" />
                Test
              </Button>
            </div>
            <code className="text-sm text-gray-600 break-all">
              https://api.boombooking.com/webhooks/{'{tenant_id}'}
            </code>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
              <Input
                type="password"
                value="whsec_1234567890abcdef"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>All Events</option>
                <option>Booking Created</option>
                <option>Booking Updated</option>
                <option>Booking Cancelled</option>
                <option>Payment Processed</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Integration Activity</h3>
        <div className="space-y-3">
          {[
            { service: 'Stripe', action: 'Payment processed', time: '2 minutes ago', status: 'success' },
            { service: 'Google Calendar', action: 'Event created', time: '5 minutes ago', status: 'success' },
            { service: 'Mailchimp', action: 'Subscriber added', time: '10 minutes ago', status: 'success' },
            { service: 'Zapier', action: 'Workflow triggered', time: '15 minutes ago', status: 'success' },
            { service: 'Slack', action: 'Notification sent', time: '1 hour ago', status: 'error' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{log.service}</div>
                  <div className="text-xs text-gray-600">{log.action}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{log.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ThirdPartyIntegrations;
