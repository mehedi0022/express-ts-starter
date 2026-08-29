import { Temporal } from "temporal-polyfill";

import { hashToken } from "../../../utils/token.util.js";
import * as sessionRepository from "../repositories/session.repository.js";

type CreateRefreshSessionInput = {
  userId: number;
  refreshToken: string;
  expiresAt: Temporal.Instant;
  absoluteExpiresAt: Temporal.Instant;
  rememberMe: boolean;
};

export const findValidSession = async (refreshToken: string) => {
  const refreshTokenHash = hashToken(refreshToken);

  const session =
    await sessionRepository.findValidSessionByTokenHash(refreshTokenHash);

  if (!session) {
    return null;
  }

  const isExpired =
    Temporal.Instant.compare(session.expiresAt, Temporal.Now.instant()) <= 0;

  if (isExpired) {
    return null;
  }

  return session;
};

export const revokeSession = async (sessionId: number) => {
  return sessionRepository.revokeSession(sessionId, Temporal.Now.instant());
};

export const createRefreshSession = async (data: CreateRefreshSessionInput) => {
  const refreshTokenHash = hashToken(data.refreshToken);

  return sessionRepository.createSession({
    userId: data.userId,
    refreshTokenHash,
    expiresAt: data.expiresAt,
    absoluteExpiresAt: data.absoluteExpiresAt,
    rememberMe: data.rememberMe,
  });
};
