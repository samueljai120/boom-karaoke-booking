import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Database
} from 'lucide-react';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'bk_live_1234567890abcdef',
      type: 'Live',
      permissions: ['read', 'write', 'admin'],
      lastUsed: '2 hours ago',
      createdAt: '2024-01-15',
      status: 'Active',
      usage: {
        requests: 15420,
        limit: 100000,
        resetDate: '2024-01-01'
      }
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'bk_test_abcdef1234567890',
      type: 'Test',
      permissions: ['read', 'write'],
      lastUsed: '1 day ago',
      createdAt: '2024-01-10',
      status: 'Active',
      usage: {
        requests: 8920,
        limit: 10000,
        resetDate: '2024-01-01'
      }
    },
    {
      id: 3,
      name: 'Webhook Key',
      key: 'whsec_1234567890abcdef',
      type: 'Webhook',
      permissions: ['webhook'],
      lastUsed: '5 minutes ago',
      createdAt: '2024-01-20',
      status: 'Active',
      usage: {
        requests: 2340,
        limit: 50000,
        resetDate: '2024-01-01'
      }
    },
    {
      id: 4,
      name: 'Legacy API Key',
      key: 'bk_legacy_9876543210fedcba',
      type: 'Live',
      permissions: ['read'],
      lastUsed: '1 week ago',
      createdAt: '2023-12-01',
      status: 'Inactive',
      usage: {
        requests: 0,
        limit: 100000,
        resetDate: '2024-01-01'
      }
    }
  ]);

  const [showAddKey, setShowAddKey] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    type: 'Live',
    permissions: ['read']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const keyTypes = [
    { value: 'Live', label: 'Live', description: 'Production API key for live data', color: 'text-green-600' },
    { value: 'Test', label: 'Test', description: 'Test API key for development', color: 'text-blue-600' },
    { value: 'Webhook', label: 'Webhook', description: 'Webhook secret for event verification', color: 'text-purple-600' }
  ];

  const permissions = [
    { value: 'read', label: 'Read', description: 'Read data from the API' },
    { value: 'write', label: 'Write', description: 'Create and update data' },
    { value: 'admin', label: 'Admin', description: 'Full administrative access' },
    { value: 'webhook', label: 'Webhook', description: 'Webhook event verification' }
  ];

  const handleAddKey = async () => {
    if (!newKey.name) {
      alert('Please enter a key name');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const key = {
      id: apiKeys.length + 1,
      ...newKey,
      key: `bk_${newKey.type.toLowerCase()}_${Math.random().toString(36).substr(2, 16)}`,
      lastUsed: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active',
      usage: {
        requests: 0,
        limit: newKey.type === 'Live' ? 100000 : newKey.type === 'Test' ? 10000 : 50000,
        resetDate: '2024-01-01'
      }
    };
    
    setApiKeys(prev => [...prev, key]);
    setNewKey({
      name: '',
      type: 'Live',
      permissions: ['read']
    });
    setShowAddKey(false);
    setIsLoading(false);
    alert('API key created successfully!');
  };

  const handleDeleteKey = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setIsLoading(false);
      alert('API key deleted successfully!');
    }
  };

  const handleToggleKey = async (keyId) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApiKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, status: key.status === 'Active' ? 'Inactive' : 'Active' }
        : key
    ));
    
    setIsLoading(false);
  };

  const copyToClipboard = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const regenerateKey = async (keyId) => {
    if (window.confirm('Are you sure you want to regenerate this API key? The old key will be invalidated.')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, key: `bk_${key.type.toLowerCase()}_${Math.random().toString(36).substr(2, 16)}` }
          : key
      ));
      
      setIsLoading(false);
      alert('API key regenerated successfully!');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    const typeConfig = keyTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'text-gray-600';
  };

  const getUsagePercentage = (usage) => {
    return (usage.requests / usage.limit) * 100;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Key className="w-6 h-6 mr-3 text-blue-600" />
            API Keys
          </h2>
          <p className="text-gray-600 mt-1">
            Manage API keys and access tokens for your applications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowAddKey(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
          <Button onClick={() => window.location.reload()} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(key.status)}`}>
                    {key.status}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 ${getTypeColor(key.type)}`}>
                    {key.type}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                    {visibleKeys[key.id] ? key.key : '•'.repeat(key.key.length)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(key.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {visibleKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {copiedKey === key.key ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Permissions</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {key.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Used</div>
                    <div className="text-sm text-gray-900">{key.lastUsed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-sm text-gray-900">{key.createdAt}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(key.usage))}`}>
                      {key.usage.requests.toLocaleString()} / {key.usage.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getUsagePercentage(key.usage) >= 90 ? 'bg-red-500' :
                        getUsagePercentage(key.usage) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(getUsagePercentage(key.usage), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={() => handleToggleKey(key.id)}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  {key.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  onClick={() => regenerateKey(key.id)}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
                <Button
                  onClick={() => handleDeleteKey(key.id)}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">https://api.boombooking.com/v1</code>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">Authorization: Bearer YOUR_API_KEY</code>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Example Request</h4>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`curl -X GET \\
  https://api.boombooking.com/v1/bookings \\
  -H "Authorization: Bearer bk_live_1234567890abcdef" \\
  -H "Content-Type: application/json"`}
          </pre>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" />
            View Full Documentation
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download SDK
          </Button>
        </div>
      </Card>

      {/* Add API Key Modal */}
      {showAddKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                <Input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a descriptive name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Type</label>
                <select
                  value={newKey.type}
                  onChange={(e) => setNewKey(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {keyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {keyTypes.find(t => t.value === newKey.type)?.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2">
                  {permissions.map(permission => (
                    <label key={permission.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKey.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKey(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission.value]
                            }));
                          } else {
                            setNewKey(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission.value)
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      <span className="ml-1 text-xs text-gray-500">- {permission.description}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowAddKey(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddKey}
                  disabled={isLoading || !newKey.name || newKey.permissions.length === 0}
                >
                  {isLoading ? 'Creating...' : 'Create Key'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
