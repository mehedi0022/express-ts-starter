import type { Request, Response } from "express";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  paginatedResponse,
  successResponse,
} from "../../../utils/api-response.js";

import * as userService from "../services/user.service.js";

import type { UserListQuery } from "../user.types.js";
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../../middlewares/auth.middleware.js";

const getAuth = (req: Request): AuthenticatedUser =>
  (req as AuthenticatedRequest).auth;

/**
 * Get current authenticated user
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  const user = await userService.getCurrentUser(userId);

  res
    .status(200)
    .json(successResponse("Current user fetched successfully", user));
});

/**
 * Create user
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const actor = getAuth(req);

  const user = await userService.createUser(actor, req.body);

  res.status(201).json(successResponse("User created successfully", user));
});

/**
 * Get all users
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers(
    req.query as unknown as UserListQuery,
  );

  res
    .status(200)
    .json(
      paginatedResponse(
        "Users fetched successfully",
        result.users,
        result.meta,
      ),
    );
});

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));

  res.status(200).json(successResponse("User fetched successfully", user));
});

/**
 * Update user
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const actor = getAuth(req);

  const user = await userService.updateUser(
    actor,
    Number(req.params.id),
    req.body,
  );

  res.status(200).json(successResponse("User updated successfully", user));
});

/**
 * Change user role
 */
export const changeUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getAuth(req);

    const user = await userService.changeUserRole(
      actor,
      Number(req.params.id),
      req.body.roleId,
    );

    res
      .status(200)
      .json(successResponse("User role updated successfully", user));
  },
);

/**
 * Change user status
 */
export const changeUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getAuth(req);

    const user = await userService.changeUserStatus(
      actor,
      Number(req.params.id),
      req.body.isActive,
    );

    res
      .status(200)
      .json(successResponse("User status updated successfully", user));
  },
);

/**
 * Reset user password
 */
export const resetUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getAuth(req);

    await userService.resetUserPassword(
      actor,
      Number(req.params.id),
      req.body.newPassword,
    );

    res
      .status(200)
      .json(
        successResponse(
          "User password reset successfully. Existing sessions were revoked.",
          null,
        ),
      );
  },
);
