import { AppError } from "../../../errors/AppError.js";
import { hashPassword, verifyPassword } from "../../../utils/password.util.js";
import { Temporal } from "temporal-polyfill";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.util.js";

import * as userRepository from "../../user/repositories/user.repository.js";
import * as sessionService from "../../session/services/session.service.js";

import type { LoginInput, RegisterInput } from "../auth.types.js";

export const register = async (data: RegisterInput) => {
  const existingUser = await userRepository.findUserByEmail(data.email);

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    ...data,
    password: hashedPassword,
  });

  const { password: _password, ...safeUser } = user;

  return safeUser;
};

export const login = async (data: LoginInput) => {
  const user = await userRepository.findUserByEmail(data.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(user.password, data.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken({
    userId: user.id,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
  });

  const now = Temporal.Now.instant();

  const refreshHours = data.rememberMe ? 24 * 7 : 24;

  const expiresAt = now.add({
    hours: refreshHours,
  });

  const absoluteExpiresAt = now.add({
    hours: 24 * 30,
  });

  await sessionService.createRefreshSession({
    userId: user.id,
    refreshToken,
    expiresAt,
    absoluteExpiresAt,
    rememberMe: data.rememberMe,
  });

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const session = await sessionService.findValidSession(refreshToken);

  if (!session) {
    throw new AppError("Session is invalid or expired", 401);
  }

  if (session.userId !== payload.userId) {
    throw new AppError("Invalid session", 401);
  }

  const now = Temporal.Now.instant();

  const absoluteExpired =
    Temporal.Instant.compare(session.absoluteExpiresAt, now) <= 0;

  if (absoluteExpired) {
    throw new AppError("Session lifetime expired. Please login again.", 401);
  }

  await sessionService.revokeSession(session.id);

  const newAccessToken = signAccessToken({
    userId: payload.userId,
  });

  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
  });

  const refreshHours = session.rememberMe ? 24 * 7 : 24;

  const candidateExpiry = now.add({
    hours: refreshHours,
  });

  const expiresAt =
    Temporal.Instant.compare(candidateExpiry, session.absoluteExpiresAt) > 0
      ? session.absoluteExpiresAt
      : candidateExpiry;

  await sessionService.createRefreshSession({
    userId: payload.userId,
    refreshToken: newRefreshToken,
    expiresAt,
    absoluteExpiresAt: session.absoluteExpiresAt,
    rememberMe: session.rememberMe,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
