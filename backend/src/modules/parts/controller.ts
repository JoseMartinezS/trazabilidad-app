import { Request, Response } from "express";
import { partSchema } from "./schema";
import {
  getAllParts,
  getPart,
  getPartBySerialNumber,
  createNewPart,
  editPart,
  removePart,
} from "./service";

export async function listParts(_req: Request, res: Response) {
  const parts = await getAllParts();
  res.json(parts);
}

export async function getPartById(req: Request, res: Response) {
  const part = await getPart(req.params.id);
  res.json(part);
}

export async function getPartBySerial(req: Request, res: Response) {
  const part = await getPartBySerialNumber(req.params.serial);
  res.json(part);
}

export async function createPartController(req: Request, res: Response) {
  const data = partSchema.parse(req.body);
  const part = await createNewPart(data);
  res.status(201).json(part);
}

export async function updatePartById(req: Request, res: Response) {
  const data = partSchema.partial().parse(req.body);
  const part = await editPart(req.params.id, data);
  res.json(part);
}

export async function deletePartById(req: Request, res: Response) {
  await removePart(req.params.id);
  res.status(204).send();
}