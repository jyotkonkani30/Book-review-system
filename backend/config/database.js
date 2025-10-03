const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Create data directory for local storage
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const connectDB = async () => {
  try {
    // First try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('⚠️  MongoDB not available. Server will run using local file storage.');
    console.log('📝 To connect to MongoDB:');
    console.log('   1. Install MongoDB locally, or');
    console.log('   2. Update MONGODB_URI in .env with your MongoDB Atlas connection string');
    console.log('   Current connection string:', process.env.MONGODB_URI);
    
    // Don't exit the process, let the server run with local storage
    return false;
  }
};

module.exports = connectDB;