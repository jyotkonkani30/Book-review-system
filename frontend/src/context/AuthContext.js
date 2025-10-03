import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  USER_LOADING: 'USER_LOADING',
  USER_LOADED: 'USER_LOADED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.USER_LOADING:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.AUTH_ERROR:
    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      try {
        dispatch({ type: AUTH_ACTIONS.USER_LOADING });
        const res = await api.get('/auth/profile');
        dispatch({
          type: AUTH_ACTIONS.USER_LOADED,
          payload: res.data.data,
        });
      } catch (err) {
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: err.response?.data?.message || 'Authentication failed',
        });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.USER_LOADING });
      const res = await api.post('/auth/register', userData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data.data,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: message,
      });
      return { success: false, message };
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.USER_LOADING });
      const res = await api.post('/auth/login', userData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data.data,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: message,
      });
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearErrors,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};