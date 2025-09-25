import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Bell, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  AlertCircle,
  Settings,
  TestTube,
  Users,
  Clock,
  Zap
} from 'lucide-react';

const PushNotifications = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    bookingConfirmations: true,
    bookingReminders: true,
    bookingCancellations: true,
    systemUpdates: false,
    marketing: false,
    desktop: true,
    mobile: true,
    email: true,
    sound: true,
    vibration: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    timezone: 'UTC'
  });

  const [testResults, setTestResults] = useState({
    desktop: null,
    mobile: null,
    email: null
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/push-notifications/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch push notification settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('pushNotificationSettings', JSON.stringify(newSettings));
  };

  const testNotification = async (type) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/push-notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type, 
          message: `Test ${type} notification` 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResults(prev => ({
          ...prev,
          [type]: 'success'
        }));
        
        // Reset after 3 seconds
        setTimeout(() => {
          setTestResults(prev => ({
            ...prev,
            [type]: null
          }));
        }, 3000);
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Failed to send test notification');
    }
    
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/push-notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Notification settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
    
    setIsLoading(false);
  };

  const notificationTypes = [
    {
      id: 'bookingConfirmations',
      title: 'Booking Confirmations',
      description: 'Get notified when bookings are confirmed',
      icon: CheckCircle
    },
    {
      id: 'bookingReminders',
      title: 'Booking Reminders',
      description: 'Receive reminders before bookings start',
      icon: Clock
    },
    {
      id: 'bookingCancellations',
      title: 'Booking Cancellations',
      description: 'Get notified when bookings are cancelled',
      icon: AlertCircle
    },
    {
      id: 'systemUpdates',
      title: 'System Updates',
      description: 'Receive notifications about system maintenance',
      icon: Settings
    },
    {
      id: 'marketing',
      title: 'Marketing Updates',
      description: 'Receive promotional offers and updates',
      icon: Zap
    }
  ];

  const deliveryMethods = [
    {
      id: 'desktop',
      title: 'Desktop Notifications',
      description: 'Browser notifications on desktop',
      icon: Monitor,
      enabled: settings.desktop
    },
    {
      id: 'mobile',
      title: 'Mobile Push',
      description: 'Push notifications on mobile devices',
      icon: Smartphone,
      enabled: settings.mobile
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Email notifications as backup',
      icon: Bell,
      enabled: settings.email
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-3 text-blue-600" />
            Push Notifications
          </h2>
          <p className="text-gray-600 mt-1">
            Configure real-time notifications for your booking system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable Notifications
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <Icon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">{type.title}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings[type.id]}
                    onChange={(e) => handleSettingChange(type.id, e.target.checked)}
                    disabled={!settings.enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Delivery Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deliveryMethods.map((method) => {
            const Icon = method.icon;
            const isSuccess = testResults[method.id] === 'success';
            
            return (
              <div key={method.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">{method.title}</h4>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={(e) => handleSettingChange(method.id, e.target.checked)}
                      disabled={!settings.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                <Button
                  onClick={() => testNotification(method.id)}
                  disabled={!method.enabled || isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Testing...
                    </div>
                  ) : isSuccess ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Success!
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Notification
                    </div>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Additional Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Sound Notifications</label>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Vibration</label>
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Quiet Hours</label>
              <input
                type="checkbox"
                checked={settings.quietHours}
                onChange={(e) => handleSettingChange('quietHours', e.target.checked)}
                disabled={!settings.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
            </div>
            {settings.quietHours && (
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={settings.quietStart}
                  onChange={(e) => handleSettingChange('quietStart', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="time"
                  value={settings.quietEnd}
                  onChange={(e) => handleSettingChange('quietEnd', e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-gray-600">Notifications Sent Today</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-gray-600">Delivery Rate</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">2.3s</div>
            <div className="text-sm text-gray-600">Average Delivery Time</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-600">User Engagement</div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PushNotifications;
