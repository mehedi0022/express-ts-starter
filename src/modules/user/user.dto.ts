import type { FieldOutputTypes } from "../../prisma/contract.d.js";

type UserRecord = FieldOutputTypes["public"]["User"];
type RoleRecord = FieldOutputTypes["public"]["Role"];

export type PublicRoleDto = Pick<
  RoleRecord,
  "id" | "key" | "name" | "rank" | "isSystem"
>;

type PublicUserRecord = Pick<
  UserRecord,
  | "id"
  | "email"
  | "userName"
  | "fullName"
  | "roleId"
  | "isActive"
  | "emailVerifiedAt"
  | "createdAt"
  | "updatedAt"
>;

export type PublicUserDto = PublicUserRecord & {
  role: PublicRoleDto;
};

type UserWithRole = PublicUserRecord & {
  rbacRole: PublicRoleDto | null;
};

const requireRole = (role: PublicRoleDto | null): PublicRoleDto => {
  if (!role) {
    throw new Error("User role relation is not configured");
  }

  return role;
};

export const toPublicUserDto = (user: UserWithRole): PublicUserDto => {
  const role = requireRole(user.rbacRole);

  return {
    id: user.id,
    email: user.email,
    userName: user.userName,
    fullName: user.fullName,
    roleId: user.roleId,

    role: {
      id: role.id,
      key: role.key,
      name: role.name,
      rank: role.rank,
      isSystem: role.isSystem,
    },

    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export type AuthenticatedUserDto = PublicUserDto & {
  permissions: string[];
};

export const toAuthenticatedUserDto = (
  user: UserWithRole,
  permissions: string[] = [],
): AuthenticatedUserDto => ({
  ...toPublicUserDto(user),
  permissions,
});
