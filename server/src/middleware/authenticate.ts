import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../auth/jwt.utils';

// Verifies the JWT access token sent as `Authorization: Bearer <token>` and
// attaches the decoded identity to req.user. Does NOT hit the database —
// keep this middleware cheap since it runs on every protected request.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
