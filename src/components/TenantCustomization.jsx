import React, { useState, useEffect } from 'react';

const TenantCustomization = () => {
  const [settings, setSettings] = useState({
    branding: {
      logo_url: '',
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B'
    },
    customization: {
      app_name: '',
      welcome_message: '',
      footer_text: '',
      contact_email: '',
      contact_phone: ''
    },
    features: {
      enable_reviews: true,
      enable_notifications: true,
      enable_waitlist: false,
      enable_recurring_bookings: false,
      require_phone_verification: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        // Merge with default settings
        setSettings(prev => ({
          ...prev,
          branding: { ...prev.branding, ...result.data.branding },
          customization: { ...prev.customization, ...result.data.customization },
          features: { ...prev.features, ...result.data.features }
        }));
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Save branding settings
      for (const [key, value] of Object.entries(settings.branding)) {
        await fetch(`/api/settings/branding.${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: value })
        });
      }

      // Save customization settings
      for (const [key, value] of Object.entries(settings.customization)) {
        await fetch(`/api/settings/customization.${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: value })
        });
      }

      // Save feature settings
      for (const [key, value] of Object.entries(settings.features)) {
        await fetch(`/api/settings/features.${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: value })
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const previewStyle = {
    '--primary-color': settings.branding.primary_color,
    '--secondary-color': settings.branding.secondary_color,
    '--accent-color': settings.branding.accent_color
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customization</h1>
        <p className="mt-2 text-gray-600">Customize your booking platform's appearance and features</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-8">
          {/* Branding */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={settings.branding.logo_url}
                  onChange={(e) => handleInputChange('branding', 'logo_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.branding.primary_color}
                    onChange={(e) => handleInputChange('branding', 'primary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.primary_color}
                    onChange={(e) => handleInputChange('branding', 'primary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.branding.secondary_color}
                    onChange={(e) => handleInputChange('branding', 'secondary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.secondary_color}
                    onChange={(e) => handleInputChange('branding', 'secondary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.branding.accent_color}
                    onChange={(e) => handleInputChange('branding', 'accent_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.accent_color}
                    onChange={(e) => handleInputChange('branding', 'accent_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={settings.customization.app_name}
                  onChange={(e) => handleInputChange('customization', 'app_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Venue Booking"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  value={settings.customization.welcome_message}
                  onChange={(e) => handleInputChange('customization', 'welcome_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Welcome to our booking system!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.customization.contact_email}
                  onChange={(e) => handleInputChange('customization', 'contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@myvenue.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.customization.contact_phone}
                  onChange={(e) => handleInputChange('customization', 'contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
            
            <div className="space-y-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="text-xs text-gray-500">
                      {getFeatureDescription(key)}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange('features', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          
          <div className="border rounded-lg p-4" style={previewStyle}>
            {/* Header Preview */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              {settings.branding.logo_url && (
                <img
                  src={settings.branding.logo_url}
                  alt="Logo"
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <h1 className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
                {settings.customization.app_name || 'My Venue Booking'}
              </h1>
            </div>

            {/* Welcome Message Preview */}
            {settings.customization.welcome_message && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>
                <p className="text-sm">{settings.customization.welcome_message}</p>
              </div>
            )}

            {/* Button Preview */}
            <div className="space-y-3">
              <button
                className="w-full py-2 px-4 rounded-lg text-white font-medium"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Book Now
              </button>
              <button
                className="w-full py-2 px-4 rounded-lg border-2 font-medium"
                style={{ 
                  borderColor: 'var(--accent-color)', 
                  color: 'var(--accent-color)' 
                }}
              >
                View Availability
              </button>
            </div>

            {/* Contact Info Preview */}
            {(settings.customization.contact_email || settings.customization.contact_phone) && (
              <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                <p>Contact us:</p>
                {settings.customization.contact_email && (
                  <p>{settings.customization.contact_email}</p>
                )}
                {settings.customization.contact_phone && (
                  <p>{settings.customization.contact_phone}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getFeatureDescription(feature) {
  const descriptions = {
    enable_reviews: 'Allow customers to leave reviews after their booking',
    enable_notifications: 'Send email and SMS notifications for bookings',
    enable_waitlist: 'Allow customers to join a waitlist when rooms are full',
    enable_recurring_bookings: 'Allow customers to book recurring time slots',
    require_phone_verification: 'Require phone number verification for bookings'
  };
  
  return descriptions[feature] || '';
}

export default TenantCustomization;
