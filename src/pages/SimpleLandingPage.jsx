import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  Users, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight,
  Play,
  Award
} from 'lucide-react';

const SimpleLandingPage = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    venues: 0,
    revenue: 0
  });

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const targetStats = { bookings: 12500, venues: 150, revenue: 2.4 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          bookings: Math.floor(targetStats.bookings * progress),
          venues: Math.floor(targetStats.venues * progress),
          revenue: (targetStats.revenue * progress).toFixed(1)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    animateStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Boom Booking</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Demo</Link>
              <Button variant="outline" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-2 mb-6 inline-flex items-center">
              <Award className="w-4 h-4 mr-2" />
              #1 Karaoke Booking Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Book More, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Stress Less
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The smartest booking system for karaoke venues. Increase revenue by 40% with our AI-powered scheduling and customer management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg">
                <Link to="/dashboard" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 border-2 hover:bg-gray-50"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Live Demo
              </Button>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {stats.bookings.toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">Bookings Managed</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  {stats.venues}+
                </div>
                <div className="text-gray-600 font-medium">Happy Venues</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  ${stats.revenue}M+
                </div>
                <div className="text-gray-600 font-medium">Revenue Generated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Venue
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for karaoke venues and entertainment businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Smart Booking System",
                description: "Intuitive calendar interface with real-time availability and conflict detection.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multi-User Management",
                description: "Role-based access control for staff, managers, and administrators.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile Optimized",
                description: "Responsive design that works perfectly on all devices and screen sizes.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics & Reports",
                description: "Comprehensive insights into booking patterns and revenue optimization.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Bank-level security with data encryption and secure authentication.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Optimized performance with sub-second response times and real-time updates.",
                color: "from-yellow-500 to-yellow-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group"
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-blue-50 group-hover:to-purple-50 hover:-translate-y-2">
                  <div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Venue?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of venues already using Boom Booking to increase revenue and streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              <Link to="/dashboard" className="flex items-center">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SimpleLandingPage;
