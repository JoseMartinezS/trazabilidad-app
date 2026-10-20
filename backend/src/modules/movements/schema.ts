import { z } from "zod";

export const movementSchema = z.object({
  partId: z.string().uuid("ID de pieza inválido"),
  fromStationId: z.string().uuid().optional().nullable(),
  toStationId: z.string().uuid().optional().nullable(),
  movementType: z.enum([
    "entry",
    "exit",
    "transfer",
    "quality_reject",
    "quality_approve",
  ]),
  observations: z.string().optional(),
});