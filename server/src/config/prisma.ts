import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';

// Prevents creating a new PrismaClient on every hot-reload during development,
// which would otherwise exhaust the Postgres connection pool.
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
  });

if (!isProduction) {
  global.__prisma__ = prisma;
}
