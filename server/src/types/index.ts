import { Request } from 'express';

export type UserRole = 'worker' | 'employer' | 'admin';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type BookingStatus = 'BOOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'PENDING' | 'PRESENT' | 'ABSENT';

export type PaymentStatus = 'PENDING' | 'PAID' | 'RELEASED' | 'FAILED' | 'REFUNDED';

export type PaymentType = 'per_day' | 'per_hour';

export type JobStatus = 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELLED';

export interface LocationGeo {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface AuthUserPayload {
  userId: string;
  role: UserRole;
  phone: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
