import {
  AuthenticationError,
  ConflictError,
} from "../../../errors/AppError.js";
import { hashPassword, verifyPassword } from "../../../utils/password.util.js";
import { Temporal } from "temporal-polyfill";
import { millisecondsUntil } from "../../../config/session-policy.js";
import {
  signAccessToken,
  issueRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.util.js";
import { randomUUID } from "node:crypto";

import * as userRepository from "../../user/repositories/user.repository.js";
import { toPublicUserDto } from "../../user/user.dto.js";
import * as sessionService from "../../session/services/session.service.js";

import type { LoginInput, RegisterInput } from "../auth.types.js";

export const register = async (data: RegisterInput) => {
  const existingUser = await userRepository.findUserByEmail(data.email);

  if (existingUser) {
    throw new ConflictError("User already exists with this email");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    ...data,
    password: hashedPassword,
  });

  return user;
};

export const login = async (data: LoginInput) => {
  const user = await userRepository.findUserByEmail(data.email);

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(user.password, data.password);

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  const now = Temporal.Now.instant();
  const window = sessionService.getNextSessionWindow(now, data.rememberMe);
  const refresh = issueRefreshToken(
    { userId: user.id },
    millisecondsUntil(window.expiresAt, now),
  );
  const accessToken = signAccessToken({ userId: user.id });

  await sessionService.createRefreshSession({
    userId: user.id,
    jti: refresh.jti,
    familyId: randomUUID(),
    refreshToken: refresh.token,
    expiresAt: window.expiresAt,
    absoluteExpiresAt: window.absoluteExpiresAt,
    rememberMe: data.rememberMe,
  });

  return {
    user: toPublicUserDto(user),
    accessToken,
    refreshToken: refresh.token,
    refreshExpiresAt: window.expiresAt,
    rememberMe: data.rememberMe,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const currentSession = await sessionService.getRefreshSession(refreshToken);

  if (
    !currentSession
    || currentSession.userId !== payload.userId
    || currentSession.jti !== payload.jti
  ) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const now = Temporal.Now.instant();
  if (Temporal.Instant.compare(currentSession.absoluteExpiresAt, now) <= 0) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const window = sessionService.getNextSessionWindow(
    now,
    currentSession.rememberMe,
    currentSession.absoluteExpiresAt,
  );
  const replacement = issueRefreshToken(
    { userId: payload.userId },
    millisecondsUntil(window.expiresAt, now),
  );

  const rotation = await sessionService.rotateRefreshSession({
    userId: payload.userId,
    currentJti: payload.jti,
    currentRefreshToken: refreshToken,
    replacementJti: replacement.jti,
    replacementRefreshToken: replacement.token,
    replacementExpiresAt: window.expiresAt,
  });

  if (rotation.status !== "rotated") {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const newAccessToken = signAccessToken({ userId: rotation.userId });

  return {
    accessToken: newAccessToken,
    refreshToken: replacement.token,
    refreshExpiresAt: rotation.expiresAt,
    rememberMe: rotation.rememberMe,
  };
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) return false;
  return sessionService.revokeRefreshSession(refreshToken);
};

/** Revokes every refresh session for the user, including the current one. */
export const logoutAll = async (userId: number) =>
  sessionService.revokeAllUserSessions(userId);
