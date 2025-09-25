import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { getApiBaseUrl } from '../utils/apiConfig';

const AuthTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Login successful! Token: ${data.token.substring(0, 20)}...`);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setTestResult(`❌ Login failed: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const testSession = async () => {
    setIsLoading(true);
    setTestResult('Testing session...');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setTestResult('❌ No token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Session valid! User: ${data.user.email}`);
      } else {
        setTestResult(`❌ Session failed: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setTestResult('Auth data cleared');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test</h2>
      
      <Card className="p-6 mb-4">
        <div className="space-y-4">
          <Button onClick={testLogin} disabled={isLoading} className="w-full">
            {isLoading ? 'Testing...' : 'Test Login (demo@example.com)'}
          </Button>
          
          <Button onClick={testSession} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? 'Testing...' : 'Test Session'}
          </Button>
          
          <Button onClick={clearAuth} variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
            Clear Auth Data
          </Button>
        </div>
      </Card>

      {testResult && (
        <Card className="p-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
        </Card>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
        <div className="space-y-2">
          <a href="/admin" className="block text-blue-600 hover:text-blue-800">Admin Dashboard</a>
          <a href="/admin/tenants" className="block text-blue-600 hover:text-blue-800">Tenant Management</a>
          <a href="/admin/users" className="block text-blue-600 hover:text-blue-800">User Management</a>
          <a href="/settings" className="block text-blue-600 hover:text-blue-800">Settings (Protected)</a>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
