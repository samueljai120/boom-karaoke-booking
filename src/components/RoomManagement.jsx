import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsAPI } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import CustomSelect from './ui/CustomSelect';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings as SettingsIcon,
  Users,
  Tag,
  DollarSign,
  Palette,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const RoomManagement = () => {
  const { settings } = useSettings();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch rooms
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['room-categories'],
    queryFn: () => roomsAPI.getCategories(),
  });

  const rooms = roomsData?.data || [];
  const categories = categoriesData?.data || [];

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    if (filterStatus !== 'all' && room.status !== filterStatus) return false;
    if (filterCategory !== 'all' && room.category !== filterCategory) return false;
    return true;
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: (data) => roomsAPI.create(data),
    onSuccess: (resp) => {
      // Invalidate queries to refetch the updated room list
      queryClient.invalidateQueries(['rooms']);
      queryClient.invalidateQueries(['room-categories']);
      toast.success('Room created successfully');
      setShowForm(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create room');
    },
  });

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => {
      // Debug logging removed for clean version
      // console.log('🚀 Update room mutation called with:', { id, data });
      return roomsAPI.update(id, data);
    },
    onSuccess: (resp) => {
      // Debug logging removed for clean version
      // console.log('✅ Room update successful:', resp);
      // Invalidate queries to refetch the updated room list
      queryClient.invalidateQueries(['rooms']);
      queryClient.invalidateQueries(['room-categories']);
      toast.success('Room updated successfully');
      setShowForm(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      // Room update failed - error handling removed for clean version
      toast.error(error.response?.data?.error || 'Failed to update room');
    },
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: (id) => roomsAPI.delete(id),
    onSuccess: (resp, variables) => {
      // Invalidate queries to refetch the updated room list
      queryClient.invalidateQueries(['rooms']);
      queryClient.invalidateQueries(['room-categories']);
      toast.success('Room deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete room');
    },
  });

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedRoom(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleDelete = (roomId) => {
    if (window.confirm('Are you sure you want to deactivate this room? This will make it unavailable for new bookings.')) {
      deleteRoomMutation.mutate(roomId);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      inactive: <EyeOff className="w-4 h-4" />,
      maintenance: <Clock className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      medium: '#3B82F6',
      large: '#10B981',
      party: '#F59E0B'
    };
    return colors[type] || '#3B82F6';
  };

  // Get room form fields configuration
  const roomFormFields = settings.roomFormFields || {};
  const customRoomFields = settings.customRoomFields || [];

  // Helper function to render room information based on field visibility
  const renderRoomInfo = (room) => {
    const visibleFields = [];
    
    // Check each field's visibility
    Object.entries(roomFormFields).forEach(([fieldKey, fieldConfig]) => {
      if (fieldConfig?.visible && room[fieldKey] !== undefined && room[fieldKey] !== null && room[fieldKey] !== '') {
        const label = fieldConfig.label || fieldKey;
        let value = room[fieldKey];
        
        // Format value based on field type
        if (fieldKey === 'hourlyRate') {
          value = `$${value}/hr`;
        } else if (fieldKey === 'capacity') {
          value = `${value} max`;
        } else if (fieldKey === 'isBookable') {
          value = value ? 'Available' : 'Unavailable';
        } else if (fieldKey === 'color') {
          // Don't show color code in the main info line, only the visual indicator
          return;
        } else if (fieldKey === 'amenities' && Array.isArray(value)) {
          // Handle amenities specially - don't show in the main info line
          return;
        }
        
        visibleFields.push({ label, value, fieldKey });
      }
    });

    // Check custom fields
    customRoomFields.forEach((customField) => {
      if (customField.visible && room[customField.name] !== undefined && room[customField.name] !== null && room[customField.name] !== '') {
        const label = customField.label || customField.name;
        visibleFields.push({ label, value: room[customField.name], fieldKey: customField.name });
      }
    });

    return visibleFields;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading rooms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-600">Manage room details, categories, and availability</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'maintenance', label: 'Maintenance' }
                ]}
                className="min-w-32"
                placeholder="All"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <CustomSelect
                value={filterCategory}
                onChange={setFilterCategory}
                options={[
                  { value: 'all', label: 'All' },
                  ...categories.map(category => ({ value: category, label: category }))
                ]}
                className="min-w-32"
                placeholder="All"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms List (vertical) */}
      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 overflow-hidden">
        {filteredRooms.map(room => {
          const visibleFields = renderRoomInfo(room);
          const mainInfoFields = visibleFields.filter(field => 
            !['description', 'amenities', 'color'].includes(field.fieldKey)
          );
          const descriptionField = visibleFields.find(field => field.fieldKey === 'description');
          const amenitiesField = room.amenities && room.amenities.length > 0 && roomFormFields.amenities?.visible;
          
          return (
            <div key={room._id || room.id} className="flex items-start justify-between p-4">
              <div className="flex items-start space-x-3 min-w-0">
                {/* Color indicator - only show if color field is visible */}
                {roomFormFields.color?.visible && (
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: room.color }}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">{room.name || 'Unnamed Room'}</span>
                    {/* Status badge - only show if status field is visible */}
                    {roomFormFields.status?.visible && (
                      <Badge className={getStatusColor(room.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(room.status)}
                          <span className="capitalize">{room.status}</span>
                        </div>
                      </Badge>
                    )}
                  </div>
                  
                  {/* Main info line - only show visible fields */}
                  {mainInfoFields.length > 0 && (
                    <div className="text-sm text-gray-600 truncate">
                      {mainInfoFields.map((field, index) => (
                        <span key={field.fieldKey}>
                          {field.value}
                          {index < mainInfoFields.length - 1 && ' • '}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Description - only show if visible */}
                  {descriptionField && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{descriptionField.value}</p>
                  )}
                  
                  {/* Amenities - only show if visible */}
                  {amenitiesField && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                      ))}
                      {room.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{room.amenities.length - 4} more</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(room)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(room._id || room.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <SettingsIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your filters to see more rooms.'
                : 'Get started by creating your first room.'
              }
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Room Form Modal */}
      {showForm && (
        <RoomForm
          room={selectedRoom}
          isEditing={isEditing}
          onClose={() => {
            setShowForm(false);
            setSelectedRoom(null);
            setIsEditing(false);
          }}
          onSave={(data) => {
            if (isEditing) {
              // Use both _id and id for compatibility
              const roomId = selectedRoom._id || selectedRoom.id;
              // Debug logging removed for clean version
              // console.log('🔧 Room update - ID:', roomId, 'Room:', selectedRoom, 'Data:', data);
              updateRoomMutation.mutate({ id: roomId, data });
            } else {
              createRoomMutation.mutate(data);
            }
          }}
          saving={isEditing ? updateRoomMutation.isPending : createRoomMutation.isPending}
          categories={categories}
        />
      )}
    </div>
  );
};

// Room Form Component
const RoomForm = ({ room, isEditing, onClose, onSave, categories, saving = false }) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    capacity: 8,
    type: 'medium',
    category: 'Standard',
    status: 'active',
    color: '#3B82F6',
    description: '',
    amenities: [],
    hourlyRate: 0,
    isBookable: true,
    sortOrder: 0
  });

  const [newAmenity, setNewAmenity] = useState('');

  // Get room form fields configuration
  const roomFormFields = settings.roomFormFields || {};
  const customRoomFields = settings.customRoomFields || [];

  // Update form data when room prop changes
  useEffect(() => {
    const baseFormData = {
      name: '',
      capacity: 8,
      type: 'medium',
      category: 'Standard',
      status: 'active',
      color: '#3B82F6',
      description: '',
      amenities: [],
      hourlyRate: 0,
      isBookable: true,
      sortOrder: 0
    };

    // Initialize custom fields
    const customFieldsData = {};
    customRoomFields.forEach(customField => {
      if (customField.visible) {
        customFieldsData[customField.name] = '';
      }
    });

    if (room && isEditing) {
      setFormData({
        ...baseFormData,
        ...customFieldsData,
        name: room.name || '',
        capacity: room.capacity || 8,
        type: room.type || 'medium',
        category: room.category || 'Standard',
        status: room.status || 'active',
        color: room.color || '#3B82F6',
        description: room.description || '',
        amenities: room.amenities || [],
        hourlyRate: room.hourlyRate || 0,
        isBookable: room.isBookable !== undefined ? room.isBookable : true,
        sortOrder: room.sortOrder || 0,
        // Add custom field values from room data
        ...customRoomFields.reduce((acc, field) => {
          if (field.visible && room[field.name] !== undefined) {
            acc[field.name] = room[field.name];
          }
          return acc;
        }, {})
      });
    } else if (!room && !isEditing) {
      // Reset form for new room creation
      setFormData({
        ...baseFormData,
        ...customFieldsData
      });
    }
  }, [room, isEditing, customRoomFields]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log (removed for clean version)('🔧 Form submitted with data:', formData);
    // Provide server-compatible data, ensuring required fields exist
    const payload = {
      ...formData,
      isActive: formData.status !== 'inactive',
    };
    // console.log (removed for clean version)('🔧 Form payload:', payload);
    onSave(payload);
  };

  const handleAmenityAdd = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleAmenityRemove = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  // Helper function to render form field based on configuration
  const renderFormField = (fieldKey, fieldConfig) => {
    if (!fieldConfig?.visible) return null;

    const value = formData[fieldKey] ?? '';
    const label = fieldConfig.label || fieldKey;
    const placeholder = fieldConfig.placeholder || '';
    const required = fieldConfig.required || false;
    const fieldType = fieldConfig.type || 'text';

    const handleChange = (newValue) => {
      setFormData(prev => ({ ...prev, [fieldKey]: newValue }));
    };

    switch (fieldType) {
      case 'text':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              required={required}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Input
              type="number"
              value={value === 0 ? '' : value}
              onChange={(e) => {
                const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                handleChange(isNaN(numValue) ? 0 : numValue);
              }}
              placeholder={placeholder}
              min="0"
              required={required}
            />
          </div>
        );

      case 'select':
        let options = [];
        if (fieldKey === 'type') {
          options = [
            { value: 'medium', label: 'Medium (up to 8 people)' },
            { value: 'large', label: 'Large (up to 15 people)' },
            { value: 'party', label: 'Party (up to 25 people)' }
          ];
        } else if (fieldKey === 'category') {
          options = [
            { value: 'Standard', label: 'Standard' },
            { value: 'Premium', label: 'Premium' },
            { value: 'VIP', label: 'VIP' },
            ...categories.filter(cat => !['Standard', 'Premium', 'VIP'].includes(cat))
              .map(category => ({ value: category, label: category }))
          ];
        } else if (fieldKey === 'status') {
          options = [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'maintenance', label: 'Maintenance' }
          ];
        }

        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <CustomSelect
              value={value}
              onChange={handleChange}
              options={options}
              placeholder={placeholder}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldKey}
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor={fieldKey} className="text-sm font-medium">
              {label}
            </label>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={value || '#3B82F6'}
                onChange={(e) => handleChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              required={required}
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Exit Button - Top Right Corner */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-12 w-12 z-10 bg-white hover:bg-gray-100 border border-gray-200 shadow-lg"
        >
          <X className="h-8 w-8 font-bold text-gray-700" />
        </Button>
        
        <CardHeader className="pr-16">
          <CardTitle>
            {isEditing ? 'Edit Room' : 'Create New Room'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormField('name', roomFormFields.name)}
              {renderFormField('capacity', roomFormFields.capacity)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormField('type', roomFormFields.type)}
              {renderFormField('category', roomFormFields.category)}
            </div>

            {/* Status & Availability Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormField('status', roomFormFields.status)}
              {renderFormField('color', roomFormFields.color)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormField('hourlyRate', roomFormFields.hourlyRate)}
              {renderFormField('sortOrder', roomFormFields.sortOrder)}
            </div>

            {/* Description Field */}
            {renderFormField('description', roomFormFields.description)}

            {/* Amenities Field - Special handling */}
            {roomFormFields.amenities?.visible && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{roomFormFields.amenities.label || 'Amenities'}</label>
                <div className="flex space-x-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder={roomFormFields.amenities.placeholder || 'Add amenity'}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAmenityAdd())}
                  />
                  <Button type="button" onClick={handleAmenityAdd}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleAmenityRemove(amenity)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Checkbox Fields */}
            {renderFormField('isBookable', roomFormFields.isBookable)}

            {/* Custom Fields */}
            {customRoomFields.map((customField) => {
              if (!customField.visible) return null;

              return (
                <div key={customField.id}>
                  {renderFormField(customField.name, customField)}
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : (isEditing ? 'Update Room' : 'Create Room')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManagement;
