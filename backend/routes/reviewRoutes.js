const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getBookReviews,
  addReview,
  updateReview,
  deleteReview,
  getUserReviews,
} = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Validation rules
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('reviewText')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Review text must be between 1 and 500 characters'),
];

// Routes
router.get('/:bookId', getBookReviews);
router.post('/:bookId', auth, reviewValidation, addReview);
router.put('/:id', auth, reviewValidation, updateReview);
router.delete('/:id', auth, deleteReview);
router.get('/user/myreviews', auth, getUserReviews);

module.exports = router;