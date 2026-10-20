import { z } from "zod";

export const stationSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().min(1, "Código requerido"),
  processOrder: z.number().int().positive("Orden debe ser positivo"),
  description: z.string().optional(),
});