const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { userStorage } = require('../utils/localStorage');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
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

    const { name, email, password } = req.body;

    // Check if user exists
    let userExists;
    try {
      userExists = await User.findOne({ email });
    } catch (error) {
      console.log('MongoDB not available, using local storage');
      userExists = await userStorage.findOne({ email });
    }
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user - try MongoDB first, fall back to local storage
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
    } catch (error) {
      console.log('MongoDB not available, using local storage for registration');
      user = await userStorage.create({
        name,
        email,
        password,
      });
    }

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
        message: 'User registered successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
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

    const { email, password } = req.body;

    // Check for user email - try MongoDB first, fall back to local storage
    let user;
    let passwordMatches = false;
    
    try {
      user = await User.findOne({ email }).select('+password');
      if (user) {
        passwordMatches = await user.matchPassword(password);
      }
    } catch (error) {
      console.log('MongoDB not available, using local storage for login');
      user = await userStorage.findOne({ email });
      if (user) {
        passwordMatches = await userStorage.matchPassword(user, password);
      }
    }

    if (user && passwordMatches) {
      // Create token
      const token = generateToken(user._id);
      
      // Ensure we're not sending back the password
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email
      };
      
      res.json({
        success: true,
        data: {
          ...userData,
          token
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    let user;
    
    try {
      user = await User.findById(req.user._id);
    } catch (error) {
      console.log('MongoDB not available, using local storage for profile lookup');
      user = userStorage.findById(req.user._id);
    }

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};