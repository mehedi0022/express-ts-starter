import type { Request, RequestHandler } from "express";

import { AuthenticationError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { accessTokenCookieName } from "../utils/cookie.util.js";
import { findAuthorizationUserById } from "../modules/user/repositories/user.repository.js";
import type { UserRole } from "../auth/roles.js";

export type AuthenticatedUser = {
  userId: number;
  // Kept during the legacy-role transition for hierarchy checks.
  role: UserRole;
  permissions: readonly string[];
};

export type AuthenticatedRequest = Request & {
  auth: AuthenticatedUser;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[accessTokenCookieName];

  if (!token || typeof token !== "string") {
    return next(new AuthenticationError("Access token not found"));
  }

  let claims;
  try {
    claims = verifyAccessToken(token);
  } catch {
    return next(new AuthenticationError("Invalid or expired access token"));
  }

  try {
    const user = await findAuthorizationUserById(claims.userId);
    if (!user) throw new AuthenticationError("Authenticated user no longer exists");
    if (!user.isActive) throw new AuthenticationError("Account is inactive");
    if (!user.rbacRole) throw new AuthenticationError("Account role is not configured");

    req.auth = {
      userId: user.id,
      role: user.role,
      permissions: user.rbacRole.rolePermissions.flatMap(({ permission }) => permission ? [permission.key] : []),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = authenticate;