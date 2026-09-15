export type UserRole = 'worker' | 'employer';

export type UserMode = 'worker' | 'employer';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type BookingStatus = 'BOOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'PENDING' | 'PRESENT' | 'ABSENT';

export type PaymentStatus = 'PENDING' | 'PAID' | 'RELEASED' | 'FAILED' | 'REFUNDED';

export type PaymentType = 'per_day' | 'per_hour';

export interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  profilePhoto?: string;
  location: UserLocation;
  // Worker fields
  skills?: string[];
  categories?: string[];
  experience?: string;
  expectedSalary?: number;
  expectedWageType?: PaymentType;
  availability?: boolean;
  // Employer fields
  businessName?: string;
  businessType?: string;
  // Ratings
  rating: number;
  totalRatings: number;
  completedJobs: number;
  isVerified: boolean;
}

export interface Job {
  _id: string;
  title: string;
  category: string;
  description: string;
  postedBy: UserProfile | string;
  location: UserLocation;
  date: string;
  startTime: string;
  endTime: string;
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
  status: 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  distanceKm?: number;
}

export interface Application {
  _id: string;
  jobId: Job | string;
  workerId: UserProfile | string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: string;
}

export interface Booking {
  _id: string;
  jobId: Job | string;
  workerId: UserProfile | string;
  employerId: UserProfile | string;
  applicationId: string;
  status: BookingStatus;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
  totalPay: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
