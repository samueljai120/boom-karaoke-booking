import { mockAPI } from './mockData.js';
import FetchClient from './fetchClient.js';
import { API_CONFIG, FORCE_REAL_API, FALLBACK_TO_MOCK } from '../config/api.js';

// API configuration - smart fallback system
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;
let isMockMode = false; // Start with real API, fallback to mock
let apiHealthChecked = false;
let apiHealthy = false;

// API configuration
console.log('🔧 API Mode:', isMockMode ? 'MOCK' : 'REAL', '| Base URL:', API_BASE_URL);

// Health check function
const checkApiHealth = async () => {
  if (apiHealthChecked) return apiHealthy;
  
  try {
    // Try both health endpoints
    const healthUrls = [`${API_BASE_URL}/health`, `${API_BASE_URL}/api/health`];
    
    for (const url of healthUrls) {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: API_CONFIG.HEADERS,
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          apiHealthy = true;
          apiHealthChecked = true;
          console.log('🏥 API Health Check: ✅ HEALTHY via', url);
          return true;
        }
      } catch (error) {
        console.log('🏥 API Health Check: ❌ FAILED for', url, '-', error.message);
      }
    }
    
    apiHealthy = false;
    apiHealthChecked = true;
    console.log('🏥 API Health Check: ❌ ALL ENDPOINTS FAILED');
    return false;
  } catch (error) {
    apiHealthy = false;
    apiHealthChecked = true;
    console.log('🏥 API Health Check: ❌ FAILED -', error.message);
    return false;
  }
};

// Create fetch client for real API calls
const apiClient = new FetchClient(API_BASE_URL, API_CONFIG.HEADERS);

// Error handler for fetch responses
const handleApiError = (error) => {
  if (error.status === 403) {
    // Handle token errors
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    if (import.meta.env.MODE === 'development') {
      console.log('🔑 Token error detected, clearing auth data');
    }
  }
  throw error;
};

// Helper function to convert frontend business hours format to backend format
const convertToBackendFormat = (businessHours) => {
  return businessHours.map(bh => ({
    day_of_week: bh.weekday,
    open_time: bh.openTime,
    close_time: bh.closeTime,
    is_closed: bh.isClosed || false
  }));
};

// Helper function to convert backend business hours format to frontend format
const convertToFrontendFormat = (backendHours) => {
  return backendHours.map(bh => ({
    weekday: bh.day_of_week,
    openTime: bh.open_time,
    closeTime: bh.close_time,
    isClosed: bh.is_closed || false
  }));
};

// Auth API with smart fallback
export const authAPI = {
  login: async (credentials) => {
    // For demo credentials, always use mock to ensure it works
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      console.log('🎯 Using mock API for demo login');
      return mockAPI.login(credentials);
    }
    
    // Check if we should use real API
    if (FORCE_REAL_API && FALLBACK_TO_MOCK) {
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        console.log('🔄 API unhealthy, falling back to mock for login');
        return mockAPI.login(credentials);
      }
    }
    
    if (isMockMode) {
      return mockAPI.login(credentials);
    }
    
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.log('❌ Real API login failed, falling back to mock:', error.message);
      if (FALLBACK_TO_MOCK) {
        return mockAPI.login(credentials);
      }
      throw error;
    }
  },
  
  logout: async () => {
    if (isMockMode) {
      return mockAPI.logout();
    }
    
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.log('❌ Real API logout failed, falling back to mock:', error.message);
      if (FALLBACK_TO_MOCK) {
        return mockAPI.logout();
      }
      throw error;
    }
  },
  
  register: async (userData) => {
    if (isMockMode) {
      return mockAPI.register(userData);
    }
    
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.log('❌ Real API register failed, falling back to mock:', error.message);
      if (FALLBACK_TO_MOCK) {
        return mockAPI.register(userData);
      }
      throw error;
    }
  },
  
  getSession: async () => {
    if (isMockMode) {
      return mockAPI.getSession();
    }
    
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.log('❌ Real API getSession failed, falling back to mock:', error.message);
      if (FALLBACK_TO_MOCK) {
        return mockAPI.getSession();
      }
      throw error;
    }
  },
  
  // Demo login for easy testing
  demoLogin: async () => {
    const demoCredentials = {
      email: 'demo@example.com',
      password: 'demo123'
    };
    return authAPI.login(demoCredentials);
  },
};

