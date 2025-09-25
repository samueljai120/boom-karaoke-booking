import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Calendar, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  RefreshCw,
  Clock,
  User,
  Mail,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const CalendarIntegration = () => {
  const [integrations, setIntegrations] = useState({
    google: {
      connected: false,
      email: '',
      lastSync: null,
      syncStatus: 'disconnected'
    },
    outlook: {
      connected: false,
      email: '',
      lastSync: null,
      syncStatus: 'disconnected'
    }
  });
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: '15', // minutes
    twoWaySync: true,
    conflictResolution: 'boom_booking', // boom_booking, external, ask
    defaultDuration: '60', // minutes
    bufferTime: '15' // minutes
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      // Mock data for now - in production, fetch from API
      setIntegrations({
        google: {
          connected: false,
          email: '',
          lastSync: null,
          syncStatus: 'disconnected'
        },
        outlook: {
          connected: false,
          email: '',
          lastSync: null,
          syncStatus: 'disconnected'
        }
      });
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => ({
        ...prev,
        google: {
          connected: true,
          email: 'user@gmail.com',
          lastSync: new Date().toISOString(),
          syncStatus: 'connected'
        }
      }));
      
      showMessage('Google Calendar connected successfully!');
    } catch (error) {
      showMessage('Failed to connect Google Calendar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const connectOutlookCalendar = async () => {
    setIsLoading(true);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => ({
        ...prev,
        outlook: {
          connected: true,
          email: 'user@outlook.com',
          lastSync: new Date().toISOString(),
          syncStatus: 'connected'
        }
      }));
      
      showMessage('Outlook Calendar connected successfully!');
    } catch (error) {
      showMessage('Failed to connect Outlook Calendar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectCalendar = async (provider) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => ({
        ...prev,
        [provider]: {
          connected: false,
          email: '',
          lastSync: null,
          syncStatus: 'disconnected'
        }
      }));
      
      showMessage(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar disconnected`);
    } catch (error) {
      showMessage('Failed to disconnect calendar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncCalendar = async (provider) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          lastSync: new Date().toISOString(),
          syncStatus: 'syncing'
        }
      }));
      
      showMessage(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar synced successfully!`);
      
      // Reset sync status after a delay
      setTimeout(() => {
        setIntegrations(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            syncStatus: 'connected'
          }
        }));
      }, 3000);
    } catch (error) {
      showMessage('Failed to sync calendar', 'error');
      setIntegrations(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          syncStatus: 'error'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSyncSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('Sync settings updated successfully!');
    } catch (error) {
      showMessage('Failed to update sync settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const IntegrationCard = ({ provider, integration }) => {
    const providerName = provider === 'google' ? 'Google Calendar' : 'Outlook Calendar';
    const providerIcon = provider === 'google' ? '📅' : '📆';
    const isConnected = integration.connected;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{providerIcon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{providerName}</h3>
              <p className="text-sm text-gray-600">
                {isConnected ? `Connected as ${integration.email}` : 'Not connected'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            integration.syncStatus === 'connected' ? 'bg-green-100 text-green-800' :
            integration.syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
            integration.syncStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {integration.syncStatus === 'syncing' ? 'Syncing...' :
             integration.syncStatus === 'connected' ? 'Connected' :
             integration.syncStatus === 'error' ? 'Error' :
             'Disconnected'}
          </div>
        </div>

        {isConnected && integration.lastSync && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Last synced: {new Date(integration.lastSync).toLocaleString()}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {!isConnected ? (
            <Button
              onClick={provider === 'google' ? connectGoogleCalendar : connectOutlookCalendar}
              disabled={isLoading}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => syncCalendar(provider)}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                onClick={() => disconnectCalendar(provider)}
                disabled={isLoading}
                variant="outline"
                className="px-3"
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            Calendar Integration
          </h1>
          <p className="text-gray-600 mt-2">
            Sync your bookings with Google Calendar and Outlook for seamless scheduling
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          messageType === 'error' 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {messageType === 'error' ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2" />
          )}
          {message}
        </div>
      )}

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard provider="google" integration={integrations.google} />
        <IntegrationCard provider="outlook" integration={integrations.outlook} />
      </div>

      {/* Sync Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Sync Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Auto Sync</div>
                <div className="text-sm text-gray-600">Automatically sync calendars</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={syncSettings.autoSync}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Two-Way Sync</div>
                <div className="text-sm text-gray-600">Sync changes in both directions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={syncSettings.twoWaySync}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, twoWaySync: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sync Interval (minutes)
              </label>
              <select
                value={syncSettings.syncInterval}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, syncInterval: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conflict Resolution
              </label>
              <select
                value={syncSettings.conflictResolution}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, conflictResolution: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="boom_booking">Boom Booking takes priority</option>
                <option value="external">External calendar takes priority</option>
                <option value="ask">Ask me to resolve conflicts</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={updateSyncSettings} disabled={isLoading}>
            <Settings className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

      {/* Sync Statistics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sync Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">247</div>
            <div className="text-sm text-gray-600">Events Synced Today</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-gray-600">Sync Success Rate</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <div className="text-sm text-gray-600">Conflicts Resolved</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">Failed Syncs</div>
          </div>
        </div>
      </Card>

      {/* Features Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Real-time Sync</h3>
              <p className="text-sm text-gray-600">Automatically sync bookings between Boom Booking and your calendar</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Secure OAuth</h3>
              <p className="text-sm text-gray-600">Industry-standard OAuth 2.0 for secure calendar access</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Conflict Resolution</h3>
              <p className="text-sm text-gray-600">Smart conflict resolution when events overlap</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Multi-Platform</h3>
              <p className="text-sm text-gray-600">Works with Google Calendar, Outlook, and more</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Buffer Time</h3>
              <p className="text-sm text-gray-600">Add buffer time between bookings automatically</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Custom Duration</h3>
              <p className="text-sm text-gray-600">Set default booking durations for different room types</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarIntegration;
