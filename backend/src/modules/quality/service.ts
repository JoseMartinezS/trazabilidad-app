import { createQualityEvent, getQualityByPart, getMovementPartId } from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function checkQuality(data: {
  partId: string;
  movementId: string;
  result: string;
  rejectionReason?: string;
  evidenceUrl?: string;
  operatorId: string;
}) {
  const movementPartId = await getMovementPartId(data.movementId);
  if (!movementPartId) {
    throw new AppError("Movimiento no encontrado", 404);
  }
  if (movementPartId !== data.partId) {
    throw new AppError("El movimiento no pertenece a la pieza indicada", 400);
  }
  return createQualityEvent(data);
}

export async function getQualityEventsByPart(partId: string) {
  return getQualityByPart(partId);
}
