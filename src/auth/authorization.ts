export const permissions = {
  usersReadAny: "users:read:any",
  usersCreate: "users:create",
  usersUpdateAny: "users:update:any",
  usersDeleteAny: "users:delete:any",
  usersChangeRole: "users:change-role",
  usersChangeStatus: "users:change-status",
  usersResetPassword: "users:reset-password",
  rbacRolesManage: "rbac:roles:manage",
  rbacPermissionsManage: "rbac:permissions:manage",
} as const;

// Route declarations use this catalogue for compile-time safety. Actual grants
// are resolved from RolePermission records in the database.
export type Permission = (typeof permissions)[keyof typeof permissions];