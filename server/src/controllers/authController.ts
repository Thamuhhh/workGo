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

  const targetRole: UserRole =
    role === 'employer' ? 'employer' : role === 'worker' ? 'worker' : 'worker';

  const existing = await User.findOne({ phone });

  let createFields: any = {
    phone,
    role: targetRole,
    name: name?.trim() || existing?.name || 'WorkGo User',
    email: email?.trim() || existing?.email,
  };
  if (city?.trim()) {
    createFields.location = {
      address: city?.trim(),
      latitude: 0,
      longitude: 0,
      city: city?.trim(),
    };
  }

  const user = await User.findOneAndUpdate(
    { phone },
    { $set: createFields, $setOnInsert: { isActive: true, isVerified: false } },
    { new: true, upsert: true }
  );

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    token,
    user: serializeUser(user),
    isNewUser: !existing,
  });
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