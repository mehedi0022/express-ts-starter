import { db } from "../../../prisma/db.js";
import { Temporal } from "temporal-polyfill";

type CreateSessionData = {
  userId: number;
  refreshTokenHash: string;
  expiresAt: Temporal.Instant;
  absoluteExpiresAt: Temporal.Instant;
  rememberMe: boolean;
};

export const createSession = async (data: CreateSessionData) => {
  return db.orm.public.Session.create({
    userId: data.userId,
    refreshTokenHash: data.refreshTokenHash,
    expiresAt: data.expiresAt,
    absoluteExpiresAt: data.absoluteExpiresAt,
    rememberMe: data.rememberMe,
  });
};

export const revokeSession = async (
  sessionId: number,
  revokedAt: Temporal.Instant,
) => {
  return db.orm.public.Session.where({
    id: sessionId,
  }).update({
    revokedAt,
  });
};

export const findSessionByTokenHash = async (refreshTokenHash: string) => {
  return db.orm.public.Session.first({
    refreshTokenHash,
  });
};

export const findValidSessionByTokenHash = async (refreshTokenHash: string) => {
  return db.orm.public.Session.first({
    refreshTokenHash,
    revokedAt: null,
  });
};
