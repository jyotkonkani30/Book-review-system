# Book Review Platform Setup Guide

## Quick Setup Instructions

### 1. Environment Setup

**Backend (.env file):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/book_review_platform?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRE=30d
```

**Replace the following:**
- `your_username` - Your MongoDB Atlas username
- `your_password` - Your MongoDB Atlas password
- `your_super_secret_jwt_key_here_make_it_very_long_and_secure` - A long, random string for JWT signing

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

### 3. Installation Commands

```bash
# Clone the project (if from Git)
git clone <your-repo-url>
cd book-review-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Development Commands

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### 5. Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 6. Test the Application

1. **Register a new user** at http://localhost:3000/register
2. **Login** with your credentials
3. **Add a book** using the "Add Book" button
4. **Browse books** on the home page
5. **Search and filter** books by title, author, or genre

### 7. Common Issues & Solutions

**Backend won't start:**
- Check if MongoDB URI is correct
- Ensure .env file is in the backend directory
- Verify all environment variables are set

**Frontend won't start:**
- Make sure you're in the frontend directory
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**CORS Issues:**
- Backend CORS is configured for localhost:3000
- If using different ports, update CORS settings in server.js

### 8. Production Deployment

**Backend (Render/Heroku):**
1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables in platform settings
4. Deploy backend service

**Frontend (Vercel/Netlify):**
1. Run `npm run build` in frontend directory
2. Upload dist/build folder or connect GitHub repo
3. Set build command: `npm run build`
4. Set publish directory: `build`

### 9. API Testing

Use these sample requests with Postman or any API client:

**Register User:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Create Book (requires token):**
```
POST http://localhost:5000/api/books
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Sample Book",
  "author": "Sample Author",
  "description": "This is a sample book description.",
  "genre": "Fiction",
  "publishedYear": 2023
}
```

### 10. Next Steps

After basic setup, consider implementing:
- Book details page with reviews
- Edit/delete book functionality
- User profile pages
- Advanced search features
- Email notifications
- Image uploads for book covers
- Social features (likes, follows)

---

**Need Help?** 
- Check the main README.md for detailed documentation
- Review the API endpoints in the backend routes
- Look at the component structure in frontend/src