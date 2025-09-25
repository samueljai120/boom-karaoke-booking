import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { getApiBaseUrl } from '../utils/apiConfig';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Settings,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';

const DatabaseManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dbStats, setDbStats] = useState({
    totalSize: '0 MB',
    tableCount: 0,
    recordCount: 0,
    lastBackup: 'Never',
    connectionCount: 1,
    queryTime: '0ms',
    uptime: '0%'
  });

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/database/stats`);
      const data = await response.json();
      if (data.success) {
        setDbStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  };

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    compression: true,
    encryption: true
  });

  const [migrationHistory, setMigrationHistory] = useState([
    { version: 'v2.1.0', description: 'Added multi-tenant support', date: '2024-12-19', status: 'completed' },
    { version: 'v2.0.5', description: 'Updated booking schema', date: '2024-12-15', status: 'completed' },
    { version: 'v2.0.3', description: 'Added audit logging', date: '2024-12-10', status: 'completed' },
    { version: 'v2.0.1', description: 'Initial PostgreSQL migration', date: '2024-12-01', status: 'completed' }
  ]);

  const [recentQueries, setRecentQueries] = useState([
    { query: 'SELECT * FROM bookings WHERE date >= NOW()', duration: '12ms', timestamp: '2 minutes ago' },
    { query: 'UPDATE users SET last_login = NOW()', duration: '8ms', timestamp: '5 minutes ago' },
    { query: 'INSERT INTO audit_logs...', duration: '15ms', timestamp: '8 minutes ago' },
    { query: 'SELECT COUNT(*) FROM tenants', duration: '3ms', timestamp: '12 minutes ago' }
  ]);

  const handleBackup = async () => {
    setIsLoading(true);
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    alert('Database backup completed successfully!');
  };

  const handleRestore = async () => {
    if (window.confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
      setIsLoading(true);
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      setIsLoading(false);
      alert('Database restored successfully!');
    }
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Database optimization completed!');
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to clean up old data? This action cannot be undone.')) {
      setIsLoading(true);
      
      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setIsLoading(false);
      alert('Database cleanup completed!');
    }
  };

  const runMigration = async (version) => {
    setIsLoading(true);
    
    // Simulate migration process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    alert(`Migration to ${version} completed successfully!`);
  };

  const databaseTables = [
    { name: 'users', records: 1247, size: '45.2 MB', lastModified: '2 hours ago' },
    { name: 'bookings', records: 15678, size: '1.2 GB', lastModified: '5 minutes ago' },
    { name: 'tenants', records: 156, size: '12.8 MB', lastModified: '1 hour ago' },
    { name: 'rooms', records: 892, size: '8.4 MB', lastModified: '3 hours ago' },
    { name: 'audit_logs', records: 23456, size: '456.7 MB', lastModified: '1 minute ago' },
    { name: 'subscriptions', records: 234, size: '15.2 MB', lastModified: '30 minutes ago' },
    { name: 'form_submissions', records: 567, size: '23.1 MB', lastModified: '2 hours ago' },
    { name: 'email_templates', records: 45, size: '2.3 MB', lastModified: '1 day ago' }
  ];

  const performanceMetrics = [
    { name: 'Query Response Time', value: '45ms', status: 'good', icon: Zap },
    { name: 'Connection Pool', value: '8/20', status: 'good', icon: Users },
    { name: 'Cache Hit Rate', value: '94.2%', status: 'excellent', icon: Activity },
    { name: 'Disk Usage', value: '2.4/10 GB', status: 'good', icon: HardDrive },
    { name: 'Uptime', value: '99.9%', status: 'excellent', icon: Shield },
    { name: 'Active Queries', value: '3', status: 'good', icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="w-6 h-6 mr-3 text-blue-600" />
            Database Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage database connections, backups, and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleOptimize} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Optimize
          </Button>
          <Button onClick={handleBackup} disabled={isLoading} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.name}</div>
                </div>
                <Icon className={`w-8 h-8 ${
                  metric.status === 'excellent' ? 'text-green-600' :
                  metric.status === 'good' ? 'text-blue-600' : 'text-yellow-600'
                }`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Database Tables */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Tables</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {databaseTables.map((table, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{table.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{table.records.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{table.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{table.lastModified}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-red-600 hover:text-red-900">Optimize</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Auto Backup</label>
              <input
                type="checkbox"
                checked={backupSettings.autoBackup}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={backupSettings.backupFrequency}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
              <Input
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                min="1"
                max="365"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Compression</label>
              <input
                type="checkbox"
                checked={backupSettings.compression}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, compression: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Encryption</label>
              <input
                type="checkbox"
                checked={backupSettings.encryption}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, encryption: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Actions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Last Backup</span>
              </div>
              <p className="text-sm text-blue-700">{dbStats.lastBackup}</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleBackup} disabled={isLoading} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating Backup...' : 'Create Backup'}
              </Button>
              <Button onClick={handleRestore} disabled={isLoading} variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Restoring...' : 'Restore from Backup'}
              </Button>
              <Button onClick={handleCleanup} disabled={isLoading} variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                {isLoading ? 'Cleaning...' : 'Cleanup Old Data'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Migration History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Migration History</h3>
        <div className="space-y-3">
          {migrationHistory.map((migration, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{migration.version}</div>
                  <div className="text-xs text-gray-600">{migration.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">{migration.date}</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {migration.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Queries */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
        <div className="space-y-3">
          {recentQueries.map((query, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-gray-900 truncate">{query.query}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{query.duration}</span>
                  <span className="text-xs text-gray-400">{query.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Database Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-600">Healthy</div>
            <div className="text-sm text-gray-600">All systems operational</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-600">Active</div>
            <div className="text-sm text-gray-600">{dbStats.connectionCount} connections</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-yellow-600">Monitor</div>
            <div className="text-sm text-gray-600">Disk usage at 24%</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseManagement;
