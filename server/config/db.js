const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/pactflow';

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.includes('@') ? mongoUri.replace(/\/\/.*@/, '//<credentials>@') : mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error(`👉 Please ensure MongoDB is running locally or specify your MONGODB_URI (e.g. MongoDB Atlas) in server/.env`);
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

