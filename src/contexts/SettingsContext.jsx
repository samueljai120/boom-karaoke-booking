import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Initialize with localStorage values if available
  const getInitialSettings = () => {
    try {
      const savedSettings = localStorage.getItem('karaoke-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Apply default layout orientation if it's set
        if (parsed.defaultLayoutOrientation) {
          parsed.layoutOrientation = parsed.defaultLayoutOrientation;
        } else {
          // Fallback to horizontal if no default is stored
          parsed.layoutOrientation = 'rooms-y-time-x';
          parsed.defaultLayoutOrientation = 'rooms-y-time-x';
        }
        
        // Force update field labels to new standardized format
        if (parsed.bookingFormFields) {
          parsed.bookingFormFields = {
            ...parsed.bookingFormFields,
            customerName: { ...parsed.bookingFormFields.customerName, label: 'Customer name' },
            phone: { ...parsed.bookingFormFields.phone, label: 'Phone number' },
            email: { ...parsed.bookingFormFields.email, label: 'Email address' },
            partySize: { ...parsed.bookingFormFields.partySize, label: 'Party size' },
            room: { ...parsed.bookingFormFields.room, label: 'Room selection' },
            source: { ...parsed.bookingFormFields.source, label: 'Booking source' },
            timeIn: { ...parsed.bookingFormFields.timeIn, label: 'Start time' },
            timeOut: { ...parsed.bookingFormFields.timeOut, label: 'End time' },
            basePrice: { ...parsed.bookingFormFields.basePrice, label: 'Base price' },
            additionalFees: { ...parsed.bookingFormFields.additionalFees, label: 'Additional fees' },
            totalPrice: { ...parsed.bookingFormFields.totalPrice, label: 'Total price' },
            specialRequests: { ...parsed.bookingFormFields.specialRequests, label: 'Special requests' },
          };
        }
        
        if (parsed.roomFormFields) {
          parsed.roomFormFields = {
            ...parsed.roomFormFields,
            name: { ...parsed.roomFormFields.name, label: 'Room name' },
            type: { ...parsed.roomFormFields.type, label: 'Room type' },
            isBookable: { ...parsed.roomFormFields.isBookable, label: 'Available for booking' },
            sortOrder: { ...parsed.roomFormFields.sortOrder, label: 'Sort order' },
            hourlyRate: { ...parsed.roomFormFields.hourlyRate, label: 'Hourly rate' },
            color: { ...parsed.roomFormFields.color, label: 'Room color' },
          };
        }
        return {
          layoutOrientation: 'rooms-y-time-x',
          defaultLayoutOrientation: 'rooms-y-time-x',
          businessHours: { openHour: 16, closeHour: 23 },
          timezone: 'America/New_York', // Default to Eastern Time
          timeFormat: '12h',
          timeInterval: 15, // Default to 15 minutes
          showBusinessHours: true,
          // Coloring options
          colorByRoomType: true,
          colorByBookingSource: true,
          bookingSourceColors: {
            walkin: '#22c55e', // green
            phone: '#f59e0b', // amber
            email: '#3b82f6', // blue
            message: '#a855f7', // purple
            online: '#ef4444', // red (fallback/other)
          },
          slotSize: 'medium',
          slotWidth: 'medium',
          slotHeight: 'medium',
          // Layout-specific slot settings
          horizontalLayoutSlots: {
            slotWidth: 'medium',
            slotHeight: 'medium',
          },
          verticalLayoutSlots: {
            slotWidth: 'medium',
            slotHeight: 'medium',
          },
          bookingFormFields: {
            customerName: { visible: true, required: true, label: 'Customer name', placeholder: 'Enter customer name', validation: 'required' },
            phone: { visible: true, required: true, label: 'Phone number', placeholder: 'Enter phone number', validation: 'phone' },
            email: { visible: true, required: false, label: 'Email address', placeholder: 'Enter email address', validation: 'email' },
            partySize: { visible: true, required: false, label: 'Party size', placeholder: 'Number of people', validation: 'number' },
            room: { visible: true, required: true, label: 'Room selection', placeholder: 'Select a room', validation: 'required' },
            source: { visible: true, required: false, label: 'Booking source', placeholder: 'How did they book?', validation: 'none' },
            timeIn: { visible: true, required: true, label: 'Start time', placeholder: 'Select start time', validation: 'required' },
            timeOut: { visible: true, required: true, label: 'End time', placeholder: 'Select end time', validation: 'required' },
            status: { visible: true, required: false, label: 'Status', placeholder: 'Booking status', validation: 'none' },
            priority: { visible: true, required: false, label: 'Priority', placeholder: 'Booking priority', validation: 'none' },
            basePrice: { visible: true, required: false, label: 'Base price', placeholder: 'Base price amount', validation: 'currency' },
            additionalFees: { visible: true, required: false, label: 'Additional fees', placeholder: 'Extra charges', validation: 'currency' },
            discount: { visible: true, required: false, label: 'Discount', placeholder: 'Discount amount', validation: 'currency' },
            totalPrice: { visible: true, required: false, label: 'Total price', placeholder: 'Total amount', validation: 'currency' },
            notes: { visible: true, required: false, label: 'Notes', placeholder: 'Additional notes', validation: 'none' },
            specialRequests: { visible: true, required: false, label: 'Special requests', placeholder: 'Special requirements', validation: 'none' },
          },
          customBookingFields: [],
          // Room form fields configuration
          roomFormFields: {
            name: { visible: true, required: true, label: 'Room name', placeholder: 'Enter room name', type: 'text', validation: 'required' },
            capacity: { visible: true, required: true, label: 'Capacity', placeholder: 'Number of people', type: 'number', validation: 'required' },
            type: { visible: true, required: true, label: 'Room type', placeholder: 'Select room type', type: 'select', validation: 'required' },
            category: { visible: true, required: true, label: 'Category', placeholder: 'Select category', type: 'select', validation: 'required' },
            status: { visible: true, required: true, label: 'Status', placeholder: 'Select status', type: 'select', validation: 'required' },
            isBookable: { visible: true, required: false, label: 'Available for booking', placeholder: '', type: 'checkbox', validation: 'none' },
            sortOrder: { visible: true, required: false, label: 'Sort order', placeholder: 'Display order', type: 'number', validation: 'number' },
            hourlyRate: { visible: true, required: false, label: 'Hourly rate', placeholder: 'Price per hour', type: 'number', validation: 'currency' },
            color: { visible: true, required: false, label: 'Room color', placeholder: '', type: 'color', validation: 'none' },
            description: { visible: true, required: false, label: 'Description', placeholder: 'Room description', type: 'textarea', validation: 'none' },
            amenities: { visible: true, required: false, label: 'Amenities', placeholder: 'Add amenities', type: 'text', validation: 'none' },
          },
          customRoomFields: [],
          // Confirmation template settings
          confirmationTemplate: {
            template: '🎤 BOOKING CONFIRMATION\n\n' +
              'Customer: {{customerName}}\n' +
              'Phone: {{phone}}\n' +
              'Email: {{email}}\n' +
              'Date: {{date}}\n' +
              'Time: {{time}}\n' +
              'Duration: {{duration}}\n' +
              'Room: {{roomName}} ({{roomCapacity}} people)\n' +
              'Status: {{status}}\n' +
              'Source: {{source}}\n' +
              'Confirmation Code: {{confirmationCode}}\n' +
              'Total Price: ${{totalPrice}}\n\n' +
              '{{#if notes}}\n' +
              'Notes: {{notes}}\n' +
              '{{/if}}\n\n' +
              '{{#if specialRequests}}\n' +
              'Special Requests: {{specialRequests}}\n' +
              '{{/if}}\n\n' +
              '{{confirmationMessage}}\n\n' +
              'For questions or changes, call us at {{businessPhone}} or email {{businessEmail}}.\n\n' +
              '---\n' +
              '{{businessName}}\n' +
              '{{businessAddress}}\n' +
              '{{businessWebsite}}\n' +
              'Generated on {{generatedDate}}',
            customFields: []
          },
          ...parsed
        };
      }
    } catch (error) {
      // Failed to parse saved settings - error handling removed for clean version
    }
    
    return {
      layoutOrientation: 'rooms-y-time-x',
      defaultLayoutOrientation: 'rooms-y-time-x',
      businessHours: { openHour: 16, closeHour: 23 },
      timezone: 'America/New_York',
      timeFormat: '12h',
      timeInterval: 15, // Default to 15 minutes
      showBusinessHours: true,
      colorByBookingSource: true,
      bookingSourceColors: {
        walkin: '#22c55e',
        phone: '#f59e0b',
        email: '#3b82f6',
        message: '#a855f7',
        online: '#ef4444',
      },
      colorByRoomType: true,
      slotSize: 'medium',
      slotWidth: 'medium',
      slotHeight: 'medium',
      // Layout-specific slot settings
      horizontalLayoutSlots: {
        slotWidth: 'medium',
        slotHeight: 'medium',
      },
      verticalLayoutSlots: {
        slotWidth: 'medium',
        slotHeight: 'medium',
      },
      bookingFormFields: {
        customerName: { visible: true, required: true, label: 'Customer name', placeholder: 'Enter customer name', validation: 'required' },
        phone: { visible: true, required: true, label: 'Phone number', placeholder: 'Enter phone number', validation: 'phone' },
        email: { visible: true, required: false, label: 'Email address', placeholder: 'Enter email address', validation: 'email' },
        partySize: { visible: true, required: false, label: 'Party size', placeholder: 'Number of people', validation: 'number' },
        room: { visible: true, required: true, label: 'Room selection', placeholder: 'Select a room', validation: 'required' },
        source: { visible: true, required: false, label: 'Booking source', placeholder: 'How did they book?', validation: 'none' },
        timeIn: { visible: true, required: true, label: 'Start time', placeholder: 'Select start time', validation: 'required' },
        timeOut: { visible: true, required: true, label: 'End time', placeholder: 'Select end time', validation: 'required' },
        status: { visible: true, required: false, label: 'Status', placeholder: 'Booking status', validation: 'none' },
        priority: { visible: true, required: false, label: 'Priority', placeholder: 'Booking priority', validation: 'none' },
        basePrice: { visible: true, required: false, label: 'Base price', placeholder: 'Base price amount', validation: 'currency' },
        additionalFees: { visible: true, required: false, label: 'Additional fees', placeholder: 'Extra charges', validation: 'currency' },
        discount: { visible: true, required: false, label: 'Discount', placeholder: 'Discount amount', validation: 'currency' },
        totalPrice: { visible: true, required: false, label: 'Total price', placeholder: 'Total amount', validation: 'currency' },
        notes: { visible: true, required: false, label: 'Notes', placeholder: 'Additional notes', validation: 'none' },
        specialRequests: { visible: true, required: false, label: 'Special requests', placeholder: 'Special requirements', validation: 'none' },
      },
      // Confirmation template settings
      confirmationTemplate: {
        template: '🎤 BOOKING CONFIRMATION\n\n' +
          'Customer: {{customerName}}\n' +
          'Phone: {{phone}}\n' +
          'Email: {{email}}\n' +
          'Date: {{date}}\n' +
          'Time: {{time}}\n' +
          'Duration: {{duration}}\n' +
          'Room: {{roomName}} ({{roomCapacity}} people)\n' +
          'Status: {{status}}\n' +
          'Source: {{source}}\n' +
          'Confirmation Code: {{confirmationCode}}\n' +
          'Total Price: ${{totalPrice}}\n\n' +
          '{{#if notes}}\n' +
          'Notes: {{notes}}\n' +
          '{{/if}}\n\n' +
          '{{#if specialRequests}}\n' +
          'Special Requests: {{specialRequests}}\n' +
          '{{/if}}\n\n' +
          '{{confirmationMessage}}\n\n' +
          'For questions or changes, call us at {{businessPhone}} or email {{businessEmail}}.\n\n' +
          '---\n' +
          '{{businessName}}\n' +
          '{{businessAddress}}\n' +
          '{{businessWebsite}}\n' +
          'Generated on {{generatedDate}}',
        customFields: []
      },
    };
  };

  const [settings, setSettings] = useState(getInitialSettings);

  // Settings are now initialized from localStorage on mount

  // Force save updated field labels on first load
  useEffect(() => {
    const savedSettings = localStorage.getItem('karaoke-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Check if we need to update field labels
      if (parsed.bookingFormFields?.customerName?.label === 'Customer Name') {
        // Update and save the settings with new labels
        const updatedSettings = {
          ...parsed,
          bookingFormFields: {
            ...parsed.bookingFormFields,
            customerName: { ...parsed.bookingFormFields.customerName, label: 'Customer name' },
            phone: { ...parsed.bookingFormFields.phone, label: 'Phone number' },
            email: { ...parsed.bookingFormFields.email, label: 'Email address' },
            partySize: { ...parsed.bookingFormFields.partySize, label: 'Party size' },
            room: { ...parsed.bookingFormFields.room, label: 'Room selection' },
            source: { ...parsed.bookingFormFields.source, label: 'Booking source' },
            timeIn: { ...parsed.bookingFormFields.timeIn, label: 'Start time' },
            timeOut: { ...parsed.bookingFormFields.timeOut, label: 'End time' },
            basePrice: { ...parsed.bookingFormFields.basePrice, label: 'Base price' },
            additionalFees: { ...parsed.bookingFormFields.additionalFees, label: 'Additional fees' },
            totalPrice: { ...parsed.bookingFormFields.totalPrice, label: 'Total price' },
            specialRequests: { ...parsed.bookingFormFields.specialRequests, label: 'Special requests' },
          },
          roomFormFields: {
            ...parsed.roomFormFields,
            name: { ...parsed.roomFormFields.name, label: 'Room name' },
            type: { ...parsed.roomFormFields.type, label: 'Room type' },
            isBookable: { ...parsed.roomFormFields.isBookable, label: 'Available for booking' },
            sortOrder: { ...parsed.roomFormFields.sortOrder, label: 'Sort order' },
            hourlyRate: { ...parsed.roomFormFields.hourlyRate, label: 'Hourly rate' },
            color: { ...parsed.roomFormFields.color, label: 'Room color' },
          }
        };
        localStorage.setItem('karaoke-settings', JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('karaoke-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      
      // If updating default layout orientation, also apply it to current layout
      if (key === 'defaultLayoutOrientation') {
        newSettings.layoutOrientation = value;
      }
      
      return newSettings;
    });
  };

  const toggleLayoutOrientation = () => {
    setSettings(prev => ({
      ...prev,
      layoutOrientation: prev.layoutOrientation === 'rooms-x-time-y' 
        ? 'rooms-y-time-x' 
        : 'rooms-x-time-y'
    }));
  };

  const updateBookingFormField = (fieldName, property, value) => {
    setSettings(prev => ({
      ...prev,
      bookingFormFields: {
        ...prev.bookingFormFields,
        [fieldName]: {
          ...prev.bookingFormFields[fieldName],
          [property]: value
        }
      }
    }));
  };

  const addCustomBookingField = (field) => {
    setSettings(prev => ({
      ...prev,
      customBookingFields: [...prev.customBookingFields, field]
    }));
  };

  const updateCustomBookingField = (fieldId, property, value) => {
    setSettings(prev => ({
      ...prev,
      customBookingFields: prev.customBookingFields.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    }));
  };

  const removeCustomBookingField = (fieldId) => {
    setSettings(prev => ({
      ...prev,
      customBookingFields: prev.customBookingFields.filter(field => field.id !== fieldId)
    }));
  };

  const updateRoomFormField = (fieldName, property, value) => {
    setSettings(prev => ({
      ...prev,
      roomFormFields: {
        ...prev.roomFormFields,
        [fieldName]: {
          ...prev.roomFormFields[fieldName],
          [property]: value
        }
      }
    }));
  };

  const addCustomRoomField = (field) => {
    setSettings(prev => ({
      ...prev,
      customRoomFields: [...prev.customRoomFields, field]
    }));
  };

  const updateCustomRoomField = (fieldId, property, value) => {
    setSettings(prev => ({
      ...prev,
      customRoomFields: prev.customRoomFields.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    }));
  };

  const removeCustomRoomField = (fieldId) => {
    setSettings(prev => ({
      ...prev,
      customRoomFields: prev.customRoomFields.filter(field => field.id !== fieldId)
    }));
  };

  const updateLayoutSlotSetting = (layoutType, slotType, value) => {
    setSettings(prev => ({
      ...prev,
      [`${layoutType}LayoutSlots`]: {
        ...prev[`${layoutType}LayoutSlots`],
        [slotType]: value
      }
    }));
  };

  const updateBookingSourceColor = (sourceKey, color) => {
    setSettings(prev => ({
      ...prev,
      bookingSourceColors: {
        ...prev.bookingSourceColors,
        [sourceKey]: color
      }
    }));
  };

  const updateConfirmationTemplate = (template) => {
    setSettings(prev => ({
      ...prev,
      confirmationTemplate: {
        ...prev.confirmationTemplate,
        template
      }
    }));
  };

  const updateConfirmationCustomFields = (customFields) => {
    setSettings(prev => ({
      ...prev,
      confirmationTemplate: {
        ...prev.confirmationTemplate,
        customFields
      }
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      layoutOrientation: 'rooms-y-time-x',
      defaultLayoutOrientation: 'rooms-y-time-x',
      businessHours: { openHour: 16, closeHour: 23 },
      timezone: 'America/New_York',
      timeFormat: '12h',
      timeInterval: 15, // Default to 15 minutes
      showBusinessHours: true,
      colorByRoomType: true,
      slotSize: 'medium',
      slotWidth: 'medium',
      slotHeight: 'medium',
      // Layout-specific slot settings
      horizontalLayoutSlots: {
        slotWidth: 'medium',
        slotHeight: 'medium',
      },
      verticalLayoutSlots: {
        slotWidth: 'medium',
        slotHeight: 'medium',
      },
      bookingFormFields: {
        customerName: { visible: true, required: true, label: 'Customer name', placeholder: 'Enter customer name', validation: 'required' },
        phone: { visible: true, required: true, label: 'Phone number', placeholder: 'Enter phone number', validation: 'phone' },
        email: { visible: true, required: false, label: 'Email address', placeholder: 'Enter email address', validation: 'email' },
        partySize: { visible: true, required: false, label: 'Party size', placeholder: 'Number of people', validation: 'number' },
        room: { visible: true, required: true, label: 'Room selection', placeholder: 'Select a room', validation: 'required' },
        source: { visible: true, required: false, label: 'Booking source', placeholder: 'How did they book?', validation: 'none' },
        timeIn: { visible: true, required: true, label: 'Start time', placeholder: 'Select start time', validation: 'required' },
        timeOut: { visible: true, required: true, label: 'End time', placeholder: 'Select end time', validation: 'required' },
        status: { visible: true, required: false, label: 'Status', placeholder: 'Booking status', validation: 'none' },
        priority: { visible: true, required: false, label: 'Priority', placeholder: 'Booking priority', validation: 'none' },
        basePrice: { visible: true, required: false, label: 'Base price', placeholder: 'Base price amount', validation: 'currency' },
        additionalFees: { visible: true, required: false, label: 'Additional fees', placeholder: 'Extra charges', validation: 'currency' },
        discount: { visible: true, required: false, label: 'Discount', placeholder: 'Discount amount', validation: 'currency' },
        totalPrice: { visible: true, required: false, label: 'Total price', placeholder: 'Total amount', validation: 'currency' },
        notes: { visible: true, required: false, label: 'Notes', placeholder: 'Additional notes', validation: 'none' },
        specialRequests: { visible: true, required: false, label: 'Special requests', placeholder: 'Special requirements', validation: 'none' },
      },
      // Room form fields configuration
      roomFormFields: {
        name: { visible: true, required: true, label: 'Room name', placeholder: 'Enter room name', type: 'text', validation: 'required' },
        capacity: { visible: true, required: true, label: 'Capacity', placeholder: 'Number of people', type: 'number', validation: 'required' },
        type: { visible: true, required: true, label: 'Room type', placeholder: 'Select room type', type: 'select', validation: 'required' },
        category: { visible: true, required: true, label: 'Category', placeholder: 'Select category', type: 'select', validation: 'required' },
        status: { visible: true, required: true, label: 'Status', placeholder: 'Select status', type: 'select', validation: 'required' },
        isBookable: { visible: true, required: false, label: 'Available for booking', placeholder: '', type: 'checkbox', validation: 'none' },
        sortOrder: { visible: true, required: false, label: 'Sort order', placeholder: 'Display order', type: 'number', validation: 'number' },
        hourlyRate: { visible: true, required: false, label: 'Hourly rate', placeholder: 'Price per hour', type: 'number', validation: 'currency' },
        color: { visible: true, required: false, label: 'Room color', placeholder: '', type: 'color', validation: 'none' },
        description: { visible: true, required: false, label: 'Description', placeholder: 'Room description', type: 'textarea', validation: 'none' },
        amenities: { visible: true, required: false, label: 'Amenities', placeholder: 'Add amenities', type: 'text', validation: 'none' },
      },
      customRoomFields: [],
      // Confirmation template settings
      confirmationTemplate: {
        template: '🎤 BOOKING CONFIRMATION\n\n' +
          'Customer: {{customerName}}\n' +
          'Phone: {{phone}}\n' +
          'Email: {{email}}\n' +
          'Date: {{date}}\n' +
          'Time: {{time}}\n' +
          'Duration: {{duration}}\n' +
          'Room: {{roomName}} ({{roomCapacity}} people)\n' +
          'Status: {{status}}\n' +
          'Source: {{source}}\n' +
          'Confirmation Code: {{confirmationCode}}\n' +
          'Total Price: ${{totalPrice}}\n\n' +
          '{{#if notes}}\n' +
          'Notes: {{notes}}\n' +
          '{{/if}}\n\n' +
          '{{#if specialRequests}}\n' +
          'Special Requests: {{specialRequests}}\n' +
          '{{/if}}\n\n' +
          '{{confirmationMessage}}\n\n' +
          'For questions or changes, call us at {{businessPhone}} or email {{businessEmail}}.\n\n' +
          '---\n' +
          '{{businessName}}\n' +
          '{{businessAddress}}\n' +
          '{{businessWebsite}}\n' +
          'Generated on {{generatedDate}}',
        customFields: []
      },
    };
    setSettings(defaultSettings);
  };

  // Save current form field configurations as defaults
  const saveAsDefaultFormFields = () => {
    setSettings(prev => ({
      ...prev,
      defaultBookingFormFields: JSON.parse(JSON.stringify(prev.bookingFormFields)),
      defaultCustomBookingFields: JSON.parse(JSON.stringify(prev.customBookingFields || [])),
      defaultRoomFormFields: JSON.parse(JSON.stringify(prev.roomFormFields || {})),
      defaultCustomRoomFields: JSON.parse(JSON.stringify(prev.customRoomFields || [])),
      formFieldsSavedAt: new Date().toISOString()
    }));
  };

  // Reset form fields to saved defaults
  const resetToDefaultFormFields = () => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      // Reset booking form fields if defaults exist
      if (prev.defaultBookingFormFields) {
        newSettings.bookingFormFields = JSON.parse(JSON.stringify(prev.defaultBookingFormFields));
      }
      
      // Reset custom booking fields if defaults exist
      if (prev.defaultCustomBookingFields) {
        newSettings.customBookingFields = JSON.parse(JSON.stringify(prev.defaultCustomBookingFields));
      }
      
      // Reset room form fields if defaults exist
      if (prev.defaultRoomFormFields) {
        newSettings.roomFormFields = JSON.parse(JSON.stringify(prev.defaultRoomFormFields));
      }
      
      // Reset custom room fields if defaults exist
      if (prev.defaultCustomRoomFields) {
        newSettings.customRoomFields = JSON.parse(JSON.stringify(prev.defaultCustomRoomFields));
      }
      
      return newSettings;
    });
  };

  const value = {
    settings,
    updateSetting,
    toggleLayoutOrientation,
    updateBookingFormField,
    addCustomBookingField,
    updateCustomBookingField,
    removeCustomBookingField,
    updateRoomFormField,
    addCustomRoomField,
    updateCustomRoomField,
    removeCustomRoomField,
    updateLayoutSlotSetting,
    updateBookingSourceColor,
    updateConfirmationTemplate,
    updateConfirmationCustomFields,
    resetSettings,
    saveAsDefaultFormFields,
    resetToDefaultFormFields,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
