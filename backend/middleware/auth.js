const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { userStorage } = require('../utils/localStorage');

const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token - try MongoDB first, fall back to local storage
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        console.log('MongoDB not available, using local storage for auth');
        req.user = userStorage.findById(decoded.id);
      }
      
      if (!req.user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = auth;