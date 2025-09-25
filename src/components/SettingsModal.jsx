import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { useSettings } from '../contexts/SettingsContext';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
import { roomsAPI, bookingsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import CustomSelect from './ui/CustomSelect';
import RoomManagement from './RoomManagement';
import BookingManagement from './BookingManagement';
import BusinessHoursSettings from './BusinessHoursSettings';
import { 
  X, 
  RotateCcw, 
  Layout, 
  Clock, 
  Palette, 
  Calendar,
  Monitor,
  Smartphone,
  Settings as SettingsIcon,
  Home,
  Users,
  BookOpen,
  Globe,
  Search,
  Download,
  Upload,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
  // Always call hooks in the same order
  const { settings, updateSetting, toggleLayoutOrientation, resetSettings } = useSettings();
  const { getBusinessHoursForDay } = useBusinessHours();
  const [activeTab, setActiveTab] = useState('layout');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const tabs = [
    { 
      id: 'layout', 
      label: 'Layout & Appearance', 
      icon: Layout, 
      description: 'Schedule layout, time slots, and visual settings',
      category: 'appearance'
    },
    { 
      id: 'business-hours', 
      label: 'Business Hours', 
      icon: Clock, 
      description: 'Operating hours and time restrictions',
      category: 'business'
    },
    { 
      id: 'rooms', 
      label: 'Room Management', 
      icon: Home, 
      description: 'Room types, capacity, and pricing',
      category: 'business'
    },
    { 
      id: 'bookings', 
      label: 'Booking Management', 
      icon: BookOpen, 
      description: 'Booking rules, validation, and workflow',
      category: 'business'
    },
    { 
      id: 'form', 
      label: 'Form Fields', 
      icon: SettingsIcon, 
      description: 'Customize booking form fields',
      category: 'forms'
    },
    { 
      id: 'room-fields', 
      label: 'Room Fields', 
      icon: Home, 
      description: 'Customize room information fields',
      category: 'forms'
    },
    { 
      id: 'confirmation', 
      label: 'Confirmation Templates', 
      icon: FileText, 
      description: 'Customize booking confirmation messages',
      category: 'forms'
    },
    { 
      id: 'display', 
      label: 'Display & Colors', 
      icon: Palette, 
      description: 'Colors, themes, and visual preferences',
      category: 'appearance'
    },
    { 
      id: 'system', 
      label: 'System Settings', 
      icon: Globe, 
      description: 'Timezone and integrations',
      category: 'system'
    }
  ];

  // Filter tabs based on search query
  const filteredTabs = useMemo(() => {
    if (!searchQuery) return tabs;
    return tabs.filter(tab => 
      tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Group tabs by category
  const groupedTabs = useMemo(() => {
    const groups = {};
    filteredTabs.forEach(tab => {
      if (!groups[tab.category]) {
        groups[tab.category] = [];
      }
      groups[tab.category].push(tab);
    });
    return groups;
  }, [filteredTabs]);

  const categoryLabels = {
    appearance: 'Appearance',
    business: 'Business',
    forms: 'Forms',
    system: 'System'
  };

  // Close on Escape key (attach only when open)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Reset dragging state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDraggingSlider(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isDraggingSlider 
          ? 'bg-black bg-opacity-20' 
          : 'bg-black bg-opacity-50'
      }`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card 
        className={`w-full max-w-6xl max-h-[90vh] relative transition-all duration-300 ${
          isDraggingSlider 
            ? 'bg-white bg-opacity-20 backdrop-blur-sm border-opacity-30' 
            : 'bg-white'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Exit Button - Top Right Corner */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={`absolute top-4 right-4 h-12 w-12 z-10 border border-gray-200 shadow-lg transition-all duration-300 ${
            isDraggingSlider 
              ? 'bg-white bg-opacity-30 hover:bg-gray-100 hover:bg-opacity-50' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <X className="h-8 w-8 font-bold text-gray-700" />
        </Button>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 transition-all duration-300 ${
          isDraggingSlider ? 'opacity-30' : 'opacity-100'
        }`}>
          <div className="flex items-center space-x-4">
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </CardTitle>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
          </div>
          
        </CardHeader>

        <div className={`flex h-[70vh] transition-all duration-300 ${
          isDraggingSlider ? 'opacity-30' : 'opacity-100'
        }`}>
          {/* Sidebar */}
          <div className={`w-80 border-r border-gray-200 flex flex-col transition-all duration-300 ${
            isDraggingSlider ? 'bg-gray-50 bg-opacity-30' : 'bg-gray-50'
          }`}>
            {/* Search - Fixed at top */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>


            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <nav className="p-4 space-y-4">
                {Object.entries(groupedTabs).map(([category, categoryTabs]) => {
                  // Define icons for each category
                  const categoryIcons = {
                    appearance: Layout,
                    business: Clock,
                    forms: SettingsIcon,
                    system: Globe
                  };
                  
                  const Icon = categoryIcons[category] || SettingsIcon;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <button
                        onClick={() => setExpandedSections(prev => ({
                          ...prev,
                          [category]: !prev[category]
                        }))}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span>{categoryLabels[category]}</span>
                        </div>
                        {expandedSections[category] ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                    
                    {expandedSections[category] && (
                      <div className="ml-4 space-y-1">
                        {categoryTabs.map(tab => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeTab === tab.id
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{tab.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{tab.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  );
                })}
                
                {searchQuery && filteredTabs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No settings found for "{searchQuery}"</p>
                  </div>
                )}

                {/* Data Management Section - Bottom of Navigation */}
                <div className="space-y-2">
                  <button
                    onClick={() => setExpandedSections(prev => ({
                      ...prev,
                      dataManagement: !prev.dataManagement
                    }))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4 text-gray-600" />
                      <span>Data Management</span>
                    </div>
                    {expandedSections.dataManagement ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                  
                  {expandedSections.dataManagement && (
                    <div className="ml-4 space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const settingsJson = JSON.stringify(settings, null, 2);
                          const blob = new Blob([settingsJson], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'karaoke-settings.json';
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Settings exported successfully');
                        }}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Settings</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.json';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                try {
                                  const importedSettings = JSON.parse(e.target.result);
                                  // Apply imported settings
                                  Object.keys(importedSettings).forEach(key => {
                                    updateSetting(key, importedSettings[key]);
                                  });
                                  toast.success('Settings imported successfully');
                                } catch (error) {
                                  toast.error('Invalid settings file');
                                }
                              };
                              reader.readAsText(file);
                            }
                          };
                          input.click();
                        }}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Import Settings</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const todayWeekday = today.getDay();
                          const todayBusinessHours = getBusinessHoursForDay(todayWeekday);
                          
                          if (todayBusinessHours.isClosed) {
                            toast.error('Business is closed today. Cannot create example bookings.');
                            return;
                          }
                          
                          const confirmMessage = `This will create 12 sample rooms with bookings for today (${todayBusinessHours.openTime} - ${todayBusinessHours.closeTime}). This action cannot be undone. Continue?`;
                          
                          if (window.confirm(confirmMessage)) {
                            createExampleData(getBusinessHoursForDay);
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Show Example</span>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isDraggingSlider ? 'opacity-30' : 'opacity-100'
          }`}>
            <CardContent className={`p-6 transition-all duration-300 ${
              isDraggingSlider ? 'bg-white bg-opacity-20' : 'bg-white'
            }`}>

              {/* Settings Content */}
              {activeTab === 'layout' && <LayoutSettings currentLayout={settings.layoutOrientation} setIsDraggingSlider={setIsDraggingSlider} />}
              {activeTab === 'business-hours' && <BusinessHoursSettings />}
              {activeTab === 'rooms' && <RoomManagement />}
              {activeTab === 'bookings' && <BookingManagement />}
              {activeTab === 'form' && <BookingFormSettings />}
              {activeTab === 'room-fields' && <RoomFieldsSettings />}
              {activeTab === 'confirmation' && <ConfirmationTemplateSettings />}
              {activeTab === 'display' && <DisplaySettings />}
              {activeTab === 'system' && <SystemSettings />}
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Function to create example data that respects business hours settings
const createExampleData = async (getBusinessHoursForDay) => {
  try {
    toast.loading('Creating example data...', { id: 'example-data' });
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayWeekday = today.getDay();
    
    // Get business hours for today
    const todayBusinessHours = getBusinessHoursForDay(todayWeekday);
    
    // Check if business is closed today
    if (todayBusinessHours.isClosed) {
      toast.error('Business is closed today. Cannot create example bookings.', { id: 'example-data' });
      return;
    }
    
    // Parse business hours
    const [openHour, openMinute] = todayBusinessHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = todayBusinessHours.closeTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    // Calculate available time window (leave some buffer at the end)
    const availableMinutes = closeMinutes - openMinutes - 60; // 1 hour buffer
    if (availableMinutes <= 0) {
      toast.error('Business hours are too short to create example bookings.', { id: 'example-data' });
      return;
    }
    
    // Create 12 sample rooms
    const sampleRooms = [
      { name: 'Karaoke Room 1', capacity: 4, category: 'Standard', type: 'small', color: '#3B82F6', hourlyRate: 25, amenities: ['Microphone', 'TV', 'Sound System'] },
      { name: 'Karaoke Room 2', capacity: 6, category: 'Standard', type: 'medium', color: '#10B981', hourlyRate: 30, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting'] },
      { name: 'Karaoke Room 3', capacity: 8, category: 'Premium', type: 'large', color: '#F59E0B', hourlyRate: 40, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar'] },
      { name: 'Karaoke Room 4', capacity: 10, category: 'Premium', type: 'large', color: '#8B5CF6', hourlyRate: 45, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar', 'Dance Floor'] },
      { name: 'Karaoke Room 5', capacity: 12, category: 'VIP', type: 'party', color: '#EF4444', hourlyRate: 60, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar', 'Dance Floor', 'Private Entrance'] },
      { name: 'Karaoke Room 6', capacity: 15, category: 'VIP', type: 'party', color: '#EC4899', hourlyRate: 70, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar', 'Dance Floor', 'Private Entrance', 'Catering'] },
      { name: 'Karaoke Room 7', capacity: 6, category: 'Standard', type: 'medium', color: '#06B6D4', hourlyRate: 35, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting'] },
      { name: 'Karaoke Room 8', capacity: 8, category: 'Premium', type: 'large', color: '#84CC16', hourlyRate: 45, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar'] },
      { name: 'Karaoke Room 9', capacity: 10, category: 'Premium', type: 'large', color: '#F97316', hourlyRate: 50, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar', 'Dance Floor'] },
      { name: 'Karaoke Room 10', capacity: 12, category: 'VIP', type: 'party', color: '#6366F1', hourlyRate: 65, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting', 'Bar', 'Dance Floor', 'Private Entrance'] },
      { name: 'Karaoke Room 11', capacity: 4, category: 'Standard', type: 'small', color: '#14B8A6', hourlyRate: 28, amenities: ['Microphone', 'TV', 'Sound System'] },
      { name: 'Karaoke Room 12', capacity: 6, category: 'Standard', type: 'medium', color: '#A855F7', hourlyRate: 32, amenities: ['Microphone', 'TV', 'Sound System', 'Lighting'] }
    ];
    
    // Create rooms first
    const createdRooms = [];
    for (const roomData of sampleRooms) {
      try {
        const roomResponse = await roomsAPI.create(roomData);
        const room = roomResponse.data?.room || roomResponse.data;
        if (room) {
          createdRooms.push(room);
        }
      } catch (error) {
        console.error('Error creating room:', error);
      }
    }
    
    // Helper function to generate time within business hours
    const generateTimeWithinHours = (startOffsetMinutes, durationMinutes = 120) => {
      const startMinutes = openMinutes + startOffsetMinutes;
      const endMinutes = startMinutes + durationMinutes;
      
      // Ensure we don't exceed business hours
      if (endMinutes >= closeMinutes) {
        const adjustedDuration = closeMinutes - startMinutes - 30; // 30 min buffer
        return {
          startMinutes: startMinutes,
          durationMinutes: Math.max(60, adjustedDuration) // minimum 1 hour
        };
      }
      
      return { startMinutes, durationMinutes };
    };
    
    // Helper function to format time to HH:MM
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    // Generate sample bookings with dynamic times based on business hours
    // Distribute bookings evenly across available time
    const bookingCount = 12;
    const timeInterval = Math.floor(availableMinutes / bookingCount);
    const bookingOffsets = Array.from({ length: bookingCount }, (_, i) => i * timeInterval);
    
    const sampleBookings = [
      { customerName: 'John Smith', phone: '+1234567890', email: 'john@example.com', partySize: 4, source: 'walk_in', status: 'confirmed', notes: 'Birthday celebration', roomIndex: 0 },
      { customerName: 'Sarah Johnson', phone: '+1234567891', email: 'sarah@example.com', partySize: 6, source: 'phone', status: 'confirmed', notes: 'Corporate team building', roomIndex: 1 },
      { customerName: 'Mike Chen', phone: '+1234567892', email: 'mike@example.com', partySize: 8, source: 'online', status: 'confirmed', notes: 'Wedding reception', roomIndex: 2 },
      { customerName: 'Emily Davis', phone: '+1234567893', email: 'emily@example.com', partySize: 10, source: 'walk_in', status: 'confirmed', notes: 'Anniversary party', roomIndex: 3 },
      { customerName: 'David Wilson', phone: '+1234567894', email: 'david@example.com', partySize: 12, source: 'phone', status: 'confirmed', notes: 'Graduation celebration', roomIndex: 4 },
      { customerName: 'Lisa Brown', phone: '+1234567895', email: 'lisa@example.com', partySize: 15, source: 'online', status: 'confirmed', notes: 'Company party', roomIndex: 5 },
      { customerName: 'Robert Taylor', phone: '+1234567896', email: 'robert@example.com', partySize: 6, source: 'walk_in', status: 'confirmed', notes: 'Friend gathering', roomIndex: 6 },
      { customerName: 'Jennifer Garcia', phone: '+1234567897', email: 'jennifer@example.com', partySize: 8, source: 'phone', status: 'confirmed', notes: 'Bachelorette party', roomIndex: 7 },
      { customerName: 'Michael Martinez', phone: '+1234567898', email: 'michael@example.com', partySize: 10, source: 'online', status: 'confirmed', notes: 'Retirement celebration', roomIndex: 8 },
      { customerName: 'Amanda Anderson', phone: '+1234567899', email: 'amanda@example.com', partySize: 12, source: 'walk_in', status: 'confirmed', notes: 'Holiday party', roomIndex: 9 },
      { customerName: 'Christopher Lee', phone: '+1234567800', email: 'christopher@example.com', partySize: 4, source: 'phone', status: 'confirmed', notes: 'Date night', roomIndex: 10 },
      { customerName: 'Jessica White', phone: '+1234567801', email: 'jessica@example.com', partySize: 6, source: 'online', status: 'confirmed', notes: 'Girls night out', roomIndex: 11 }
    ];
    
    // Add dynamic times to each booking
    const bookingsWithTimes = sampleBookings.map((booking, index) => {
      const offset = bookingOffsets[index] || (index * 30);
      const { startMinutes, durationMinutes } = generateTimeWithinHours(offset);
      const endMinutes = startMinutes + durationMinutes;
      
      return {
        ...booking,
        startTime: `${todayStr}T${formatTime(startMinutes)}:00`,
        endTime: `${todayStr}T${formatTime(endMinutes)}:00`
      };
    });
    
    // Create bookings
    for (const bookingData of bookingsWithTimes) {
      if (createdRooms[bookingData.roomIndex]) {
        try {
          const roomId = createdRooms[bookingData.roomIndex]._id || createdRooms[bookingData.roomIndex].id;
          const bookingPayload = {
            ...bookingData,
            roomId: roomId,
            basePrice: (bookingData.partySize * 5) + Math.floor(Math.random() * 20),
            additionalFees: Math.floor(Math.random() * 10),
            discount: Math.floor(Math.random() * 5),
            totalPrice: 0 // Will be calculated
          };
          
          // Calculate total price
          bookingPayload.totalPrice = bookingPayload.basePrice + bookingPayload.additionalFees - bookingPayload.discount;
          
          await bookingsAPI.create(bookingPayload);
        } catch (error) {
          console.error('Error creating booking:', error);
        }
      }
    }
    
    toast.success(`Example data created successfully! 12 rooms and bookings have been added for today (${todayBusinessHours.openTime} - ${todayBusinessHours.closeTime}).`, { id: 'example-data' });
    
    // Refresh the page after a short delay to show the new data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } catch (error) {
    console.error('Error creating example data:', error);
    toast.error('Failed to create example data. Please try again.', { id: 'example-data' });
  }
};

// Layout Settings Component
const LayoutSettings = ({ currentLayout, setIsDraggingSlider }) => {
  const { settings, updateSetting, toggleLayoutOrientation, updateLayoutSlotSetting, resetSettings } = useSettings();
  const notifyApplied = () => toast.success('Settings applied', { id: 'settings-applied', duration: 900 });

  // Calculate exact slot dimensions matching the actual schedule grid logic
  const getActualSlotDimensions = () => {
    // Use the exact same logic as TraditionalSchedule.jsx
    const widthMap = {
      'tiny': 20,
      'small': 40,
      'medium': 60,
      'large': 80,
      'huge': 100
    };
    const heightMap = {
      'tiny': 50,
      'small': 70,
      'medium': 90,
      'large': 130,
      'huge': 160
    };
    
  // Use custom width if available, otherwise fall back to preset width
  const customWidth = settings?.horizontalLayoutSlots?.customWidth;
  const baseSlotWidth = customWidth || 60;
  
  // Use custom height if available, otherwise fall back to mapped height
  const customHeight = settings?.horizontalLayoutSlots?.customHeight;
  const baseSlotHeight = customHeight || heightMap[settings?.horizontalLayoutSlots?.slotHeight] || 90;
  
  // When using custom width, don't apply scale factor - use the custom value directly
  const widthScaleFactor = customWidth ? 1.0 : (settings?.horizontalLayoutSlots?.widthScaleFactor || 0.4);
  // When using custom height, don't apply scale factor - use the custom value directly
  const heightScaleFactor = customHeight ? 1.0 : (settings?.horizontalLayoutSlots?.heightScaleFactor || 1.0);
    
    // Calculate responsive slot width (exact copy from TraditionalSchedule)
    const getResponsiveSlotWidth = () => {
      const minWidth = Math.max(1, baseSlotWidth * widthScaleFactor);
      
      // Calculate available width for time slots
      const availableWidth = (typeof window !== 'undefined' ? window.innerWidth : 1200) - 200; // Account for room column and padding
      const timeInterval = settings.timeInterval || 15;
      
      // Use actual business hours calculation (same as TraditionalSchedule)
      // Default to 12 hours if business hours not available
      const businessHours = settings.businessHours?.openTime && settings.businessHours?.closeTime ? 
        (() => {
          const [openHour, openMinute] = settings.businessHours.openTime.split(':').map(Number);
          const [closeHour, closeMinute] = settings.businessHours.closeTime.split(':').map(Number);
          
          // Handle late night hours (close time is next day)
          const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
          
          if (isLateNight) {
            // Late night: from open time to close time next day
            return (24 - openHour) + closeHour + ((60 - openMinute + closeMinute) / 60);
          } else {
            // Normal hours: from open time to close time same day
            return closeHour - openHour + ((closeMinute - openMinute) / 60);
          }
        })() : 12; // Fallback to 12 hours
      
      const timeSlotsCount = Math.ceil((businessHours * 60) / timeInterval);
      
      if (timeSlotsCount === 0) {
        return minWidth;
      }
      
      // Calculate optimal width based on available space
      const optimalWidth = availableWidth / timeSlotsCount;
      
      // For tiny/small settings, allow more compression
      // Also consider custom width - use much less compression for custom values
      const compressionThreshold = customWidth ? 
        0.95 : // Use 95% of custom width (much less compression)
        (settings.horizontalLayoutSlots?.slotWidth === 'tiny' ? 0.6 : 
         settings.horizontalLayoutSlots?.slotWidth === 'small' ? 0.7 : 0.8);
      
      // Use the larger of: user preference or calculated optimal width (with compression)
      const finalWidth = Math.max(
        minWidth, 
        Math.round(optimalWidth * compressionThreshold)
      );
      
      return finalWidth;
    };

    // Calculate responsive slot height (exact copy from TraditionalSchedule)
    const getResponsiveSlotHeight = () => {
      // If custom height is set, use it directly (respect user's choice)
      if (customHeight) {
        return Math.max(1, customHeight);
      }
      
      const minHeight = Math.max(1, baseSlotHeight * heightScaleFactor);
      
      // Calculate available height for room rows
      const availableHeight = (typeof window !== 'undefined' ? window.innerHeight : 800) - 200; // Account for headers and padding
      const roomsCount = 4; // Simulate 4 rooms for preview
      
      if (roomsCount === 0) {
        return minHeight;
      }
      
      // Calculate optimal height based on available space
      const optimalHeight = availableHeight / roomsCount;
      
      // For smaller heights, allow more compression
      const compressionThreshold = baseSlotHeight <= 50 ? 0.6 : 
                                  baseSlotHeight <= 80 ? 0.7 : 0.8;
      
      // Use the larger of: user preference or calculated optimal height (with compression)
      const finalHeight = Math.max(
        minHeight, 
        Math.round(optimalHeight * compressionThreshold)
      );
      
      return finalHeight;
    };

    return {
      width: getResponsiveSlotWidth(),
      height: getResponsiveSlotHeight()
    };
  };

  // Get actual dimensions for preview
  const actualDimensions = getActualSlotDimensions();

  return (
    <div className="space-y-8">
      {/* Layout Orientation */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Layout Orientation</h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose how rooms and time are arranged in the schedule view.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vertical */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              settings.layoutOrientation === 'rooms-x-time-y' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => { updateSetting('layoutOrientation', 'rooms-x-time-y'); notifyApplied(); }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Layout className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium">Vertical</h4>
              </div>
              {settings.layoutOrientation === 'rooms-x-time-y' && (
                <Badge className="bg-blue-500">Active</Badge>
              )}
            </div>
          </div>

          {/* Horizontal */}
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              settings.layoutOrientation === 'rooms-y-time-x' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => { updateSetting('layoutOrientation', 'rooms-y-time-x'); notifyApplied(); }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-medium">Horizontal</h4>
              </div>
              {settings.layoutOrientation === 'rooms-y-time-x' && (
                <Badge className="bg-green-500">Active</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Default orientation selector */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Default orientation</label>
          <CustomSelect
            value={settings.defaultLayoutOrientation}
            onChange={(value) => { updateSetting('defaultLayoutOrientation', value); notifyApplied(); }}
            options={[
              { value: 'rooms-x-time-y', label: 'Vertical' },
              { value: 'rooms-y-time-x', label: 'Horizontal' }
            ]}
            placeholder="Select orientation"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { toggleLayoutOrientation(); notifyApplied(); }}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Switch Layout</span>
          </Button>
        </div>
      </div>

      {/* Time Format & Business Hours */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Time Format</h3>
        </div>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="timeFormat"
              value="12h"
              checked={settings.timeFormat === '12h'}
              onChange={(e) => { updateSetting('timeFormat', e.target.value); notifyApplied(); }}
              className="text-blue-600"
            />
            <span>12-hour (9:00 AM)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="timeFormat"
              value="24h"
              checked={settings.timeFormat === '24h'}
              onChange={(e) => { updateSetting('timeFormat', e.target.value); notifyApplied(); }}
              className="text-blue-600"
            />
            <span>24-hour (09:00)</span>
          </label>
        </div>

        {/* Time Interval Setting */}
        <div className="mt-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Time Slot Interval</label>
            <select
              value={settings.timeInterval || 15}
              onChange={(e) => { updateSetting('timeInterval', parseInt(e.target.value)); notifyApplied(); }}
              className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes (1 hour)</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Controls the granularity of time slots in the calendar view
            </div>
          </div>
        </div>

        {/* Layout-Specific Slot Settings - Only show for current layout */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Slot Sizes for Current Layout</label>
          
          {/* Vertical Layout (rooms-x-time-y) - Only show if current layout is vertical */}
          {currentLayout === 'rooms-x-time-y' && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Vertical Layout (Rooms × Time)</h4>
              <p className="text-xs text-gray-600 mb-4">Control the size of time slots in the vertical schedule view. Height affects how much vertical space each time slot takes up.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Time Slot Height</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'tiny', label: 'Tiny', description: '20px', color: 'bg-gray-100' },
                      { value: 'small', label: 'Small', description: '40px', color: 'bg-gray-200' },
                      { value: 'medium', label: 'Medium', description: '60px', color: 'bg-gray-300' },
                      { value: 'large', label: 'Large', description: '80px', color: 'bg-gray-400' },
                      { value: 'huge', label: 'Huge', description: '100px', color: 'bg-gray-500' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { updateLayoutSlotSetting('vertical', 'slotHeight', opt.value); notifyApplied(); }}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          settings.verticalLayoutSlots?.slotHeight === opt.value 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        type="button"
                      >
                        <div className={`w-full h-4 ${opt.color} rounded mb-2`}></div>
                        <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Current Setting Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">Current Setting</h5>
                      <p className="text-xs text-gray-600">
                        {settings.verticalLayoutSlots?.slotHeight === 'tiny' && 'Tiny (48px base)'}
                        {settings.verticalLayoutSlots?.slotHeight === 'small' && 'Small (72px base)'}
                        {settings.verticalLayoutSlots?.slotHeight === 'medium' && 'Medium (96px base)'}
                        {settings.verticalLayoutSlots?.slotHeight === 'large' && 'Large (112px base)'}
                        {settings.verticalLayoutSlots?.slotHeight === 'huge' && 'Huge (128px base)'}
                        {!settings.verticalLayoutSlots?.slotHeight && 'Medium (96px base)'}
                        <span className="text-gray-400 ml-1">• Auto-adjusts to screen</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Auto-adjusts to screen size</div>
                      <div className="text-xs text-gray-400">Changes apply immediately</div>
                    </div>
                  </div>
                </div>


                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 text-blue-600 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-800">Slot Height Tips</h5>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• <strong>Tiny/Small:</strong> More time slots visible, compact view</li>
                        <li>• <strong>Medium:</strong> Balanced view, good for most use cases</li>
                        <li>• <strong>Large/Huge:</strong> Easier to read, better for touch interfaces</li>
                        <li>• Height automatically adjusts based on available screen space</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Horizontal Layout (rooms-y-time-x) - Only show if current layout is horizontal */}
          {currentLayout === 'rooms-y-time-x' && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Horizontal Layout (Time × Rooms)</h4>
              <p className="text-xs text-gray-600 mb-4">Control the size of time slots in the horizontal schedule view. Width affects how much horizontal space each time slot takes up.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Time Slot Width</label>
                  <div className="space-y-4">
                    
                    {/* Custom Width Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Custom Width: {settings.horizontalLayoutSlots?.customWidth || 140}px → Actual: {actualDimensions.width}px</span>
                        <div className="flex space-x-2">
                          <button
                            onMouseDown={() => setIsDraggingSlider(true)}
                            onMouseUp={() => setIsDraggingSlider(false)}
                            onTouchStart={() => setIsDraggingSlider(true)}
                            onTouchEnd={() => setIsDraggingSlider(false)}
                            onClick={() => {
                              const newWidth = Math.max(1, (settings.horizontalLayoutSlots?.customWidth || 140) - 10);
                              updateLayoutSlotSetting('horizontal', 'customWidth', newWidth);
                              notifyApplied();
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                            type="button"
                          >
                            -10px
                          </button>
                          <button
                            onMouseDown={() => setIsDraggingSlider(true)}
                            onMouseUp={() => setIsDraggingSlider(false)}
                            onTouchStart={() => setIsDraggingSlider(true)}
                            onTouchEnd={() => setIsDraggingSlider(false)}
                            onClick={() => {
                              const newWidth = Math.min(200, (settings.horizontalLayoutSlots?.customWidth || 140) + 10);
                              updateLayoutSlotSetting('horizontal', 'customWidth', newWidth);
                              notifyApplied();
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                            type="button"
                          >
                            +10px
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="200"
                          value={settings.horizontalLayoutSlots?.customWidth || 140}
                          onMouseDown={() => setIsDraggingSlider(true)}
                          onMouseUp={() => setIsDraggingSlider(false)}
                          onTouchStart={() => setIsDraggingSlider(true)}
                          onTouchEnd={() => setIsDraggingSlider(false)}
                          onChange={(e) => {
                            updateLayoutSlotSetting('horizontal', 'customWidth', parseInt(e.target.value));
                            notifyApplied();
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${((settings.horizontalLayoutSlots?.customWidth || 140) - 1) / 199 * 100}%, #e5e7eb ${((settings.horizontalLayoutSlots?.customWidth || 140) - 1) / 199 * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        {/* Live value indicator on slider */}
                        <div 
                          className="absolute top-0 transform -translate-x-1/2 pointer-events-none"
                          style={{
                            left: `${((settings.horizontalLayoutSlots?.customWidth || 140) - 1) / 199 * 100}%`,
                            top: '-8px'
                          }}
                        >
                          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap">
                            {actualDimensions.width}px
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>10px</span>
                        <span>200px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Time Slot Height</label>
                  <div className="space-y-4">
                    {/* Height Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Height: {settings.horizontalLayoutSlots?.customHeight || 90}px → Actual: {actualDimensions.height}px</span>
                        <div className="flex space-x-2">
                          <button
                            onMouseDown={() => setIsDraggingSlider(true)}
                            onMouseUp={() => setIsDraggingSlider(false)}
                            onTouchStart={() => setIsDraggingSlider(true)}
                            onTouchEnd={() => setIsDraggingSlider(false)}
                            onClick={() => {
                              const newHeight = Math.max(1, (settings.horizontalLayoutSlots?.customHeight || 90) - 10);
                              updateLayoutSlotSetting('horizontal', 'customHeight', newHeight);
                              notifyApplied();
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                            type="button"
                          >
                            -10px
                          </button>
                          <button
                            onMouseDown={() => setIsDraggingSlider(true)}
                            onMouseUp={() => setIsDraggingSlider(false)}
                            onTouchStart={() => setIsDraggingSlider(true)}
                            onTouchEnd={() => setIsDraggingSlider(false)}
                            onClick={() => {
                              const newHeight = Math.min(200, (settings.horizontalLayoutSlots?.customHeight || 90) + 10);
                              updateLayoutSlotSetting('horizontal', 'customHeight', newHeight);
                              notifyApplied();
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                            type="button"
                          >
                            +10px
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="200"
                          value={settings.horizontalLayoutSlots?.customHeight || 90}
                          onMouseDown={() => setIsDraggingSlider(true)}
                          onMouseUp={() => setIsDraggingSlider(false)}
                          onTouchStart={() => setIsDraggingSlider(true)}
                          onTouchEnd={() => setIsDraggingSlider(false)}
                          onChange={(e) => {
                            updateLayoutSlotSetting('horizontal', 'customHeight', parseInt(e.target.value));
                            notifyApplied();
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((settings.horizontalLayoutSlots?.customHeight || 90) - 1) / 199 * 100}%, #e5e7eb ${((settings.horizontalLayoutSlots?.customHeight || 90) - 1) / 199 * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        {/* Live value indicator on slider */}
                        <div 
                          className="absolute top-0 transform -translate-x-1/2 pointer-events-none"
                          style={{
                            left: `${((settings.horizontalLayoutSlots?.customHeight || 90) - 1) / 199 * 100}%`,
                            top: '-8px'
                          }}
                        >
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap">
                            {actualDimensions.height}px
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>20px</span>
                        <span>200px</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Auto-adjusts to screen size</div>
                      <div className="text-xs text-gray-400">Changes apply immediately</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 text-blue-600 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-blue-800">Horizontal Layout Tips</h5>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• <strong>Width:</strong> Controls how much horizontal space each time slot takes</li>
                        <li>• <strong>Height:</strong> Controls the vertical space for each room row</li>
                        <li>• <strong>Tiny/Small:</strong> More time slots visible, compact view</li>
                        <li>• <strong>Medium:</strong> Balanced view, good for most use cases</li>
                        <li>• <strong>Large/Huge:</strong> Easier to read, better for touch interfaces</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Display Settings Component
const DisplaySettings = () => {
  const { settings, updateSetting, updateBookingSourceColor } = useSettings();
  const notifyApplied = () => toast.success('Settings applied', { id: 'settings-applied', duration: 900 });

  return (
    <div className="space-y-8">
      {/* Display Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Display Options</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Show Business Hours</div>
              <div className="text-sm text-gray-600">Highlight business hours in the schedule</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showBusinessHours}
              onChange={(e) => { updateSetting('showBusinessHours', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Color by Room Type</div>
              <div className="text-sm text-gray-600">Use different colors for Medium/Large/Party rooms</div>
            </div>
            <input
              type="checkbox"
              checked={settings.colorByRoomType}
              onChange={(e) => { updateSetting('colorByRoomType', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Color by Booking Source</div>
              <div className="text-sm text-gray-600">Walk-in, Phone, Email, Message, Online</div>
            </div>
            <input
              type="checkbox"
              checked={settings.colorByBookingSource}
              onChange={(e) => { updateSetting('colorByBookingSource', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Booking Source Colors */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Booking Source Colors</h3>
        </div>
        <p className="text-sm text-gray-600">Customize colors for each booking source.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(settings.bookingSourceColors || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="capitalize text-sm font-medium text-gray-700">{key}</span>
                <span className="w-4 h-4 rounded" style={{ backgroundColor: value }} />
              </div>
              <input
                type="color"
                value={value}
                onChange={(e) => { updateBookingSourceColor(key, e.target.value); notifyApplied(); }}
                className="w-10 h-6 p-0 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Booking Form Settings Component
const BookingFormSettings = () => {
  const { settings, updateBookingFormField, addCustomBookingField, updateCustomBookingField, removeCustomBookingField, saveAsDefaultFormFields, resetToDefaultFormFields } = useSettings();
  const [expandedField, setExpandedField] = useState(null);
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    label: '',
    placeholder: '',
    type: 'text',
    required: false,
    validation: 'none'
  });

  const fieldGroups = [
    {
      title: 'Customer Information',
      fields: [
        { key: 'customerName', label: 'Customer name', required: true },
        { key: 'phone', label: 'Phone number', required: true },
        { key: 'email', label: 'Email address', required: false },
        { key: 'partySize', label: 'Party size', required: false },
      ]
    },
    {
      title: 'Booking Details',
      fields: [
        { key: 'room', label: 'Room selection', required: true },
        { key: 'source', label: 'Booking source', required: false },
        { key: 'timeIn', label: 'Start time', required: true },
        { key: 'timeOut', label: 'End time', required: true },
        { key: 'status', label: 'Status', required: false },
        { key: 'priority', label: 'Priority', required: false },
      ]
    },
    {
      title: 'Pricing',
      fields: [
        { key: 'basePrice', label: 'Base price', required: false },
        { key: 'additionalFees', label: 'Additional fees', required: false },
        { key: 'discount', label: 'Discount', required: false },
        { key: 'totalPrice', label: 'Total price', required: false },
      ]
    },
    {
      title: 'Additional Information',
      fields: [
        { key: 'notes', label: 'Notes', required: false },
        { key: 'specialRequests', label: 'Special requests', required: false },
      ]
    }
  ];

  const validationTypes = [
    { value: 'none', label: 'No validation' },
    { value: 'required', label: 'Required field' },
    { value: 'email', label: 'Email format' },
    { value: 'phone', label: 'Phone number' },
    { value: 'number', label: 'Numeric value' },
    { value: 'currency', label: 'Currency amount' },
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'tel', label: 'Phone Input' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date Picker' },
    { value: 'time', label: 'Time Picker' },
  ];

  const handleAddCustomField = () => {
    if (newCustomField.name && newCustomField.label) {
      const field = {
        id: Date.now().toString(),
        ...newCustomField,
        visible: true
      };
      addCustomBookingField(field);
      setNewCustomField({
        name: '',
        label: '',
        placeholder: '',
        type: 'text',
        required: false,
        validation: 'none'
      });
      setShowAddCustomField(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Booking Form Fields</h3>
        </div>
        <p className="text-sm text-gray-600">
          Configure field visibility, labels, placeholders, and validation rules for booking forms.
        </p>
      </div>

      {fieldGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
            {group.title}
          </h4>
          <div className="space-y-3">
            {group.fields.map((field) => {
              const fieldConfig = settings.bookingFormFields[field.key];
              const isExpanded = expandedField === field.key;
              
              return (
                <div key={field.key} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{fieldConfig?.label || field.label}</span>
                        {fieldConfig?.required && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fieldConfig?.visible || false}
                          onChange={(e) => updateBookingFormField(field.key, 'visible', e.target.checked)}
                          disabled={fieldConfig?.required}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${fieldConfig?.required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedField(isExpanded ? null : field.key)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? 'Collapse' : 'Configure'}
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Field Label</label>
                          <Input
                            value={fieldConfig?.label || ''}
                            onChange={(e) => updateBookingFormField(field.key, 'label', e.target.value)}
                            placeholder="Field label"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Placeholder Text</label>
                          <Input
                            value={fieldConfig?.placeholder || ''}
                            onChange={(e) => updateBookingFormField(field.key, 'placeholder', e.target.value)}
                            placeholder="Placeholder text"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Validation Type</label>
                          <CustomSelect
                            value={fieldConfig?.validation || 'none'}
                            onChange={(value) => updateBookingFormField(field.key, 'validation', value)}
                            options={validationTypes}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={fieldConfig?.required || false}
                              onChange={(e) => updateBookingFormField(field.key, 'required', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Required Field</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
            Custom Fields
          </h4>
          <Button
            onClick={() => setShowAddCustomField(true)}
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        </div>
        
        {settings.customBookingFields?.map((field) => (
          <div key={field.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  Custom
                </Badge>
                {field.required && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomBookingField(field.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {showAddCustomField && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-4">Add Custom Field</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Name (ID)</label>
                <Input
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., specialInstructions"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Label</label>
                <Input
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Special Instructions"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Type</label>
                <CustomSelect
                  value={newCustomField.type}
                  onChange={(value) => setNewCustomField(prev => ({ ...prev, type: value }))}
                  options={fieldTypes}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Validation</label>
                <CustomSelect
                  value={newCustomField.validation}
                  onChange={(value) => setNewCustomField(prev => ({ ...prev, validation: value }))}
                  options={validationTypes}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Placeholder</label>
                <Input
                  value={newCustomField.placeholder}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Placeholder text"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCustomField.required}
                    onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Required Field</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddCustomField(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomField}
                disabled={!newCustomField.name || !newCustomField.label}
              >
                Add Field
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Default Settings Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-800">Save Current Configuration</h4>
            <p className="text-xs text-gray-600 mt-1">
              Save your current form field settings as defaults for future use
              {settings.formFieldsSavedAt && (
                <span className="block mt-1 text-green-600">
                  Last saved: {new Date(settings.formFieldsSavedAt).toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                saveAsDefaultFormFields();
                toast.success('Form field settings saved as defaults');
              }}
              className="flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save as Default</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all form fields to the saved defaults? This will overwrite your current configuration.')) {
                  resetToDefaultFormFields();
                  toast.success('Form fields reset to saved defaults');
                }
              }}
              disabled={!settings.defaultBookingFormFields && !settings.defaultRoomFormFields}
              className="flex items-center space-x-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Required fields cannot be hidden as they are essential for booking creation. 
              Changes will be applied immediately to all booking forms in the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// System Settings Component
const SystemSettings = () => {
  const { settings, updateSetting } = useSettings();
  const notifyApplied = () => toast.success('Settings applied', { id: 'settings-applied', duration: 900 });

  return (
    <div className="space-y-8">
      {/* Timezone Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Timezone & Localization</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
            <CustomSelect
              value={settings.timezone || 'America/New_York'}
              onChange={(value) => { updateSetting('timezone', value); notifyApplied(); }}
              options={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
                { value: 'Europe/Paris', label: 'Paris (CET)' },
                { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
              ]}
              placeholder="Select timezone"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Format</label>
            <CustomSelect
              value={settings.dateFormat || 'MM/DD/YYYY'}
              onChange={(value) => { updateSetting('dateFormat', value); notifyApplied(); }}
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
              ]}
              placeholder="Select date format"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings - HIDDEN */}
      {false && (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-600">Send email alerts for booking changes</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications || false}
              onChange={(e) => { updateSetting('emailNotifications', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sound Alerts</div>
              <div className="text-sm text-gray-600">Play sounds for booking events</div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundAlerts || false}
              onChange={(e) => { updateSetting('soundAlerts', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Desktop Notifications</div>
              <div className="text-sm text-gray-600">Show browser notifications</div>
            </div>
            <input
              type="checkbox"
              checked={settings.desktopNotifications || false}
              onChange={(e) => { updateSetting('desktopNotifications', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>
      )}

      {/* Performance Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Performance</h3>
        </div>
        
        <div className="space-y-3">
          {/* Auto-refresh setting - HIDDEN */}
          {false && (
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-refresh Schedule</div>
              <div className="text-sm text-gray-600">Automatically refresh booking data</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRefresh || false}
              onChange={(e) => { updateSetting('autoRefresh', e.target.checked); notifyApplied(); }}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
          )}
          
          {/* Refresh interval setting - HIDDEN */}
          {false && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Refresh Interval (seconds)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={settings.refreshInterval || 60}
              onChange={(e) => { updateSetting('refreshInterval', parseInt(e.target.value)); notifyApplied(); }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Save className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Backup Settings</h4>
            <p className="text-sm text-gray-600 mb-3">Export your current settings for backup</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const settingsJson = JSON.stringify(settings, null, 2);
                const blob = new Blob([settingsJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `karaoke-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Settings backed up successfully');
              }}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Now
            </Button>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Reset Settings</h4>
            <p className="text-sm text-gray-600 mb-3">Restore all settings to defaults</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
                  resetSettings();
                  toast.success('Settings reset to defaults');
                }
              }}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">System Settings Information:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Timezone affects all time displays and business hours</li>
              <li>• Performance settings optimize the application for your needs</li>
              <li>• Regular backups ensure you don't lose your configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Template Settings Component
const ConfirmationTemplateSettings = () => {
  const { settings, updateConfirmationTemplate, updateConfirmationCustomFields } = useSettings();
  const [template, setTemplate] = useState(settings.confirmationTemplate?.template || '');
  const [customFields, setCustomFields] = useState(settings.confirmationTemplate?.customFields || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Available field placeholders
  const availableFields = [
    { key: 'customerName', label: 'Customer name', type: 'text' },
    { key: 'phone', label: 'Phone number', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'time', label: 'Time', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'text' },
    { key: 'roomName', label: 'Room name', type: 'text' },
    { key: 'roomCapacity', label: 'Room capacity', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'source', label: 'Source', type: 'text' },
    { key: 'confirmationCode', label: 'Confirmation code', type: 'text' },
    { key: 'totalPrice', label: 'Total price', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
    { key: 'specialRequests', label: 'Special requests', type: 'text' },
    { key: 'businessName', label: 'Business name', type: 'text' },
    { key: 'businessPhone', label: 'Business phone', type: 'text' },
    { key: 'businessEmail', label: 'Business email', type: 'text' },
    { key: 'businessAddress', label: 'Business address', type: 'text' },
    { key: 'businessWebsite', label: 'Business website', type: 'text' },
    { key: 'confirmationMessage', label: 'Confirmation message', type: 'text' },
    { key: 'generatedDate', label: 'Generated date', type: 'text' },
  ];

  // Initialize template from settings
  useEffect(() => {
    setTemplate(settings.confirmationTemplate?.template || '');
    setCustomFields(settings.confirmationTemplate?.customFields || []);
  }, [settings.confirmationTemplate]);

  // Track changes
  useEffect(() => {
    const hasChanges = 
      template !== (settings.confirmationTemplate?.template || '') ||
      JSON.stringify(customFields) !== JSON.stringify(settings.confirmationTemplate?.customFields || []);
    setHasUnsavedChanges(hasChanges);
  }, [template, customFields, settings.confirmationTemplate]);

  // Save template
  const handleSaveTemplate = () => {
    updateConfirmationTemplate(template);
    updateConfirmationCustomFields(customFields);
    toast.success('Confirmation template saved successfully!');
    setHasUnsavedChanges(false);
  };

  // Reset to default template
  const handleResetTemplate = () => {
    if (window.confirm('Are you sure you want to reset to the default template? This will overwrite your current template.')) {
      const defaultTemplate = '🎤 BOOKING CONFIRMATION\n\n' +
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
        'Generated on {{generatedDate}}';
      
      setTemplate(defaultTemplate);
      setCustomFields([]);
      toast.success('Template reset to default');
    }
  };

  // Add custom field
  const handleAddCustomField = () => {
    const newField = {
      id: Date.now(),
      key: `custom_${Date.now()}`,
      label: 'Custom Field',
      type: 'text',
      value: ''
    };
    setCustomFields([...customFields, newField]);
  };

  // Update custom field
  const handleUpdateCustomField = (id, field, value) => {
    setCustomFields(prev => 
      prev.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  // Remove custom field
  const handleRemoveCustomField = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Confirmation Template</h3>
        </div>
        <p className="text-sm text-gray-600">
          Customize the confirmation message template that customers receive. Use placeholders like {'{{customerName}}'} to insert booking data.
        </p>
      </div>

      {/* Available Fields */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">Available Fields (click to insert)</h4>
        <div className="flex flex-wrap gap-2">
          {availableFields.map(field => (
            <Button
              key={field.key}
              variant="outline"
              size="sm"
              onClick={() => {
                const newTemplate = template + `{{${field.key}}}`;
                setTemplate(newTemplate);
              }}
              className="text-xs"
            >
              {field.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-800">Custom Fields</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCustomField}
            className="flex items-center space-x-1"
          >
            <FileText className="w-3 h-3" />
            <span>Add Field</span>
          </Button>
        </div>
        <div className="space-y-2">
          {customFields.map(field => (
            <div key={field.id} className="flex items-center space-x-2">
              <Input
                placeholder="Field label"
                value={field.label}
                onChange={(e) => handleUpdateCustomField(field.id, 'label', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Field value"
                value={field.value}
                onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCustomField(field.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Template Editor */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800">Template</h4>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
          placeholder="Enter your confirmation template here..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleResetTemplate}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Default</span>
        </Button>
        
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600">You have unsaved changes</span>
          )}
          <Button
            onClick={handleSaveTemplate}
            disabled={!hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </Button>
        </div>
      </div>

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 text-blue-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-medium text-blue-800">Template Tips</h5>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Use double curly braces for placeholders: {'{{customerName}}'}</li>
              <li>• Use conditional blocks: {'{{#if notes}}Notes: {{notes}}{{/if}}'}</li>
              <li>• Custom fields will be available as {'{{customFieldKey}}'}</li>
              <li>• Changes are saved automatically when you click Save</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Room Fields Settings Component
const RoomFieldsSettings = () => {
  const { settings, updateRoomFormField, addCustomRoomField, updateCustomRoomField, removeCustomRoomField, saveAsDefaultFormFields, resetToDefaultFormFields } = useSettings();
  const [expandedField, setExpandedField] = useState(null);
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    label: '',
    placeholder: '',
    type: 'text',
    required: false,
    validation: 'none'
  });

  const fieldGroups = [
    {
      title: 'Basic Information',
      fields: [
        { key: 'name', label: 'Room name', required: true },
        { key: 'capacity', label: 'Capacity', required: true },
        { key: 'type', label: 'Room type', required: true },
        { key: 'category', label: 'Category', required: true },
      ]
    },
    {
      title: 'Status & Availability',
      fields: [
        { key: 'status', label: 'Status', required: true },
        { key: 'isBookable', label: 'Available for booking', required: false },
        { key: 'sortOrder', label: 'Sort order', required: false },
      ]
    },
    {
      title: 'Pricing & Details',
      fields: [
        { key: 'hourlyRate', label: 'Hourly rate', required: false },
        { key: 'color', label: 'Room color', required: false },
        { key: 'description', label: 'Description', required: false },
        { key: 'amenities', label: 'Amenities', required: false },
      ]
    }
  ];

  const validationTypes = [
    { value: 'none', label: 'No validation' },
    { value: 'required', label: 'Required field' },
    { value: 'number', label: 'Numeric value' },
    { value: 'currency', label: 'Currency amount' },
    { value: 'email', label: 'Email format' },
    { value: 'phone', label: 'Phone number' },
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'tel', label: 'Phone Input' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'color', label: 'Color Picker' },
    { value: 'date', label: 'Date Picker' },
    { value: 'time', label: 'Time Picker' },
  ];

  const handleAddCustomField = () => {
    if (newCustomField.name && newCustomField.label) {
      const field = {
        id: Date.now().toString(),
        ...newCustomField,
        visible: true
      };
      addCustomRoomField(field);
      setNewCustomField({
        name: '',
        label: '',
        placeholder: '',
        type: 'text',
        required: false,
        validation: 'none'
      });
      setShowAddCustomField(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Home className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Room Information Fields</h3>
        </div>
        <p className="text-sm text-gray-600">
          Configure field visibility, labels, placeholders, and validation rules for room information forms.
        </p>
      </div>

      {fieldGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
            {group.title}
          </h4>
          <div className="space-y-3">
            {group.fields.map((field) => {
              const fieldConfig = settings.roomFormFields?.[field.key];
              const isExpanded = expandedField === field.key;
              
              return (
                <div key={field.key} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{fieldConfig?.label || field.label}</span>
                        {fieldConfig?.required && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fieldConfig?.visible || false}
                          onChange={(e) => updateRoomFormField(field.key, 'visible', e.target.checked)}
                          disabled={fieldConfig?.required}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${fieldConfig?.required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedField(isExpanded ? null : field.key)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? 'Collapse' : 'Configure'}
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Field Label</label>
                          <Input
                            value={fieldConfig?.label || ''}
                            onChange={(e) => updateRoomFormField(field.key, 'label', e.target.value)}
                            placeholder="Field label"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Placeholder Text</label>
                          <Input
                            value={fieldConfig?.placeholder || ''}
                            onChange={(e) => updateRoomFormField(field.key, 'placeholder', e.target.value)}
                            placeholder="Placeholder text"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Field Type</label>
                          <CustomSelect
                            value={fieldConfig?.type || 'text'}
                            onChange={(value) => updateRoomFormField(field.key, 'type', value)}
                            options={fieldTypes}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Validation Type</label>
                          <CustomSelect
                            value={fieldConfig?.validation || 'none'}
                            onChange={(value) => updateRoomFormField(field.key, 'validation', value)}
                            options={validationTypes}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={fieldConfig?.required || false}
                              onChange={(e) => updateRoomFormField(field.key, 'required', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Required Field</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
            Custom Fields
          </h4>
          <Button
            onClick={() => setShowAddCustomField(true)}
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Field
          </Button>
        </div>
        
        {settings.customRoomFields?.map((field) => (
          <div key={field.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  Custom
                </Badge>
                {field.required && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomRoomField(field.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {showAddCustomField && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-4">Add Custom Field</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Name (ID)</label>
                <Input
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., specialFeatures"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Label</label>
                <Input
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Special Features"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Field Type</label>
                <CustomSelect
                  value={newCustomField.type}
                  onChange={(value) => setNewCustomField(prev => ({ ...prev, type: value }))}
                  options={fieldTypes}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Validation</label>
                <CustomSelect
                  value={newCustomField.validation}
                  onChange={(value) => setNewCustomField(prev => ({ ...prev, validation: value }))}
                  options={validationTypes}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Placeholder</label>
                <Input
                  value={newCustomField.placeholder}
                  onChange={(e) => setNewCustomField(prev => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Placeholder text"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCustomField.required}
                    onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Required Field</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddCustomField(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomField}
                disabled={!newCustomField.name || !newCustomField.label}
              >
                Add Field
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Default Settings Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-800">Save Current Configuration</h4>
            <p className="text-xs text-gray-600 mt-1">
              Save your current room field settings as defaults for future use
              {settings.formFieldsSavedAt && (
                <span className="block mt-1 text-green-600">
                  Last saved: {new Date(settings.formFieldsSavedAt).toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                saveAsDefaultFormFields();
                toast.success('Room field settings saved as defaults');
              }}
              className="flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save as Default</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all room fields to the saved defaults? This will overwrite your current configuration.')) {
                  resetToDefaultFormFields();
                  toast.success('Room fields reset to saved defaults');
                }
              }}
              disabled={!settings.defaultBookingFormFields && !settings.defaultRoomFormFields}
              className="flex items-center space-x-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Required fields cannot be hidden as they are essential for room creation. 
              Changes will be applied immediately to all room forms in the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;