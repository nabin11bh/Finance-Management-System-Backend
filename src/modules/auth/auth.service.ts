import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../services/audit.service";

const revokedRefreshTokens = new Set<string>();
// v1.0 runs a single instance; move to Redis before scaling horizontally.

function signAccessToken(userId: string, email: string) {
  return jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export async function login(email: string, password: string, ip?: string) {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    await writeAuditLog({ action: "USER_LOGIN_FAILED", ipAddress: ip, newValues: { email } });
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await writeAuditLog({ userId: user.id, action: "USER_LOGIN_FAILED", ipAddress: ip });
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  await writeAuditLog({ userId: user.id, action: "USER_LOGIN", ipAddress: ip });

  return {
    accessToken: signAccessToken(user.id, user.email),
    refreshToken: signRefreshToken(user.id),
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
    },
  };
}

export async function refresh(refreshToken: string) {
  if (!refreshToken) throw new AppError(401, "UNAUTHORIZED", "Refresh token missing");
  if (revokedRefreshTokens.has(refreshToken)) {
    throw new AppError(401, "UNAUTHORIZED", "Refresh token has been revoked");
  }

  let payload: { sub: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Refresh token is invalid or expired");
  }

  const user = await prisma.user.findFirst({ where: { id: payload.sub, deletedAt: null } });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "User no longer exists");

  return { accessToken: signAccessToken(user.id, user.email) };
}

export async function logout(refreshToken: string | undefined, userId?: string, ip?: string) {
  if (refreshToken) revokedRefreshTokens.add(refreshToken);
  await writeAuditLog({ userId, action: "USER_LOGOUT", ipAddress: ip });
}