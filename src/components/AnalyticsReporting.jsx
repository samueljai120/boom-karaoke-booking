import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const AnalyticsReporting = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    revenue: { current: 0, previous: 0, change: 0, trend: 'up' },
    bookings: { current: 0, previous: 0, change: 0, trend: 'up' },
    users: { current: 0, previous: 0, change: 0, trend: 'up' },
    conversion: { current: 0, previous: 0, change: 0, trend: 'up' }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analytics/overview');
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    }
  };

  const [chartData, setChartData] = useState({
    revenue: [
      { month: 'Jan', value: 12000 },
      { month: 'Feb', value: 13500 },
      { month: 'Mar', value: 14800 },
      { month: 'Apr', value: 16200 },
      { month: 'May', value: 17500 },
      { month: 'Jun', value: 18750 }
    ],
    bookings: [
      { month: 'Jan', value: 28000 },
      { month: 'Feb', value: 32000 },
      { month: 'Mar', value: 35000 },
      { month: 'Apr', value: 38000 },
      { month: 'May', value: 42000 },
      { month: 'Jun', value: 45678 }
    ],
    users: [
      { month: 'Jan', value: 1800 },
      { month: 'Feb', value: 2100 },
      { month: 'Mar', value: 2350 },
      { month: 'Apr', value: 2500 },
      { month: 'May', value: 2675 },
      { month: 'Jun', value: 2847 }
    ]
  });

  const [topPerformers, setTopPerformers] = useState([
    { name: 'Boom Karaoke Downtown', revenue: 4500, bookings: 1200, growth: 25.3 },
    { name: 'Boom Karaoke Westside', revenue: 3800, bookings: 980, growth: 18.7 },
    { name: 'Boom Karaoke Eastside', revenue: 3200, bookings: 850, growth: 12.4 },
    { name: 'Boom Karaoke North', revenue: 2800, bookings: 720, growth: 8.9 },
    { name: 'Boom Karaoke South', revenue: 2400, bookings: 650, growth: 5.2 }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { action: 'New booking created', user: 'john@example.com', time: '2 minutes ago', type: 'booking' },
    { action: 'Payment processed', user: 'system', time: '5 minutes ago', type: 'payment' },
    { action: 'User registered', user: 'jane@example.com', time: '10 minutes ago', type: 'user' },
    { action: 'Report generated', user: 'admin@example.com', time: '1 hour ago', type: 'report' },
    { action: 'Settings updated', user: 'mike@example.com', time: '2 hours ago', type: 'settings' }
  ]);

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600' },
    { value: 'bookings', label: 'Bookings', icon: Calendar, color: 'text-blue-600' },
    { value: 'users', label: 'Users', icon: Users, color: 'text-purple-600' },
    { value: 'conversion', label: 'Conversion', icon: Target, color: 'text-orange-600' }
  ];

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update data based on period
    const multiplier = period === '7d' ? 0.25 : period === '30d' ? 1 : period === '90d' ? 3 : 12;
    setReportData(prev => ({
      revenue: {
        ...prev.revenue,
        current: Math.round(prev.revenue.current * multiplier),
        change: prev.revenue.change + (Math.random() - 0.5) * 10
      },
      bookings: {
        ...prev.bookings,
        current: Math.round(prev.bookings.current * multiplier),
        change: prev.bookings.change + (Math.random() - 0.5) * 10
      },
      users: {
        ...prev.users,
        current: Math.round(prev.users.current * multiplier),
        change: prev.users.change + (Math.random() - 0.5) * 10
      }
    }));
    
    setIsLoading(false);
  };

  const generateReport = async () => {
    setIsLoading(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    alert('Report generated successfully! Check your downloads folder.');
  };

  const exportData = async (format) => {
    setIsLoading(true);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert(`Data exported to ${format.toUpperCase()} successfully!`);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'report':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      case 'settings':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
            Analytics & Reporting
          </h2>
          <p className="text-gray-600 mt-1">
            Track performance and generate detailed reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={generateReport} disabled={isLoading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button onClick={() => handlePeriodChange(selectedPeriod)} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Time Period</h3>
          <div className="flex space-x-2">
            {periods.map(period => (
              <Button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                disabled={isLoading}
                variant={selectedPeriod === period.value ? 'default' : 'outline'}
                size="sm"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => {
          const Icon = metric.icon;
          const data = reportData[metric.value];
          return (
            <Card key={metric.value} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value === 'revenue' ? `$${data.current.toLocaleString()}` :
                     metric.value === 'conversion' ? `${data.current}%` :
                     data.current.toLocaleString()}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <div className="mt-4 flex items-center">
                {getTrendIcon(data.trend)}
                <span className={`ml-2 text-sm font-medium ${getTrendColor(data.trend)}`}>
                  {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
                </span>
                <span className="ml-2 text-sm text-gray-500">vs previous period</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.revenue.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.value / Math.max(...chartData.revenue.map(d => d.value))) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {chartData.bookings.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(item.value / Math.max(...chartData.bookings.map(d => d.value))) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Venues</h3>
        <div className="space-y-4">
          {topPerformers.map((venue, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{venue.name}</div>
                  <div className="text-sm text-gray-600">
                    ${venue.revenue.toLocaleString()} revenue • {venue.bookings.toLocaleString()} bookings
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">+{venue.growth}%</div>
                <div className="text-xs text-gray-500">growth</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getActivityIcon(activity.type)}
                <div className="ml-3">
                  <div className="font-medium text-sm text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-600">{activity.user}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Download className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">CSV Export</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Export data in CSV format for Excel</p>
            <Button onClick={() => exportData('csv')} disabled={isLoading} size="sm" className="w-full">
              {isLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">PDF Report</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Generate comprehensive PDF report</p>
            <Button onClick={() => exportData('pdf')} disabled={isLoading} size="sm" className="w-full">
              {isLoading ? 'Generating...' : 'Generate PDF'}
            </Button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">JSON Export</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Export raw data in JSON format</p>
            <Button onClick={() => exportData('json')} disabled={isLoading} size="sm" className="w-full">
              {isLoading ? 'Exporting...' : 'Export JSON'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Peak Performance</span>
            </div>
            <p className="text-sm text-green-700">
              Your booking system is performing 15% better than last month. 
              Consider scaling up to handle increased demand.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Optimization Opportunity</span>
            </div>
            <p className="text-sm text-blue-700">
              Conversion rate increased by 15.7%. Focus on the top-performing 
              venues to maximize revenue potential.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsReporting;
