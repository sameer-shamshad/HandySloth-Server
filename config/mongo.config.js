import mongoose from 'mongoose';
import { MONGODB_URI } from './env.config.js';

export const connectMongoDB = async () => {
  try {
    if (!MONGODB_URI)
      throw new Error('MONGODB_URI is not defined');
   
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};