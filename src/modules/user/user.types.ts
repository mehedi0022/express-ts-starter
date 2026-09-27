import { z } from "zod";

import {
  changeUserRoleSchema,
  changeUserStatusSchema,
  createUserSchema,
  registerUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  userListQuerySchema,
} from "./validations/user.validation.js";

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];

export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>["body"];

export type ChangeUserStatusInput = z.infer<
  typeof changeUserStatusSchema
>["body"];

export type ResetUserPasswordInput = z.infer<
  typeof resetUserPasswordSchema
>["body"];

export type UserListQuery = z.infer<typeof userListQuerySchema>["query"];
