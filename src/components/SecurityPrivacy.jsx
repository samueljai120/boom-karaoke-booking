import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Database,
  Globe,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload,
  Trash2,
  Clock
} from 'lucide-react';

const SecurityPrivacy = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    ipWhitelist: [],
    dataRetention: 365,
    gdprCompliance: true,
    dataEncryption: true,
    auditLogging: true,
    privacyMode: false,
    dataExport: true,
    dataDeletion: true
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [securityScore, setSecurityScore] = useState(75);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/security/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
    }
  };

  const calculateSecurityScore = () => {
    let score = 0;
    if (settings.twoFactorAuth) score += 25;
    if (settings.dataEncryption) score += 20;
    if (settings.auditLogging) score += 15;
    if (settings.gdprCompliance) score += 15;
    if (settings.ipWhitelist.length > 0) score += 10;
    if (settings.passwordExpiry <= 90) score += 10;
    if (settings.sessionTimeout <= 30) score += 5;
    setSecurityScore(Math.min(score, 100));
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('securityPrivacySettings', JSON.stringify(newSettings));
  };

  const addIpAddress = () => {
    if (ipAddress && !settings.ipWhitelist.includes(ipAddress)) {
      const newWhitelist = [...settings.ipWhitelist, ipAddress];
      handleSettingChange('ipWhitelist', newWhitelist);
      setIpAddress('');
    }
  };

  const removeIpAddress = (ip) => {
    const newWhitelist = settings.ipWhitelist.filter(address => address !== ip);
    handleSettingChange('ipWhitelist', newWhitelist);
  };

  const changePassword = async () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (password.new.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Password changed successfully!');
    
    setPassword({
      current: '',
      new: '',
      confirm: '',
      showCurrent: false,
      showNew: false,
      showConfirm: false
    });
  };

  const exportData = async () => {
    setIsLoading(true);
    
    // Simulate data export
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    alert('Data export completed! Check your downloads folder.');
  };

  const requestDataDeletion = async () => {
    if (window.confirm('Are you sure you want to request data deletion? This action cannot be undone.')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      alert('Data deletion request submitted. You will receive an email confirmation within 24 hours.');
    }
  };

  const securityFeatures = [
    {
      id: 'twoFactorAuth',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with 2FA',
      icon: Shield,
      enabled: settings.twoFactorAuth
    },
    {
      id: 'dataEncryption',
      title: 'Data Encryption',
      description: 'Encrypt sensitive data at rest and in transit',
      icon: Lock,
      enabled: settings.dataEncryption
    },
    {
      id: 'auditLogging',
      title: 'Audit Logging',
      description: 'Track all user actions and system changes',
      icon: Database,
      enabled: settings.auditLogging
    },
    {
      id: 'gdprCompliance',
      title: 'GDPR Compliance',
      description: 'Ensure compliance with data protection regulations',
      icon: Globe,
      enabled: settings.gdprCompliance
    }
  ];

  const privacySettings = [
    {
      id: 'privacyMode',
      title: 'Privacy Mode',
      description: 'Hide sensitive information from non-admin users',
      icon: Eye,
      enabled: settings.privacyMode
    },
    {
      id: 'dataExport',
      title: 'Data Export',
      description: 'Allow users to export their data',
      icon: Download,
      enabled: settings.dataExport
    },
    {
      id: 'dataDeletion',
      title: 'Data Deletion',
      description: 'Allow users to request data deletion',
      icon: Trash2,
      enabled: settings.dataDeletion
    }
  ];

  const recentActivities = [
    { action: 'Password changed', user: 'admin@boombooking.com', time: '2 minutes ago', status: 'success' },
    { action: 'IP address added to whitelist', user: 'admin@boombooking.com', time: '1 hour ago', status: 'success' },
    { action: 'Failed login attempt', user: 'unknown@example.com', time: '3 hours ago', status: 'warning' },
    { action: 'Data export requested', user: 'user@example.com', time: '1 day ago', status: 'info' },
    { action: 'Two-factor authentication enabled', user: 'admin@boombooking.com', time: '2 days ago', status: 'success' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-blue-600" />
            Security & Privacy
          </h2>
          <p className="text-gray-600 mt-1">
            Manage security settings and data privacy controls
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{securityScore}%</div>
          <div className="text-sm text-gray-600">Security Score</div>
        </div>
      </div>

      {/* Security Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  securityScore >= 80 ? 'bg-green-500' : 
                  securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${securityScore}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{securityScore}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {securityScore >= 80 ? 'Excellent security configuration!' : 
           securityScore >= 60 ? 'Good security, consider enabling additional features.' : 
           'Security needs improvement. Please enable recommended features.'}
        </p>
      </Card>

      {/* Security Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <Icon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={feature.enabled}
                    onChange={(e) => handleSettingChange(feature.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Password Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Management</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <Input
                  type={password.showCurrent ? 'text' : 'password'}
                  value={password.current}
                  onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setPassword(prev => ({ ...prev, showCurrent: !prev.showCurrent }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {password.showCurrent ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <Input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                min="30"
                max="365"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Input
                  type={password.showNew ? 'text' : 'password'}
                  value={password.new}
                  onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setPassword(prev => ({ ...prev, showNew: !prev.showNew }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {password.showNew ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={password.showConfirm ? 'text' : 'password'}
                  value={password.confirm}
                  onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setPassword(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {password.showConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={changePassword}
              disabled={isLoading || !password.current || !password.new || !password.confirm}
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </Card>

      {/* IP Whitelist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Address Whitelist</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1"
            />
            <Button onClick={addIpAddress} disabled={!ipAddress}>
              Add IP
            </Button>
          </div>
          
          {settings.ipWhitelist.length > 0 && (
            <div className="space-y-2">
              {settings.ipWhitelist.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{ip}</span>
                  <button
                    onClick={() => removeIpAddress(ip)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {privacySettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <Icon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">{setting.title}</h4>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Download className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Export Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Download all your data in a portable format</p>
            <Button onClick={exportData} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Trash2 className="w-5 h-5 text-red-600 mr-2" />
              <h4 className="font-medium text-gray-900">Delete Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Request permanent deletion of all your data</p>
            <Button onClick={requestDataDeletion} disabled={isLoading} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
              {isLoading ? 'Processing...' : 'Request Deletion'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-600">{activity.user}</div>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityPrivacy;
