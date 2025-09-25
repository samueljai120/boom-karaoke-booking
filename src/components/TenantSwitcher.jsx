import React, { useState, useEffect } from 'react';

const TenantSwitcher = ({ currentTenantId, onTenantChange }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (currentTenantId && tenants.length > 0) {
      const tenant = tenants.find(t => t.id === currentTenantId);
      setCurrentTenant(tenant);
    }
  }, [currentTenantId, tenants]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenants');
      const result = await response.json();
      
      if (result.success) {
        setTenants(result.data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSelect = (tenant) => {
    setCurrentTenant(tenant);
    setIsOpen(false);
    if (onTenantChange) {
      onTenantChange(tenant);
    }
    
    // Update tenant context in localStorage for persistence
    localStorage.setItem('currentTenantId', tenant.id);
    localStorage.setItem('currentTenant', JSON.stringify(tenant));
    
    // Reload the page to apply new tenant context
    window.location.reload();
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

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading tenants...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span>{currentTenant ? currentTenant.name : 'Select Tenant'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Switch Tenant</h3>
            <p className="text-xs text-gray-500 mt-1">Select a tenant to switch context</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {tenants.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No tenants found
              </div>
            ) : (
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSelect(tenant)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    currentTenant?.id === tenant.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          tenant.status === 'active' ? 'bg-green-400' : 
                          tenant.status === 'inactive' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tenant.subdomain}.boom-booking.com
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(tenant.plan_type)}`}>
                        {tenant.plan_type}
                      </span>
                      {currentTenant?.id === tenant.id && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Total Tenants: {tenants.length}</span>
                <span>Active: {tenants.filter(t => t.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default TenantSwitcher;
