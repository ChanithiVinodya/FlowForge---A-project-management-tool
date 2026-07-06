import pino from 'pino';
import { env, isProduction } from './env';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      },
});

export const httpLoggerOptions = {
  logger,
  autoLogging: env.NODE_ENV !== 'test',
};
