import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus } from '../types';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['APPLIED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'APPLIED',
      index: true,
    },
    notes: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate application by same worker to same job
ApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
