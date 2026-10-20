import {
  createMovement,
  listMovementsByPart,
  listMovements,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function registerMovement(data: {
  partId: string;
  fromStationId?: string | null;
  toStationId?: string | null;
  operatorId: string;
  movementType: string;
  observations?: string;
}) {
  return createMovement(data);
}

export async function getMovementsByPart(partId: string) {
  return listMovementsByPart(partId);
}

export async function getMovements(filters: Parameters<typeof listMovements>[0]) {
  return listMovements(filters);
}