import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import BookCard from '../components/BookCard';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/books/user/mybooks');
        setBooks(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your books. Please try again.');
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Books</h1>
        <Link
          to="/books/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Book
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && books.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't added any books yet.</p>
          <Link
            to="/books/add"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add Your First Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} showActions={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooks;