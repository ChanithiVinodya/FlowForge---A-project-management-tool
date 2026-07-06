import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// Single shared Redis client used for: caching, rate limiting, and later as the
// pub/sub backbone for the Socket.io adapter and BullMQ queues.
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));

// Additional clients for Socket.io Redis adapter
export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();
