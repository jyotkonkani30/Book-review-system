const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Directory to store local data files
const DATA_DIR = path.join(__dirname, '../data');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// Initialize files with empty arrays if they don't exist
const initializeDataFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
};

// Initialize all data files
initializeDataFile(USERS_FILE);
initializeDataFile(BOOKS_FILE);
initializeDataFile(REVIEWS_FILE);

// Helper functions to read from and write to JSON files
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading from ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

// User CRUD operations
const userStorage = {
  findById: (id) => {
    const users = readData(USERS_FILE);
    const user = users.find(user => user._id === id);
    if (user) {
      // Don't return password in the response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
  
  findOne: async ({ email }) => {
    const users = readData(USERS_FILE);
    return users.find(user => user.email === email);
  },
  
  create: async ({ name, email, password }) => {
    const users = readData(USERS_FILE);
    
    // Check if user with the same email already exists
    if (users.some(user => user.email === email)) {
      return null;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user with UUID
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeData(USERS_FILE, users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  matchPassword: async (user, enteredPassword) => {
    if (!user || !user.password) return false;
    try {
      return await bcrypt.compare(enteredPassword, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }
};

// Book CRUD operations
const bookStorage = {
  findAll: () => {
    return readData(BOOKS_FILE);
  },
  
  findById: (id) => {
    const books = readData(BOOKS_FILE);
    return books.find(book => book._id === id);
  },
  
  create: (bookData) => {
    const books = readData(BOOKS_FILE);
    const newBook = {
      _id: Date.now().toString(),
      ...bookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    books.push(newBook);
    writeData(BOOKS_FILE, books);
    return newBook;
  },
  
  update: (id, bookData) => {
    let books = readData(BOOKS_FILE);
    const index = books.findIndex(book => book._id === id);
    
    if (index !== -1) {
      books[index] = {
        ...books[index],
        ...bookData,
        updatedAt: new Date().toISOString()
      };
      writeData(BOOKS_FILE, books);
      return books[index];
    }
    return null;
  },
  
  delete: (id) => {
    let books = readData(BOOKS_FILE);
    const filtered = books.filter(book => book._id !== id);
    
    if (filtered.length < books.length) {
      writeData(BOOKS_FILE, filtered);
      return true;
    }
    return false;
  }
};

// Review CRUD operations
const reviewStorage = {
  findByBookId: (bookId) => {
    const reviews = readData(REVIEWS_FILE);
    return reviews.filter(review => review.book === bookId);
  },
  
  findOne: (query) => {
    const reviews = readData(REVIEWS_FILE);
    if (query.book && query.user) {
      return reviews.find(review => review.book === query.book && review.user === query.user);
    }
    return null;
  },
  
  findById: (id) => {
    const reviews = readData(REVIEWS_FILE);
    return reviews.find(review => review._id === id);
  },
  
  findByUserId: (userId) => {
    const reviews = readData(REVIEWS_FILE);
    return reviews.filter(review => review.user === userId);
  },
  
  create: (reviewData) => {
    const reviews = readData(REVIEWS_FILE);
    const newReview = {
      _id: Date.now().toString(),
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    reviews.push(newReview);
    writeData(REVIEWS_FILE, reviews);
    
    // Update book's average rating and total reviews
    reviewStorage.updateBookStats(reviewData.book);
    
    return newReview;
  },
  
  update: (id, reviewData) => {
    let reviews = readData(REVIEWS_FILE);
    const index = reviews.findIndex(review => review._id === id);
    
    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        ...reviewData,
        updatedAt: new Date().toISOString()
      };
      writeData(REVIEWS_FILE, reviews);
      return reviews[index];
    }
    return null;
  },
  
  delete: (id) => {
    let reviews = readData(REVIEWS_FILE);
    const review = reviews.find(r => r._id === id);
    const bookId = review ? review.book : null;
    
    const filtered = reviews.filter(review => review._id !== id);
    
    if (filtered.length < reviews.length) {
      writeData(REVIEWS_FILE, filtered);
      
      // Update book's average rating and total reviews after deletion
      if (bookId) {
        reviewStorage.updateBookStats(bookId);
      }
      
      return true;
    }
    return false;
  },
  
  // Helper method to update a book's rating and review count
  updateBookStats: (bookId) => {
    const reviews = readData(REVIEWS_FILE);
    const bookReviews = reviews.filter(review => review.book === bookId);
    
    // Calculate average rating
    let averageRating = 0;
    if (bookReviews.length > 0) {
      const sum = bookReviews.reduce((total, review) => total + review.rating, 0);
      averageRating = Math.round((sum / bookReviews.length) * 10) / 10; // Round to 1 decimal place
    }
    
    // Update book
    const books = readData(BOOKS_FILE);
    const bookIndex = books.findIndex(book => book._id === bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex] = {
        ...books[bookIndex],
        averageRating,
        totalReviews: bookReviews.length,
        updatedAt: new Date().toISOString()
      };
      writeData(BOOKS_FILE, books);
    }
  }
};

module.exports = {
  userStorage,
  bookStorage,
  reviewStorage
};