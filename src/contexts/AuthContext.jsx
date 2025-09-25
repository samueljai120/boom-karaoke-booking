import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { getApiBaseUrl } from '../utils/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔑 AuthContext: Initializing auth, token =', token);
      if (token) {
        try {
          // Use authAPI for session check with smart fallback
          const response = await authAPI.getSession();
          console.log('🔑 AuthContext: Session check response:', response);
          
          if (response.success) {
            setUser(response.data.user);
            console.log('🔑 AuthContext: User set from session:', response.data.user);
          } else {
            // Session invalid, clear auth
            console.log('🔑 AuthContext: Session invalid, clearing auth');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('🔑 AuthContext: Session check failed:', error);
          // For demo purposes, don't clear auth on network errors
          // Just set loading to false so the app can continue
          console.log('🔑 AuthContext: Using mock mode due to network error');
          
          // Try to get user from localStorage as fallback
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              setUser(user);
              console.log('🔑 AuthContext: Restored user from localStorage:', user);
            } catch (e) {
              console.error('🔑 AuthContext: Failed to parse stored user:', e);
            }
          }
        }
      } else {
        console.log('🔑 AuthContext: No token found');
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('🔑 AuthContext: Starting login process...');
      // Use the authAPI which has smart fallback to mock data
      const response = await authAPI.login(credentials);
      console.log('🔑 AuthContext: Login response:', response);
      
      if (response.success) {
        const { token, user } = response.data;
        console.log('🔑 AuthContext: Login successful, setting user:', user);
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        
        console.log('🔑 AuthContext: User state updated, returning success');
        return { success: true };
      } else {
        console.log('🔑 AuthContext: Login failed:', response.error);
        return {
          success: false,
          error: response.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('🔑 AuthContext: Login error:', error);
      return {
        success: false,
        error: 'Login failed - please try again'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Logout error - error handling removed for clean version
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};