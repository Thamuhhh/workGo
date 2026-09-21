import { Request, Response } from 'express';
import { createHash } from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OtpVerification } from '../models/OtpVerification';
import { dbStatus } from '../config/db';
import { env } from '../config/env';
import { AuthenticatedRequest, UserRole } from '../types';

const OTP_TTL_SECONDS = 600;
const MAX_ATTEMPTS = 5;

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const generateOtp = (): string => String(Math.floor(1000 + Math.random() * 9000));

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message:
      'Database unavailable. Start MongoDB (or set MONGODB_URI in server/.env) and restart the server.',
  });
  return false;
};

type OtpPurpose = 'login' | 'register';

const normalizePhone = (phone: string): string => {
  const digits = String(phone).replace(/[^0-9]/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
};

const serializeUser = (u: any) => ({
  _id: u._id.toString(),
  name: u.name,
  phone: u.phone,
  email: u.email,
  role: u.role,
  profilePhoto: u.profilePhoto,
  location: {
    address: u.location?.address ?? '',
    latitude: u.location?.latitude ?? 0,
    longitude: u.location?.longitude ?? 0,
    city: u.location?.city ?? '',
  },
  skills: u.skills ?? [],
  categories: u.categories ?? [],
  experience: u.experience,
  expectedSalary: u.expectedSalary,
  expectedWageType: u.expectedWageType,
  availability: u.availability,
  businessName: u.businessName,
  businessType: u.businessType,
  rating: u.rating,
  totalRatings: u.totalRatings,
  completedJobs: u.completedJobs,
  isVerified: u.isVerified,
});

const signToken = (user: any): string =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role as UserRole, phone: user.phone },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

interface FindOrCreateInput {
  phone: string;
  role?: UserRole;
  name?: string;
  email?: string;
  city?: string;
}

const findOrCreateUser = async ({ phone, role, name, email, city }: FindOrCreateInput): Promise<{ user: any; isNewUser: boolean }> => {
  const targetRole: UserRole = role === 'employer' ? 'employer' : 'worker';
  const existing = await User.findOne({ phone });

  const set: any = {
    role: targetRole,
    name: name?.trim() || existing?.name || 'WorkGo User',
  };
  if (email?.trim()) set.email = email.trim();
  if (city?.trim()) {
    set.location = {
      address: city.trim(),
      latitude: 0,
      longitude: 0,
      city: city.trim(),
    };
  }

  const user = await User.findOneAndUpdate(
    { phone },
    { $set: set, $setOnInsert: { isActive: true, isVerified: false } },
    { new: true, upsert: true }
  );

  return { user, isNewUser: !existing };
};

