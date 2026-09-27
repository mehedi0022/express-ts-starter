import type { UserRole } from "./roles.js";

const roleRank: Readonly<Record<UserRole, number>> = {
  CUSTOMER: 1,
  SELLER: 2,
  AUTHOR: 3,
  EDITOR: 4,
  MODERATOR: 5,
  MANAGER: 6,
  ADMIN: 7,
  SUPER_ADMIN: 8,
};

export const canCreateRole = (actorRole: UserRole, newRole: UserRole) => {
  if (actorRole === "SUPER_ADMIN") return true;
  return actorRole === "ADMIN" && newRole === "MANAGER";
};

export const canManageRole = (actorRole: UserRole, targetRole: UserRole) => {
  if (actorRole === "SUPER_ADMIN") return true;
  return actorRole === "ADMIN" && roleRank[targetRole] < roleRank[actorRole];
};

export const canAssignRole = (actorRole: UserRole, newRole: UserRole) =>
  actorRole === "SUPER_ADMIN" && roleRank[newRole] <= roleRank.SUPER_ADMIN;
