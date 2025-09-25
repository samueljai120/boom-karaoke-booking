import React, { useState, useEffect } from 'react';

const BillingDashboard = () => {
  const [billingData, setBillingData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBillingData();
    fetchAlerts();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing');
      const result = await response.json();
      
      if (result.success) {
        setBillingData(result.data);
      } else {
        setError(result.error || 'Failed to fetch billing data');
      }
    } catch (err) {
      setError('Error fetching billing data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/billing/alerts');
      const result = await response.json();
      
      if (result.success) {
        setAlerts(result.data.alerts);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getUsagePercentage = (current, limit) => {
    return limit > 0 ? Math.round((current / limit) * 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No billing data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor your usage and billing information</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {alert.type === 'error' ? (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Plan Type</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{billingData.tenant.plan_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingData.billing.plan.base_price)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total This Month</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingData.billing.total_amount)}</p>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bookings Usage */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
            <span className="text-sm text-gray-500">
              {formatNumber(billingData.usage.bookings.count)} / {formatNumber(billingData.usage.bookings.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.bookings.count, billingData.usage.bookings.limit))}`}
              style={{ width: `${Math.min(getUsagePercentage(billingData.usage.bookings.count, billingData.usage.bookings.limit), 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {getUsagePercentage(billingData.usage.bookings.count, billingData.usage.bookings.limit)}% of limit used
          </p>
        </div>

        {/* Rooms Usage */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
            <span className="text-sm text-gray-500">
              {formatNumber(billingData.usage.rooms.count)} / {formatNumber(billingData.usage.rooms.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.rooms.count, billingData.usage.rooms.limit))}`}
              style={{ width: `${Math.min(getUsagePercentage(billingData.usage.rooms.count, billingData.usage.rooms.limit), 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {getUsagePercentage(billingData.usage.rooms.count, billingData.usage.rooms.limit)}% of limit used
          </p>
        </div>

        {/* API Calls Usage */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">API Calls</h3>
            <span className="text-sm text-gray-500">
              {formatNumber(billingData.usage.api_calls.count)} / {formatNumber(billingData.usage.api_calls.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.api_calls.count, billingData.usage.api_calls.limit))}`}
              style={{ width: `${Math.min(getUsagePercentage(billingData.usage.api_calls.count, billingData.usage.api_calls.limit), 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {getUsagePercentage(billingData.usage.api_calls.count, billingData.usage.api_calls.limit)}% of limit used
          </p>
        </div>
      </div>

      {/* Billing Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Details</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Plan ({billingData.billing.plan.type})</span>
            <span className="font-medium">{formatCurrency(billingData.billing.plan.base_price)}</span>
          </div>
          
          {billingData.billing.overage_charges.total > 0 && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Overage Charges</h4>
                {billingData.billing.overages.bookings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Extra Bookings ({billingData.billing.overages.bookings})</span>
                    <span>{formatCurrency(billingData.billing.overage_charges.bookings)}</span>
                  </div>
                )}
                {billingData.billing.overages.rooms > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Extra Rooms ({billingData.billing.overages.rooms})</span>
                    <span>{formatCurrency(billingData.billing.overage_charges.rooms)}</span>
                  </div>
                )}
                {billingData.billing.overages.api_calls > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Extra API Calls ({formatNumber(billingData.billing.overages.api_calls)})</span>
                    <span>{formatCurrency(billingData.billing.overage_charges.api_calls)}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-medium text-gray-900">Overage Total</span>
                <span className="font-medium">{formatCurrency(billingData.billing.overage_charges.total)}</span>
              </div>
            </>
          )}
          
          <div className="border-t pt-4 flex justify-between text-lg font-semibold">
            <span>Total Amount</span>
            <span>{formatCurrency(billingData.billing.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
        
        {billingData.payment_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingData.payment_history.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.description || 'Monthly subscription'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No payment history available</p>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;
