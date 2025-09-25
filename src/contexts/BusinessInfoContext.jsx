import React, { createContext, useContext, useState, useEffect } from 'react';

const BusinessInfoContext = createContext();

export const useBusinessInfo = () => {
  const context = useContext(BusinessInfoContext);
  if (!context) {
    throw new Error('useBusinessInfo must be used within a BusinessInfoProvider');
  }
  return context;
};

export const BusinessInfoProvider = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Boom Karaoke',
    phone: '+1 (555) 123-4567',
    email: 'info@boomkaraoke.com',
    address: '123 Music Street, City, State 12345',
    website: 'www.boomkaraoke.com',
    hours: 'Mon-Sun: 6:00 PM - 2:00 AM',
    confirmationMessage: 'Thank you for choosing our karaoke service! Please arrive 10 minutes before your scheduled time.',
  });

  // Load business info from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('businessInfo');
    if (saved) {
      try {
        setBusinessInfo(JSON.parse(saved));
      } catch (error) {
        // Failed to load business info - error handling removed for clean version
      }
    }
  }, []);

  // Save business info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
  }, [businessInfo]);

  const updateBusinessInfo = (updates) => {
    setBusinessInfo(prev => ({ ...prev, ...updates }));
  };

  const resetBusinessInfo = () => {
    setBusinessInfo({
      name: 'Boom Karaoke',
      phone: '+1 (555) 123-4567',
      email: 'info@boomkaraoke.com',
      address: '123 Music Street, City, State 12345',
      website: 'www.boomkaraoke.com',
      hours: 'Mon-Sun: 6:00 PM - 2:00 AM',
      confirmationMessage: 'Thank you for choosing our karaoke service! Please arrive 10 minutes before your scheduled time.',
    });
  };

  return (
    <BusinessInfoContext.Provider value={{
      businessInfo,
      updateBusinessInfo,
      resetBusinessInfo,
    }}>
      {children}
    </BusinessInfoContext.Provider>
  );
};

export default BusinessInfoContext;
