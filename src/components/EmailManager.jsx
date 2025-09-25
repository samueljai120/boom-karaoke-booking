import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  TestTube,
  Bell,
  UserPlus,
  Calendar,
  X
} from 'lucide-react';

const EmailManager = () => {
  const [emailConfig, setEmailConfig] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/email/config');
      const config = await response.json();
      setEmailConfig(config);
    } catch (error) {
      console.error('Failed to fetch email config:', error);
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

  const sendTestEmail = async () => {
    if (!testEmail) {
      showMessage('Please enter an email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage(`Test email sent successfully to ${testEmail}!`);
        setTestEmail('');
      } else {
        showMessage(`Failed to send test email: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to send test email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async () => {
    if (!testEmail) {
      showMessage('Please enter an email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: testEmail,
          name: 'Test User'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        showMessage(`Welcome email sent successfully to ${testEmail}!`);
        setTestEmail('');
      } else {
        showMessage(`Failed to send welcome email: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to send welcome email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const EmailTemplateDemo = ({ title, description, icon: Icon, onClick }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full">
        <Send className="w-4 h-4 mr-2" />
        Send Demo
      </Button>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Mail className="w-8 h-8 mr-3 text-blue-600" />
            Email Management
          </h1>
          <p className="text-gray-600 mt-2">
            Configure and test email notifications for your booking system
          </p>
        </div>
        <Button variant="outline" onClick={fetchEmailConfig}>
          <Settings className="w-4 h-4 mr-2" />
          Refresh Config
        </Button>
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
          <button 
            onClick={() => setMessage('')}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Email Configuration Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Email Configuration
        </h2>
        
        {emailConfig ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                emailConfig.smtpConfigured ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <div>
                <div className="font-medium text-gray-900">SMTP Status</div>
                <div className="text-sm text-gray-600">
                  {emailConfig.smtpConfigured ? 'Configured' : 'Development Mode'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 mr-3 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">From Email</div>
                <div className="text-sm text-gray-600">{emailConfig.fromEmail}</div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Settings className="w-4 h-4 mr-3 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Service</div>
                <div className="text-sm text-gray-600">{emailConfig.service}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading configuration...</p>
          </div>
        )}
      </Card>

      {/* Email Testing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TestTube className="w-5 h-5 mr-2" />
          Email Testing
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter email address to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={sendTestEmail}
              disabled={isLoading}
              className="flex items-center"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Test Email'}
            </Button>
            <Button 
              onClick={sendWelcomeEmail}
              disabled={isLoading}
              variant="outline"
              className="flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Welcome Email
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>• <strong>Test Email:</strong> Sends a simple test message to verify email delivery</p>
          <p>• <strong>Welcome Email:</strong> Sends a formatted welcome message with features overview</p>
        </div>
      </Card>

      {/* Email Templates Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Email Templates
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EmailTemplateDemo
            title="Booking Confirmation"
            description="Sent when a new booking is created"
            icon={CheckCircle}
            onClick={() => showMessage('Booking confirmation template preview would open here')}
          />
          
          <EmailTemplateDemo
            title="Booking Reminder"
            description="Sent 24 hours before booking"
            icon={Bell}
            onClick={() => showMessage('Booking reminder template preview would open here')}
          />
          
          <EmailTemplateDemo
            title="Booking Cancellation"
            description="Sent when a booking is cancelled"
            icon={X}
            onClick={() => showMessage('Booking cancellation template preview would open here')}
          />
          
          <EmailTemplateDemo
            title="Welcome Email"
            description="Sent to new users on signup"
            icon={UserPlus}
            onClick={() => showMessage('Welcome email template preview would open here')}
          />
        </div>
      </Card>

      {/* Email Automation Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Email Automation Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Booking Confirmations</div>
                <div className="text-sm text-gray-600">Send confirmation emails automatically</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Booking Reminders</div>
                <div className="text-sm text-gray-600">Send reminders 24 hours before booking</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Cancellation Notifications</div>
                <div className="text-sm text-gray-600">Send emails when bookings are cancelled</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Welcome Emails</div>
                <div className="text-sm text-gray-600">Send welcome emails to new users</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Setup Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Setup Instructions</h2>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">For Production (Gmail):</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Enable 2-factor authentication on your Gmail account</li>
              <li>Generate an App Password in Google Account settings</li>
              <li>Set environment variables: GMAIL_USER and GMAIL_APP_PASSWORD</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">For Production (Custom SMTP):</h3>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</li>
              <li>Set SMTP_SECURE to 'true' for SSL/TLS</li>
              <li>Configure FROM_EMAIL for sender address</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Development Mode:</h3>
            <p className="ml-4">Currently using Ethereal Email for testing. Check server logs for preview URLs.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailManager;
