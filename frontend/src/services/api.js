import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Service - Centralized API communication
 * Handles authentication, error handling, and request/response interceptors
 */

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get auth tokens from localStorage
    const authData = localStorage.getItem('authTokens');
    if (authData) {
      const { accessToken } = JSON.parse(authData);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const isSilent = Boolean(originalRequest?.headers?.['X-Silent-Errors']);

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      if (!isSilent) {
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const authData = localStorage.getItem('authTokens');
        if (authData) {
          const { refreshToken } = JSON.parse(authData);
          
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken,
            });

            if (response.data.success) {
              // Update tokens in localStorage
              localStorage.setItem('authTokens', JSON.stringify(response.data.data.tokens));
              
              // Retry the original request with new token
              const { accessToken } = response.data.data.tokens;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              return apiClient(originalRequest);
            }
          }
        }

        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (status === 403) {
      if (!isSilent) {
        toast.error(data.message || 'Access denied. Insufficient permissions.');
      }
    }

    // Handle 429 Too Many Requests - rate limiting
    if (status === 429) {
      if (!isSilent) {
        toast.error(data.message || 'Too many requests. Please try again later.');
      }
    }

    // Handle 500+ server errors
    if (status >= 500) {
      if (!isSilent) {
        toast.error(data.message || 'Server error. Please try again later.');
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      if (!isSilent) {
        toast.error(data.message || 'Resource not found.');
      }
    }

    // Handle 400 Bad Request
    if (status === 400) {
      if (data.errors && Array.isArray(data.errors)) {
        if (!isSilent) {
          data.errors.forEach(err => toast.error(err));
        }
      } else {
        if (!isSilent) {
          toast.error(data.message || 'Invalid request.');
        }
      }
    }

    return Promise.reject(error);
  }
);

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// API service functions
export const authAPI = {
  login: (credentials, config = {}) => apiClient.post('/auth/login', credentials, config),
  register: (userData, config = {}) => apiClient.post('/auth/register', userData, config),
  logout: (config = {}) => apiClient.post('/auth/logout', null, config),
  refreshToken: (tokens, config = {}) => apiClient.post('/auth/refresh-token', tokens, config),
  changePassword: (passwordData, config = {}) => apiClient.post('/auth/change-password', passwordData, config),
  getProfile: (config = {}) => apiClient.get('/auth/profile', config),
};

export const patientAPI = {
  search: (params) => apiClient.get('/patients/search', { params }),
  getProfile: (patientId) => apiClient.get(`/patients/${patientId}/profile`),
  updateDemographics: (patientId, data) => apiClient.put(`/patients/${patientId}/demographics`, data),
  getMedicalRecords: (patientId, params) => apiClient.get(`/patients/${patientId}/medical-records`, { params }),
  createMedicalRecord: (patientId, data) => apiClient.post(`/patients/${patientId}/medical-records`, data),
  getVisits: (patientId, params) => apiClient.get(`/patients/${patientId}/visits`, { params }),
  addVisit: (patientId, data) => apiClient.post(`/patients/${patientId}/visits`, data),
  getMedications: (patientId, params) => apiClient.get(`/patients/${patientId}/medications`, { params }),
  emergencyAccess: (patientId, data) => apiClient.post(`/patients/${patientId}/emergency-access`, data),
};

export const consentAPI = {
  create: (patientId, data) => apiClient.post(`/consent/patients/${patientId}`, data),
  getPatientConsents: (patientId, params) => apiClient.get(`/consent/patients/${patientId}`, { params }),
  getMyConsents: (params) => apiClient.get('/consent/my-consents', { params }),
  revoke: (consentId, data) => apiClient.put(`/consent/${consentId}/revoke`, data),
  update: (consentId, data) => apiClient.put(`/consent/${consentId}`, data),
  check: (params) => apiClient.get('/consent/check', { params }),
  getStats: (patientId) => apiClient.get(`/consent/patients/${patientId}/stats`),
};

export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
  getSystemStats: () => apiClient.get('/admin/stats'),
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
};

// Utility function to handle API errors consistently
export const handleApiError = (error, customMessage = null) => {
  if (error.response) {
    const { status, data } = error.response;
    const message = customMessage || data.message || 'An error occurred';
    
    console.error('API Error:', {
      status,
      message,
      data,
      url: error.config?.url,
    });
    
    return { success: false, message, status, data };
  } else if (error.request) {
    console.error('Network Error:', error);
    return { 
      success: false, 
      message: customMessage || 'Network error. Please check your connection.' 
    };
  } else {
    console.error('Error:', error);
    return { 
      success: false, 
      message: customMessage || 'An unexpected error occurred.' 
    };
  }
};

// Utility function to show loading state
export const withLoading = async (apiCall, setLoading) => {
  try {
    setLoading(true);
    const result = await apiCall();
    return result;
  } finally {
    setLoading(false);
  }
};

export default apiClient;
