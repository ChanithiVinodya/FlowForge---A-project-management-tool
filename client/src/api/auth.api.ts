import client from './client';
import { RegisterInput, LoginInput } from '@/types/auth';

export const register = async (data: RegisterInput) => {
  const response = await client.post('/auth/register', data);
  return response.data;
};

export const login = async (data: LoginInput) => {
  const response = await client.post('/auth/login', data);
  return response.data;
};

export const logout = async () => {
  await client.post('/auth/logout');
};

export const getMe = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await client.post('/auth/reset-password', data);
  return response.data;
};
