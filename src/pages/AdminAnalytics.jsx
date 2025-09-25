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
  Award
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    revenue: [],
    users: [],
    bookings: [],
    tenants: [],
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalytics({
        overview: {
          totalRevenue: 125400,
          monthlyRevenue: 18750,
          totalUsers: 2847,
          activeUsers: 2156,
          totalBookings: 45678,
          totalTenants: 156,
          activeTenants: 142,
          conversionRate: 12.5,
          churnRate: 3.2,
          avgRevenuePerUser: 44.2,
          avgBookingsPerUser: 16.1
        },
        revenue: [
          { date: '2024-11-01', revenue: 15200, bookings: 1200 },
          { date: '2024-11-02', revenue: 16800, bookings: 1350 },
          { date: '2024-11-03', revenue: 14200, bookings: 1100 },
          { date: '2024-11-04', revenue: 18900, bookings: 1500 },
          { date: '2024-11-05', revenue: 20100, bookings: 1650 },
          { date: '2024-11-06', revenue: 17600, bookings: 1400 },
          { date: '2024-11-07', revenue: 19300, bookings: 1550 }
        ],
        users: [
          { date: '2024-11-01', newUsers: 45, activeUsers: 2100 },
          { date: '2024-11-02', newUsers: 52, activeUsers: 2120 },
          { date: '2024-11-03', newUsers: 38, activeUsers: 2080 },
          { date: '2024-11-04', newUsers: 61, activeUsers: 2140 },
          { date: '2024-11-05', newUsers: 48, activeUsers: 2160 },
          { date: '2024-11-06', newUsers: 55, activeUsers: 2180 },
          { date: '2024-11-07', newUsers: 42, activeUsers: 2156 }
        ],
        bookings: [
          { date: '2024-11-01', bookings: 1200, revenue: 15200 },
          { date: '2024-11-02', bookings: 1350, revenue: 16800 },
          { date: '2024-11-03', bookings: 1100, revenue: 14200 },
          { date: '2024-11-04', bookings: 1500, revenue: 18900 },
          { date: '2024-11-05', bookings: 1650, revenue: 20100 },
          { date: '2024-11-06', bookings: 1400, revenue: 17600 },
          { date: '2024-11-07', bookings: 1550, revenue: 19300 }
        ],
        tenants: [
          { name: 'Downtown Karaoke', users: 18, bookings: 2340, revenue: 2450, growth: 12.5 },
          { name: 'Premium Lounge', users: 67, bookings: 15670, revenue: 8900, growth: 8.3 },
          { name: 'Chain Operations', users: 145, bookings: 45670, revenue: 15600, growth: 15.2 },
          { name: 'Test Venue', users: 2, bookings: 45, revenue: 0, growth: -5.2 }
        ],
        performance: {
          avgResponseTime: 245,
          uptime: 99.9,
          errorRate: 0.1,
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 38
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Platform performance and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
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
                <p className="text-2xl font-bold text-gray-900">${analytics.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+15.3% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+8.2% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalBookings.toLocaleString()}</p>
                <p className="text-xs text-green-600">+22.1% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeTenants}</p>
                <p className="text-xs text-green-600">+12 this month</p>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Revenue & Bookings</h2>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={selectedMetric === 'revenue' ? 'primary' : 'outline'}
                    onClick={() => setSelectedMetric('revenue')}
                  >
                    Revenue
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedMetric === 'bookings' ? 'primary' : 'outline'}
                    onClick={() => setSelectedMetric('bookings')}
                  >
                    Bookings
                  </Button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                  <p className="text-sm text-gray-500">Revenue: ${analytics.overview.monthlyRevenue.toLocaleString()}/month</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">{analytics.performance.uptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium text-blue-600">{analytics.performance.avgResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-red-600">{analytics.performance.errorRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium text-orange-600">{analytics.performance.cpuUsage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-medium text-purple-600">{analytics.performance.memoryUsage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disk Usage</span>
                  <span className="text-sm font-medium text-gray-600">{analytics.performance.diskUsage}%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Top Tenants */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Tenants</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.tenants.map((tenant, index) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant.users}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant.bookings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${tenant.revenue.toLocaleString()}
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

        {/* Additional Metrics */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate}%</p>
                <p className="text-xs text-green-600">+2.1% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600 rotate-180" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.churnRate}%</p>
                <p className="text-xs text-red-600">-0.5% this month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ARPU</p>
                <p className="text-2xl font-bold text-gray-900">${analytics.overview.avgRevenuePerUser}</p>
                <p className="text-xs text-green-600">+$2.3 this month</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
