import mongoose, { Document, Schema } from 'mongoose';

export interface IOtpVerification extends Document {
  phone: string;
  otpHash: string;
  purpose: 'login' | 'register';
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'register'], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired records
OtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

OtpVerificationSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

export const OtpVerification = mongoose.model<IOtpVerification>(
  'OtpVerification',
  OtpVerificationSchema
);