# 📚 Book Review Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application that allows users to discover, add, and review books. Users can create accounts, manage their book collections, write reviews, and explore books added by other users.

## 🌟 Features

### ✅ Core Functionality
- **User Authentication**: Secure signup/login with JWT tokens and password hashing
- **Book Management**: Add, edit, delete books with full CRUD operations
- **Review System**: Rate books (1-5 stars) and write detailed reviews
- **Pagination**: Efficient browsing with 5 books per page
- **Authorization**: Users can only edit/delete their own books and reviews

### 🎯 Search & Filter
- **Search**: Find books by title or author
- **Filter by Genre**: Browse books by category
- **Sort Options**: Sort by date, rating, or publication year

### 🚀 Bonus Features
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes
- **Average Ratings**: Automatic calculation and display of book ratings
- **User Profiles**: View user's books and reviews
- **Real-time Updates**: Dynamic rating calculations

## 🛠️ Technology Stack

### Backend
- **Node.js** & **Express.js**: Server and API framework
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library with hooks
- **React Router**: Client-side routing
- **Context API**: State management
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework

## 📁 Project Structure

```
book-review-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Review.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── reviewController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   └── reviewRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── database.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── BookCard.js
│   │   │   ├── StarRating.js
│   │   │   └── Pagination.js
│   │   ├── pages/
│   │   │   ├── BookList.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── BookContext.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-review-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/book_review_platform?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=30d
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the Applications**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Database Schema

### User Schema
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  timestamps: true
}
```

### Book Schema
```javascript
{
  title: String (required, max 200 chars),
  author: String (required, max 100 chars),
  description: String (required, max 1000 chars),
  genre: String (required, enum values),
  publishedYear: Number (required, 1000-current year),
  addedBy: ObjectId (ref: User),
  averageRating: Number (0-5, default: 0),
  totalReviews: Number (default: 0),
  timestamps: true
}
```

### Review Schema
```javascript
{
  book: ObjectId (ref: Book),
  user: ObjectId (ref: User),
  rating: Number (required, 1-5),
  reviewText: String (required, max 500 chars),
  timestamps: true
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Books
- `GET /api/books` - Get all books (with pagination, search, filter)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (protected)
- `PUT /api/books/:id` - Update book (protected, owner only)
- `DELETE /api/books/:id` - Delete book (protected, owner only)
- `GET /api/books/user/mybooks` - Get user's books (protected)

### Reviews
- `GET /api/reviews/:bookId` - Get reviews for a book
- `POST /api/reviews/:bookId` - Add review (protected)
- `PUT /api/reviews/:id` - Update review (protected, owner only)
- `DELETE /api/reviews/:id` - Delete review (protected, owner only)
- `GET /api/reviews/user/myreviews` - Get user's reviews (protected)

## 🎨 UI Components

### Key Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Star Rating**: Interactive 5-star rating system
- **Search & Filter**: Real-time search and genre filtering
- **Pagination**: Efficient navigation through large datasets
- **Form Validation**: Client-side and server-side validation
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation with express-validator
- **CORS Configuration**: Controlled cross-origin requests
- **Protected Routes**: Middleware-based route protection
- **Authorization Checks**: Owner-only actions for books and reviews

## 🧪 Testing

### API Testing with Postman
1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Test authentication flows and CRUD operations

### Manual Testing
1. User Registration and Login
2. Book CRUD operations
3. Review system functionality
4. Search and filter features
5. Pagination and sorting
6. Authorization and access control

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy the backend service

### Frontend Deployment (Vercel/Netlify)
1. Build the production version: `npm run build`
2. Connect GitHub repository
3. Set build command and output directory
4. Deploy the frontend

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database hosting
- Tailwind CSS for styling framework
- React community for excellent documentation
- Express.js for robust backend framework

## 📞 Support

For support, email [your-email@example.com] or create an issue in the GitHub repository.

---

**Built with ❤️ using the MERN Stack**