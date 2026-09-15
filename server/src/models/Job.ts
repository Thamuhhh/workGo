import mongoose, { Document, Schema } from 'mongoose';
import { JobStatus, PaymentType } from '../types';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description: string;
  postedBy: mongoose.Types.ObjectId;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
  };
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "06:00 AM"
  endTime: string; // e.g. "04:00 PM"
  workersRequired: number;
  workersAccepted: number;
  salary: number;
  paymentType: PaymentType;
  foodProvided: boolean;
  transportProvided: boolean;
  requirements: {
    skills: string[];
    experience?: string;
    dressCode?: string;
    otherInstructions?: string;
  };
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      city: { type: String, default: '' },
    },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    workersRequired: { type: Number, required: true, min: 1 },
    workersAccepted: { type: Number, default: 0, min: 0 },
    salary: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ['per_day', 'per_hour'], default: 'per_day' },
    foodProvided: { type: Boolean, default: false },
    transportProvided: { type: Boolean, default: false },
    requirements: {
      skills: { type: [String], default: [] },
      experience: { type: String, default: '' },
      dressCode: { type: String, default: '' },
      otherInstructions: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['OPEN', 'FILLED', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geo compound index
JobSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
