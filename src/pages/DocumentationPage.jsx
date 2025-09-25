import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  BookOpen,
  FileText,
  Code,
  Database,
  Settings,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Video,
  Users,
  BarChart3,
  Clock,
  MessageCircle
} from 'lucide-react';

const DocumentationPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const documentationCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6" />,
      description: "Everything you need to know to get up and running",
      color: "from-blue-500 to-blue-600",
      articles: [
        {
          title: "Quick Start Guide",
          description: "Get your first booking system set up in minutes",
          readTime: "5 min read",
          type: "Guide",
          link: "#quick-start"
        },
        {
          title: "Account Setup",
          description: "Configure your venue settings and preferences",
          readTime: "3 min read",
          type: "Setup",
          link: "#account-setup"
        },
        {
          title: "First Room Configuration",
          description: "Learn how to create and configure your venue's rooms",
          readTime: "4 min read",
          type: "Guide",
          link: "#room-setup"
        },
        {
          title: "User Management",
          description: "Add and manage staff members and permissions",
          readTime: "6 min read",
          type: "Guide",
          link: "#user-management"
        }
      ]
    },
    {
      title: "Core Features",
      icon: <Calendar className="w-6 h-6" />,
      description: "Master the essential booking and scheduling features",
      color: "from-green-500 to-green-600",
      articles: [
        {
          title: "Creating Bookings",
          description: "Step-by-step guide to creating and managing bookings",
          readTime: "7 min read",
          type: "Tutorial",
          link: "#creating-bookings"
        },
        {
          title: "Calendar Management",
          description: "Understanding the calendar view and scheduling",
          readTime: "5 min read",
          type: "Guide",
          link: "#calendar-management"
        },
        {
          title: "Business Hours Setup",
          description: "Configure your venue's operating hours and availability",
          readTime: "4 min read",
          type: "Setup",
          link: "#business-hours"
        },
        {
          title: "Booking Status Management",
          description: "Manage booking confirmations, cancellations, and modifications",
          readTime: "6 min read",
          type: "Guide",
          link: "#booking-status"
        }
      ]
    },
    {
      title: "Integrations",
      icon: <Zap className="w-6 h-6" />,
      description: "Connect Boom Booking with your existing tools",
      color: "from-purple-500 to-purple-600",
      articles: [
        {
          title: "Google Calendar Sync",
          description: "Sync your bookings with Google Calendar",
          readTime: "8 min read",
          type: "Integration",
          link: "#google-calendar"
        },
        {
          title: "Outlook Integration",
          description: "Connect with Microsoft Outlook and Office 365",
          readTime: "7 min read",
          type: "Integration",
          link: "#outlook-integration"
        },
        {
          title: "POS System Integration",
          description: "Connect with popular point-of-sale systems",
          readTime: "10 min read",
          type: "Integration",
          link: "#pos-integration"
        },
        {
          title: "Email Notifications",
          description: "Set up automated email notifications for bookings",
          readTime: "5 min read",
          type: "Setup",
          link: "#email-notifications"
        }
      ]
    },
    {
      title: "Analytics & Reporting",
      icon: <BarChart3 className="w-6 h-6" />,
      description: "Track performance and gain insights into your business",
      color: "from-orange-500 to-orange-600",
      articles: [
        {
          title: "Dashboard Overview",
          description: "Understanding your analytics dashboard and key metrics",
          readTime: "6 min read",
          type: "Guide",
          link: "#dashboard-overview"
        },
        {
          title: "Revenue Reports",
          description: "Generate and analyze revenue reports",
          readTime: "5 min read",
          type: "Guide",
          link: "#revenue-reports"
        },
        {
          title: "Customer Analytics",
          description: "Track customer behavior and booking patterns",
          readTime: "7 min read",
          type: "Guide",
          link: "#customer-analytics"
        },
        {
          title: "Export Data",
          description: "Export your data for external analysis",
          readTime: "4 min read",
          type: "Guide",
          link: "#export-data"
        }
      ]
    },
    {
      title: "API & Development",
      icon: <Code className="w-6 h-6" />,
      description: "Developer resources and API documentation",
      color: "from-indigo-500 to-indigo-600",
      articles: [
        {
          title: "API Overview",
          description: "Introduction to the Boom Booking API",
          readTime: "8 min read",
          type: "API",
          link: "/api"
        },
        {
          title: "Authentication",
          description: "Learn how to authenticate with the API",
          readTime: "6 min read",
          type: "API",
          link: "#api-auth"
        },
        {
          title: "SDK Downloads",
          description: "Download SDKs for popular programming languages",
          readTime: "3 min read",
          type: "Download",
          link: "#sdk-downloads"
        },
        {
          title: "Webhook Configuration",
          description: "Set up webhooks for real-time updates",
          readTime: "9 min read",
          type: "Integration",
          link: "#webhooks"
        }
      ]
    },
    {
      title: "Mobile & Apps",
      icon: <Globe className="w-6 h-6" />,
      description: "Mobile applications and cross-platform access",
      color: "from-teal-500 to-teal-600",
      articles: [
        {
          title: "Mobile App Setup",
          description: "Download and configure the mobile app",
          readTime: "4 min read",
          type: "Setup",
          link: "#mobile-app"
        },
        {
          title: "Progressive Web App",
          description: "Use Boom Booking as a PWA on any device",
          readTime: "5 min read",
          type: "Guide",
          link: "#pwa-setup"
        },
        {
          title: "Offline Mode",
          description: "Work with bookings even when offline",
          readTime: "6 min read",
          type: "Guide",
          link: "#offline-mode"
        },
        {
          title: "Multi-Device Sync",
          description: "Keep your data synchronized across devices",
          readTime: "5 min read",
          type: "Guide",
          link: "#multi-device"
        }
      ]
    }
  ];

  const quickLinks = [
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      link: "#videos",
      type: "Video"
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Download Center",
      description: "Mobile apps, desktop tools, and integrations",
      link: "#downloads",
      type: "Download"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Forum",
      description: "Connect with other users and get help",
      link: "#forum",
      type: "Community"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Support Center",
      description: "Get help from our support team",
      link: "/support",
      type: "Support"
    }
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const getTypeColor = (type) => {
    const colors = {
      'Guide': 'bg-blue-100 text-blue-800',
      'Tutorial': 'bg-green-100 text-green-800',
      'Setup': 'bg-purple-100 text-purple-800',
      'Integration': 'bg-orange-100 text-orange-800',
      'API': 'bg-indigo-100 text-indigo-800',
      'Download': 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

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
              <Link to="/help">
                <Button variant="outline" size="sm">Help Center</Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" size="sm">Support</Button>
              </Link>
              <Link to="/api">
                <Button size="sm">API Docs</Button>
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
              Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comprehensive guides, tutorials, and resources to help you make the most of Boom Booking. 
              Find everything you need to set up, configure, and optimize your booking system.
            </p>
            
            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={link.link}>
                  <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-blue-500 transition-colors" />
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Documentation Categories</h2>
            <p className="text-xl text-gray-600">Explore our comprehensive guides and tutorials</p>
          </motion.div>

          <div className="space-y-6">
            {documentationCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleSection(categoryIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                          <p className="text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.articles.length} articles
                        </Badge>
                        {expandedSection === categoryIndex ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSection === categoryIndex && (
                    <motion.div 
                      className="border-t bg-gray-50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {category.articles.map((article, articleIndex) => (
                            <motion.div
                              key={articleIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: articleIndex * 0.1 }}
                            >
                              <Link to={article.link}>
                                <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow group">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {article.title}
                                    </h4>
                                    <Badge className={`text-xs ${getTypeColor(article.type)}`}>
                                      {article.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {article.readTime}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Quick Access */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Developer Resources</h2>
            <p className="text-xl text-gray-600 mb-8">Build custom integrations and applications</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/api">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <Code className="w-5 h-5 mr-2" />
                  API Documentation
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download SDKs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Boom Booking</span>
              </div>
              <p className="text-gray-400">
                The smartest booking system for karaoke venues and entertainment businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Demo</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/status" className="hover:text-white">Status</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Boom Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentationPage;
