import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Quote,
  Award,
  Globe,
  X,
  Maximize2,
  MousePointer,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    venues: 0,
    revenue: 0
  });
  const [showLiveDemo, setShowLiveDemo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const slideInLeft = {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const slideInRight = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

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

  // Live Demo Component
  const LiveDemoModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowLiveDemo(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Demo</h3>
          <p className="text-gray-600 mb-6">
            Experience the full Boom Booking system with our interactive demo. 
            Click below to open the application in a new window.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => {
              // Use current domain for demo
              const currentDomain = window.location.origin;
              window.open(`${currentDomain}/login`, '_blank', 'noopener,noreferrer');
              setShowLiveDemo(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Open Live Demo
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowLiveDemo(false)}
            className="w-full py-3 px-6 rounded-lg"
          >
            Cancel
          </Button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Demo credentials: demo@example.com / demo123</p>
        </div>
      </motion.div>
    </motion.div>
  );

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Booking System",
      description: "Intuitive calendar interface with real-time availability and conflict detection.",
      color: "from-blue-500 to-blue-600",
      demo: "calendar"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-User Management",
      description: "Role-based access control for staff, managers, and administrators.",
      color: "from-green-500 to-green-600",
      demo: "users"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices and screen sizes.",
      color: "from-purple-500 to-purple-600",
      demo: "mobile"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Reports",
      description: "Comprehensive insights into booking patterns and revenue optimization.",
      color: "from-orange-500 to-orange-600",
      demo: "analytics"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with data encryption and secure authentication.",
      color: "from-red-500 to-red-600",
      demo: "security"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized performance with sub-second response times and real-time updates.",
      color: "from-yellow-500 to-yellow-600",
      demo: "performance"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Downtown Karaoke",
      avatar: "SC",
      avatarColor: "from-pink-400 to-rose-500",
      venue: "Downtown Karaoke",
      venueImage: "🎤",
      content: "Boom Booking transformed our business. We've seen a 40% increase in bookings and our staff efficiency has improved dramatically.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Manager, Premium Lounge",
      avatar: "MR",
      avatarColor: "from-blue-400 to-indigo-500",
      venue: "Premium Lounge",
      venueImage: "🍸",
      content: "The mobile interface is incredible. Our staff can manage bookings from anywhere, and customers love the seamless experience.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Director, Chain Operations",
      avatar: "ET",
      avatarColor: "from-purple-400 to-violet-500",
      venue: "Chain Operations",
      venueImage: "🏢",
      content: "Finally, a booking system that scales with our business. The multi-location features are exactly what we needed.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: ["1 Room", "50 Bookings/Month", "Basic Support", "Mobile App"],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Basic",
      price: "$19",
      period: "per month",
      description: "For growing businesses",
      features: ["5 Rooms", "500 Bookings/Month", "Email Support", "Analytics", "Calendar Sync"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For established venues",
      features: ["20 Rooms", "2,000 Bookings/Month", "Priority Support", "API Access", "Custom Branding", "Advanced Analytics"],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$99",
      period: "per month",
      description: "For multi-location chains",
      features: ["Unlimited Rooms", "Unlimited Bookings", "White-label", "Dedicated Support", "Multi-location Management"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="scroll-indicator"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-100 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-green-100 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Calendar className="w-5 h-5 text-white" />
              </motion.div>
              <span className="ml-2 text-xl font-bold text-gray-900">Boom Booking</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                href="#features" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Features
              </motion.a>
              <motion.a 
                href="#pricing" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Pricing
              </motion.a>
              <motion.a 
                href="#testimonials" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Reviews
              </motion.a>
              <motion.button
                onClick={() => setShowLiveDemo(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                whileHover={{ y: -2 }}
              >
                <Play className="w-4 h-4 mr-1" />
                Live Demo
              </motion.button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <header className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-2 mb-6 inline-flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-4 h-4 mr-2" />
                </motion.div>
                #1 Karaoke Booking Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Book More, 
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Stress Less
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The smartest booking system for karaoke venues. Increase revenue by 40% with our AI-powered scheduling and customer management platform.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg">
                  <Link to="/dashboard" className="flex items-center">
                    Start Free Trial
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 border-2 hover:bg-gray-50"
                  onClick={() => {
                    // Use current domain for demo
                    const currentDomain = window.location.origin;
                    window.open(`${currentDomain}/login`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                  </motion.div>
                  Watch Live Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Animated Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  {stats.bookings.toLocaleString()}+
                </motion.div>
                <div className="text-gray-600 font-medium">Bookings Managed</div>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {stats.venues}+
                </motion.div>
                <div className="text-gray-600 font-medium">Happy Venues</div>
              </motion.div>
              <motion.div 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  ${stats.revenue}M+
                </motion.div>
                <div className="text-gray-600 font-medium">Revenue Generated</div>
              </motion.div>
            </motion.div>
            </header>

            {/* Right Column - Product Mockup */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <motion.div 
                  className="relative bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="ml-2 font-semibold text-gray-900">Boom Booking</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Mockup Calendar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Today's Bookings</h3>
                      <span className="text-sm text-blue-600 font-medium">Dec 2024</span>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-gray-500 py-2">{day}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <motion.div 
                          key={day}
                          className={`text-center py-2 rounded-lg cursor-pointer ${
                            day === 15 ? 'bg-blue-600 text-white' : 
                            day > 15 && day < 20 ? 'bg-blue-100 text-blue-600' : 
                            'text-gray-700 hover:bg-gray-100'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {day}
                        </motion.div>
                      ))}
                    </div>

                    {/* Booking Cards */}
                    <div className="space-y-2">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Room A - 2:00 PM</p>
                            <p className="text-xs text-gray-600">John Smith - 2 hours</p>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Room B - 4:00 PM</p>
                            <p className="text-xs text-gray-600">Sarah Chen - 1.5 hours</p>
                          </div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">+12 Bookings</p>
                      <p className="text-xs text-gray-500">This week</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">+40% Revenue</p>
                      <p className="text-xs text-gray-500">vs last month</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Everything You Need to Run Your Venue
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Powerful features designed specifically for karaoke venues and entertainment businesses.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-blue-50 group-hover:to-purple-50 relative overflow-hidden feature-card feature-glow">
                  {/* Feature Illustration */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    {feature.demo === 'calendar' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="10" y="20" width="80" height="60" rx="5" fill="currentColor" />
                        <rect x="15" y="25" width="70" height="8" rx="2" fill="currentColor" />
                        <rect x="15" y="35" width="20" height="6" rx="1" fill="currentColor" />
                        <rect x="40" y="35" width="20" height="6" rx="1" fill="currentColor" />
                        <rect x="65" y="35" width="20" height="6" rx="1" fill="currentColor" />
                        <rect x="15" y="45" width="15" height="6" rx="1" fill="currentColor" />
                        <rect x="35" y="45" width="15" height="6" rx="1" fill="currentColor" />
                        <rect x="55" y="45" width="15" height="6" rx="1" fill="currentColor" />
                        <rect x="75" y="45" width="10" height="6" rx="1" fill="currentColor" />
                      </svg>
                    )}
                    {feature.demo === 'users' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="30" cy="30" r="12" fill="currentColor" />
                        <circle cx="70" cy="30" r="12" fill="currentColor" />
                        <circle cx="50" cy="60" r="15" fill="currentColor" />
                        <path d="M20 80 Q30 70 40 80 Q50 90 60 80 Q70 70 80 80" stroke="currentColor" strokeWidth="3" fill="none" />
                      </svg>
                    )}
                    {feature.demo === 'mobile' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="25" y="10" width="50" height="80" rx="8" fill="currentColor" />
                        <rect x="30" y="20" width="40" height="50" rx="2" fill="white" />
                        <circle cx="50" cy="75" r="3" fill="currentColor" />
                      </svg>
                    )}
                    {feature.demo === 'analytics' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="10" y="60" width="15" height="30" fill="currentColor" />
                        <rect x="30" y="40" width="15" height="50" fill="currentColor" />
                        <rect x="50" y="20" width="15" height="70" fill="currentColor" />
                        <rect x="70" y="30" width="15" height="60" fill="currentColor" />
                        <path d="M17.5 45 Q32.5 25 47.5 35 Q62.5 45 77.5 25" stroke="currentColor" strokeWidth="3" fill="none" />
                      </svg>
                    )}
                    {feature.demo === 'security' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M50 10 L70 20 L70 50 Q70 70 50 80 Q30 70 30 50 L30 20 Z" fill="currentColor" />
                        <circle cx="50" cy="50" r="8" fill="white" />
                        <path d="M45 50 L48 53 L55 46" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                    {feature.demo === 'performance' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 60 L30 75 L35 55 L20 40 L40 40 Z" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  <motion.div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 relative z-10">{feature.description}</p>
                  <motion.button
                    className="text-blue-600 font-medium flex items-center group-hover:text-purple-600 transition-colors relative z-10"
                    whileHover={{ x: 5 }}
                    onClick={() => setShowLiveDemo(true)}
                  >
                    <MousePointer className="w-4 h-4 mr-2" />
                    Try Live Demo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile App Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Manage Bookings on the Go
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our mobile app gives you complete control over your venue's bookings, even when you're away from the office.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Real-time booking notifications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Offline mode support</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Push notifications for updates</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Mobile Mockups */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center space-x-4">
                {/* Phone 1 */}
                <motion.div 
                  className="relative"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-48 h-96 phone-mockup rounded-3xl p-2">
                    <div className="w-full h-full phone-screen rounded-2xl overflow-hidden">
                      <div className="bg-blue-600 text-white p-4 text-center">
                        <h3 className="font-semibold">Today's Bookings</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">Room A - 2:00 PM</p>
                          <p className="text-xs text-gray-600">John Smith</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">Room B - 4:00 PM</p>
                          <p className="text-xs text-gray-600">Sarah Chen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Phone 2 */}
                <motion.div 
                  className="relative"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-48 h-96 phone-mockup rounded-3xl p-2">
                    <div className="w-full h-full phone-screen rounded-2xl overflow-hidden">
                      <div className="bg-purple-600 text-white p-4 text-center">
                        <h3 className="font-semibold">Analytics</h3>
                      </div>
                      <div className="p-4">
                        <div className="h-32 bg-gradient-to-t from-blue-100 to-purple-100 rounded-lg flex items-end justify-center">
                          <div className="text-2xl">📊</div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Revenue</span>
                            <span className="font-semibold">+40%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bookings</span>
                            <span className="font-semibold">+25%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Venues Worldwide
            </h2>
            <p className="text-gray-600">
              Join thousands of successful venues using Boom Booking
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              { name: "Downtown Karaoke", icon: "🎤", color: "from-pink-500 to-rose-600" },
              { name: "Premium Lounge", icon: "🍸", color: "from-blue-500 to-indigo-600" },
              { name: "Night Owl Bar", icon: "🦉", color: "from-purple-500 to-violet-600" },
              { name: "Golden Voice", icon: "🎵", color: "from-yellow-500 to-orange-600" }
            ].map((venue, index) => (
              <motion.div 
                key={index}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-r ${venue.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 venue-logo`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {venue.icon}
                </motion.div>
                <div className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {venue.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Particle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle absolute w-2 h-2 bg-blue-200 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Real results from real venues
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group-hover:bg-white relative overflow-hidden testimonial-glow">
                  {/* Venue Background Image */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <div className="text-6xl">{testimonial.venueImage}</div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      className="w-8 h-8 text-blue-600"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Quote />
                    </motion.div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 group-hover:text-gray-700 transition-colors relative z-10">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${testimonial.avatarColor} rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-white font-semibold text-lg">{testimonial.avatar}</span>
                      </motion.div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    {/* Venue Badge */}
                    <motion.div 
                      className="bg-gray-100 group-hover:bg-blue-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {testimonial.venue}
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Choose the perfect plan for your venue. No hidden fees, no surprises.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className={`p-6 relative hover:shadow-2xl transition-all duration-300 pricing-card ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-white' 
                    : 'bg-white hover:from-gray-50 hover:to-white'
                }`}>
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 animate-pulse-glow">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </motion.div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {plan.name}
                    </h3>
                    <motion.div 
                      className="text-4xl font-bold text-gray-900 mb-1"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {plan.price}
                    </motion.div>
                    <div className="text-gray-600">{plan.period}</div>
                    <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        </motion.div>
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className={`w-full btn-animated ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 cta-glow relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"
            animate={{
              scale: [1.5, 1, 1.5],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -50, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Venue?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of venues already using Boom Booking to increase revenue and streamline operations.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 shadow-lg btn-animated">
                <Link to="/dashboard" className="flex items-center">
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 btn-animated"
              >
                <Link to="/pricing" className="flex items-center">
                  View Pricing
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
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

      {/* Live Demo Modal */}
      {showLiveDemo && <LiveDemoModal />}
    </div>
  );
};

export default LandingPage;
