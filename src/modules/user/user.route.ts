import { Router } from "express";

import { permissions } from "../../auth/authorization.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  changeUserRole,
  changeUserStatus,
  createUser,
  getAllUsers,
  getMe,
  getUserById,
  resetUserPassword,
  updateUser,
} from "./controllers/user.controller.js";

import {
  changeUserRoleSchema,
  changeUserStatusSchema,
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  userIdSchema,
  userListQuerySchema,
} from "./validations/user.validation.js";

const router = Router();

router.use(requireAuth);

/**
 * Current authenticated user
 */
router.get("/me", getMe);

/**
 * User management
 */
router.get(
  "/",
  validate(userListQuerySchema),
  requirePermission(permissions.usersReadAny),
  getAllUsers,
);

router.get(
  "/:id",
  validate(userIdSchema),
  requirePermission(permissions.usersReadAny),
  getUserById,
);

router.post(
  "/",
  validate(createUserSchema),
  requirePermission(permissions.usersCreate),
  createUser,
);

router.patch(
  "/:id",
  validate(updateUserSchema),
  requirePermission(permissions.usersUpdateAny),
  updateUser,
);

router.patch(
  "/:id/role",
  validate(changeUserRoleSchema),
  requirePermission(permissions.usersChangeRole),
  changeUserRole,
);

router.patch(
  "/:id/status",
  validate(changeUserStatusSchema),
  requirePermission(permissions.usersChangeStatus),
  changeUserStatus,
);

router.post(
  "/:id/reset-password",
  validate(resetUserPasswordSchema),
  requirePermission(permissions.usersResetPassword),
  resetUserPassword,
);

export default router;
