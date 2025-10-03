const Review = require('../models/Review');
const Book = require('../models/Book');
const { validationResult } = require('express-validator');
const { reviewStorage, bookStorage, userStorage } = require('../utils/localStorage');

// @desc    Get reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    let reviews;
    
    try {
      // Try MongoDB first
      reviews = await Review.find({ book: req.params.bookId })
        .populate('user', 'name')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for reviews');
      
      // Fall back to local storage
      reviews = reviewStorage.findByBookId(req.params.bookId);
      
      // Manually add user names to simulate populate
      reviews = reviews.map(review => {
        const user = userStorage.findById(review.user);
        return {
          ...review,
          user: user ? { _id: user._id, name: user.name } : { _id: review.user, name: 'Unknown User' }
        };
      });
      
      // Sort by createdAt in descending order
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add review
// @route   POST /api/reviews/:bookId
// @access  Private
const addReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating, reviewText } = req.body;
    const bookId = req.params.bookId;
    let book;
    let existingReview;

    try {
      // Try MongoDB first for book check
      book = await Book.findById(bookId);
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for book check');
      book = bookStorage.findById(bookId);
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    try {
      // Check if user already reviewed this book using MongoDB
      existingReview = await Review.findOne({
        book: bookId,
        user: req.user._id
      });
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for review check');
      existingReview = reviewStorage.findOne({
        book: bookId,
        user: req.user._id
      });
    }

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    let review;
    let populatedReview;

    try {
      // Try creating the review with MongoDB
      review = await Review.create({
        book: bookId,
        user: req.user._id,
        rating,
        reviewText,
      });
      
      populatedReview = await Review.findById(review._id)
        .populate('user', 'name');
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for review creation');
      
      // Fall back to local storage
      review = reviewStorage.create({
        book: bookId,
        user: req.user._id,
        rating: parseInt(rating),
        reviewText,
      });
      
      // Manually populate user data
      const user = userStorage.findById(req.user._id);
      populatedReview = {
        ...review,
        user: user ? { _id: user._id, name: user.name } : { _id: req.user._id, name: 'Unknown User' }
      };
    }

    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let review;
    
    try {
      // Try MongoDB first
      review = await Review.findById(req.params.id);
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for review lookup');
      review = reviewStorage.findById(req.params.id);
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    const reviewUserId = review.user.toString ? review.user.toString() : review.user;
    const currentUserId = req.user._id.toString ? req.user._id.toString() : req.user._id;
    
    if (reviewUserId !== currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    try {
      // Try MongoDB update
      review = await Review.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate('user', 'name');
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for review update');
      
      // Fall back to local storage
      review = reviewStorage.update(req.params.id, req.body);
      
      // Manually populate user data
      const user = userStorage.findById(review.user);
      review = {
        ...review,
        user: user ? { _id: user._id, name: user.name } : { _id: review.user, name: 'Unknown User' }
      };
    }

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    let review;
    let isDeleted = false;
    
    try {
      // Try MongoDB first
      review = await Review.findById(req.params.id);
      
      if (review) {
        // Make sure user is review owner
        if (review.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized to delete this review'
          });
        }

        await Review.findByIdAndDelete(req.params.id);
        isDeleted = true;
      }
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for review deletion');
      
      // Fall back to local storage
      review = reviewStorage.findById(req.params.id);
      
      if (review) {
        // Make sure user is review owner
        if (review.user !== req.user._id) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized to delete this review'
          });
        }
        
        isDeleted = reviewStorage.delete(req.params.id);
      }
    }

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (!isDeleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/myreviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    let reviews;
    
    try {
      // Try MongoDB first
      reviews = await Review.find({ user: req.user._id })
        .populate('book', 'title author')
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for user reviews');
      
      // Fall back to local storage
      reviews = reviewStorage.findByUserId(req.user._id);
      
      // Manually populate book data
      reviews = reviews.map(review => {
        const book = bookStorage.findById(review.book);
        return {
          ...review,
          book: book ? { _id: book._id, title: book.title, author: book.author } : { _id: review.book, title: 'Unknown Book', author: 'Unknown Author' }
        };
      });
      
      // Sort by createdAt in descending order
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getBookReviews,
  addReview,
  updateReview,
  deleteReview,
  getUserReviews,
};