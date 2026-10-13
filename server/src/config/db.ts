import mongoose from 'mongoose';
import { env } from './env';

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error: any) {
    // Do not continue into seeding or serve requests with a disconnected database.
    // Driver errors may contain connection details; keep credentials out of logs.
    throw new Error(
      'MongoDB connection failed. Check server/.env, Atlas cluster readiness and the IP access list.',
    );
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected');
});