const issueAuth = (user: any, isNewUser: boolean, res: Response): void => {
  const token = signToken(user);
  res.status(200).json({
    success: true,
    message: 'Verified successfully',
    token,
    user: serializeUser(user),
    isNewUser,
  });
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;

  const { phone, purpose } = req.body as { phone: string; purpose?: OtpPurpose };
  const otpPurpose: OtpPurpose = purpose === 'register' ? 'register' : 'login';

  const otp = generateOtp();

  await OtpVerification.deleteMany({ phone, purpose: otpPurpose });

  await OtpVerification.create({
    phone,
    otpHash: sha256(otp),
    purpose: otpPurpose,
    expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
  });

  // In development we return the code directly so the app can be tested without an SMS gateway.
  // Plug a real SMS provider (Twilio / MSG91 / Fast2SMS) into sendSms in production.
  console.log(`\n[WorkGo OTP] ${phone}: ${otp} (${otpPurpose})\n`);

  res.status(200).json({
    success: true,
    message: `OTP sent${otpPurpose === 'register' ? ' for verification' : ''}`,
    expiresIn: OTP_TTL_SECONDS,
    devOtp: env.NODE_ENV !== 'production' ? otp : undefined,
  });
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;

  const { phone, otp, role, name, email, city } = req.body as {
    phone: string;
    otp: string;
    role?: UserRole;
    name?: string;
    email?: string;
    city?: string;
  };

  const record = await OtpVerification.findOne({
    phone,
    purpose: { $in: ['login', 'register'] },
  }).sort({ createdAt: -1 });

  if (!record) {
    res.status(400).json({
      success: false,
      message: 'No OTP requested for this number. Please request a new code.',
    });
    return;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await OtpVerification.deleteOne({ _id: record._id });
    res.status(400).json({
      success: false,
      message: 'OTP expired. Please request a new code.',
    });
    return;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await OtpVerification.deleteOne({ _id: record._id });
    res.status(400).json({
      success: false,
      message: 'Too many wrong attempts. Please request a new code.',
    });
    return;
  }

  if (record.otpHash !== sha256(String(otp).trim())) {
    record.attempts += 1;
    await record.save();
    res.status(400).json({
      success: false,
      message: 'Incorrect OTP. Please try again.',
      attemptsLeft: MAX_ATTEMPTS - record.attempts,
    });
    return;
  }

  await OtpVerification.deleteOne({ _id: record._id });

  const { user, isNewUser } = await findOrCreateUser({ phone, role, name, email, city });
  issueAuth(user, isNewUser, res);
};

// Verifies a Firebase Auth ID token and signs a user in (or creates the account).
// Uses Google's public tokeninfo endpoint so no service-account key is required;
// fall back to firebase-admin by setting FIREBASE_SERVICE_ACCOUNT when going to prod.
const verifyFirebaseIdToken = async (idToken: string): Promise<{ phone: string }> => {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!res.ok) {
    throw Object.assign(new Error('Invalid or expired verification token.'), { status: 401 });
  }

  const info = (await res.json()) as any;

  const expectedIss = `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`;
  if (info.iss !== expectedIss) {
    throw Object.assign(
      new Error('Token was not issued by this Firebase project.'),
      { status: 401 }
    );
  }

  const phone = normalizePhone(info.phone_number ?? '');
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw Object.assign(
      new Error('No valid phone number attached to this Firebase account.'),
      { status: 400 }
    );
  }

  return { phone };
};

export const firebaseLogin = async (req: Request, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;

  const { idToken, role, name, email, city } = req.body as {
    idToken: string;
    role?: UserRole;
    name?: string;
    email?: string;
    city?: string;
  };

  try {
    const { phone } = await verifyFirebaseIdToken(idToken);
    const { user, isNewUser } = await findOrCreateUser({ phone, role, name, email, city });
    issueAuth(user, isNewUser, res);
  } catch (e: any) {
    res.status(e?.status || 500).json({
      success: false,
      message: e?.message || 'Firebase verification failed.',
    });
    return;
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.status(200).json({ success: true, user: serializeUser(user) });
};

const PROFILE_EDITABLE = [
  'name',
  'email',
  'role',
  'businessName',
  'businessType',
  'profilePhoto',
  'experience',
  'expectedSalary',
  'expectedWageType',
  'skills',
  'categories',
  'availability',
] as const;

export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const body: any = req.body ?? {};

  const updates: any = {};
  for (const key of PROFILE_EDITABLE) {
    if (body[key] !== undefined) {
      if (key === 'role' && body.role !== 'worker' && body.role !== 'employer') {
        res.status(400).json({
          success: false,
          message: 'Role must be worker or employer.',
        });
        return;
      }
      updates[key] = body[key];
    }
  }

  if (typeof body.city === 'string' && body.city.trim()) {
    updates.location = {
      address: body.city.trim(),
      latitude: body.location?.latitude ?? 0,
      longitude: body.location?.longitude ?? 0,
      city: body.city.trim(),
    };
  } else if (body.location && typeof body.location === 'object') {
    updates.location = body.location;
  }

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updates },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.status(200).json({ success: true, user: serializeUser(user) });
};