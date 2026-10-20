import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "supervisor", "operator"]),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "supervisor", "operator"]).optional(),
  isActive: z.boolean().optional(),
});