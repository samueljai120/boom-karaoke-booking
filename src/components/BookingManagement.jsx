import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI, roomsAPI } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
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
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  Mail,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Calendar as CalendarIcon,
  User,
  MapPin,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import ReservationViewModal from './ReservationViewModal';

const BookingManagement = () => {
  const { settings } = useSettings();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  const { isWithinBusinessHours, getBusinessHoursForDay } = useBusinessHours();

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', { search: searchQuery, status: filterStatus, room: filterRoom, date: filterDate }],
    queryFn: () => {
      // Only pass date parameter if filterDate is explicitly set
      const params = {
        ...(searchQuery && { customer: searchQuery }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterRoom !== 'all' && { room: filterRoom }),
        ...(filterDate && { date: filterDate })
      };
      return bookingsAPI.getAll(params);
    },
  });

  // Fetch rooms for filter
  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
  });

  const bookings = bookingsData?.data?.bookings || [];
  const normalizedBookings = useMemo(() => {
    const mapped = bookings.map(b => ({
      ...b,
      roomId: b.roomId || b.room,
      startTime: b.startTime || b.timeIn,
      endTime: b.endTime || b.timeOut,
    }));

    // Apply date filter using overlap logic (match schedule) only if date filter is set
    if (filterDate) {
      const selectedStart = moment(filterDate).startOf('day');
      const selectedEnd = moment(filterDate).endOf('day');
      
      return mapped.filter(b => {
        const bookingStart = moment(b.startTime || b.timeIn);
        const bookingEnd = moment(b.endTime || b.timeOut);
        return bookingStart.isBefore(selectedEnd) && bookingEnd.isAfter(selectedStart);
      });
    }

    return mapped;
  }, [bookings, filterDate]);
  const rooms = roomsData?.data || [];

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingsAPI.create(data),
    onSuccess: (resp) => {
      // Optimistically merge the newly created booking for instant feedback
      const newBooking = resp?.data?.booking || resp?.data?.data?.booking;
      if (newBooking) {
        queryClient.setQueryData(['bookings', { search: searchQuery, status: filterStatus, room: filterRoom, date: filterDate }], (old) => {
          const prev = old?.data?.bookings || [];
          return { ...(old || {}), data: { ...(old?.data || {}), bookings: [newBooking, ...prev] } };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
      setShowForm(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => bookingsAPI.update(id, data),
    onSuccess: (resp, variables) => {
      const updated = resp?.data?.booking || resp?.data?.data?.booking;
      const updatedId = variables?.id;
      if (updated || updatedId) {
        queryClient.setQueryData(['bookings', { search: searchQuery, status: filterStatus, room: filterRoom, date: filterDate }], (old) => {
          const prev = old?.data?.bookings || [];
          const next = prev.map(b => (b._id === (updated?._id || updatedId) ? (updated || { ...b, ...variables.data }) : b));
          return { ...(old || {}), data: { ...(old?.data || {}), bookings: next } };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated successfully');
      setShowForm(false);
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update booking');
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (id) => bookingsAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    },
  });

  // Delete booking mutation (permanent delete or server-side cancel depending on backend)
  const deleteBookingMutation = useMutation({
    mutationFn: (id) => bookingsAPI.delete(id),
    onSuccess: (_resp, id) => {
      // Optimistically remove from current cache list
      queryClient.setQueryData(['bookings', { search: searchQuery, status: filterStatus, room: filterRoom, date: filterDate }], (old) => {
        const prev = old?.data?.bookings || [];
        const next = prev.filter(b => b._id !== id);
        return { ...(old || {}), data: { ...(old?.data || {}), bookings: next } };
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete booking');
    },
  });

  // Restore booking mutation (e.g., from cancelled/no_show back to confirmed)
  const restoreBookingMutation = useMutation({
    mutationFn: (id) => bookingsAPI.update(id, { status: 'confirmed' }),
    onSuccess: (_resp, id) => {
      // Update cache status immediately
      queryClient.setQueryData(['bookings', { search: searchQuery, status: filterStatus, room: filterRoom, date: filterDate }], (old) => {
        const prev = old?.data?.bookings || [];
        const next = prev.map(b => (b._id === id ? { ...b, status: 'confirmed' } : b));
        return { ...(old || {}), data: { ...(old?.data || {}), bookings: next } };
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking restored');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to restore booking');
    },
  });

  // Handle view booking - show read-only view first
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle edit from view modal
  const handleEditFromView = (booking) => {
    // Normalize before passing into form to avoid undefined fields
    const normalized = {
      ...booking,
      roomId: booking.roomId || booking.room,
      startTime: booking.startTime || booking.timeIn,
      endTime: booking.endTime || booking.timeOut,
    };
    setSelectedBooking(normalized);
    setIsViewModalOpen(false);
    setIsEditing(true);
    setShowForm(true);
  };

  // Handle direct edit (for backward compatibility)
  const handleEdit = (booking) => {
    // Normalize before passing into form to avoid undefined fields
    const normalized = {
      ...booking,
      roomId: booking.roomId || booking.room,
      startTime: booking.startTime || booking.timeIn,
      endTime: booking.endTime || booking.timeOut,
    };
    setSelectedBooking(normalized);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedBooking(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const handleDelete = (bookingId) => {
    if (window.confirm('Delete this booking? This cannot be undone.')) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  const handleRestore = (bookingId) => {
    if (window.confirm('Restore this booking to confirmed status?')) {
      restoreBookingMutation.mutate(bookingId);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
      no_show: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      pending: <AlertCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      no_show: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const getSourceColor = (source) => {
    const colors = {
      walk_in: 'bg-blue-100 text-blue-800',
      phone: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      online: 'bg-orange-100 text-orange-800',
      app: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  // Get room form fields configuration
  const roomFormFields = settings.roomFormFields || {};

  // Helper function to format room information based on field visibility
  const formatRoomInfo = (room) => {
    if (!room) return 'Unknown room';
    
    const visibleFields = [];
    
    // Always show room name (with null check)
    visibleFields.push(room.name || 'Unnamed Room');
    
    // Check each field's visibility
    Object.entries(roomFormFields).forEach(([fieldKey, fieldConfig]) => {
      if (fieldConfig?.visible && room[fieldKey] !== undefined && room[fieldKey] !== null && room[fieldKey] !== '') {
        let value = room[fieldKey];
        
        // Format value based on field type
        if (fieldKey === 'capacity') {
          value = `(${value} max)`;
        } else if (fieldKey === 'hourlyRate') {
          value = `- $${value}/hour`;
        } else if (fieldKey === 'category') {
          value = `[${value}]`;
        } else if (fieldKey === 'color' || fieldKey === 'description' || fieldKey === 'amenities') {
          // Don't show these in the room info line
          return;
        } else {
          value = `(${value})`;
        }
        
        visibleFields.push(value);
      }
    });

    return visibleFields.join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Manage customer bookings, reservations, and walk-ins</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, phone, or confirmation code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <CustomSelect
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'no_show', label: 'No Show' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Room</label>
                  <CustomSelect
                    value={filterRoom}
                    onChange={setFilterRoom}
                    options={[{ value: 'all', label: 'All Rooms' }, ...rooms.map(r => ({ value: r._id || r.id, label: r.name }))]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {normalizedBookings.map(booking => (
          <Card key={booking._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: booking.roomId?.color || '#9CA3AF' }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.customerName}
                    </h3>
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </Badge>
                    <Badge className={getSourceColor(booking.source)}>
                      {booking.source.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{formatRoomInfo(booking.roomId)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{moment(booking.startTime).format('MMM DD, YYYY')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{booking.partySize} people</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{booking.phone}</span>
                    </div>
                    {booking.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{booking.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${booking.totalPrice}</span>
                    </div>
                    {booking.confirmationCode && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {booking.confirmationCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(booking)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(booking)}
                    title="Edit Directly"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {(booking.status === 'cancelled' || booking.status === 'no_show') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(booking._id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Restore booking"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(booking._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {normalizedBookings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' || filterRoom !== 'all' || filterDate
                ? 'Try adjusting your search or filters to see more bookings.'
                : 'Get started by creating your first booking.'
              }
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reservation View Modal */}
      <ReservationViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onEdit={handleEditFromView}
        onDelete={(booking) => {
          if (window.confirm('Are you sure you want to delete this reservation?')) {
            handleDelete(booking._id);
            setIsViewModalOpen(false);
          }
        }}
      />

      {/* Booking Form Modal */}
      {showForm && (
        <BookingForm
          booking={selectedBooking}
          isEditing={isEditing}
          onClose={() => {
            setShowForm(false);
            setSelectedBooking(null);
            setIsEditing(false);
          }}
          onSave={(data) => {
            if (isEditing) {
              updateBookingMutation.mutate({ id: selectedBooking._id, data });
            } else {
              createBookingMutation.mutate(data);
            }
          }}
          saving={isEditing ? updateBookingMutation.isPending : createBookingMutation.isPending}
          rooms={rooms}
          isWithinBusinessHours={isWithinBusinessHours}
        />
      )}
    </div>
  );
};

// Booking Form Component
const BookingForm = ({ booking, isEditing, onClose, onSave, rooms, saving = false, isWithinBusinessHours }) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    room: '',
    timeIn: '',
    timeOut: '',
    source: 'walk_in',
    status: 'confirmed',
    priority: 'normal',
    notes: '',
    specialRequests: '',
    partySize: 1,
    basePrice: 0,
    additionalFees: 0,
    discount: 0,
    totalPrice: 0,
  });

  // Get room form fields configuration
  const roomFormFields = settings.roomFormFields || {};

  // Helper function to format room option for dropdown
  const formatRoomOption = (room) => {
    if (!room) return 'Unknown room';
    
    const visibleFields = [];
    
    // Always show room name (with null check)
    visibleFields.push(room.name || 'Unnamed Room');
    
    // Check each field's visibility
    Object.entries(roomFormFields).forEach(([fieldKey, fieldConfig]) => {
      if (fieldConfig?.visible && room[fieldKey] !== undefined && room[fieldKey] !== null && room[fieldKey] !== '') {
        let value = room[fieldKey];
        
        // Format value based on field type
        if (fieldKey === 'capacity') {
          value = `(${value} max)`;
        } else if (fieldKey === 'hourlyRate') {
          value = `- $${value}/hour`;
        } else if (fieldKey === 'category') {
          value = `[${value}]`;
        } else if (fieldKey === 'color' || fieldKey === 'description' || fieldKey === 'amenities') {
          // Don't show these in the room option
          return;
        } else {
          value = `(${value})`;
        }
        
        visibleFields.push(value);
      }
    });

    return visibleFields.join(' ');
  };

  // Update form data when booking prop changes
  useEffect(() => {
    if (booking && isEditing) {
      setFormData({
        customerName: booking.customerName || '',
        phone: booking.phone || '',
        email: booking.email || '',
        room: booking.roomId?._id || booking.room || '',
        timeIn: booking.startTime ? moment(booking.startTime).format('YYYY-MM-DDTHH:mm') : '',
        timeOut: booking.endTime ? moment(booking.endTime).format('YYYY-MM-DDTHH:mm') : '',
        source: booking.source || 'walk_in',
        status: booking.status || 'confirmed',
        priority: booking.priority || 'normal',
        notes: booking.notes || '',
        specialRequests: booking.specialRequests || '',
        partySize: booking.partySize || 1,
        basePrice: typeof booking.basePrice === 'number' ? booking.basePrice : 0,
        additionalFees: typeof booking.additionalFees === 'number' ? booking.additionalFees : 0,
        discount: typeof booking.discount === 'number' ? booking.discount : 0,
        totalPrice: typeof booking.totalPrice === 'number' ? booking.totalPrice : 0,
      });
    } else if (!booking && !isEditing) {
      // Reset form for new booking creation with sensible defaults
      const now = new Date();
      const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        room: '',
        timeIn: defaultStartTime.toISOString().slice(0, 16), // Format for datetime-local input
        timeOut: defaultEndTime.toISOString().slice(0, 16), // Format for datetime-local input
        source: 'walk_in',
        status: 'confirmed',
        priority: 'normal',
        notes: '',
        specialRequests: '',
        partySize: 1,
        basePrice: 0,
        additionalFees: 0,
        discount: 0,
        totalPrice: 0,
      });
    }
  }, [booking, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate phone number format
    const phonePattern = /^[\+]?[1-9][\d]{7,15}$/;
    if (formData.phone && !phonePattern.test(formData.phone)) {
      toast.error('Please enter a valid phone number (8-16 digits, starting with 1-9)');
      return;
    }
    
    // Validate required fields
    if (!formData.timeIn || !formData.timeOut) {
      toast.error('Please select both start and end times for the booking.');
      return;
    }
    
    // Calculate duration and total price
    const startTime = new Date(formData.timeIn);
    const endTime = new Date(formData.timeOut);
    
    // Validate that end time is after start time
    if (endTime <= startTime) {
      toast.error('End time must be after start time. Please select a valid time range.');
      return;
    }
    
    // Validate business hours
    if (!isWithinBusinessHours(startTime, formData.timeIn, formData.timeOut)) {
      toast.error('Booking time is outside business hours. Please choose a time within business hours.');
      return;
    }
    
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    // Validate minimum duration (at least 15 minutes)
    if (durationMinutes < 15) {
      toast.error('Booking duration must be at least 15 minutes.');
      return;
    }
    
    const selectedRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === formData.room) : null);
    const hourlyRate = selectedRoom?.hourlyRate || 25;
    const basePrice = (durationMinutes / 60) * hourlyRate;
    const totalPrice = basePrice + (formData.additionalFees || 0) - (formData.discount || 0);

    const bookingData = {
      ...formData,
      durationMinutes,
      basePrice: Math.round(basePrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      // Send both legacy (timeIn/timeOut, room) and API (startTime/endTime, roomId) fields for compatibility
      timeIn: startTime.toISOString(),
      timeOut: endTime.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      roomId: formData.room,
      room: formData.room
    };

    onSave(bookingData);
  };

  // Helper function to render form fields based on settings
  const renderFormField = (fieldKey, fieldConfig, value, onChange, options = {}) => {
    if (!fieldConfig?.visible) return null;

    const isRequired = fieldConfig.required;
    const label = fieldConfig.label || fieldKey;
    const placeholder = fieldConfig.placeholder || `Enter ${label.toLowerCase()}`;
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {label} {isRequired && '*'}
        </label>
        <div className="relative">
          {options.icon && (
            <div className="absolute left-3 top-3 w-4 h-4 text-gray-400">
              {options.icon}
            </div>
          )}
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={options.icon ? "pl-10" : ""}
            type={fieldConfig.type === 'email' ? 'email' : fieldConfig.type === 'tel' ? 'tel' : fieldConfig.type === 'number' ? 'number' : 'text'}
          />
        </div>
      </div>
    );
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate duration if both times are set
    if (field === 'timeIn' && formData.timeOut) {
      const startTime = new Date(value);
      const endTime = new Date(formData.timeOut);
      if (endTime > startTime) {
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        const selectedRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === formData.room) : null);
        const hourlyRate = selectedRoom?.hourlyRate || 25;
        const basePrice = (durationMinutes / 60) * hourlyRate;
        setFormData(prev => ({
          ...prev,
          basePrice: Math.round(basePrice * 100) / 100,
          totalPrice: Math.round((basePrice + (prev.additionalFees || 0) - (prev.discount || 0)) * 100) / 100
        }));
      } else if (endTime <= startTime) {
        // If end time is not after start time, automatically adjust end time to be 1 hour later
        const adjustedEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        setFormData(prev => ({
          ...prev,
          timeOut: adjustedEndTime.toISOString().slice(0, 16)
        }));
      }
    } else if (field === 'timeOut' && formData.timeIn) {
      const startTime = new Date(formData.timeIn);
      const endTime = new Date(value);
      if (endTime > startTime) {
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        const selectedRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === formData.room) : null);
        const hourlyRate = selectedRoom?.hourlyRate || 25;
        const basePrice = (durationMinutes / 60) * hourlyRate;
        setFormData(prev => ({
          ...prev,
          basePrice: Math.round(basePrice * 100) / 100,
          totalPrice: Math.round((basePrice + (prev.additionalFees || 0) - (prev.discount || 0)) * 100) / 100
        }));
      } else if (endTime <= startTime) {
        // If end time is not after start time, automatically adjust end time to be 1 hour later
        const adjustedEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        setFormData(prev => ({
          ...prev,
          timeOut: adjustedEndTime.toISOString().slice(0, 16)
        }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
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
            {isEditing ? 'Edit Booking' : 'Create New Booking'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            {(settings.bookingFormFields.customerName?.visible || settings.bookingFormFields.phone?.visible || settings.bookingFormFields.email?.visible || settings.bookingFormFields.partySize?.visible) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField('customerName', settings.bookingFormFields.customerName, formData.customerName, (value) => setFormData(prev => ({ ...prev, customerName: value })))}
                  {renderFormField('phone', settings.bookingFormFields.phone, formData.phone, (value) => {
                    // Only allow digits and optional + at the beginning
                    const cleanValue = value.replace(/[^\d+]/g, '');
                    setFormData(prev => ({ ...prev, phone: cleanValue }));
                  })}
                  {renderFormField('email', settings.bookingFormFields.email, formData.email, (value) => setFormData(prev => ({ ...prev, email: value })))}
                  {renderFormField('partySize', settings.bookingFormFields.partySize, formData.partySize, (value) => setFormData(prev => ({ ...prev, partySize: parseInt(value) })))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {settings.customBookingFields?.filter(field => field.visible).map((field) => (
              <div key={field.id} className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField(field.name, field, formData[field.name] || '', (value) => setFormData(prev => ({ ...prev, [field.name]: value })))}
                </div>
              </div>
            ))}

            {/* Booking Details */}
            {(settings.bookingFormFields.room?.visible || settings.bookingFormFields.source?.visible || settings.bookingFormFields.timeIn?.visible || settings.bookingFormFields.timeOut?.visible || settings.bookingFormFields.status?.visible || settings.bookingFormFields.priority?.visible) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.bookingFormFields.room?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.room.label} {settings.bookingFormFields.room.required && '*'}
                      </label>
                      <CustomSelect
                        value={formData.room}
                        onChange={(value) => setFormData(prev => ({ ...prev, room: value }))}
                        options={rooms
                          .filter(r => r.status === 'active' && r.isBookable)
                          .map(r => ({ value: r._id || r.id, label: formatRoomOption(r) }))}
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.source?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.source.label} {settings.bookingFormFields.source.required && '*'}
                      </label>
                      <CustomSelect
                        value={formData.source}
                        onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                        options={[
                          { value: 'walk_in', label: 'Walk-in' },
                          { value: 'phone', label: 'Phone' },
                          { value: 'email', label: 'Email' },
                          { value: 'online', label: 'Online' },
                          { value: 'app', label: 'App' },
                          { value: 'other', label: 'Other' },
                        ]}
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.timeIn?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.timeIn.label} {settings.bookingFormFields.timeIn.required && '*'}
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.timeIn}
                        onChange={(e) => handleTimeChange('timeIn', e.target.value)}
                        placeholder={settings.bookingFormFields.timeIn.placeholder}
                        required={settings.bookingFormFields.timeIn.required}
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.timeOut?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.timeOut.label} {settings.bookingFormFields.timeOut.required && '*'}
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.timeOut}
                        onChange={(e) => handleTimeChange('timeOut', e.target.value)}
                        placeholder={settings.bookingFormFields.timeOut.placeholder}
                        required={settings.bookingFormFields.timeOut.required}
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.status?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.status.label} {settings.bookingFormFields.status.required && '*'}
                      </label>
                      <CustomSelect
                        value={formData.status}
                        onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        options={[
                          { value: 'confirmed', label: 'Confirmed' },
                          { value: 'pending', label: 'Pending' },
                          { value: 'cancelled', label: 'Cancelled' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'no_show', label: 'No Show' },
                        ]}
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.priority?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.priority.label} {settings.bookingFormFields.priority.required && '*'}
                      </label>
                      <CustomSelect
                        value={formData.priority}
                        onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'high', label: 'High' },
                          { value: 'urgent', label: 'Urgent' },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            {(settings.bookingFormFields.basePrice?.visible || settings.bookingFormFields.additionalFees?.visible || settings.bookingFormFields.discount?.visible || settings.bookingFormFields.totalPrice?.visible) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderFormField('basePrice', settings.bookingFormFields.basePrice, formData.basePrice, (value) => setFormData(prev => ({ ...prev, basePrice: parseFloat(value) })))}
                  {renderFormField('additionalFees', settings.bookingFormFields.additionalFees, formData.additionalFees, (value) => setFormData(prev => ({ ...prev, additionalFees: parseFloat(value) })))}
                  {renderFormField('discount', settings.bookingFormFields.discount, formData.discount, (value) => setFormData(prev => ({ ...prev, discount: parseFloat(value) })))}
                </div>
                {settings.bookingFormFields.totalPrice?.visible && (
                  <div className="text-lg font-semibold text-gray-900">
                    Total: ${Number(formData.totalPrice || 0).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Additional Information */}
            {(settings.bookingFormFields.notes?.visible || settings.bookingFormFields.specialRequests?.visible) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="space-y-4">
                  {settings.bookingFormFields.notes?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.notes.label} {settings.bookingFormFields.notes.required && '*'}
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={settings.bookingFormFields.notes.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="3"
                      />
                    </div>
                  )}
                  {settings.bookingFormFields.specialRequests?.visible && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {settings.bookingFormFields.specialRequests.label} {settings.bookingFormFields.specialRequests.required && '*'}
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        placeholder={settings.bookingFormFields.specialRequests.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : (isEditing ? 'Update Booking' : 'Create Booking')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;
