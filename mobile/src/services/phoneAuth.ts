import { Platform } from 'react-native';
import { sendOtp, verifyOtp, firebaseServerVerify, SendOtpResponse, VerifyOtpResponse } from './auth';
import { UserRole } from '../types';

// On native (Android/iOS) we use Firebase Phone Auth which delivers a real, free
// OTP SMS through Google. On web / Expo Go (where the native module can't run)
// we fall back to the backend dev-OTP flow so the app stays testable.

let firebaseModule: any = null;

const fbAuth = async () => {
  if (!firebaseModule) {
    firebaseModule = (await import('@react-native-firebase/auth')).default;
  }
  return firebaseModule();
};

const otpError = (code?: string, fallback?: string): string => {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid mobile number. Please check and retry.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a minute.';
    case 'auth/quota-exceeded':
      return 'OTP quota reached for this number. Try again later.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check and retry.';
    case 'auth/invalid-verification-code':
    case 'auth/mismatching-verification-code':
      return 'Incorrect OTP. Please try again.';
    default:
      return fallback ?? 'Something went wrong. Please try again.';
  }
};

let pendingConfirmation: any = null;

export const sendPhoneOtp = async (
  phone: string,
  purpose?: 'login' | 'register'
): Promise<SendOtpResponse> => {
  if (Platform.OS !== 'web') {
    const auth = await fbAuth();
    try {
      pendingConfirmation = await auth.signInWithPhoneNumber(`+91${phone}`, true);
    } catch (e: any) {
      throw new Error(otpError(e?.code, e?.message || 'Could not send OTP.'));
    }
    return { message: 'OTP sent', expiresIn: 120 };
  }
  return sendOtp(phone, purpose);
};

export const verifyPhoneOtp = async (
  phone: string,
  otp: string,
  extra: { role?: UserRole; name?: string; email?: string; city?: string } = {}
): Promise<VerifyOtpResponse> => {
  if (Platform.OS !== 'web') {
    const auth = await fbAuth();
    if (!pendingConfirmation) {
      throw new Error('Please request a new code.');
    }
    try {
      await pendingConfirmation.confirm(otp.trim());
    } catch (e: any) {
      throw new Error(otpError(e?.code, e?.message || 'OTP verification failed.'));
    } finally {
      pendingConfirmation = null;
    }

    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Could not get verification from Firebase.');
    }
    return firebaseServerVerify(idToken, extra);
  }

  return verifyOtp({ phone, otp, ...extra });
};