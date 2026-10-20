import { z } from "zod";

export const qualityCheckSchema = z.object({
  partId: z.string().uuid("ID de pieza inválido"),
  movementId: z.string().uuid("ID de movimiento inválido"),
  result: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
  evidenceUrl: z.string().optional(),
});