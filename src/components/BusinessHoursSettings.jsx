import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import CustomSelect from './ui/CustomSelect';
import { Clock, Save, RotateCcw, Copy, Trash2, Plus, Check, X, AlertCircle, Calendar, Sun, Moon, Zap, Users, Coffee, Music } from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessHoursSettings = () => {
  const { businessHours, loading, updateBusinessHours } = useBusinessHours();
  const [localBusinessHours, setLocalBusinessHours] = useState([]);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // 'detailed' or 'visual'
  const [showPresets, setShowPresets] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const daysOfWeek = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' }
  ];

  useEffect(() => {
    if (businessHours.length > 0) {
      setLocalBusinessHours([...businessHours]);
    }
  }, [businessHours]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localBusinessHours) !== JSON.stringify(businessHours);
    setHasChanges(hasChanges);
  }, [localBusinessHours, businessHours]);

  const updateBusinessHour = (weekday, field, value) => {
    setLocalBusinessHours(prev => prev.map(bh => 
      bh.weekday === weekday 
        ? { ...bh, [field]: value }
        : bh
    ));
  };

  // Copy hours from one day to another
  const copyDayHours = (fromWeekday, toWeekday) => {
    const sourceDay = localBusinessHours.find(bh => bh.weekday === fromWeekday);
    if (sourceDay) {
      updateBusinessHour(toWeekday, 'openTime', sourceDay.openTime);
      updateBusinessHour(toWeekday, 'closeTime', sourceDay.closeTime);
      updateBusinessHour(toWeekday, 'isClosed', sourceDay.isClosed);
      toast.success(`Copied ${daysOfWeek[fromWeekday].name} hours to ${daysOfWeek[toWeekday].name}`);
    }
  };

  // Copy to all days
  const copyToAllDays = (fromWeekday) => {
    const sourceDay = localBusinessHours.find(bh => bh.weekday === fromWeekday);
    if (sourceDay) {
      const updatedHours = localBusinessHours.map(bh => ({
        ...bh,
        openTime: sourceDay.openTime,
        closeTime: sourceDay.closeTime,
        isClosed: sourceDay.isClosed
      }));
      setLocalBusinessHours(updatedHours);
      toast.success(`Applied ${daysOfWeek[fromWeekday].name} hours to all days`);
    }
  };

  // Validate time range
  const validateTimeRange = (openTime, closeTime) => {
    if (!openTime || !closeTime) return { isValid: true };
    
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    // Handle late night hours (close time next day)
    const isLateNight = closeMinutes < openMinutes;
    const actualCloseMinutes = isLateNight ? closeMinutes + 24 * 60 : closeMinutes;
    
    return {
      isValid: actualCloseMinutes > openMinutes,
      isLateNight,
      duration: actualCloseMinutes - openMinutes
    };
  };

  const toggleClosed = (weekday) => {
    setLocalBusinessHours(prev => prev.map(bh => 
      bh.weekday === weekday 
        ? { ...bh, isClosed: !bh.isClosed }
        : bh
    ));
  };

  const saveBusinessHours = async () => {
    try {
      setSaving(true);
      const success = await updateBusinessHours(localBusinessHours);
      if (success) {
        // Context will handle the success toast
      }
    } catch (error) {
      // Error saving business hours - error handling removed for clean version
      toast.error('Failed to save business hours');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultHours = daysOfWeek.map(day => ({
      weekday: day.id,
      openTime: day.id === 0 || day.id === 6 ? '12:00' : '16:00', // Sunday/Saturday: 12:00, others: 16:00
      closeTime: day.id === 5 || day.id === 6 ? '23:59' : '23:00', // Friday/Saturday: 23:59, others: 23:00
      isClosed: false
    }));
    setLocalBusinessHours(defaultHours);
  };

  const presets = [
    {
      name: 'Standard Karaoke',
      description: '6 PM - 2 AM (Fri/Sat until 3 AM)',
      hours: daysOfWeek.map(day => ({
        weekday: day.id,
        openTime: '18:00',
        closeTime: day.id === 5 || day.id === 6 ? '03:00' : '02:00',
        isClosed: false
      }))
    },
    {
      name: 'Extended Hours',
      description: '8 PM - 4 AM (Fri/Sat until 5 AM)',
      hours: daysOfWeek.map(day => ({
        weekday: day.id,
        openTime: '20:00',
        closeTime: day.id === 5 || day.id === 6 ? '05:00' : '04:00',
        isClosed: false
      }))
    },
    {
      name: 'Daytime Business',
      description: '10 AM - 10 PM',
      hours: daysOfWeek.map(day => ({
        weekday: day.id,
        openTime: '10:00',
        closeTime: '22:00',
        isClosed: false
      }))
    },
    {
      name: 'Weekend Only',
      description: 'Closed weekdays, 6 PM - 2 AM weekends',
      hours: daysOfWeek.map(day => ({
        weekday: day.id,
        openTime: day.id === 0 || day.id === 6 ? '18:00' : '00:00',
        closeTime: day.id === 0 || day.id === 6 ? '02:00' : '00:00',
        isClosed: day.id !== 0 && day.id !== 6
      }))
    },
    {
      name: '24/7',
      description: 'Open all day, every day',
      hours: daysOfWeek.map(day => ({
        weekday: day.id,
        openTime: '00:00',
        closeTime: '23:59',
        isClosed: false
      }))
    }
  ];

  const applyPreset = (preset) => {
    setLocalBusinessHours(preset.hours);
    toast.success(`Applied ${preset.name} preset`);
    setShowPresets(false);
  };

  // Bulk operations
  const setAllDays = (openTime, closeTime, isClosed = false) => {
    const updatedHours = localBusinessHours.map(bh => ({
      ...bh,
      openTime,
      closeTime,
      isClosed
    }));
    setLocalBusinessHours(updatedHours);
    toast.success(`Set all days to ${isClosed ? 'closed' : `${openTime} - ${closeTime}`}`);
  };

  const setWeekdays = (openTime, closeTime, isClosed = false) => {
    const updatedHours = localBusinessHours.map(bh => ({
      ...bh,
      openTime: bh.weekday >= 1 && bh.weekday <= 5 ? openTime : bh.openTime,
      closeTime: bh.weekday >= 1 && bh.weekday <= 5 ? closeTime : bh.closeTime,
      isClosed: bh.weekday >= 1 && bh.weekday <= 5 ? isClosed : bh.isClosed
    }));
    setLocalBusinessHours(updatedHours);
    toast.success(`Set weekdays to ${isClosed ? 'closed' : `${openTime} - ${closeTime}`}`);
  };

  const setWeekends = (openTime, closeTime, isClosed = false) => {
    const updatedHours = localBusinessHours.map(bh => ({
      ...bh,
      openTime: bh.weekday === 0 || bh.weekday === 6 ? openTime : bh.openTime,
      closeTime: bh.weekday === 0 || bh.weekday === 6 ? closeTime : bh.closeTime,
      isClosed: bh.weekday === 0 || bh.weekday === 6 ? isClosed : bh.isClosed
    }));
    setLocalBusinessHours(updatedHours);
    toast.success(`Set weekends to ${isClosed ? 'closed' : `${openTime} - ${closeTime}`}`);
  };

  const closeAllDays = () => {
    const updatedHours = localBusinessHours.map(bh => ({
      ...bh,
      isClosed: true
    }));
    setLocalBusinessHours(updatedHours);
    toast.success('Closed all days');
  };

  // Time Picker Component
  const TimePicker = ({ value, onChange, label, disabled = false }) => {
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [period, setPeriod] = useState('AM');

    useEffect(() => {
      if (value) {
        const [h, m] = value.split(':').map(Number);
        if (h === 0) {
          setHour(12);
          setPeriod('AM');
        } else if (h < 12) {
          setHour(h);
          setPeriod('AM');
        } else if (h === 12) {
          setHour(12);
          setPeriod('PM');
        } else {
          setHour(h - 12);
          setPeriod('PM');
        }
        setMinute(m);
      }
    }, [value]);

    const handleTimeChange = (newHour, newMinute, newPeriod) => {
      let hour24 = newHour;
      if (newPeriod === 'AM' && newHour === 12) hour24 = 0;
      else if (newPeriod === 'PM' && newHour !== 12) hour24 = newHour + 12;
      
      const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
      onChange(timeString);
    };

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <select
            value={hour}
            onChange={(e) => handleTimeChange(parseInt(e.target.value), minute, period)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-gray-500">:</span>
          <select
            value={minute}
            onChange={(e) => handleTimeChange(hour, parseInt(e.target.value), period)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {Array.from({ length: 60 }, (_, i) => i).map(m => (
              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => handleTimeChange(hour, minute, e.target.value)}
            disabled={disabled}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    );
  };

  // Visual Schedule Component
  const VisualSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-4">Weekly Schedule Overview</div>
        <div className="grid grid-cols-8 gap-1 text-xs">
          <div className="font-medium text-gray-500 p-2">Time</div>
          {daysOfWeek.map(day => (
            <div key={day.id} className="font-medium text-gray-500 p-2 text-center">
              {day.short}
            </div>
          ))}
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-gray-400 p-1 text-right pr-2">
                {moment().hour(hour).format('h A')}
              </div>
              {daysOfWeek.map(day => {
                const dayHours = localBusinessHours.find(bh => bh.weekday === day.id) || {
                  weekday: day.id,
                  openTime: '00:00',
                  closeTime: '00:00',
                  isClosed: true
                };
                
                if (dayHours.isClosed) {
                  return <div key={`${day.id}-${hour}`} className="h-6 bg-gray-200 rounded"></div>;
                }
                
                const [openHour] = dayHours.openTime.split(':').map(Number);
                const [closeHour] = dayHours.closeTime.split(':').map(Number);
                const isLateNight = closeHour < openHour;
                const isOpen = isLateNight 
                  ? (hour >= openHour || hour < closeHour)
                  : (hour >= openHour && hour < closeHour);
                
                return (
                  <div
                    key={`${day.id}-${hour}`}
                    className={`h-6 rounded ${
                      isOpen 
                        ? 'bg-green-400' 
                        : hour === openHour 
                          ? 'bg-yellow-400' 
                          : 'bg-gray-100'
                    }`}
                    title={`${day.name} ${moment().hour(hour).format('h A')} - ${isOpen ? 'Open' : 'Closed'}`}
                  ></div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading business hours...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Business Hours</h3>
          {hasChanges && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Unsaved Changes
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="flex items-center space-x-1"
          >
            <Users className="w-4 h-4" />
            <span>Bulk Actions</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'detailed' ? 'visual' : 'detailed')}
            className="flex items-center space-x-1"
          >
            {viewMode === 'detailed' ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span>{viewMode === 'detailed' ? 'Visual View' : 'Detailed View'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center space-x-1"
          >
            <Zap className="w-4 h-4" />
            <span>Presets</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          
          <Button
            size="sm"
            onClick={saveBusinessHours}
            disabled={saving || !hasChanges}
            className="flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Bulk Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quick Set All Days</label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllDays('18:00', '02:00')}
                    className="w-full justify-start"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    6 PM - 2 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllDays('20:00', '04:00')}
                    className="w-full justify-start"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    8 PM - 4 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllDays('10:00', '22:00')}
                    className="w-full justify-start"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    10 AM - 10 PM
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Weekdays Only</label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekdays('18:00', '02:00')}
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    6 PM - 2 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekdays('09:00', '17:00')}
                    className="w-full justify-start"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    9 AM - 5 PM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekdays('00:00', '00:00', true)}
                    className="w-full justify-start"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Closed
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Weekends Only</label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekends('18:00', '03:00')}
                    className="w-full justify-start"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    6 PM - 3 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekends('12:00', '02:00')}
                    className="w-full justify-start"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    12 PM - 2 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWeekends('00:00', '00:00', true)}
                    className="w-full justify-start"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Closed
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quick Actions</label>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeAllDays}
                    className="w-full justify-start"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close All Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllDays('00:00', '23:59')}
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Open 24/7
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Presets Panel */}
      {showPresets && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-900">Quick Presets</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPresets(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="flex flex-col items-start p-3 h-auto text-left"
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {viewMode === 'visual' ? (
        <Card>
          <CardContent className="p-6">
            <VisualSchedule />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {daysOfWeek.map(day => {
            const dayHours = (localBusinessHours && Array.isArray(localBusinessHours) ? localBusinessHours.find(bh => bh.weekday === day.id) : null) || {
              weekday: day.id,
              openTime: '16:00',
              closeTime: '23:00',
              isClosed: false
            };

            const validation = validateTimeRange(dayHours.openTime, dayHours.closeTime);

            return (
              <Card key={day.id} className={`border ${validation.isValid ? 'border-gray-200' : 'border-red-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={!dayHours.isClosed}
                        onChange={() => toggleClosed(day.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">{day.name}</span>
                      {validation.isLateNight && !dayHours.isClosed && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Late Night
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {dayHours.isClosed ? (
                        <span className="text-sm text-red-600 font-medium">CLOSED</span>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToAllDays(day.id)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Copy to all days"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {!dayHours.isClosed && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TimePicker
                          value={dayHours.openTime}
                          onChange={(value) => updateBusinessHour(day.id, 'openTime', value)}
                          label="Open Time"
                        />
                        <TimePicker
                          value={dayHours.closeTime}
                          onChange={(value) => updateBusinessHour(day.id, 'closeTime', value)}
                          label="Close Time"
                        />
                      </div>
                      
                      {!validation.isValid && (
                        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-800">
                            <p className="font-medium">Invalid time range</p>
                            <p>Close time must be after open time</p>
                          </div>
                        </div>
                      )}
                      
                      {validation.isValid && validation.duration > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {Math.floor(validation.duration / 60)}h {validation.duration % 60}m
                          {validation.isLateNight && (
                            <span className="ml-2 text-purple-600">(Late night hours)</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Business Hours Information:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Bookings can only be made during open hours</li>
              <li>• Times are displayed in your local timezone</li>
              <li>• <strong>Late-night hours</strong> (e.g., 2:00 AM, 3:00 AM) will display on the same day schedule</li>
              <li>• Use presets for common karaoke business hours</li>
              <li>• Closed days will not accept any bookings</li>
              <li>• Changes are saved when you click Save Changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHoursSettings;
