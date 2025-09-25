import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

const FeedbackSystem = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedback, setFeedback] = useState({
    rating: 0,
    category: '',
    message: '',
    email: '',
    name: '',
    phone: ''
  });
  const [interviewRequest, setInterviewRequest] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    timezone: '',
    goals: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [feedbackStats, setFeedbackStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    pendingInterviews: 0,
    completedInterviews: 0
  });

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      // Mock data for now - in production, fetch from API
      setFeedbackStats({
        totalFeedback: 127,
        averageRating: 4.6,
        pendingInterviews: 8,
        completedInterviews: 23
      });
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
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

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.rating || !feedback.category || !feedback.message) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage('Thank you for your feedback! We appreciate your input.');
      setFeedback({
        rating: 0,
        category: '',
        message: '',
        email: '',
        name: '',
        phone: ''
      });
    } catch (error) {
      showMessage('Failed to submit feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!interviewRequest.name || !interviewRequest.email || !interviewRequest.preferredDate) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage('Interview request submitted! We\'ll contact you within 24 hours.');
      setInterviewRequest({
        name: '',
        email: '',
        phone: '',
        role: '',
        company: '',
        preferredDate: '',
        preferredTime: '',
        timezone: '',
        goals: ''
      });
    } catch (error) {
      showMessage('Failed to submit interview request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange(star)}
          disabled={readonly}
          className={`w-8 h-8 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const FeedbackStatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="p-6 text-center">
      <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            User Feedback & Research
          </h1>
          <p className="text-gray-600 mt-2">
            Collect user feedback and schedule interviews to improve your product
          </p>
        </div>
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
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FeedbackStatsCard
          title="Total Feedback"
          value={feedbackStats.totalFeedback}
          icon={MessageSquare}
          color="bg-blue-500"
          subtitle="All time"
        />
        <FeedbackStatsCard
          title="Average Rating"
          value={feedbackStats.averageRating}
          icon={Star}
          color="bg-yellow-500"
          subtitle="Out of 5.0"
        />
        <FeedbackStatsCard
          title="Pending Interviews"
          value={feedbackStats.pendingInterviews}
          icon={Clock}
          color="bg-orange-500"
          subtitle="To be scheduled"
        />
        <FeedbackStatsCard
          title="Completed Interviews"
          value={feedbackStats.completedInterviews}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="This month"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'feedback'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2 inline" />
          Feedback Collection
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'interviews'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2 inline" />
          User Interviews
        </button>
      </div>

      {/* Feedback Collection Tab */}
      {activeTab === 'feedback' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Collect User Feedback</h2>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your experience? *
              </label>
              <StarRating 
                rating={feedback.rating} 
                onRatingChange={handleRatingClick}
              />
              <div className="mt-2 text-sm text-gray-500">
                {feedback.rating === 0 && 'Click a star to rate'}
                {feedback.rating === 1 && 'Poor - We need to improve'}
                {feedback.rating === 2 && 'Fair - Room for improvement'}
                {feedback.rating === 3 && 'Good - Solid experience'}
                {feedback.rating === 4 && 'Very Good - Great experience'}
                {feedback.rating === 5 && 'Excellent - Perfect experience'}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                <option value="booking">Booking Process</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="features">Features</option>
                <option value="support">Customer Support</option>
                <option value="pricing">Pricing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback *
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your experience, what you liked, what could be improved..."
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <Input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => setFeedback(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </Card>
      )}

      {/* User Interviews Tab */}
      {activeTab === 'interviews' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule User Interview</h2>
          
          <form onSubmit={handleInterviewSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={interviewRequest.name}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={interviewRequest.email}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={interviewRequest.phone}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Title
                </label>
                <Input
                  type="text"
                  value={interviewRequest.role}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Venue Manager"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Venue Name
              </label>
              <Input
                type="text"
                value={interviewRequest.company}
                onChange={(e) => setInterviewRequest(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Downtown Karaoke"
              />
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <Input
                  type="date"
                  value={interviewRequest.preferredDate}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, preferredDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <Input
                  type="time"
                  value={interviewRequest.preferredTime}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, preferredTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={interviewRequest.timezone}
                  onChange={(e) => setInterviewRequest(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timezone</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="CET">Central European Time (CET)</option>
                  <option value="JST">Japan Standard Time (JST)</option>
                </select>
              </div>
            </div>

            {/* Interview Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to discuss? (Optional)
              </label>
              <textarea
                value={interviewRequest.goals}
                onChange={(e) => setInterviewRequest(prev => ({ ...prev, goals: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us what you'd like to discuss during the interview..."
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isLoading ? 'Submitting...' : 'Request Interview'}
            </Button>
          </form>
        </Card>
      )}

      {/* Feedback Categories Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedback Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: 'Booking Process', icon: Calendar, count: 45, trend: 'up' },
            { category: 'User Interface', icon: ThumbsUp, count: 32, trend: 'up' },
            { category: 'Performance', icon: TrendingUp, count: 28, trend: 'down' },
            { category: 'Features', icon: Star, count: 23, trend: 'up' },
            { category: 'Customer Support', icon: Users, count: 15, trend: 'up' },
            { category: 'Pricing', icon: BarChart3, count: 12, trend: 'down' }
          ].map((item, index) => (
            <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.category}</div>
                <div className="text-sm text-gray-600">{item.count} feedback items</div>
              </div>
              <div className={`text-sm font-medium ${
                item.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.trend === 'up' ? '↗' : '↘'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FeedbackSystem;
