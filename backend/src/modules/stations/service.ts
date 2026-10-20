import {
  listStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function getAllStations() {
  return listStations();
}

export async function getStation(id: string) {
  const station = await getStationById(id);
  if (!station) {
    throw new AppError("Estación no encontrada", 404);
  }
  return station;
}

export async function createNewStation(data: Parameters<typeof createStation>[0]) {
  return createStation(data);
}

export async function editStation(
  id: string,
  data: Parameters<typeof updateStation>[1]
) {
  const station = await updateStation(id, data);
  if (!station) {
    throw new AppError("Estación no encontrada", 404);
  }
  return station;
}

export async function removeStation(id: string) {
  const deleted = await deleteStation(id);
  if (!deleted) {
    throw new AppError("Estación no encontrada", 404);
  }
}