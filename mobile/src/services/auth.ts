import apiClient from './api';
import { UserProfile, UserRole } from '../types';

export interface RegisterPayload {
  phone: string;
  password: string;
  role?: UserRole;
  name?: string;
  email?: string;
  city?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  isNewUser: boolean;
}

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/register', payload);
  return res.data as AuthResponse;
};

export const loginUser = async (phone: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/login', { phone, password });
  return res.data as AuthResponse;
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