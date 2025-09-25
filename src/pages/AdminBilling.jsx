import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  Users,
  Building,
  DollarSign,
  Settings,
  Shield,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  ArrowLeft,
  Globe,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Phone,
  Clock,
  Download,
  MessageSquare,
  UserPlus,
  Code,
  Shield as PrivacyIcon,
  HelpCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Star,
  Award,
  CreditCard,
  Receipt,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

const AdminBilling = () => {
  const [billing, setBilling] = useState({
    overview: {},
    transactions: [],
    subscriptions: [],
    revenue: [],
    tenants: []
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBilling({
        overview: {
          totalRevenue: 125400,
          monthlyRevenue: 18750,
          pendingPayments: 3200,
          failedPayments: 450,
          totalTransactions: 1247,
          avgTransactionValue: 100.6,
          revenueGrowth: 15.3,
          churnRate: 3.2
        },
        transactions: [
          {
            id: 1,
            tenant: 'Downtown Karaoke',
            amount: 49.00,
            status: 'completed',
            plan: 'pro',
            date: '2024-12-15',
            method: 'credit_card',
            invoice: 'INV-001'
          },
          {
            id: 2,
            tenant: 'Premium Lounge',
            amount: 199.00,
            status: 'completed',
            plan: 'business',
            date: '2024-12-14',
            method: 'bank_transfer',
            invoice: 'INV-002'
          },
          {
            id: 3,
            tenant: 'Chain Operations',
            amount: 199.00,
            status: 'pending',
            plan: 'business',
            date: '2024-12-13',
            method: 'credit_card',
            invoice: 'INV-003'
          },
          {
            id: 4,
            tenant: 'Test Venue',
            amount: 0.00,
            status: 'failed',
            plan: 'free',
            date: '2024-12-12',
            method: 'credit_card',
            invoice: 'INV-004'
          }
        ],
        subscriptions: [
          {
            id: 1,
            tenant: 'Downtown Karaoke',
            plan: 'pro',
            status: 'active',
            amount: 49.00,
            nextBilling: '2025-01-15',
            users: 18,
            rooms: 8,
            bookings: 2340
          },
          {
            id: 2,
            tenant: 'Premium Lounge',
            plan: 'business',
            status: 'active',
            amount: 199.00,
            nextBilling: '2025-01-14',
            users: 67,
            rooms: 32,
            bookings: 15670
          },
          {
            id: 3,
            tenant: 'Chain Operations',
            plan: 'business',
            status: 'past_due',
            amount: 199.00,
            nextBilling: '2024-12-20',
            users: 145,
            rooms: 78,
            bookings: 45670
          },
          {
            id: 4,
            tenant: 'Test Venue',
            plan: 'free',
            status: 'cancelled',
            amount: 0.00,
            nextBilling: null,
            users: 2,
            rooms: 1,
            bookings: 45
          }
        ],
        revenue: [
          { month: 'Jan', revenue: 15200, growth: 5.2 },
          { month: 'Feb', revenue: 16800, growth: 10.5 },
          { month: 'Mar', revenue: 14200, growth: -15.5 },
          { month: 'Apr', revenue: 18900, growth: 33.1 },
          { month: 'May', revenue: 20100, growth: 6.3 },
          { month: 'Jun', revenue: 17600, growth: -12.4 },
          { month: 'Jul', revenue: 19300, growth: 9.7 },
          { month: 'Aug', revenue: 21500, growth: 11.4 },
          { month: 'Sep', revenue: 19800, growth: -7.9 },
          { month: 'Oct', revenue: 22400, growth: 13.1 },
          { month: 'Nov', revenue: 18750, growth: -16.3 },
          { month: 'Dec', revenue: 18750, growth: 0.0 }
        ],
        tenants: [
          { name: 'Downtown Karaoke', plan: 'pro', revenue: 2450, status: 'active', growth: 12.5 },
          { name: 'Premium Lounge', plan: 'business', revenue: 8900, status: 'active', growth: 8.3 },
          { name: 'Chain Operations', plan: 'business', revenue: 15600, status: 'past_due', growth: 15.2 },
          { name: 'Test Venue', plan: 'free', revenue: 0, status: 'cancelled', growth: -5.2 }
        ]
      });
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const filteredTransactions = billing.transactions.filter(transaction => {
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || transaction.plan === filterPlan;
    return matchesStatus && matchesPlan;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <motion.header 
        className="bg-white shadow-sm border-b"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/admin" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Billing Overview</h1>
                <p className="text-sm text-gray-500">Revenue and subscription management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${billing.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{billing.overview.revenueGrowth}% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${billing.overview.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+8.2% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">${billing.overview.pendingPayments.toLocaleString()}</p>
                <p className="text-xs text-yellow-600">Needs attention</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                <p className="text-2xl font-bold text-gray-900">${billing.overview.failedPayments.toLocaleString()}</p>
                <p className="text-xs text-red-600">Requires action</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Revenue chart visualization would go here</p>
                  <p className="text-sm text-gray-500">Monthly revenue: ${billing.overview.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Subscriptions</span>
                  <span className="text-sm font-medium text-green-600">
                    {billing.subscriptions.filter(s => s.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Past Due</span>
                  <span className="text-sm font-medium text-red-600">
                    {billing.subscriptions.filter(s => s.status === 'past_due').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="text-sm font-medium text-gray-600">
                    {billing.subscriptions.filter(s => s.status === 'cancelled').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Subscriptions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {billing.subscriptions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Transaction Value</span>
                  <span className="text-sm font-medium text-blue-600">
                    ${billing.overview.avgTransactionValue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="text-sm font-medium text-red-600">
                    {billing.overview.churnRate}%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <div className="flex space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{transaction.invoice}</div>
                            <div className="text-sm text-gray-500">{transaction.method}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.tenant}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${transaction.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPlanBadgeColor(transaction.plan)}>
                          {transaction.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Top Revenue Tenants */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Revenue Tenants</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billing.tenants.map((tenant, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Building className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPlanBadgeColor(tenant.plan)}>
                          {tenant.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${tenant.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`flex items-center ${getGrowthColor(tenant.growth)}`}>
                          {getGrowthIcon(tenant.growth)}
                          <span className="ml-1">{tenant.growth > 0 ? '+' : ''}{tenant.growth}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBilling;
