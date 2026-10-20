import { Request, Response } from "express";
import { qualityCheckSchema } from "./schema";
import { checkQuality, getQualityEventsByPart } from "./service";

export async function createQualityCheck(req: Request, res: Response) {
  const data = qualityCheckSchema.parse(req.body);
  const authReq = req as any;
  const operatorId = authReq.user?.userId;

  if (!operatorId) {
    res.status(401).json({ error: "Usuario no autenticado" });
    return;
  }

  const event = await checkQuality({
    ...data,
    operatorId,
  });
  res.status(201).json(event);
}

export async function getQualityForPart(req: Request, res: Response) {
  const events = await getQualityEventsByPart(req.params.partId);
  res.json(events);
}