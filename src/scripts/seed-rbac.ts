import { closeDatabase, db } from "../prisma/db.js";

const roles = [
  { key: "CUSTOMER", name: "Customer", rank: 1 },
  { key: "SELLER", name: "Seller", rank: 2 },
  { key: "AUTHOR", name: "Author", rank: 3 },
  { key: "EDITOR", name: "Editor", rank: 4 },
  { key: "MODERATOR", name: "Moderator", rank: 5 },
  { key: "MANAGER", name: "Manager", rank: 6 },
  { key: "ADMIN", name: "Admin", rank: 7 },
  { key: "SUPER_ADMIN", name: "Super Admin", rank: 8 },
] as const;

const permissions = [
  { key: "users:read:any", module: "users", action: "read:any", description: "View any user" },
  { key: "users:create", module: "users", action: "create", description: "Create a user" },
  { key: "users:update:any", module: "users", action: "update:any", description: "Update any user" },
  { key: "users:delete:any", module: "users", action: "delete:any", description: "Delete any user" },
  { key: "users:change-role", module: "users", action: "change-role", description: "Change a user's role" },
  { key: "users:change-status", module: "users", action: "change-status", description: "Activate or deactivate a user" },
  { key: "users:reset-password", module: "users", action: "reset-password", description: "Reset a user's password" },
  { key: "rbac:roles:manage", module: "rbac", action: "roles:manage", description: "Manage role permission assignments" },
  { key: "rbac:permissions:manage", module: "rbac", action: "permissions:manage", description: "Create and manage permissions" },
] as const;

const privilegedRoleKeys = new Set(["ADMIN", "SUPER_ADMIN"]);

const seedRbac = async () => db.transaction(async (tx) => {
  const roleIds = new Map<string, number>();
  const permissionIds = new Map<string, number>();

  for (const role of roles) {
    const existing = await tx.orm.public.Role.first({ key: role.key });
    const saved = existing
      ? await tx.orm.public.Role.where({ id: existing.id }).update({ ...role, isSystem: true })
      : await tx.orm.public.Role.create({ ...role, isSystem: true });
    if (!saved) throw new Error(`Could not seed role: ${role.key}`);
    roleIds.set(role.key, saved.id);
  }

  const users = await tx.orm.public.User.select("id", "role").all();
  for (const user of users) {
    const roleId = roleIds.get(user.role);
    if (roleId === undefined) throw new Error(`Seed role not found for user ${user.id}: ${user.role}`);
    await tx.orm.public.User.where({ id: user.id }).update({ roleId });
  }

  for (const permission of permissions) {
    const existing = await tx.orm.public.Permission.first({ key: permission.key });
    const saved = existing
      ? await tx.orm.public.Permission.where({ id: existing.id }).update(permission)
      : await tx.orm.public.Permission.create(permission);
    if (!saved) throw new Error(`Could not seed permission: ${permission.key}`);
    permissionIds.set(permission.key, saved.id);
  }

  for (const roleKey of privilegedRoleKeys) {
    const roleId = roleIds.get(roleKey);
    if (roleId === undefined) throw new Error(`Seed role not found: ${roleKey}`);

    for (const [permissionKey, permissionId] of permissionIds) {
      if (roleKey !== "SUPER_ADMIN" && permissionKey.startsWith("rbac:")) continue;
      const existing = await tx.orm.public.RolePermission.first({ roleId, permissionId });
      if (!existing) await tx.orm.public.RolePermission.create({ roleId, permissionId });
    }
  }

  return { roles: roleIds.size, permissions: permissionIds.size, users: users.length };
});

try {
  const result = await seedRbac();
  console.log(`RBAC seeded: ${result.roles} roles, ${result.permissions} permissions, ${result.users} users linked.`);
} finally {
  await closeDatabase();
}