import { prisma } from '../config/prisma';
import { logger } from '../config/logger';
import { ApiError } from '../utils/ApiError';
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
  hashToken,
} from './password.utils';
import {
  expiresInToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './jwt.utils';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from './auth.validation';

interface AuthResult {
  user: { id: string; email: string; name: string; avatarUrl: string | null };
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

function toPublicUser(user: { id: string; email: string; name: string; avatarUrl: string | null }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
}

// Creates a new RefreshToken DB record + signs the corresponding JWT.
// The DB record is what lets us revoke a single session or rotate on refresh;
// the JWT itself is what gets base64'd into the httpOnly cookie.
async function issueRefreshToken(userId: string) {
  const record = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: '', // filled in right after, once we know the token string
      expiresAt: new Date(Date.now() + expiresInToMs(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  const token = signRefreshToken({ sub: userId, tokenId: record.id });

  const updated = await prisma.refreshToken.update({
    where: { id: record.id },
    data: { tokenHash: hashToken(token) },
  });

  return { token, expiresAt: updated.expiresAt };
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const { token: refreshToken, expiresAt } = await issueRefreshToken(userId);
  return { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
  });

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same error for "no such user" and "wrong password" — don't let the
  // response shape reveal whether an email is registered.
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), ...tokens };
}

// Refresh token ROTATION: every refresh call invalidates the presented token
// and issues a brand new one. If a stolen refresh token is ever replayed after
// the legitimate client already rotated it, the stolen one will fail this
// lookup (already revoked) — a signal you could use to revoke ALL of that
// user's sessions as a compromise response.
export async function refresh(presentedToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(presentedToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const record = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });

  if (
    !record ||
    record.revoked ||
    record.expiresAt < new Date() ||
    record.tokenHash !== hashToken(presentedToken)
  ) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), ...tokens };
}

export async function logout(presentedToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(presentedToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.tokenId },
      data: { revoked: true },
    });
  } catch {
    // Token was already invalid/expired — logging out is still a success
    // from the client's point of view, so we swallow this rather than 401.
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always resolve successfully whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user) return;

  const rawToken = generateRandomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // TODO(Phase 6 - notifications/email): send via the email queue processor
  // instead of logging. Wiring this through BullMQ keeps this request fast.
  logger.info({ email }, `Password reset link: /reset-password?token=${rawToken}`);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
  });

  if (!record) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    // Resetting the password invalidates every existing session — otherwise
    // an attacker who had a stolen refresh token keeps access after "reset".
    prisma.refreshToken.updateMany({ where: { userId: record.userId }, data: { revoked: true } }),
  ]);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}
