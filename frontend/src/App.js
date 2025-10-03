import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import BookList from './pages/BookList';
import Login from './pages/Login';
import Register from './pages/Register';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import MyBooks from './pages/MyBooks';
import MyReviews from './pages/MyReviews';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/books/add" 
                element={
                  <ProtectedRoute>
                    <AddBook />
                  </ProtectedRoute>
                } 
              />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route 
                path="/my-books" 
                element={
                  <ProtectedRoute>
                    <MyBooks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-reviews" 
                element={
                  <ProtectedRoute>
                    <MyReviews />
                  </ProtectedRoute>
                } 
              />
              {/* Additional protected routes can be added here */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          </Router>
        </ThemeProvider>
      </BookProvider>
    </AuthProvider>
  );
}

export default App;