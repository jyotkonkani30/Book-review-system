import React, { createContext, useContext, useReducer } from 'react';
import api from '../utils/api';

// Initial state
const initialState = {
  books: [],
  currentBook: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: '',
    genre: 'all',
    sort: 'newest',
  },
};

// Create context
const BookContext = createContext();

// Action types
const BOOK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  GET_BOOKS_SUCCESS: 'GET_BOOKS_SUCCESS',
  GET_BOOK_SUCCESS: 'GET_BOOK_SUCCESS',
  BOOK_ERROR: 'BOOK_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_CURRENT_BOOK: 'CLEAR_CURRENT_BOOK',
};

// Reducer
const bookReducer = (state, action) => {
  switch (action.type) {
    case BOOK_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: true,
      };
    case BOOK_ACTIONS.GET_BOOKS_SUCCESS:
      return {
        ...state,
        books: action.payload.data,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case BOOK_ACTIONS.GET_BOOK_SUCCESS:
      return {
        ...state,
        currentBook: action.payload,
        loading: false,
        error: null,
      };
    case BOOK_ACTIONS.BOOK_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case BOOK_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case BOOK_ACTIONS.CLEAR_CURRENT_BOOK:
      return {
        ...state,
        currentBook: null,
      };
    case BOOK_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const BookProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookReducer, initialState);

  // Get books
  const getBooks = async (page = 1, filters = {}) => {
    try {
      dispatch({ type: BOOK_ACTIONS.SET_LOADING });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...filters,
      });

      const res = await api.get(`/books?${params}`);
      dispatch({
        type: BOOK_ACTIONS.GET_BOOKS_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: BOOK_ACTIONS.BOOK_ERROR,
        payload: err.response?.data?.message || 'Failed to fetch books',
      });
    }
  };

  // Get single book
  const getBook = async (id) => {
    try {
      dispatch({ type: BOOK_ACTIONS.SET_LOADING });
      const res = await api.get(`/books/${id}`);
      dispatch({
        type: BOOK_ACTIONS.GET_BOOK_SUCCESS,
        payload: res.data.data,
      });
    } catch (err) {
      dispatch({
        type: BOOK_ACTIONS.BOOK_ERROR,
        payload: err.response?.data?.message || 'Failed to fetch book',
      });
    }
  };

  // Create book
  const createBook = async (bookData) => {
    try {
      const res = await api.post('/books', bookData);
      return { success: true, message: res.data.message, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create book';
      return { success: false, message };
    }
  };

  // Update book
  const updateBook = async (id, bookData) => {
    try {
      const res = await api.put(`/books/${id}`, bookData);
      return { success: true, message: res.data.message, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update book';
      return { success: false, message };
    }
  };

  // Delete book
  const deleteBook = async (id) => {
    try {
      const res = await api.delete(`/books/${id}`);
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete book';
      return { success: false, message };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: BOOK_ACTIONS.SET_FILTERS,
      payload: filters,
    });
  };

  // Clear current book
  const clearCurrentBook = () => {
    dispatch({ type: BOOK_ACTIONS.CLEAR_CURRENT_BOOK });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: BOOK_ACTIONS.CLEAR_ERRORS });
  };

  return (
    <BookContext.Provider
      value={{
        ...state,
        getBooks,
        getBook,
        createBook,
        updateBook,
        deleteBook,
        setFilters,
        clearCurrentBook,
        clearErrors,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

// Custom hook to use book context
export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};