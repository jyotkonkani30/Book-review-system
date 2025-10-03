const Book = require('../models/Book');
const { validationResult } = require('express-validator');
const { bookStorage } = require('../utils/localStorage');

// @desc    Get all books with pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const startIndex = (page - 1) * limit;
    
    let books = [];
    let total = 0;
    
    try {
      // Try MongoDB first
      // Build query object
      let query = {};
      
      // Search functionality
      if (req.query.search) {
        query = {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { author: { $regex: req.query.search, $options: 'i' } }
          ]
        };
      }
      
      // Filter by genre
      if (req.query.genre && req.query.genre !== 'all') {
        query.genre = req.query.genre;
      }
      
      // Sort options
      let sortOptions = {};
      if (req.query.sort === 'year_desc') {
        sortOptions = { publishedYear: -1 };
      } else if (req.query.sort === 'year_asc') {
        sortOptions = { publishedYear: 1 };
      } else if (req.query.sort === 'rating_desc') {
        sortOptions = { averageRating: -1 };
      } else if (req.query.sort === 'rating_asc') {
        sortOptions = { averageRating: 1 };
      } else {
        sortOptions = { createdAt: -1 }; // Default: newest first
      }

      books = await Book.find(query)
        .populate('addedBy', 'name')
        .sort(sortOptions)
        .limit(limit)
        .skip(startIndex);

      total = await Book.countDocuments(query);
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for book listing');
      
      // Fall back to local storage
      let allBooks = bookStorage.findAll();
      
      // Apply filters manually
      if (req.query.search) {
        const search = req.query.search.toLowerCase();
        allBooks = allBooks.filter(book => 
          book.title.toLowerCase().includes(search) || 
          book.author.toLowerCase().includes(search)
        );
      }
      
      if (req.query.genre && req.query.genre !== 'all') {
        allBooks = allBooks.filter(book => book.genre === req.query.genre);
      }
      
      // Apply sorting manually
      if (req.query.sort === 'year_desc') {
        allBooks.sort((a, b) => b.publishedYear - a.publishedYear);
      } else if (req.query.sort === 'year_asc') {
        allBooks.sort((a, b) => a.publishedYear - b.publishedYear);
      } else if (req.query.sort === 'rating_desc') {
        allBooks.sort((a, b) => b.averageRating - a.averageRating);
      } else if (req.query.sort === 'rating_asc') {
        allBooks.sort((a, b) => a.averageRating - b.averageRating);
      } else {
        // Default: newest first by creation date
        allBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      total = allBooks.length;
      books = allBooks.slice(startIndex, startIndex + limit);
    }
    
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res) => {
  try {
    let book;
    
    try {
      // Try MongoDB first
      book = await Book.findById(req.params.id).populate('addedBy', 'name');
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for book retrieval');
      // Fall back to local storage
      book = bookStorage.findById(req.params.id);
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
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

    const { title, author, description, genre, publishedYear } = req.body;

    let book;
    let populatedBook;

    try {
      // Try MongoDB first
      book = await Book.create({
        title,
        author,
        description,
        genre,
        publishedYear,
        addedBy: req.user._id,
      });
      
      populatedBook = await Book.findById(book._id).populate('addedBy', 'name');
    } catch (dbError) {
      console.log('MongoDB not available, using local storage for book creation');
      
      // Fall back to local storage
      book = bookStorage.create({
        title,
        author,
        description,
        genre,
        publishedYear,
        addedBy: req.user._id,
        averageRating: 0,
        totalReviews: 0
      });
      
      // Since we can't do MongoDB population with local storage, 
      // manually add the user name to simulate population
      populatedBook = {
        ...book,
        addedBy: {
          _id: req.user._id,
          name: req.user.name
        }
      };
    }

    res.status(201).json({
      success: true,
      data: populatedBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
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

    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Make sure user is book owner
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }

    book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('addedBy', 'name');

    res.json({
      success: true,
      data: book,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Update book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Make sure user is book owner
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this book'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's books
// @route   GET /api/books/user/mybooks
// @access  Private
const getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Get user books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getUserBooks,
};