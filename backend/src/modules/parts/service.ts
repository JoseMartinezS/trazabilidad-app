import {
  listParts,
  getPartById,
  getPartBySerial,
  createPart,
  updatePart,
  deletePart,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function getAllParts() {
  return listParts();
}

export async function getPart(id: string) {
  const part = await getPartById(id);
  if (!part) {
    throw new AppError("Pieza no encontrada", 404);
  }
  return part;
}

export async function getPartBySerialNumber(serial: string) {
  const part = await getPartBySerial(serial);
  if (!part) {
    throw new AppError("Pieza no encontrada", 404);
  }
  return part;
}

export async function createNewPart(data: Parameters<typeof createPart>[0]) {
  const exists = await getPartBySerial(data.serialNumber);
  if (exists) {
    throw new AppError("Ya existe una pieza con ese número de serie", 409);
  }
  return createPart(data);
}

export async function editPart(
  id: string,
  data: Parameters<typeof updatePart>[1]
) {
  const part = await updatePart(id, data);
  if (!part) {
    throw new AppError("Pieza no encontrada", 404);
  }
  return part;
}

export async function removePart(id: string) {
  const deleted = await deletePart(id);
  if (!deleted) {
    throw new AppError("Pieza no encontrada", 404);
  }
}