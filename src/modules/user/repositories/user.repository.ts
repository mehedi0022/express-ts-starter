import { db } from "../../../prisma/db.js";

import { toPublicUserDto } from "../user.dto.js";
import type { UserListQuery } from "../user.types.js";

import { pageOffset, paginationMeta } from "../../../utils/pagination.js";

import { Temporal } from "temporal-polyfill";
import { or } from "@prisma/orm-postgres/orm-client";

type CreateUserData = {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  roleId: number;
};

export const findRoleById = (id: number) =>
  db.orm.public.Role.select("id", "key", "name", "rank", "isSystem").first({
    id,
  });

export const findUserIdByEmail = (email: string) =>
  db.orm.public.User.select("id").first({
    email,
  });

export const findUserByEmail = async (email: string) => {
  return db.orm.public.User.select(
    "id",
    "email",
    "userName",
    "fullName",
    "password",
    "roleId",
    "isActive",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
  )
    .include("rbacRole", (role) =>
      role.select("id", "key", "name", "rank", "isSystem"),
    )
    .first({
      email,
    });
};

/**
 * Get paginated users.
 */
export const findAllUsers = async ({
  page,
  limit,
  roleId,
  status,
  search,
  sortBy,
  sortOrder,
}: UserListQuery) => {
  const selectedUsers = db.orm.public.User.select(
    "id",
    "email",
    "userName",
    "fullName",
    "roleId",
    "isActive",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
  ).include("rbacRole", (role) =>
    role.select("id", "key", "name", "rank", "isSystem"),
  );

  let filteredUsers = selectedUsers;

  if (roleId) {
    filteredUsers = filteredUsers.where({
      roleId,
    });
  }

  if (status) {
    filteredUsers = filteredUsers.where({
      isActive: status === "ACTIVE",
    });
  }

  if (search) {
    const term = `%${search}%`;

    filteredUsers = filteredUsers.where((user) =>
      or(
        user.fullName.ilike(term),
        user.userName.ilike(term),
        user.email.ilike(term),
      ),
    );
  }

  const offset = pageOffset(page, limit);

  const usersQuery = (() => {
    switch (sortBy) {
      case "id":
        return filteredUsers.orderBy((user) =>
          sortOrder === "asc" ? user.id.asc() : user.id.desc(),
        );

      case "email":
        return filteredUsers.orderBy([
          (user) =>
            sortOrder === "asc" ? user.email.asc() : user.email.desc(),
          (user) => user.id.asc(),
        ]);

      case "userName":
        return filteredUsers.orderBy([
          (user) =>
            sortOrder === "asc" ? user.userName.asc() : user.userName.desc(),
          (user) => user.id.asc(),
        ]);

      case "fullName":
        return filteredUsers.orderBy([
          (user) =>
            sortOrder === "asc" ? user.fullName.asc() : user.fullName.desc(),
          (user) => user.id.asc(),
        ]);

      case "roleId":
        return filteredUsers.orderBy([
          (user) =>
            sortOrder === "asc" ? user.roleId.asc() : user.roleId.desc(),
          (user) => user.id.asc(),
        ]);

      case "createdAt":
      default:
        return filteredUsers.orderBy([
          (user) =>
            sortOrder === "asc" ? user.createdAt.asc() : user.createdAt.desc(),
          (user) => user.id.desc(),
        ]);
    }
  })();

  const [{ total }, users] = await Promise.all([
    filteredUsers.aggregate((aggregate) => ({
      total: aggregate.count(),
    })),

    usersQuery.offset(offset).limit(limit).all(),
  ]);

  return {
    users: users.map(toPublicUserDto),
    meta: paginationMeta(page, limit, total),
  };
};

/**
 * Create user.
 */
export const createUser = async (data: CreateUserData) => {
  const user = await db.orm.public.User.select(
    "id",
    "email",
    "userName",
    "fullName",
    "roleId",
    "isActive",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
  )
    .include("rbacRole", (role) =>
      role.select("id", "key", "name", "rank", "isSystem"),
    )
    .create({
      userName: data.userName,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      roleId: data.roleId,
    });

  return toPublicUserDto(user);
};

