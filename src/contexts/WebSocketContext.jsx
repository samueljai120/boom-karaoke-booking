import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if we're in mock mode (same logic as API)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const isMockMode = !API_BASE_URL || API_BASE_URL.includes('your-api-server.com') || API_BASE_URL.includes('localhost');
    
    // Skip WebSocket connection in mock mode
    if (isMockMode) {
      // Debug logging removed for clean version
      // console.log('🔧 Skipping WebSocket connection in mock mode');
      setConnected(false);
      return;
    }

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8002';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit('join-room', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit('leave-room', room);
    }
  };

  const subscribeToBookingChanges = (callback) => {
    if (socket && connected) {
      socket.on('booking-changed', callback);
      return () => socket.off('booking-changed', callback);
    }
    return () => {};
  };

  const subscribeToRoomChanges = (roomId, callback) => {
    if (socket && connected) {
      socket.on('room-booking-changed', callback);
      return () => socket.off('room-booking-changed', callback);
    }
    return () => {};
  };

  const subscribeToDateChanges = (date, callback) => {
    if (socket && connected) {
      socket.on('date-booking-changed', callback);
      return () => socket.off('date-booking-changed', callback);
    }
    return () => {};
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    subscribeToBookingChanges,
    subscribeToRoomChanges,
    subscribeToDateChanges,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};