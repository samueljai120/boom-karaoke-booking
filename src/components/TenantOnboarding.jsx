import React, { useState } from 'react';

const TenantOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    subdomain: '',
    domain: '',
    plan_type: 'basic',
    
    // Step 2: Business Info
    business_type: 'karaoke',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // Step 3: Rooms Setup
    rooms: [
      { name: 'Room A', capacity: 4, category: 'Standard', price_per_hour: 25 },
      { name: 'Room B', capacity: 6, category: 'Premium', price_per_hour: 35 },
      { name: 'Room C', capacity: 8, category: 'VIP', price_per_hour: 50 }
    ],
    
    // Step 4: Business Hours
    business_hours: {
      monday: { open: '10:00', close: '22:00', is_closed: false },
      tuesday: { open: '10:00', close: '22:00', is_closed: false },
      wednesday: { open: '10:00', close: '22:00', is_closed: false },
      thursday: { open: '10:00', close: '22:00', is_closed: false },
      friday: { open: '10:00', close: '23:00', is_closed: false },
      saturday: { open: '10:00', close: '23:00', is_closed: false },
      sunday: { open: '10:00', close: '22:00', is_closed: false }
    },
    
    // Step 5: Settings
    settings: {
      app_name: '',
      booking_advance_days: 30,
      booking_min_duration: 60,
      booking_max_duration: 480
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...formData.rooms];
    newRooms[index][field] = value;
    setFormData(prev => ({
      ...prev,
      rooms: newRooms
    }));
  };

  const handleBusinessHourChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create tenant
      const tenantResponse = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          subdomain: formData.subdomain,
          domain: formData.domain,
          plan_type: formData.plan_type
        })
      });

      const tenantResult = await tenantResponse.json();
      
      if (!tenantResult.success) {
        throw new Error(tenantResult.error || 'Failed to create tenant');
      }

      const tenantId = tenantResult.data.id;

      // Create rooms
      for (const room of formData.rooms) {
        await fetch(`/api/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...room,
            tenant_id: tenantId
          })
        });
      }

      // Update business hours
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const hours = formData.business_hours[day];
        
        await fetch(`/api/business-hours/${i}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            open_time: hours.open,
            close_time: hours.close,
            is_closed: hours.is_closed,
            tenant_id: tenantId
          })
        });
      }

      // Update settings
      const settingsToUpdate = {
        ...formData.settings,
        app_name: formData.name,
        timezone: formData.timezone,
        currency: formData.currency
      };

      for (const [key, value] of Object.entries(settingsToUpdate)) {
        await fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: value,
            tenant_id: tenantId
          })
        });
      }

      if (onComplete) {
        onComplete(tenantResult.data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Boom Booking!</h2>
        <p className="text-gray-600">Let's set up your venue management system in just a few steps.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Venue Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="My Awesome Karaoke Venue"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subdomain *
        </label>
        <div className="flex">
          <input
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="myvenue"
            required
          />
          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
            .boom-booking.com
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your customers will access your booking system at {formData.subdomain || 'myvenue'}.boom-booking.com
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Type
        </label>
        <select
          value={formData.plan_type}
          onChange={(e) => handleInputChange('plan_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="free">Free - 1 room, 50 bookings/month</option>
          <option value="basic">Basic - 5 rooms, 500 bookings/month</option>
          <option value="pro">Pro - 20 rooms, 2,000 bookings/month</option>
          <option value="business">Business - Unlimited rooms and bookings</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your business to customize your experience.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Type
        </label>
        <select
          value={formData.business_type}
          onChange={(e) => handleInputChange('business_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="karaoke">Karaoke Venue</option>
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="event_space">Event Space</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Setup</h2>
        <p className="text-gray-600">Configure your rooms with capacity and pricing.</p>
      </div>

      {formData.rooms.map((room, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Room {String.fromCharCode(65 + index)}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={room.name}
                onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={room.capacity}
                onChange={(e) => handleRoomChange(index, 'capacity', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={room.category}
                onChange={(e) => handleRoomChange(index, 'category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price/Hour ({formData.currency})</label>
              <input
                type="number"
                value={room.price_per_hour}
                onChange={(e) => handleRoomChange(index, 'price_per_hour', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Hours</h2>
        <p className="text-gray-600">Set your operating hours for each day of the week.</p>
      </div>

      {Object.entries(formData.business_hours).map(([day, hours]) => (
        <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-20">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {day}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!hours.is_closed}
              onChange={(e) => handleBusinessHourChange(day, 'is_closed', !e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Open</span>
          </div>
          {!hours.is_closed && (
            <>
              <div>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleBusinessHourChange(day, 'open', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleBusinessHourChange(day, 'close', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Settings</h2>
        <p className="text-gray-600">Configure your booking preferences and limits.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking Advance Days
          </label>
          <input
            type="number"
            value={formData.settings.booking_advance_days}
            onChange={(e) => handleInputChange('settings', {
              ...formData.settings,
              booking_advance_days: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="365"
          />
          <p className="text-xs text-gray-500 mt-1">How many days in advance can customers book?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.settings.booking_min_duration}
            onChange={(e) => handleInputChange('settings', {
              ...formData.settings,
              booking_min_duration: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="15"
            step="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.settings.booking_max_duration}
            onChange={(e) => handleInputChange('settings', {
              ...formData.settings,
              booking_max_duration: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="60"
            step="30"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 5</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantOnboarding;