/**
 * Find the minimum user data required for authorization.
 *
 * Permissions are resolved through:
 *
 * User -> Role -> RolePermission -> Permission
 */
export const findAuthorizationUserById = (id: number) =>
  db.orm.public.User.select("id", "isActive")
    .include("rbacRole", (role) =>
      role
        .select("id", "key", "rank")
        .include("rolePermissions", (rolePermission) =>
          rolePermission.include("permission", (permission) =>
            permission.select("key"),
          ),
        ),
    )
    .first({
      id,
    });

/**
 * Get all permission keys granted to a user
 * through their current role.
 */
export const getPermissionKeysForUserId = async (
  id: number,
): Promise<string[]> => {
  const user = await findAuthorizationUserById(id);

  if (!user?.rbacRole) {
    return [];
  }

  return user.rbacRole.rolePermissions.flatMap(({ permission }) =>
    permission ? [permission.key] : [],
  );
};

/**
 * Find user by ID and return public DTO.
 */
export const findUserById = async (id: number) => {
  const user = await db.orm.public.User.select(
    "id",
    "email",
    "userName",
    "fullName",
    "roleId",
    "isActive",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
  )
    .include("rbacRole", (role) =>
      role.select("id", "key", "name", "rank", "isSystem"),
    )
    .first({
      id,
    });

  return user ? toPublicUserDto(user) : null;
};

/**
 * Update user profile.
 */
export const updateUserById = async (
  id: number,
  data: {
    userName?: string | null;
    fullName?: string | null;
  },
) => {
  const user = await db.orm.public.User.where({
    id,
  })
    .select(
      "id",
      "email",
      "userName",
      "fullName",
      "roleId",
      "isActive",
      "emailVerifiedAt",
      "createdAt",
      "updatedAt",
    )
    .include("rbacRole", (role) =>
      role.select("id", "key", "name", "rank", "isSystem"),
    )
    .update(data);

  return user ? toPublicUserDto(user) : null;
};

/**
 * Count active users assigned to a specific role key.
 *
 * Role key is used here only to identify a specific
 * system role. Authorization itself is not based on
 * role keys.
 */
export const countActiveUsersByRoleKey = async (roleKey: string) => {
  const role = await db.orm.public.Role.select("id").first({
    key: roleKey,
  });

  if (!role) {
    return 0;
  }

  const result = await db.orm.public.User.where({
    roleId: role.id,
    isActive: true,
  }).aggregate((aggregate) => ({
    count: aggregate.count(),
  }));

  return result.count;
};

/**
 * Change user's role.
 */
export const updateUserRoleById = async (id: number, roleId: number) => {
  const user = await db.orm.public.User.where({
    id,
  })
    .select(
      "id",
      "email",
      "userName",
      "fullName",
      "roleId",
      "isActive",
      "emailVerifiedAt",
      "createdAt",
      "updatedAt",
    )
    .include("rbacRole", (role) =>
      role.select("id", "key", "name", "rank", "isSystem"),
    )
    .update({
      roleId,
    });

  return user ? toPublicUserDto(user) : null;
};

/**
 * Change user status.
 *
 * Deactivating a user also revokes all active sessions.
 */
export const updateUserStatusAndRevokeSessions = async (
  id: number,
  isActive: boolean,
) =>
  db.transaction(async (tx) => {
    const user = await tx.orm.public.User.where({
      id,
    })
      .select(
        "id",
        "email",
        "userName",
        "fullName",
        "roleId",
        "isActive",
        "emailVerifiedAt",
        "createdAt",
        "updatedAt",
      )
      .include("rbacRole", (role) =>
        role.select("id", "key", "name", "rank", "isSystem"),
      )
      .update({
        isActive,
      });

    if (!user) {
      return null;
    }

    if (!isActive) {
      const revokedAt = Temporal.Now.instant();

      while (
        await tx.orm.public.Session.where({
          userId: id,
          revokedAt: null,
        })
          .select("id")
          .update({
            revokedAt,
          })
      ) {
        // ORM updates one row at a time.
        // Continue until every active session is revoked.
      }
    }

    return toPublicUserDto(user);
  });
