import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { 
  Copy, 
  Check, 
  Settings, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  DollarSign,
  FileText,
  Edit3,
  Save,
  RotateCcw
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useBusinessInfo } from '../contexts/BusinessInfoContext';
import { useSettings } from '../contexts/SettingsContext';

const BookingConfirmation = ({ booking, onClose, isOpen, onTemplateUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [template, setTemplate] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const { businessInfo } = useBusinessInfo();
  const { settings, updateConfirmationTemplate, updateConfirmationCustomFields } = useSettings();

  // Default template with placeholders
  const getDefaultTemplate = () => {
    return '🎤 BOOKING CONFIRMATION\n\n' +
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
  };

  // Initialize template from settings or use default
  useEffect(() => {
    if (isOpen && booking) {
      const savedTemplate = settings.confirmationTemplate?.template;
      if (savedTemplate) {
        setTemplate(savedTemplate);
      } else {
        setTemplate(getDefaultTemplate());
      }
      
      // Load custom fields
      const savedFields = settings.confirmationTemplate?.customFields || [];
      setCustomFields(savedFields);
    }
  }, [isOpen, booking, settings.confirmationTemplate]);

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

  // Process template with booking data
  const processTemplate = (template, bookingData) => {
    if (!template || !bookingData) return '';
    
    let processed = template;
    
    // Replace basic placeholders
    Object.entries(bookingData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const replacement = value !== null && value !== undefined ? String(value) : '';
      processed = processed.replace(new RegExp(placeholder, 'g'), replacement);
    });
    
    // Handle conditional blocks
    processed = processed.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, field, content) => {
      return bookingData[field] ? content : '';
    });
    
    return processed;
  };

  // Generate booking data for template
  const generateBookingData = (booking) => {
    if (!booking) return {};
    
    const startTime = moment(booking.startTime || booking.timeIn);
    const endTime = moment(booking.endTime || booking.timeOut);
    const duration = endTime.diff(startTime, 'hours', true);
    
    // Ensure businessInfo has default values
    const safeBusinessInfo = businessInfo || {};
    
    return {
      customerName: booking.customerName || 'N/A',
      phone: booking.phone || 'N/A',
      email: booking.email || 'N/A',
      date: startTime.format('MMMM DD, YYYY'),
      time: `${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`,
      duration: `${duration.toFixed(1)} hours`,
      roomName: booking.room?.name || booking.roomId?.name || 'N/A',
      roomCapacity: booking.room?.capacity || booking.roomId?.capacity || 'N/A',
      status: booking.status || 'confirmed',
      source: booking.source || 'walk_in',
      confirmationCode: booking.confirmationCode || (booking._id ? String(booking._id).slice(-8).toUpperCase() : 'N/A'),
      totalPrice: booking.totalPrice || booking.basePrice || '0.00',
      notes: booking.notes || '',
      specialRequests: booking.specialRequests || '',
      businessName: safeBusinessInfo.name || 'Business Name',
      businessPhone: safeBusinessInfo.phone || 'N/A',
      businessEmail: safeBusinessInfo.email || 'N/A',
      businessAddress: safeBusinessInfo.address || 'N/A',
      businessWebsite: safeBusinessInfo.website || 'N/A',
      confirmationMessage: safeBusinessInfo.confirmationMessage || 'Thank you for your booking!',
      generatedDate: moment().format('MMMM DD, YYYY at h:mm A'),
    };
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const bookingData = generateBookingData(booking);
      const processedTemplate = processTemplate(template, bookingData);
      
      await navigator.clipboard.writeText(processedTemplate);
      setCopied(true);
      toast.success('Confirmation copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Failed to copy - error handling removed for clean version
      toast.error('Failed to copy to clipboard');
    }
  };

  // Save template
  const handleSaveTemplate = () => {
    updateConfirmationTemplate(template);
    updateConfirmationCustomFields(customFields);
    toast.success('Template saved successfully!');
    setShowTemplateEditor(false);
    if (onTemplateUpdate) {
      onTemplateUpdate(template);
    }
  };

  // Reset to default template
  const handleResetTemplate = () => {
    if (window.confirm('Are you sure you want to reset to the default template? This will overwrite your current template.')) {
      const defaultTemplate = getDefaultTemplate();
      setTemplate(defaultTemplate);
      updateConfirmationTemplate(defaultTemplate);
      updateConfirmationCustomFields([]);
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

  // Save custom fields
  const handleSaveCustomFields = () => {
    updateConfirmationCustomFields(customFields);
    toast.success('Custom fields saved!');
  };

  if (!isOpen || !booking) return null;

  const bookingData = generateBookingData(booking);
  const processedTemplate = template ? processTemplate(template, bookingData) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">Booking Confirmation</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateEditor(!showTemplateEditor)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Template Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Template Editor */}
          {showTemplateEditor && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Template Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Available Fields */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Fields (click to insert)</h4>
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Custom Fields</h4>
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

                {/* Template Text Area */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Template</h4>
                  <textarea
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                    placeholder="Enter your confirmation template here..."
                  />
                </div>

                {/* Template Actions */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleResetTemplate}
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateEditor(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveTemplate}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Template</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Details Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Customer:</span>
                    <span>{bookingData.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{bookingData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Date:</span>
                    <span>{bookingData.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Time:</span>
                    <span>{bookingData.time}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Room:</span>
                    <span>{bookingData.roomName} ({bookingData.roomCapacity} people)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Total:</span>
                    <span>${bookingData.totalPrice}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={bookingData.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {bookingData.status}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {bookingData.source}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Confirmation:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {bookingData.confirmationCode}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Confirmation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Confirmation</CardTitle>
                <Button
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 ${
                    copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                  {processedTemplate}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleCopy} className="flex items-center space-x-2">
              <Copy className="w-4 h-4" />
              <span>Copy Confirmation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
