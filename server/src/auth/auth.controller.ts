import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import * as authService from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/api/auth', // only sent back on auth routes (refresh/logout)
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  res.status(201).json({ user: result.user, accessToken: result.accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  res.status(200).json({ user: result.user, accessToken: result.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!presentedToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const result = await authService.refresh(presentedToken);
  setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
  res.status(200).json({ user: result.user, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (presentedToken) {
    await authService.logout(presentedToken);
  }
  clearRefreshCookie(res);
  res.status(204).send();
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  // Always 200 regardless of whether the email exists — see service comment.
  res.status(200).json({ message: 'If that email is registered, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: 'Password has been reset. Please log in again.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.status(200).json({ user });
});
