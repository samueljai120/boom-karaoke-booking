import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Header from './Header';
import DatePicker from './DatePicker';
import Scheduler from './Scheduler';
import DigitalClock from './DigitalClock';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Users, Clock, Calendar, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { roomsAPI, bookingsAPI } from '../lib/api';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 17)); // September 17, 2025
  const [showSettings, setShowSettings] = useState(false);
  const { connected } = useWebSocket();
  const queryClient = useQueryClient();

  // Test data fetching
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', selectedDate],
    queryFn: () => bookingsAPI.getAll({ date: moment(selectedDate).format('YYYY-MM-DD') }),
  });

  const rooms = roomsData?.data || [];
  const bookings = bookingsData?.data?.bookings || [];

  // Set up real-time updates
  useEffect(() => {
    const unsubscribe = useWebSocket().subscribeToBookingChanges((data) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    });

    return unsubscribe;
  }, [queryClient]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSettingsClick={handleSettingsClick} />
      
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>
      
      {/* Fixed Digital Clock */}
      <DigitalClock 
        showSeconds={true} 
        showDate={true} 
        showDay={true}
        size="md"
        className="shadow-xl border-2 border-blue-200 bg-blue-50"
      />
      
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Date Picker */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          
          {/* Connection Status */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rooms:</span>
                <span>{rooms.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bookings:</span>
                <span>{bookings.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Scheduler */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full">
            <Scheduler
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
        </div>

        {/* Right Sidebar - Quick Stats */}
        <div className="w-64 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Date</span>
                </div>
                <span className="text-sm font-medium">
                  {moment(selectedDate).format('MMM D, YYYY')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Day</span>
                </div>
                <span className="text-sm font-medium">
                  {moment(selectedDate).format('dddd')}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Room Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-gray-600">Medium</span>
                    </div>
                    <Badge className="text-xs">
                      {rooms.filter(r => r.type === 'medium').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Large</span>
                    </div>
                    <Badge className="text-xs">
                      {rooms.filter(r => r.type === 'large').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs text-gray-600">Party</span>
                    </div>
                    <Badge className="text-xs">
                      {rooms.filter(r => r.type === 'party').length}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1">
                    Find Available Slot
                  </button>
                  <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1">
                    View All Bookings
                  </button>
                  <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1">
                    Room Settings
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Modal (Placeholder) */}
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

export default Dashboard;