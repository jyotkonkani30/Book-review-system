const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getUserBooks,
} = require('../controllers/bookController');
const auth = require('../middleware/auth');

// Validation rules
const bookValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('genre')
    .isIn([
      'Fiction',
      'Non-Fiction',
      'Mystery',
      'Romance',
      'Science Fiction',
      'Fantasy',
      'Thriller',
      'Biography',
      'History',
      'Self-Help',
      'Business',
      'Technology',
      'Other'
    ])
    .withMessage('Please select a valid genre'),
  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage('Please enter a valid year'),
];

// Routes
router.route('/')
  .get(getBooks)
  .post(auth, bookValidation, createBook);

router.route('/:id')
  .get(getBook)
  .put(auth, bookValidation, updateBook)
  .delete(auth, deleteBook);

router.get('/user/mybooks', auth, getUserBooks);

module.exports = router;