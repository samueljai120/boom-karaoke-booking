import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { getApiBaseUrl } from '../utils/apiConfig';

const LoginTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const testDemoLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing demo login...');

    try {
      console.log('🚀 Starting demo login test...');
      const result = await login({
        email: 'demo@example.com',
        password: 'demo123'
      });
      
      console.log('📋 Demo login result:', result);
      setTestResult(`Result: ${JSON.stringify(result, null, 2)}`);
      
      if (result.success) {
        setTestResult('✅ Demo login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setTestResult(`❌ Demo login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
      setTestResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing direct API call...');

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
      setTestResult(`Direct API Result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Direct API Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Login Test</h2>
      
      <Card className="p-6 mb-4">
        <div className="space-y-4">
          <Button onClick={testDemoLogin} disabled={isLoading} className="w-full">
            {isLoading ? 'Testing...' : 'Test Demo Login (via AuthContext)'}
          </Button>
          
          <Button onClick={testDirectAPI} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? 'Testing...' : 'Test Direct API Call'}
          </Button>
        </div>
      </Card>

      {testResult && (
        <Card className="p-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
        </Card>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
        <div className="space-y-2">
          <a href="/login" className="block text-blue-600 hover:text-blue-800">Login Page</a>
          <a href="/dashboard" className="block text-blue-600 hover:text-blue-800">User Dashboard</a>
          <a href="/admin" className="block text-blue-600 hover:text-blue-800">Admin Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
