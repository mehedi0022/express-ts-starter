import type { RequestHandler } from "express";

import type { Permission } from "../auth/authorization.js";
import { AuthenticationError, AuthorizationError } from "../errors/AppError.js";

const getAuth = (auth: Express.Request["auth"]) => {
  if (!auth) {
    throw new AuthenticationError();
  }

  return auth;
};

export const requirePermission =
  (permission: Permission): RequestHandler =>
  (req, _res, next) => {
    try {
      const auth = getAuth(req.auth);

      if (!auth.permissions.includes(permission)) {
        throw new AuthorizationError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };

type OwnershipOptions = {
  param?: string;
};

export const requireOwnership =
  ({ param = "id" }: OwnershipOptions = {}): RequestHandler =>
  (req, _res, next) => {
    try {
      const auth = getAuth(req.auth);

      const ownerId = Number(req.params[param]);

      if (!Number.isSafeInteger(ownerId) || ownerId !== auth.userId) {
        throw new AuthorizationError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
