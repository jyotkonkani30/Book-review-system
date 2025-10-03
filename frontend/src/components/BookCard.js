import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const BookCard = ({ book }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link to={`/books/${book._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              by {book.author}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200">
            {book.genre}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {book.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <StarRating rating={book.averageRating} readonly size="sm" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({book.totalReviews} {book.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {book.publishedYear}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Added by {book.addedBy?.name || 'Unknown'}
          </p>
          <Link
            to={`/books/${book._id}`}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View Details
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;