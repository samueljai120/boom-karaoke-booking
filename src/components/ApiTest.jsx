import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('testing');
  const [emailStatus, setEmailStatus] = useState('testing');
  const [settingsStatus, setSettingsStatus] = useState('testing');
  const [authStatus, setAuthStatus] = useState('testing');

  useEffect(() => {
    testApiConnections();
  }, []);

  const testApiConnections = async () => {
    // Test health endpoint
    try {
      const healthResponse = await fetch(`${getApiBaseUrl()}/health`);
      const healthData = await healthResponse.json();
      setApiStatus(healthData.success ? 'success' : 'error');
    } catch (error) {
      setApiStatus('error');
    }

    // Test email endpoint
    try {
      const emailResponse = await fetch(`${getApiBaseUrl()}/email/config`);
      const emailData = await emailResponse.json();
      setEmailStatus(emailData.success ? 'success' : 'error');
    } catch (error) {
      setEmailStatus('error');
    }

    // Test settings endpoint
    try {
      const settingsResponse = await fetch(`${getApiBaseUrl()}/settings`);
      const settingsData = await settingsResponse.json();
      setSettingsStatus(settingsData.success ? 'success' : 'error');
    } catch (error) {
      setSettingsStatus('error');
    }

    // Test auth endpoint
    try {
      const authResponse = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com', password: 'demo123' })
      });
      const authData = await authResponse.json();
      setAuthStatus(authData.success ? 'success' : 'error');
    } catch (error) {
      setAuthStatus('error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Connected';
      case 'error':
        return 'Failed';
      default:
        return 'Testing...';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Connection Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Backend Health</h3>
              <p className="text-sm text-gray-600">API server status</p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(apiStatus)}
              <span className="ml-2 text-sm font-medium">
                {getStatusText(apiStatus)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Email Service</h3>
              <p className="text-sm text-gray-600">Email configuration</p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(emailStatus)}
              <span className="ml-2 text-sm font-medium">
                {getStatusText(emailStatus)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Settings API</h3>
              <p className="text-sm text-gray-600">Settings management</p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(settingsStatus)}
              <span className="ml-2 text-sm font-medium">
                {getStatusText(settingsStatus)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Authentication</h3>
              <p className="text-sm text-gray-600">Login system</p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(authStatus)}
              <span className="ml-2 text-sm font-medium">
                {getStatusText(authStatus)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={testApiConnections} className="w-full">
          Retest Connections
        </Button>
      </div>
    </div>
  );
};

export default ApiTest;
