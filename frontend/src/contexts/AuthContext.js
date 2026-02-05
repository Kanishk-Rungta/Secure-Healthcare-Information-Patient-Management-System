import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Authentication Context - Global authentication state management
 * Handles user authentication, tokens, and session management
 */

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_START: 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        tokens: action.payload.tokens,
        error: null,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedTokens = localStorage.getItem('authTokens');
        const storedUser = localStorage.getItem('authUser');

        if (storedTokens && storedUser) {
          const tokens = JSON.parse(storedTokens);
          const user = JSON.parse(storedUser);

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, tokens },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Save tokens and user to localStorage whenever they change
  useEffect(() => {
    if (state.isAuthenticated && state.tokens.accessToken) {
      localStorage.setItem('authTokens', JSON.stringify(state.tokens));
      localStorage.setItem('authUser', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('authTokens');
      localStorage.removeItem('authUser');
    }
  }, [state.isAuthenticated, state.tokens, state.user]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.login(credentials);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        toast.success('Login successful');
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message || 'Login failed',
        });
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.register(userData);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            tokens: response.data.tokens,
          },
        });

        toast.success('Registration successful');
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.message || 'Registration failed',
        });
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.tokens.accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!state.tokens.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken({
        refreshToken: state.tokens.refreshToken,
      });

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: { tokens: response.data.tokens },
        });
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
          payload: response.message || 'Token refresh failed',
        });
        return { success: false };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
        payload: 'Token refresh failed',
      });
      return { success: false };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);

      if (response.success) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        toast.error(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Get current user profile
  const getProfile = async () => {
    try {
      const response = await authAPI.getProfile();

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            tokens: state.tokens,
          },
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    changePassword,
    clearError,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
