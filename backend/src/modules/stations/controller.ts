import { Request, Response } from "express";
import { stationSchema } from "./schema";
import {
  getAllStations,
  getStation,
  createNewStation,
  editStation,
  removeStation,
} from "./service";

export async function listStations(_req: Request, res: Response) {
  const stations = await getAllStations();
  res.json(stations);
}

export async function getStationById(req: Request, res: Response) {
  const station = await getStation(req.params.id);
  res.json(station);
}

export async function createStationController(req: Request, res: Response) {
  const data = stationSchema.parse(req.body);
  const station = await createNewStation(data);
  res.status(201).json(station);
}

export async function updateStationById(req: Request, res: Response) {
  const data = stationSchema.partial().parse(req.body);
  const station = await editStation(req.params.id, data);
  res.json(station);
}

export async function deleteStationById(req: Request, res: Response) {
  await removeStation(req.params.id);
  res.status(204).send();
}