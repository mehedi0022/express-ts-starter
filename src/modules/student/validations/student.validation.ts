import { z } from "zod";

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    email: z.string().email("Invalid email address"),

    age: z.number().int().min(5, "Age must be at least 5"),
  }),
});
