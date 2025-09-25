import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Receipt,
  Zap,
  Shield
} from 'lucide-react';

const BillingSubscriptions = () => {
  const [billingData, setBillingData] = useState({
    currentPlan: 'Pro',
    planPrice: 49,
    nextBilling: '2024-01-15',
    totalRevenue: 18750,
    monthlyRecurring: 2847,
    churnRate: 2.3,
    averageRevenuePerUser: 6.58
  });

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      tenant: 'Boom Karaoke Downtown',
      plan: 'Business',
      price: 99,
      status: 'Active',
      nextBilling: '2024-01-15',
      users: 15,
      revenue: 99
    },
    {
      id: 2,
      tenant: 'Boom Karaoke Westside',
      plan: 'Pro',
      price: 49,
      status: 'Active',
      nextBilling: '2024-01-20',
      users: 8,
      revenue: 49
    },
    {
      id: 3,
      tenant: 'Boom Karaoke Eastside',
      plan: 'Basic',
      price: 19,
      status: 'Active',
      nextBilling: '2024-01-25',
      users: 3,
      revenue: 19
    },
    {
      id: 4,
      tenant: 'Boom Karaoke North',
      plan: 'Free',
      price: 0,
      status: 'Trial',
      nextBilling: '2024-01-30',
      users: 1,
      revenue: 0
    },
    {
      id: 5,
      tenant: 'Boom Karaoke South',
      plan: 'Pro',
      price: 49,
      status: 'Cancelled',
      nextBilling: null,
      users: 5,
      revenue: 0
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      tenant: 'Boom Karaoke Downtown',
      amount: 99,
      type: 'Subscription',
      status: 'Completed',
      date: '2024-12-15',
      method: 'Credit Card'
    },
    {
      id: 2,
      tenant: 'Boom Karaoke Westside',
      amount: 49,
      type: 'Subscription',
      status: 'Completed',
      date: '2024-12-14',
      method: 'Credit Card'
    },
    {
      id: 3,
      tenant: 'Boom Karaoke Eastside',
      amount: 19,
      type: 'Subscription',
      status: 'Completed',
      date: '2024-12-13',
      method: 'Credit Card'
    },
    {
      id: 4,
      tenant: 'Boom Karaoke North',
      amount: 0,
      type: 'Trial',
      status: 'Active',
      date: '2024-12-10',
      method: 'N/A'
    },
    {
      id: 5,
      tenant: 'Boom Karaoke South',
      amount: -49,
      type: 'Refund',
      status: 'Completed',
      date: '2024-12-12',
      method: 'Credit Card'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Pro');

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: ['1 Room', '50 Bookings/Month', 'Basic Support'],
      popular: false
    },
    {
      name: 'Basic',
      price: 19,
      features: ['5 Rooms', '500 Bookings/Month', 'Email Support', 'Calendar Integration'],
      popular: false
    },
    {
      name: 'Pro',
      price: 49,
      features: ['20 Rooms', '2,000 Bookings/Month', 'Priority Support', 'API Access', 'Custom Branding', 'Analytics'],
      popular: true
    },
    {
      name: 'Business',
      price: 99,
      features: ['Unlimited Rooms', 'Unlimited Bookings', 'White-label', 'Multi-location', 'Advanced Analytics', 'Dedicated Support'],
      popular: false
    }
  ];

  const handlePlanChange = async (planName) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSelectedPlan(planName);
    setBillingData(prev => ({
      ...prev,
      currentPlan: planName,
      planPrice: plans.find(p => p.name === planName).price
    }));
    
    setIsLoading(false);
    alert(`Plan changed to ${planName} successfully!`);
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'Cancelled', nextBilling: null }
          : sub
      ));
      
      setIsLoading(false);
      alert('Subscription cancelled successfully!');
    }
  };

  const handleRefund = async (transactionId) => {
    if (window.confirm('Are you sure you want to process this refund?')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      alert('Refund processed successfully!');
    }
  };

  const exportBillingData = async (format) => {
    setIsLoading(true);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert(`Billing data exported to ${format.toUpperCase()} successfully!`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Trial':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Trial':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
            Billing & Subscriptions
          </h2>
          <p className="text-gray-600 mt-1">
            Manage billing, subscriptions, and payment processing
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => exportBillingData('csv')} disabled={isLoading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handlePlanChange(selectedPlan)} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">${billingData.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">${billingData.monthlyRecurring.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Recurring</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{billingData.churnRate}%</div>
              <div className="text-sm text-gray-600">Churn Rate</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">${billingData.averageRevenuePerUser}</div>
              <div className="text-sm text-gray-600">ARPU</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{billingData.currentPlan} Plan</div>
            <div className="text-gray-600">${billingData.planPrice}/month</div>
            <div className="text-sm text-gray-500">Next billing: {billingData.nextBilling}</div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button size="sm">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Plan Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.popular && (
                <div className="text-xs font-semibold text-blue-600 mb-2">MOST POPULAR</div>
              )}
              <div className="text-xl font-bold text-gray-900">{plan.name}</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                ${plan.price}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePlanChange(plan.name)}
                disabled={isLoading || plan.name === billingData.currentPlan}
                className={`w-full mt-4 ${
                  plan.name === billingData.currentPlan ? 'bg-gray-400' : ''
                }`}
              >
                {plan.name === billingData.currentPlan ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscriptions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Subscriptions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.tenant}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subscription.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${subscription.price}/month
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(subscription.status)}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.nextBilling || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscription.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      {subscription.status === 'Active' && (
                        <button 
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Receipt className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-sm text-gray-900">{transaction.tenant}</div>
                  <div className="text-xs text-gray-600">{transaction.type} • {transaction.method}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}${transaction.amount}
                  </div>
                  <div className="text-xs text-gray-500">{transaction.date}</div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(transaction.status)}
                  <span className={`ml-2 px-2 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                {transaction.type === 'Refund' && (
                  <Button
                    onClick={() => handleRefund(transaction.id)}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Process Refund
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Visa ending in 4242</div>
                <div className="text-sm text-gray-600">Expires 12/25</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Default</span>
              <Button size="sm" variant="outline">Edit</Button>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </Card>

      {/* Billing Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
              <Input
                type="email"
                defaultValue="billing@boombooking.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                defaultValue="123 Business St, Suite 100, City, State 12345"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
              <Input
                type="text"
                defaultValue="12-3456789"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
};

export default BillingSubscriptions;
