 import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONG_URI, {
      serverSelectionTimeoutMS: 5000, // Add timeout
      retryWrites: true,
    });
    console.log('MongoDB connected successfully!');
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit the process, just log the error
    throw error;
  }
};