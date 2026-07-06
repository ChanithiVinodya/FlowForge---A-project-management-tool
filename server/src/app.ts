import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { httpLoggerOptions } from './config/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { UPLOAD_DIR } from './config/upload';
import authRoutes from './auth/auth.routes';
import projectRoutes from './modules/projects/project.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import activityRoutes from './modules/activities/activity.routes';
import searchRoutes from './modules/search/search.routes';

export function createApp() {
  const app = express();

  // Security headers on every response.
  app.use(helmet());

  // Only the configured frontend origin may make credentialed requests
  // (needed so the httpOnly refresh-token cookie is sent/received).
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp(httpLoggerOptions));

  // Serve uploaded files statically (swap this path for S3/CDN in production)
  app.use('/uploads', express.static(UPLOAD_DIR));

  // Global request rate limit; auth routes layer stricter limits on top of this.
  app.use('/api', apiLimiter);

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api', activityRoutes);
  app.use('/api/search', searchRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
