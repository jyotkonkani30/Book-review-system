import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookRes = await api.get(`/books/${id}`);
        setBook(bookRes.data.data);
        
        const reviewsRes = await api.get(`/reviews/${id}`);
        setReviews(reviewsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Check if user has already reviewed this book
  const hasUserReviewed = () => {
    if (!isAuthenticated || !user || !reviews.length) return false;
    // Handle both cases where user might be an object with _id or just the user ID
    return reviews.some(review => {
      if (review.user && review.user._id) {
        return review.user._id === user._id;
      }
      return review.user === user._id;
    });
  };

  // Handle review form changes
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value
    });
  };

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setReviewForm({
      ...reviewForm,
      rating: newRating
    });
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewForm.reviewText.trim().length < 10) {
      setReviewError('Review text must be at least 10 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setReviewError(null);
      
      const response = await api.post(`/reviews/${id}`, {
        rating: reviewForm.rating,
        reviewText: reviewForm.reviewText
      });
      
      // Add new review to reviews list with user info
      setReviews([
        {
          ...response.data.data,
          user: {
            _id: user._id,
            name: user.name
          }
        },
        ...reviews
      ]);
      
      // Reset form
      setReviewForm({
        rating: 5,
        reviewText: ''
      });
      
      setReviewSuccess('Your review was added successfully');
      
      // Update book data with new rating
      setBook({
        ...book,
        averageRating: response.data.data.rating, // This is simplified, ideally the API should return updated book data
        totalReviews: book.totalReviews + 1
      });
      
      setIsSubmitting(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'Book not found'}</p>
        <Link 
          to="/" 
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Books
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {book.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                by {book.author}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200 mr-4">
                {book.genre}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Published: {book.publishedYear}
              </span>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <StarRating rating={book.averageRating} readonly size="lg" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {book.averageRating.toFixed(1)} ({book.totalReviews} {book.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {book.description}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>

            {isAuthenticated ? (
              !hasUserReviewed() ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-3">Add Your Review</h3>
                  
                  {reviewError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                      {reviewError}
                    </div>
                  )}
                  
                  {reviewSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                      {reviewSuccess}
                    </div>
                  )}
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center">
                        <StarRating 
                          rating={reviewForm.rating} 
                          onRatingChange={handleRatingChange} 
                          size="md" 
                        />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {reviewForm.rating} of 5 stars
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label 
                        htmlFor="reviewText" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Your Review
                      </label>
                      <textarea
                        id="reviewText"
                        name="reviewText"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Write your review here..."
                        value={reviewForm.reviewText}
                        onChange={handleReviewChange}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {reviewForm.reviewText.length}/500 characters (minimum 10)
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 text-blue-700 dark:text-blue-300">
                  You've already reviewed this book.
                </div>
              )
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Please <Link to="/login" className="text-primary-600 hover:text-primary-500">sign in</Link> to leave a review.
                </p>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 italic">
                No reviews yet. Be the first to review this book!
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div 
                    key={review._id} 
                    className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {review.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {review.reviewText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;