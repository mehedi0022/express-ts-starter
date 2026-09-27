import { z } from "zod";
import type { FieldOutputTypes } from "../prisma/contract.d.js";

export type UserRole = FieldOutputTypes["public"]["User"]["role"];

export const userRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "AUTHOR",
  "MANAGER",
  "EDITOR",
  "SELLER",
  "CUSTOMER",
] satisfies readonly UserRole[]);
