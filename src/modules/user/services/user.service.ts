import * as userRepository from "../repositories/user.repository.js";
import * as accountTokenRepository from "../../auth/repositories/account-token.repository.js";

import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../../../errors/AppError.js";

import type { RegisterUserInput, UserListQuery } from "../user.types.js";

import { hashPassword } from "../../../utils/password.util.js";
import { Temporal } from "temporal-polyfill";
import { config } from "../../../config/env.js";
import { logger } from "../../../config/logger.js";
import { emailService } from "../../email/email.service.js";
import { createWelcomeEmail } from "../../email/templates/welcome.template.js";

const SUPER_ADMIN_ROLE_KEY = "SUPER_ADMIN";
const DEFAULT_REGISTRATION_ROLE_KEY = "CUSTOMER";

type ActorContext = {
  userId: number;
  roleId: number;
  roleKey: string;
  roleRank: number;
};

const canManageTarget = (actor: ActorContext, targetRoleRank: number) =>
  actor.roleRank > targetRoleRank;

const canAssignRole = (actor: ActorContext, roleRank: number) =>
  actor.roleRank > roleRank;

export const getAllUsers = async (query: UserListQuery) => {
  return userRepository.findAllUsers(query);
};

export const getUserById = async (id: number) => {
  const user = await userRepository.findUserById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const createUser = async (
  actor: ActorContext,
  data: {
    userName: string;
    fullName: string;
    email: string;
    password: string;
    roleId: number;
  },
) => {
  const email = data.email.trim().toLowerCase();

  const role = await userRepository.findRoleById(data.roleId);

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (!canAssignRole(actor, role.rank)) {
    throw new AuthorizationError("You cannot create a user with this role");
  }

  const existingUser = await userRepository.findUserIdByEmail(email);

  if (existingUser) {
    throw new ConflictError("A user with this email already exists");
  }

  return userRepository.createUser({
    userName: data.userName,
    fullName: data.fullName,
    email,
    password: await hashPassword(data.password),
    roleId: role.id,
  });
};

export const registerUser = async (data: RegisterUserInput) => {
  const email = data.email.trim().toLowerCase();
  const role = await userRepository.findRoleByKey(
    DEFAULT_REGISTRATION_ROLE_KEY,
  );

  if (!role) {
    throw new NotFoundError("Default registration role not found");
  }

  console.log(config.smtp.enabled);

  const existingUser = await userRepository.findUserIdByEmail(email);

  if (existingUser) {
    throw new ConflictError("A user with this email already exists");
  }

  const user = await userRepository.createUser({
    userName: data.userName,
    fullName: data.fullName,
    email,
    password: await hashPassword(data.password),
    roleId: role.id,
  });

  if (config.smtp.enabled) {
    void emailService
      .sendEmail({
        to: user.email,
        ...createWelcomeEmail({
          appUrl: config.email.appUrl!,
          recipientName: user.fullName ?? undefined,
        }),
      })
      .catch((error: unknown) => {
        logger.error(
          { errorName: error instanceof Error ? error.name : "UnknownError", userId: user.id },
          "Welcome email delivery failed",
        );
      });
  }

  return user;
};

export const getCurrentUser = async (id: number) => {
  const user = await getUserById(id);

  const permissions = await userRepository.getPermissionKeysForUserId(id);

  return {
    ...user,
    permissions,
  };
};

export const updateUser = async (
  actor: ActorContext,
  id: number,
  data: {
    userName?: string | null;
    fullName?: string | null;
  },
) => {
  const target = await userRepository.findUserById(id);

  if (!target) {
    throw new NotFoundError("User not found");
  }

  const isOwnAccount = actor.userId === id;

  if (!isOwnAccount && !canManageTarget(actor, target.role.rank)) {
    throw new AuthorizationError("You cannot update this user");
  }

  const user = await userRepository.updateUserById(id, data);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const changeUserRole = async (
  actor: ActorContext,
  id: number,
  newRoleId: number,
) => {
  const target = await userRepository.findUserById(id);

  if (!target) {
    throw new NotFoundError("User not found");
  }

  const newRole = await userRepository.findRoleById(newRoleId);

  if (!newRole) {
    throw new NotFoundError("Role not found");
  }

  if (actor.userId === id) {
    throw new ConflictError("You cannot change your own role");
  }

  if (!canManageTarget(actor, target.role.rank)) {
    throw new AuthorizationError("You cannot change this user's role");
  }

  if (!canAssignRole(actor, newRole.rank)) {
    throw new AuthorizationError("You cannot assign this role");
  }

  if (target.roleId === newRole.id) {
    return target;
  }

  if (
    target.role.key === SUPER_ADMIN_ROLE_KEY &&
    target.isActive &&
    (await userRepository.countActiveUsersByRoleKey(SUPER_ADMIN_ROLE_KEY)) <= 1
  ) {
    throw new ConflictError("The last active SUPER_ADMIN cannot be demoted");
  }

  const user = await userRepository.updateUserRoleById(id, newRole.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const changeUserStatus = async (
  actor: ActorContext,
  id: number,
  isActive: boolean,
) => {
  const target = await userRepository.findUserById(id);

  if (!target) {
    throw new NotFoundError("User not found");
  }

  if (actor.userId === id && !isActive) {
    throw new ConflictError("You cannot deactivate your own account");
  }

  if (!canManageTarget(actor, target.role.rank)) {
    throw new AuthorizationError("You cannot change this user's status");
  }

  if (target.isActive === isActive) {
    return target;
  }

  if (
    target.role.key === SUPER_ADMIN_ROLE_KEY &&
    target.isActive &&
    !isActive &&
    (await userRepository.countActiveUsersByRoleKey(SUPER_ADMIN_ROLE_KEY)) <= 1
  ) {
    throw new ConflictError(
      "The last active SUPER_ADMIN cannot be deactivated",
    );
  }

  const user = await userRepository.updateUserStatusAndRevokeSessions(
    id,
    isActive,
  );

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const resetUserPassword = async (
  actor: ActorContext,
  id: number,
  newPassword: string,
) => {
  const target = await userRepository.findUserById(id);

  if (!target) {
    throw new NotFoundError("User not found");
  }

  if (actor.userId === id) {
    throw new ConflictError(
      "Use the change-password endpoint to update your own password",
    );
  }

  if (!canManageTarget(actor, target.role.rank)) {
    throw new AuthorizationError("You cannot reset this user's password");
  }

  const updated = await accountTokenRepository.changePasswordAndRevokeSessions({
    userId: id,
    passwordHash: await hashPassword(newPassword),
    now: Temporal.Now.instant(),
  });

  if (!updated) {
    throw new NotFoundError("User not found");
  }
};
