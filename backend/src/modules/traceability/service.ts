import {
  getPartById,
  getPartHistory,
  getQualityEvents,
  getTimeByStation,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function getPart(partId: string) {
  const part = await getPartById(partId);
  if (!part) {
    throw new AppError("Pieza no encontrada", 404);
  }
  return part;
}

export async function getHistory(partId: string) {
  return getPartHistory(partId);
}

export async function getQuality(partId: string) {
  return getQualityEvents(partId);
}

export async function getStationTimes(partId: string) {
  return getTimeByStation(partId);
}
