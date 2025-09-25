import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const SupportPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supportChannels = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Available 24/7",
      responseTime: "Usually within 2 minutes",
      action: "Start Chat",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Available 24/7",
      responseTime: "Response within 24 hours",
      action: "Send Email",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      availability: "Mon-Fri 9AM-6PM PST",
      responseTime: "Immediate response",
      action: "Call Now",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const documentationSections = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6" />,
      articles: [
        {
          title: "Setting Up Your First Room",
          description: "Learn how to create and configure your venue's rooms",
          readTime: "3 min read",
          type: "Guide"
        },
        {
          title: "Creating Your First Booking",
          description: "Step-by-step guide to creating bookings",
          readTime: "5 min read",
          type: "Tutorial"
        },
        {
          title: "User Management",
          description: "How to add and manage staff members",
          readTime: "4 min read",
          type: "Guide"
        }
      ]
    },
    {
      title: "Features & Usage",
      icon: <FileText className="w-6 h-6" />,
      articles: [
        {
          title: "Calendar Integration",
          description: "Sync with Google Calendar, Outlook, and more",
          readTime: "7 min read",
          type: "Integration"
        },
        {
          title: "Mobile App Setup",
          description: "Download and configure the mobile app",
          readTime: "4 min read",
          type: "Setup"
        },
        {
          title: "Analytics Dashboard",
          description: "Understanding your venue's performance metrics",
          readTime: "6 min read",
          type: "Guide"
        }
      ]
    },
    {
      title: "Troubleshooting",
      icon: <CheckCircle className="w-6 h-6" />,
      articles: [
        {
          title: "Common Issues",
          description: "Solutions to frequently encountered problems",
          readTime: "8 min read",
          type: "Troubleshooting"
        },
        {
          title: "Performance Issues",
          description: "How to resolve slow loading and performance problems",
          readTime: "5 min read",
          type: "Troubleshooting"
        },
        {
          title: "Data Recovery",
          description: "How to recover lost or corrupted data",
          readTime: "6 min read",
          type: "Recovery"
        }
      ]
    }
  ];

  const faqCategories = [
    {
      title: "Account & Billing",
      icon: <CheckCircle className="w-6 h-6" />,
      faqs: [
        {
          question: "How do I upgrade my plan?",
          answer: "Go to Settings > Billing to upgrade your plan. You can change your plan at any time, and changes will be reflected in your next billing cycle."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: <MessageCircle className="w-6 h-6" />,
      faqs: [
        {
          question: "The app is running slowly. What should I do?",
          answer: "Try refreshing your browser or clearing your cache. If the issue persists, check your internet connection or contact our support team for assistance."
        },
        {
          question: "Can I use Boom Booking offline?",
          answer: "Yes! Our mobile app supports offline mode. You can view bookings and make changes when offline, and they'll sync when you're back online."
        },
        {
          question: "How do I integrate with my POS system?",
          answer: "We offer API access and pre-built integrations with popular POS systems. Contact our support team to discuss integration options for your specific system."
        }
      ]
    }
  ];

  const resources = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      link: "#",
      type: "Videos"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Center",
      description: "Mobile apps, desktop tools, and integrations",
      link: "#",
      type: "Downloads"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "API Documentation",
      description: "Complete API reference and examples",
      link: "/api",
      type: "Documentation"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Community Forum",
      description: "Connect with other users and get help",
      link: "#",
      type: "Community"
    }
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
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
              <Link to="/contact">
                <Button size="sm">Contact Us</Button>
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
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get help, find answers, and connect with our support team. 
              We're here to help you succeed with Boom Booking.
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
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Support</h2>
            <p className="text-xl text-gray-600">Choose the best way to get the help you need</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">{channel.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{channel.title}</h3>
                  <p className="text-gray-600 mb-4">{channel.description}</p>
                  <div className="text-sm text-blue-600 font-medium mb-2">{channel.availability}</div>
                  <div className="text-sm text-gray-500 mb-4">{channel.responseTime}</div>
                  <Button className={`w-full bg-gradient-to-r ${channel.color} hover:opacity-90 text-white`}>
                    {channel.action}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Documentation</h2>
            <p className="text-xl text-gray-600">Comprehensive guides and tutorials</p>
          </motion.div>

          <div className="space-y-6">
            {documentationSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleSection(sectionIndex)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    {expandedSection === sectionIndex ? (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSection === sectionIndex && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.articles.map((article, articleIndex) => (
                          <Card key={articleIndex} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">{article.type}</Badge>
                              <span className="text-xs text-gray-500">{article.readTime}</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4>
                            <p className="text-gray-600 text-sm">{article.description}</p>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </motion.div>

          <div className="space-y-6">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <button
                    onClick={() => toggleSection(`faq-${categoryIndex}`)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <div className="text-white">{category.icon}</div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                    </div>
                    {expandedSection === `faq-${categoryIndex}` ? (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSection === `faq-${categoryIndex}` && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t"
                    >
                      <div className="p-6 space-y-6">
                        {category.faqs.map((faq, faqIndex) => (
                          <div key={faqIndex} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h4>
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <p className="text-xl text-gray-600">More ways to learn and get help</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">{resource.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{resource.description}</p>
                  <Badge variant="outline" className="text-xs">{resource.type}</Badge>
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
            Still Need Help?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Our support team is here to help you succeed with Boom Booking.
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
                Contact Support
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Live Chat
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

export default SupportPage;
