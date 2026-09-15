import mongoose, { Document, Schema } from 'mongoose';
import { AttendanceStatus, BookingStatus, PaymentStatus } from '../types';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  status: BookingStatus;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
  startedAt?: Date;
  completedAt?: Date;
  totalPay: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    status: {
      type: String,
      enum: ['BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'BOOKED',
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['PENDING', 'PRESENT', 'ABSENT'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'RELEASED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    totalPay: { type: Number, required: true, default: 0 },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookings for same job and worker
BookingSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
