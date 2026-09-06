import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    userName: z.string().min(2),
    fullName: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
  }),
});

const userIdParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const userIdSchema = z.object({ params: userIdParams });

export const updateUserSchema = z.object({
  params: userIdParams,
  body: z.object({
    userName: z.string().min(2).nullable().optional(),
    fullName: z.string().min(3).nullable().optional(),
  }).strict().refine((body) => Object.keys(body).length > 0, {
    message: "At least one profile field is required",
  }),
});
