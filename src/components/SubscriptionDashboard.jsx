import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  CreditCard,
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';

const SubscriptionDashboard = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [upgradeOptions, setUpgradeOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const tenantId = 'demo-tenant'; // In real app, get from auth context

  useEffect(() => {
    fetchSubscriptionData();
    fetchUpgradeOptions();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch(`/api/subscription/status/${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSubscriptionData(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpgradeOptions = async () => {
    try {
      const response = await fetch(`/api/subscription/upgrade-options/${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setUpgradeOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching upgrade options:', error);
    }
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Users className="w-5 h-5" />;
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Star className="w-5 h-5" />;
      case 'business':
        return <Crown className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'text-gray-600';
      case 'basic':
        return 'text-blue-600';
      case 'pro':
        return 'text-purple-600';
      case 'business':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Error</h3>
          <p className="text-gray-600">Unable to load subscription information.</p>
        </div>
      </Card>
    );
  }

  const { plan, planName, usage, limits, planConfig } = subscriptionData;
  const roomUsagePercentage = getUsagePercentage(usage.rooms.used, usage.rooms.limit);
  const bookingUsagePercentage = getUsagePercentage(usage.bookings.used, usage.bookings.limit);

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-gray-100 ${getPlanColor(planName)}`}>
              {getPlanIcon(planName)}
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-semibold text-gray-900">{planName} Plan</h2>
              <p className="text-gray-600">
                {planConfig.price === 0 ? 'Free forever' : `$${planConfig.price}/month`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${limits.isOverLimit ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {limits.isOverLimit ? 'Over Limit' : 'Active'}
            </Badge>
            {limits.isOverLimit && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        {limits.isOverLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Usage Limit Exceeded</h3>
                <p className="text-sm text-red-700">{limits.overLimitMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Bars */}
        <div className="space-y-4">
          {/* Room Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Rooms</span>
              <span className="text-sm text-gray-600">
                {usage.rooms.used} / {usage.rooms.unlimited ? '∞' : usage.rooms.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(roomUsagePercentage)}`}
                style={{ width: `${Math.min(roomUsagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Booking Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Bookings</span>
              <span className="text-sm text-gray-600">
                {usage.bookings.used} / {usage.bookings.unlimited ? '∞' : usage.bookings.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(bookingUsagePercentage)}`}
                style={{ width: `${Math.min(bookingUsagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Upgrade Recommendations */}
      {upgradeOptions && upgradeOptions.upgradeOptions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
              <p className="text-gray-600">Get more features and higher limits</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-4">
            {upgradeOptions.upgradeOptions.slice(0, 2).map((option, index) => (
              <div key={option.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {getPlanIcon(option.name)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">{option.name}</h4>
                      <p className="text-sm text-gray-600">${option.price}/month</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {option.benefits.rooms}
                    </div>
                    <div className="text-xs text-gray-600">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {option.benefits.bookings}
                    </div>
                    <div className="text-xs text-gray-600">Monthly Bookings</div>
                  </div>
                </div>

                {option.benefits.additionalFeatures.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Additional Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {option.benefits.additionalFeatures.map((feature, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade to {option.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Billing Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
          <CreditCard className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Plan</span>
            <span className="font-medium">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Billing Date</span>
            <span className="font-medium">
              {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            <Link to="/pricing">View All Plans</Link>
          </Button>
        </div>
      </Card>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
            <p className="text-gray-600 mb-6">
              You'll be redirected to our secure payment page to complete your upgrade.
            </p>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setShowUpgradeModal(false);
                  // In real app, redirect to Stripe checkout
                  window.location.href = '/pricing';
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
