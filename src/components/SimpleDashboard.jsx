import React, { useState } from 'react';
import moment from 'moment';
import Header from './Header';
import DigitalClock from './DigitalClock';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { roomsAPI, bookingsAPI } from '../lib/api';

const SimpleDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 17)); // September 17, 2025
  const [showSettings, setShowSettings] = useState(false);

  // Fetch rooms
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
  });

  // Fetch bookings
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings', selectedDate],
    queryFn: () => bookingsAPI.getAll({ date: selectedDate }),
  });

  const rooms = roomsData?.data || [];
  const bookings = bookingsData?.data?.bookings || [];

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const getRoomTypeColor = (type) => {
    const colors = {
      medium: 'bg-blue-100 text-blue-800',
      large: 'bg-green-100 text-green-800',
      party: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSettingsClick={handleSettingsClick} />
      
      <div className="p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Boom Karaoke Booking System
            </h1>
            <p className="text-gray-600">
              {moment(selectedDate).format('dddd, MMMM D, YYYY')}
            </p>
          </div>
        </div>
        
        {/* Fixed Digital Clock */}
        <DigitalClock 
          showSeconds={true} 
          showDate={true} 
          showDay={true}
          size="lg"
          className="shadow-xl border-2 border-blue-200 bg-blue-50"
        />

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roomsLoading ? '...' : rooms.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingsLoading ? '...' : bookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moment().format('h:mm A')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Rooms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading rooms...</p>
                </div>
              ) : roomsError ? (
                <div className="text-center py-4 text-red-600">
                  Error loading rooms: {roomsError.message}
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map(room => (
                    <div key={room._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: room.color }}
                        />
                        <div>
                          <p className="font-medium">{room.name || 'Unnamed Room'}</p>
                          <p className="text-sm text-gray-600">{room.capacity} people</p>
                        </div>
                      </div>
                      <Badge className={getRoomTypeColor(room.category)}>
                        {room.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Today's Bookings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading bookings...</p>
                </div>
              ) : bookingsError ? (
                <div className="text-center py-4 text-red-600">
                  Error loading bookings: {bookingsError.message}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings for today</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Booking
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking._id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{booking.customerName}</p>
                        <Badge className="bg-green-100 text-green-800">
                          {booking.source}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{booking.roomId?.name || booking.room?.name || booking.room_name || 'Unknown room'}</p>
                        <p>
                          {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
                        </p>
                        {booking.notes && <p className="text-xs italic">"{booking.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Plus className="w-6 h-6" />
                <span>New Booking</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Calendar className="w-6 h-6" />
                <span>View Calendar</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Manage Rooms</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Clock className="w-6 h-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
