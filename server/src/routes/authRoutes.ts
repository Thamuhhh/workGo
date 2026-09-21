import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { sendOtp, verifyOtp, getMe, updateMe } from '../controllers/authController';

const router = Router();

const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

router.post(
  '/otp/send',
  validateRequest({
    body: z.object({
      phone: phoneSchema,
      purpose: z.enum(['login', 'register']).optional(),
    }),
  }),
  sendOtp
);

router.post(
  '/otp/verify',
  validateRequest({
    body: z.object({
      phone: phoneSchema,
      otp: z.string().regex(/^\d{4}$/, 'OTP must be 4 digits'),
      role: z.enum(['worker', 'employer']).optional(),
      name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
      email: z.string().email().optional(),
      city: z.string().min(2).max(60).optional(),
    }),
  }),
  verifyOtp
);

router.get('/me', requireAuth, getMe);

router.patch(
  '/me',
  requireAuth,
  validateRequest({
    body: z
      .object({
        name: z.string().min(2).max(60),
        email: z.string().email(),
        role: z.enum(['worker', 'employer']),
        businessName: z.string().max(60),
        businessType: z.string().max(60),
        profilePhoto: z.string().url(),
        experience: z.string().max(40),
        expectedSalary: z.number().min(0),
        expectedWageType: z.enum(['per_day', 'per_hour']),
        skills: z.array(z.string()),
        categories: z.array(z.string()),
        availability: z.boolean(),
        city: z.string().min(2).max(60),
        location: z.object({
          address: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          city: z.string(),
        }),
      })
      .partial(),
  }),
  updateMe
);

export default router;