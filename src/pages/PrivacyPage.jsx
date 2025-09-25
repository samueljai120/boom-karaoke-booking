import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';

const PrivacyPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const privacySections = [
    {
      title: "Information We Collect",
      icon: <Database className="w-6 h-6" />,
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name, email address, and phone number",
            "Business information and venue details",
            "Payment and billing information",
            "Account credentials and preferences"
          ]
        },
        {
          subtitle: "Usage Information",
          items: [
            "Booking data and scheduling information",
            "App usage patterns and feature interactions",
            "Device information and browser data",
            "IP address and location data"
          ]
        },
        {
          subtitle: "Communication Data",
          items: [
            "Support tickets and customer service interactions",
            "Email communications and notifications",
            "Feedback and survey responses",
            "Marketing preferences and opt-ins"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: "Service Provision",
          items: [
            "Provide and maintain our booking management services",
            "Process bookings and manage your venue operations",
            "Send important service notifications and updates",
            "Provide customer support and technical assistance"
          ]
        },
        {
          subtitle: "Business Operations",
          items: [
            "Improve our services and develop new features",
            "Analyze usage patterns to enhance user experience",
            "Conduct research and analytics for service improvement",
            "Ensure platform security and prevent fraud"
          ]
        },
        {
          subtitle: "Legal Compliance",
          items: [
            "Comply with applicable laws and regulations",
            "Respond to legal requests and court orders",
            "Protect our rights and prevent misuse",
            "Maintain records as required by law"
          ]
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          subtitle: "Service Providers",
          items: [
            "Third-party vendors who assist in service delivery",
            "Payment processors for billing and transactions",
            "Cloud hosting providers for data storage",
            "Analytics services for usage insights"
          ]
        },
        {
          subtitle: "Business Transfers",
          items: [
            "In case of merger, acquisition, or sale of assets",
            "With your explicit consent for specific purposes",
            "To protect our rights and prevent fraud",
            "As required by law or legal process"
          ]
        },
        {
          subtitle: "We Do Not Sell",
          items: [
            "We never sell your personal information to third parties",
            "We do not share data for marketing purposes without consent",
            "We do not use your data for advertising without permission",
            "We protect your information as if it were our own"
          ]
        }
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="w-6 h-6" />,
      content: [
        {
          subtitle: "Technical Safeguards",
          items: [
            "End-to-end encryption for all data transmission",
            "Secure data centers with 24/7 monitoring",
            "Regular security audits and vulnerability assessments",
            "Multi-factor authentication for account access"
          ]
        },
        {
          subtitle: "Administrative Controls",
          items: [
            "Limited access to personal data on a need-to-know basis",
            "Regular staff training on data protection practices",
            "Strict data handling policies and procedures",
            "Incident response plans for security breaches"
          ]
        },
        {
          subtitle: "Physical Security",
          items: [
            "Secure facilities with restricted access",
            "Environmental controls and backup systems",
            "Regular maintenance and monitoring of equipment",
            "Disaster recovery and business continuity plans"
          ]
        }
      ]
    }
  ];

  const rights = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Access Your Data",
      description: "Request a copy of all personal information we have about you"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Correct Information",
      description: "Update or correct any inaccurate personal information"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Portability",
      description: "Export your data in a machine-readable format"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Deletion",
      description: "Request deletion of your personal information"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Restrict Processing",
      description: "Limit how we use your personal information"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Opt-Out",
      description: "Unsubscribe from marketing communications"
    }
  ];

  const compliance = [
    {
      standard: "GDPR",
      description: "General Data Protection Regulation (EU)",
      status: "Compliant",
      color: "bg-green-100 text-green-800"
    },
    {
      standard: "CCPA",
      description: "California Consumer Privacy Act (US)",
      status: "Compliant",
      color: "bg-green-100 text-green-800"
    },
    {
      standard: "SOC 2",
      description: "Service Organization Control 2",
      status: "Certified",
      color: "bg-blue-100 text-blue-800"
    },
    {
      standard: "ISO 27001",
      description: "Information Security Management",
      status: "Certified",
      color: "bg-blue-100 text-blue-800"
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
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information when you use Boom Booking.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                <Shield className="w-5 h-5 mr-2" />
                Last Updated: December 15, 2024
              </Badge>
              <Button variant="outline" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Privacy Practices</h2>
            <p className="text-xl text-gray-600">Transparent information about how we handle your data</p>
          </motion.div>

          <div className="space-y-6">
            {privacySections.map((section, sectionIndex) => (
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
                      <span className="text-gray-500">−</span>
                    ) : (
                      <span className="text-gray-500">+</span>
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
                      <div className="p-6 space-y-8">
                        {section.content.map((subsection, subsectionIndex) => (
                          <div key={subsectionIndex}>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">{subsection.subtitle}</h4>
                            <ul className="space-y-2">
                              {subsection.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start">
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-600">{item}</span>
                                </li>
                              ))}
                            </ul>
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

      {/* Your Rights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-xl text-gray-600">You have control over your personal information</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rights.map((right, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-white">{right.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{right.title}</h3>
                  <p className="text-gray-600">{right.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Compliance & Certifications</h2>
            <p className="text-xl text-gray-600">We meet the highest standards for data protection</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliance.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.standard}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <Badge className={item.color}>
                    {item.status}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
            <p className="text-xl text-gray-600">Contact our privacy team for any questions or concerns</p>
          </motion.div>

          <Card className="p-8 text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Privacy Team</h3>
                <p className="text-gray-600">privacy@boombooking.com</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              For privacy-related questions, data requests, or concerns about how we handle your information, 
              please contact our privacy team. We respond to all inquiries within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Contact Privacy Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <FileText className="w-5 h-5 mr-2" />
                Data Request Form
              </Button>
            </div>
          </Card>
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
            Trust & Transparency
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            We're committed to protecting your privacy and being transparent about our practices.
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
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Shield className="w-5 h-5 mr-2" />
              Security Center
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

export default PrivacyPage;
