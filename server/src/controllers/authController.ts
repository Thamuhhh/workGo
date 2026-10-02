import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { dbStatus } from '../config/db';
import { env } from '../config/env';
import { AuthenticatedRequest, UserRole } from '../types';

const PASSWORD_MIN = 6;

const isDbReady = (res: Response): boolean => {
  if (dbStatus.isConnected && mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    success: false,
    message:
      'Database unavailable. Start MongoDB (or set MONGODB_URI in server/.env) and restart the server.',
  });
  return false;
};

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

const issueAuth = (user: any, isNewUser: boolean, res: Response, message = 'Verified successfully'): void => {
  const token = signToken(user);
  res.status(200).json({
    success: true,
    message,
    token,
    user: serializeUser(user),
    isNewUser,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;

  const { phone, password, role, name, email, city } = req.body as {
    phone: string;
    password: string;
    role?: UserRole;
    name?: string;
    email?: string;
    city?: string;
  };

  const normalizedPhone = normalizePhone(phone);

  const existing = await User.findOne({ phone: normalizedPhone });
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'This mobile number is already registered. Please login instead.',
    });
    return;
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    res.status(400).json({
      success: false,
      message: `Password must be at least ${PASSWORD_MIN} characters long.`,
    });
    return;
  }

  const user = await User.create({
    phone: normalizedPhone,
    name: name?.trim() || 'WorkGo User',
    email: email?.trim() || undefined,
    role: role === 'employer' ? 'employer' : 'worker',
    passwordHash: await bcrypt.hash(password, 10),
    ...(city?.trim()
      ? { location: { address: city.trim(), latitude: 0, longitude: 0, city: city.trim() } }
      : {}),
    isVerified: true,
    isActive: true,
  });

  issueAuth(user, true, res, 'Account created successfully');
};

export const login = async (req: Request, res: Response): Promise<void> => {
  if (!isDbReady(res)) return;

  const { phone, password } = req.body as { phone: string; password: string };

  const normalizedPhone = normalizePhone(phone);

  const user = await User.findOne({ phone: normalizedPhone });
  if (!user || !user.passwordHash) {
    res.status(401).json({
      success: false,
      message: 'No account found for this number. Create an account first.',
    });
    return;
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    res.status(401).json({
      success: false,
      message: 'Incorrect password. Please try again.',
    });
    return;
  }

  issueAuth(user, false, res, 'Logged in successfully');
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