import React, { useState, useEffect } from 'react';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', permissions: {}, expires_in_days: null });
  const [createdKey, setCreatedKey] = useState(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      const result = await response.json();
      
      if (result.success) {
        setApiKeys(result.data);
      } else {
        setError(result.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      setError('Error fetching API keys: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCreatedKey(result.data);
        setShowCreateForm(false);
        setNewKey({ name: '', permissions: {}, expires_in_days: null });
        fetchApiKeys();
      } else {
        setError(result.error || 'Failed to create API key');
      }
    } catch (err) {
      setError('Error creating API key: ' + err.message);
    }
  };

  const deleteApiKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchApiKeys();
      } else {
        setError(result.error || 'Failed to delete API key');
      }
    } catch (err) {
      setError('Error deleting API key: ' + err.message);
    }
  };

  const toggleApiKeyStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchApiKeys();
      } else {
        setError(result.error || 'Failed to update API key');
      }
    } catch (err) {
      setError('Error updating API key: ' + err.message);
    }
  };

  const regenerateApiKey = async (id) => {
    if (!window.confirm('Are you sure you want to regenerate this API key? The old key will no longer work.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}/regenerate`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCreatedKey(result.data);
        fetchApiKeys();
      } else {
        setError(result.error || 'Failed to regenerate API key');
      }
    } catch (err) {
      setError('Error regenerating API key: ' + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatUsageCount = (count) => {
    return new Intl.NumberFormat('en-US').format(count);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
            <p className="mt-2 text-gray-600">Manage your API keys for programmatic access</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New API Key
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Created Key Display */}
      {createdKey && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">API Key Created Successfully!</h3>
              <p className="text-sm mt-1">Please copy and save this key securely. It will not be shown again.</p>
              <div className="mt-2 p-2 bg-white rounded border font-mono text-sm">
                {createdKey.api_key}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(createdKey.api_key)}
              className="ml-4 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New API Key</h2>
          
          <form onSubmit={createApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key Name *
              </label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="My API Key"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In (Days)
              </label>
              <input
                type="number"
                value={newKey.expires_in_days || ''}
                onChange={(e) => setNewKey({ ...newKey, expires_in_days: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty for no expiration"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create API Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your API Keys</h2>
        </div>

        {apiKeys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{key.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{key.masked_key}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatUsageCount(key.usage_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleApiKeyStatus(key.id, key.is_active)}
                          className={`px-2 py-1 rounded text-xs ${
                            key.is_active
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {key.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => regenerateApiKey(key.id)}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={() => deleteApiKey(key.id)}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No API keys created yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Create your first API key
            </button>
          </div>
        )}
      </div>

      {/* Usage Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How to Use API Keys</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>Include your API key in the Authorization header of your requests:</p>
          <div className="bg-white p-3 rounded border font-mono text-xs">
            Authorization: Bearer your_api_key_here
          </div>
          <p>Example with curl:</p>
          <div className="bg-white p-3 rounded border font-mono text-xs">
            curl -H "Authorization: Bearer your_api_key_here" https://your-domain.com/api/rooms
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
