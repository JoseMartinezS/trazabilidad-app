import { z } from "zod";

export const partSchema = z.object({
  serialNumber: z.string().min(1, "Número de serie requerido"),
  currentStationId: z.string().uuid().optional(),
});