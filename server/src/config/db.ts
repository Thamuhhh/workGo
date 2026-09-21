import mongoose from 'mongoose';
import { env } from './env';

export interface DatabaseStatus {
  isConnected: boolean;
  host?: string;
  name?: string;
}

export const dbStatus: DatabaseStatus = {
  isConnected: false,
};

export const connectDB = async (): Promise<boolean> => {
  try {
    mongoose.connection.on('connected', () => {
      dbStatus.isConnected = true;
      dbStatus.host = mongoose.connection.host;
      dbStatus.name = mongoose.connection.name;
      console.log(`MongoDB connected successfully: ${dbStatus.host}/${dbStatus.name}`);
    });

    mongoose.connection.on('error', (err) => {
      dbStatus.isConnected = false;
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      dbStatus.isConnected = false;
      console.warn('MongoDB disconnected.');
    });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });

    return true;
  } catch (error: any) {
    dbStatus.isConnected = false;
    console.warn(
      `Warning: Could not connect to MongoDB at ${redactUri(env.MONGODB_URI)} (${error.message}).`
    );
    console.warn('Running in resilient mode. Ensure MongoDB is running locally or provide a valid MONGODB_URI in server/.env');
    return false;
  }
};

const redactUri = (uri: string): string => {
  try {
    return uri.replace(/\/\/[^:@/]+:[^@/]+@/, '//***:***@');
  } catch {
    return 'mongodb://***';
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  dbStatus.isConnected = false;
};
