import { sendOtp, verifyOtp, SendOtpResponse, VerifyOtpResponse } from './auth';
import { UserRole } from '../types';

export const sendPhoneOtp = async (
  phone: string,
  purpose?: 'login' | 'register'
): Promise<SendOtpResponse> => {
  return sendOtp(phone, purpose);
};

export const verifyPhoneOtp = async (
  phone: string,
  otp: string,
  extra: { role?: UserRole; name?: string; email?: string; city?: string } = {}
): Promise<VerifyOtpResponse> => {
  return verifyOtp({ phone, otp, ...extra });
};