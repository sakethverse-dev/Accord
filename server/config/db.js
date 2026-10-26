const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: MONGODB_URI environment variable is not defined in Render Dashboard!');
    console.error('👉 Please go to Render -> Environment -> Add MONGODB_URI with your MongoDB Atlas connection string.');
    throw new Error('MONGODB_URI environment variable is missing on Render.');
  }

  const activeUri = mongoUri || 'mongodb://127.0.0.1:27017/pactflow';

  try {
    console.log(`Connecting to MongoDB at: ${activeUri.includes('@') ? activeUri.replace(/\/\/.*@/, '//<credentials>@') : activeUri}...`);
    await mongoose.connect(activeUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error(`👉 Please ensure MongoDB is running or verify your MONGODB_URI in Render Environment Variables`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting DB:', error);
  }
};

module.exports = { connectDB, disconnectDB };

