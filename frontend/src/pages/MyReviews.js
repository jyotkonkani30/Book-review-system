import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StarRating from '../components/StarRating';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews/user/myreviews');
        setReviews(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your reviews. Please try again.');
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      setError('Failed to delete review. Please try again.');
    }
  };

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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Reviews</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't written any reviews yet.</p>
          <Link
            to="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Browse Books to Review
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    to={`/books/${review.book._id}`}
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    {review.book.title}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-400">{review.book.author}</p>
                </div>
                <div className="flex items-center">
                  <StarRating rating={review.rating} />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{review.rating}/5</span>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">{review.reviewText}</p>
              
              <div className="mt-4 flex justify-end items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                  aria-label="Delete review"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;