import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AIAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forecast');
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchAIInsights();
  }, [timeframe]);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setInsights(result.data);
      } else {
        throw new Error('Failed to fetch AI insights');
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = () => {
    fetchAIInsights();
    toast.success('AI insights refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading AI insights...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No AI insights available</p>
        <button
          onClick={refreshInsights}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'forecast', label: 'Demand Forecast', icon: '📈' },
    { id: 'pricing', label: 'Pricing Optimization', icon: '💰' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Powered by artificial intelligence for smarter business decisions</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Next 7 Days</option>
            <option value="30d">Next 30 Days</option>
          </select>
          <button
            onClick={refreshInsights}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Forecast Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {(insights.demand_forecast?.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pricing Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.pricing_optimization?.recommendations_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.pricing_optimization?.expected_revenue_impact?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rooms Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">
                {insights.pricing_optimization?.total_rooms_analyzed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'forecast' && (
          <DemandForecastTab forecast={insights.demand_forecast} />
        )}
        {activeTab === 'pricing' && (
          <PricingOptimizationTab pricing={insights.pricing_optimization} />
        )}
        {activeTab === 'insights' && (
          <AIInsightsTab insights={insights} />
        )}
      </div>
    </div>
  );
};

// Demand Forecast Tab Component
const DemandForecastTab = ({ forecast }) => {
  if (!forecast) return <div className="text-center py-8 text-gray-500">No forecast data available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Demand Forecast</h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Confidence Level</span>
            <span className="text-sm font-medium">{(forecast.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${forecast.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Key Factors:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.factors?.map((factor, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Daily Predictions:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecast.forecast?.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day.day_of_week]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.predicted_bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(day.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pricing Optimization Tab Component
const PricingOptimizationTab = ({ pricing }) => {
  if (!pricing) return <div className="text-center py-8 text-gray-500">No pricing data available</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing Optimization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pricing.total_rooms_analyzed}</div>
            <div className="text-sm text-gray-600">Rooms Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pricing.recommendations_count}</div>
            <div className="text-sm text-gray-600">Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{pricing.expected_revenue_impact?.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Expected Impact</div>
          </div>
        </div>

        {pricing.suggestions?.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Pricing Recommendations:</h4>
            {pricing.suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{suggestion.room_name}</h5>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    suggestion.change_percentage > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {suggestion.change_percentage > 0 ? '+' : ''}{suggestion.change_percentage}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Current Price:</span>
                    <span className="ml-2 font-medium">${suggestion.current_price}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Suggested Price:</span>
                    <span className="ml-2 font-medium">${suggestion.suggested_price}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Reasoning:</strong> {suggestion.reasoning}
                </div>
                <div className="mt-1 text-sm text-blue-600">
                  <strong>Expected Impact:</strong> {suggestion.expected_impact}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No pricing optimizations suggested</p>
            <p className="text-sm">Your current pricing appears to be well-optimized</p>
          </div>
        )}
      </div>
    </div>
  );
};

// AI Insights Tab Component
const AIInsightsTab = ({ insights }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 AI Insights & Recommendations</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Metrics:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Suggestions</div>
                <div className="text-lg font-semibold">{insights.key_metrics?.total_suggestions || 0}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Average Confidence</div>
                <div className="text-lg font-semibold">{((insights.key_metrics?.avg_confidence || 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Revenue Impact</div>
                <div className="text-lg font-semibold">{(insights.key_metrics?.expected_revenue_impact || 0).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI Recommendations:</h4>
            <div className="space-y-2">
              {insights.recommendations?.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 mt-1">💡</span>
                  <span className="text-sm text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Trends Analysis:</h4>
            {insights.demand_forecast?.trends && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Demand Trend</div>
                  <div className={`text-lg font-semibold ${
                    insights.demand_forecast.trends.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insights.demand_forecast.trends.trend > 0 ? '+' : ''}{(insights.demand_forecast.trends.trend * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Pattern Detection</div>
                  <div className="text-lg font-semibold">
                    {Object.keys(insights.demand_forecast.trends.seasonality || {}).length} days analyzed
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;
