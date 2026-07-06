import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

// In-memory store is fine for a single instance / local dev. Once the API runs
// as multiple instances behind a load balancer, swap the `store` option for
// `rate-limit-redis` pointed at the shared Redis client so limits are enforced
// across all instances rather than per-process.
const handler = (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.tooManyRequests('Too many requests, please try again later'));
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Tighter limit specifically for login/password endpoints to slow down
// credential-stuffing / brute-force attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
