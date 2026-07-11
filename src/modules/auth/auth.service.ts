import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";

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

export async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");

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