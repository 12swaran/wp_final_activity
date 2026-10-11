import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error: any) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Warning] Please ensure MongoDB is running locally or MONGODB_URI points to a valid MongoDB Atlas cluster in server/.env`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected');
});
