import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  Code,
  Key,
  BookOpen,
  ArrowRight,
  Copy,
  CheckCircle,
  ExternalLink,
  Zap,
  Shield,
  Globe,
  Database
} from 'lucide-react';

const APIPage = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/bookings',
      description: 'Retrieve all bookings',
      auth: 'Bearer Token',
      example: `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.boombooking.com/v1/bookings`
    },
    {
      method: 'POST',
      path: '/api/bookings',
      description: 'Create a new booking',
      auth: 'Bearer Token',
      example: `curl -X POST \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"roomId": "room_123", "startTime": "2024-12-20T14:00:00Z", "duration": 120}' \\
  https://api.boombooking.com/v1/bookings`
    },
    {
      method: 'PUT',
      path: '/api/bookings/{id}',
      description: 'Update an existing booking',
      auth: 'Bearer Token',
      example: `curl -X PUT \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"duration": 180}' \\
  https://api.boombooking.com/v1/bookings/booking_123`
    },
    {
      method: 'DELETE',
      path: '/api/bookings/{id}',
      description: 'Cancel a booking',
      auth: 'Bearer Token',
      example: `curl -X DELETE \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.boombooking.com/v1/bookings/booking_123`
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "RESTful API",
      description: "Clean, intuitive REST endpoints following industry standards"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Authentication",
      description: "JWT-based authentication with role-based access control"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global CDN",
      description: "Fast response times worldwide with our global infrastructure"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Real-time Data",
      description: "WebSocket support for real-time booking updates"
    }
  ];

  const sdkExamples = [
    {
      language: "JavaScript",
      code: `// Install the SDK
npm install @boombooking/api-client

// Initialize the client
import { BoomBookingAPI } from '@boombooking/api-client';

const client = new BoomBookingAPI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create a booking
const booking = await client.bookings.create({
  roomId: 'room_123',
  startTime: '2024-12-20T14:00:00Z',
  duration: 120,
  customerName: 'John Doe',
  customerEmail: 'john@example.com'
});

console.log('Booking created:', booking.id);`
    },
    {
      language: "Python",
      code: `# Install the SDK
pip install boombooking-api

# Initialize the client
from boombooking import BoomBookingAPI

client = BoomBookingAPI(
    api_key='your-api-key',
    environment='production'
)

# Create a booking
booking = client.bookings.create(
    room_id='room_123',
    start_time='2024-12-20T14:00:00Z',
    duration=120,
    customer_name='John Doe',
    customer_email='john@example.com'
)

print(f"Booking created: {booking.id}")`
    },
    {
      language: "PHP",
      code: `<?php
// Install via Composer
// composer require boombooking/api-client

use BoomBooking\\API\\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

// Create a booking
$booking = $client->bookings->create([
    'room_id' => 'room_123',
    'start_time' => '2024-12-20T14:00:00Z',
    'duration' => 120,
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com'
]);

echo "Booking created: " . $booking->id;
?>`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Boom Booking</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/docs">
                <Button variant="outline" size="sm">Documentation</Button>
              </Link>
              <Link to="/contact">
                <Button size="sm">Get API Key</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Boom Booking API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Powerful REST API to integrate Boom Booking into your applications. 
              Build custom solutions, automate workflows, and sync with your existing systems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Key className="w-5 h-5 mr-2" />
                  Get API Key
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">API Features</h2>
            <p className="text-xl text-gray-600">Everything you need to build powerful integrations</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">API Endpoints</h2>
            <p className="text-xl text-gray-600">Core endpoints for booking management</p>
          </motion.div>

          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Badge className={`${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                    </div>
                    <Badge variant="outline">{endpoint.auth}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{endpoint.description}</p>
                  
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Example Request</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(endpoint.example, index)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedCode === index ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{endpoint.example}</code>
                    </pre>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">SDK Examples</h2>
            <p className="text-xl text-gray-600">Get started quickly with our official SDKs</p>
          </motion.div>

          <div className="space-y-8">
            {sdkExamples.map((sdk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{sdk.language}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(sdk.code, `sdk-${index}`)}
                    >
                      {copiedCode === `sdk-${index}` ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copy Code
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{sdk.code}</code>
                    </pre>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get your API key and start building amazing integrations today.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get API Key
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <ExternalLink className="w-5 h-5 mr-2" />
              API Documentation
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold">Boom Booking</span>
            </div>
            <p className="text-gray-400 mb-4">
              The smartest booking system for karaoke venues and entertainment businesses.
            </p>
            <p className="text-gray-500">&copy; 2024 Boom Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default APIPage;