// Rooms API
export const roomsAPI = {
  getAll: (params = {}) => mockAPI.getRooms(params),
  getById: (id) => mockAPI.getRooms().then(response => 
    response.data.find(room => room.id === id)
  ),
  create: (data) => mockAPI.createRoom(data),
  update: (id, data) => mockAPI.updateRoom(id, data),
  delete: (id) => mockAPI.deleteRoom(id),
  getCategories: () => Promise.resolve({ 
    data: ['Standard', 'Premium', 'VIP'] 
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => mockAPI.getBookings(params),
  getById: (id) => mockAPI.getBookings().then(response => 
    response.data.find(booking => booking.id === id)
  ),
  create: (data) => mockAPI.createBooking(data),
  update: (id, data) => mockAPI.updateBooking(id, data),
  delete: (id) => mockAPI.deleteBooking(id),
  cancel: (id) => mockAPI.updateBooking(id, { status: 'cancelled' }),
  move: async (data) => {
    
    // Update the source booking
    const sourceResult = await mockAPI.updateBooking(data.bookingId, { 
      roomId: data.newRoomId,
      startTime: data.newTimeIn, 
      endTime: data.newTimeOut,
      timeIn: data.newTimeIn,
      timeOut: data.newTimeOut
    });
    
    // If there's a target booking (swap), update it too
    if (data.targetBookingId && data.targetNewTimeIn && data.targetNewTimeOut) {
      const targetResult = await mockAPI.updateBooking(data.targetBookingId, {
        roomId: data.targetRoomId || data.newRoomId,
        startTime: data.targetNewTimeIn,
        endTime: data.targetNewTimeOut,
        timeIn: data.targetNewTimeIn,
        timeOut: data.targetNewTimeOut
      });
      
      return {
        data: {
          source: sourceResult.data.booking,
          target: targetResult.data.booking,
          type: 'swap'
        }
      };
    }
    
    return {
      data: {
        booking: sourceResult.data.booking,
        type: 'move'
      }
    };
  },
  resize: (data) => mockAPI.updateBooking(data.bookingId, { 
    startTime: data.newStartTime, 
    endTime: data.newEndTime,
    timeIn: data.newStartTime,
    timeOut: data.newEndTime
  }),
};

// Availability API (simplified for mock)
export const availabilityAPI = {
  get: (params = {}) => Promise.resolve({ 
    data: { available: true, message: 'Mock availability data' } 
  }),
  findBest: (params = {}) => Promise.resolve({ 
    data: { roomId: 1, available: true } 
  }),
};

// Business Hours API
export const businessHoursAPI = {
  get: async () => {
    if (isMockMode) {
      return mockAPI.getBusinessHours();
    }
    
    try {
      const response = await apiClient.get('/business-hours');
      
      // Convert backend format to frontend format
      const frontendHours = convertToFrontendFormat(response.data.data || []);
      
      return {
        data: {
          success: true,
          businessHours: frontendHours
        }
      };
    } catch (error) {
      // Error fetching business hours - logging removed for clean version
      
      // Enhanced error logging
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        // Network error details - logging removed for clean version
        
        // Fallback to mock mode for network errors
        return mockAPI.getBusinessHours();
      }
      
      throw error;
    }
  },
  
  update: async (data) => {
    if (isMockMode) {
      return mockAPI.updateBusinessHours(data);
    }
    
    try {
      
      // Convert frontend format to backend format
      const backendHours = convertToBackendFormat(data.businessHours || data);
      
      const response = await apiClient.put('/business-hours', {
        hours: backendHours
      });
      
      // Convert response back to frontend format
      const frontendHours = convertToFrontendFormat(response.data.data || []);
      
      return {
        data: {
          success: true,
          businessHours: frontendHours
        }
      };
    } catch (error) {
      // Error updating business hours - logging removed for clean version
      
      // Enhanced error logging
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        // Network error details - logging removed for clean version
        
        // Fallback to mock mode for network errors
        return mockAPI.updateBusinessHours(data);
      }
      
      throw error;
    }
  },
  
  getExceptions: () => Promise.resolve({ data: [] }),
  createException: (data) => Promise.resolve({ data }),
  deleteException: (id) => Promise.resolve({ data: { message: 'Exception deleted' } }),
};

// Settings API
export const settingsAPI = {
  get: async () => {
    if (isMockMode) {
      return mockAPI.getSettings();
    }
    
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      // console.error('Error fetching settings:', error);
      throw error;
    }
  },
  
  update: async (data) => {
    if (isMockMode) {
      return mockAPI.updateSettings(data);
    }
    
    try {
      const response = await apiClient.put('/settings', data);
      return response.data;
    } catch (error) {
      // console.error('Error updating settings:', error);
      throw error;
    }
  },
};

// Health API
export const healthAPI = {
  check: () => mockAPI.healthCheck(),
};

// Default export for backward compatibility
export default {
  authAPI,
  roomsAPI,
  bookingsAPI,
  availabilityAPI,
  businessHoursAPI,
  settingsAPI,
  healthAPI
};