import apiClient from './api';
import { UserProfile, UserRole } from '../types';

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  devOtp?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  role?: UserRole;
  name?: string;
  email?: string;
  city?: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: UserProfile;
  isNewUser: boolean;
}

export const sendOtp = async (
  phone: string,
  purpose?: 'login' | 'register'
): Promise<SendOtpResponse> => {
  const res = await apiClient.post('/auth/otp/send', { phone, purpose });
  return res.data as SendOtpResponse;
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const res = await apiClient.post('/auth/otp/verify', payload);
  return res.data as VerifyOtpResponse;
};

export const getMe = async (): Promise<UserProfile> => {
  const res = await apiClient.get('/auth/me');
  return res.data.user as UserProfile;
};

export interface UpdateMePayload extends Partial<UserProfile> {
  city?: string;
}

export const updateMe = async (patch: UpdateMePayload): Promise<UserProfile> => {
  const res = await apiClient.patch('/auth/me', patch);
  return res.data.user as UserProfile;
};