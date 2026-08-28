import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string("Username is required")
      .min(2, "Username must be at least 2 characters"),
    full_name: z
      .string("Full name is required")
      .min(3, "Full name must be at least 3 characters"),
    email: z.email("Invalid email address"),
    password: z
      .string("Password is required")
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  }),
});
