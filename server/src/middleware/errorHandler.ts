import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

// Must be registered LAST, after all routes. Express recognizes an error handler
// by its 4-argument signature (err, req, res, next) even though `next` is unused.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, 'Operational server error');
    }
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
      },
    });
  }

  // Translate common Prisma errors into clean 4xx responses instead of leaking
  // ORM internals to the client.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { message: 'A record with this value already exists' } });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Record not found' } });
    }
  }

  // Anything else is unexpected — log the full error, never expose internals.
  logger.error({ err, path: req.path }, 'Unhandled error');
  return res.status(500).json({
    error: {
      message: 'Something went wrong',
      ...(isProduction ? {} : { stack: err instanceof Error ? err.stack : undefined }),
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.path} not found` } });
}
