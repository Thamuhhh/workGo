import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  profilePhoto?: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
  };
  // Worker specific fields
  skills: string[];
  categories: string[];
  experience?: string;
  expectedSalary?: number;
  expectedWageType?: 'per_day' | 'per_hour';
  availability?: boolean;
  
  // Employer specific fields
  businessName?: string;
  businessType?: string;
  
  // Shared metrics
  rating: number;
  totalRatings: number;
  completedJobs: number;
  isVerified: boolean;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, enum: ['worker', 'employer', 'admin'], required: true, index: true },
    profilePhoto: { type: String },
    location: {
      address: { type: String, default: '' },
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      city: { type: String, default: '' },
    },
    skills: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    experience: { type: String, default: '0 years' },
    expectedSalary: { type: Number, default: 0 },
    expectedWageType: { type: String, enum: ['per_day', 'per_hour'], default: 'per_day' },
    availability: { type: Boolean, default: true },
    businessName: { type: String },
    businessType: { type: String },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
