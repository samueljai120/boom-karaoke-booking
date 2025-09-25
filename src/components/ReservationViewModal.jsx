import React, { useState } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { X, Calendar, Clock, Users, Phone, Mail, User, Edit, Trash2, Copy } from 'lucide-react';
import BookingConfirmation from './BookingConfirmation';

const ReservationViewModal = ({ isOpen, onClose, booking, onEdit, onDelete, onNoShow }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  if (!isOpen || !booking) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'walk_in': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSource = (source) => {
    switch (source) {
      case 'walk_in': return 'Walk-in';
      case 'phone': return 'Phone';
      case 'online': return 'Online';
      case 'email': return 'Email';
      default: return source;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto relative">
        {/* Exit Button - Top Right Corner */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 z-10 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center"
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
        
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 pr-10">
          <CardTitle className="text-lg font-semibold">Reservation Details</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Customer & Reservation Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                {booking.customerName || 'Guest'}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status || 'confirmed'}
                </Badge>
                <Badge className={getSourceColor(booking.source)}>
                  {formatSource(booking.source)}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                {booking.phone || 'N/A'}
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-3 w-3 mr-1" />
                {booking.email || 'N/A'}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-3 w-3 mr-1" />
                {booking.partySize || 'N/A'} guests
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                {booking.room?.name || booking.roomId?.name || booking.room_name || 'N/A'}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {moment(booking.startTime).format('MMM DD, YYYY')}
              </div>
              <div className="flex items-center text-gray-900">
                <Clock className="h-4 w-4 mr-2" />
                {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
              </div>
              <div className="text-gray-600">
                {moment(booking.endTime).diff(moment(booking.startTime), 'hours', true).toFixed(1)}h
              </div>
            </div>
          </div>


          {/* Additional Information */}
          {(booking.notes || booking.specialRequests || booking.pricing) && (
            <div className="space-y-2">
              {booking.notes && (
                <div className="bg-blue-50 p-2 rounded text-sm">
                  <span className="font-medium text-blue-800">Notes:</span>
                  <p className="text-blue-700 mt-1">{booking.notes}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div className="bg-orange-50 p-2 rounded text-sm">
                  <span className="font-medium text-orange-800">Special Requests:</span>
                  <p className="text-orange-700 mt-1">{booking.specialRequests}</p>
                </div>
              )}
              {booking.pricing && (
                <div className="bg-green-50 p-2 rounded text-sm">
                  <span className="font-medium text-green-800">Pricing:</span>
                  <span className="text-green-700 ml-2">${booking.pricing}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {onEdit && (
              <Button
                onClick={() => onEdit(booking)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onNoShow && booking.status === 'confirmed' && (
              <Button
                onClick={() => onNoShow(booking)}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                <User className="h-3 w-3 mr-1" />
                No Show
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmation(true)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Confirmation
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this reservation?')) {
                    onDelete(booking);
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Confirmation Modal */}
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        booking={booking}
      />
    </div>
  );
};

export default ReservationViewModal;
