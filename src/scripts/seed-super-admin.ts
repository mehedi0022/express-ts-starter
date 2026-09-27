import { z } from "zod";

import { config } from "../config/env.js";
import { hashPassword } from "../utils/password.util.js";
import { closeDatabase, db } from "../prisma/db.js";

const passwordSchema = z
  .string()
  .min(8, "must be at least 8 characters")
  .regex(/[A-Z]/, "must contain an uppercase letter")
  .regex(/[a-z]/, "must contain a lowercase letter")
  .regex(/[0-9]/, "must contain a number")
  .regex(/[^A-Za-z0-9]/, "must contain a special character");

const getSeedInput = () => {
  if (!config.superAdmin.email || !config.superAdmin.password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required. Run npm run rbac:seed first.",
    );
  }

  return {
    email: config.superAdmin.email.toLowerCase(),
    password: passwordSchema.parse(config.superAdmin.password),
    userName: config.superAdmin.userName,
    fullName: config.superAdmin.fullName,
  };
};

const seedSuperAdmin = async () => {
  const input = getSeedInput();
  const password = await hashPassword(input.password);

  return db.transaction(async (tx) => {
    const role = await tx.orm.public.Role.first({ key: "SUPER_ADMIN" });

    if (!role) {
      throw new Error("SUPER_ADMIN role not found. Run npm run rbac:seed first.");
    }

    const existing = await tx.orm.public.User.first({ email: input.email });
    const user = existing
      ? await tx.orm.public.User.where({ id: existing.id }).update({
          email: input.email,
          userName: input.userName,
          fullName: input.fullName,
          password,
          roleId: role.id,
          isActive: true,
        })
      : await tx.orm.public.User.create({
          email: input.email,
          userName: input.userName,
          fullName: input.fullName,
          password,
          roleId: role.id,
          isActive: true,
        });

    if (!user) throw new Error("Could not create or update the super-admin user.");

    return { id: user.id, created: !existing };
  });
};

try {
  const result = await seedSuperAdmin();
  console.log(`Super admin ${result.created ? "created" : "updated"} (user ID: ${result.id}).`);
} finally {
  await closeDatabase();
}
