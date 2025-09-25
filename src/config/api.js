import { getApiBaseUrl } from '../utils/apiConfig';

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Smart API mode detection - tries real API first, falls back to mock
export const FORCE_REAL_API = true; // Enable real API attempts
export const FALLBACK_TO_MOCK = true; // Allow fallback to mock on failure
