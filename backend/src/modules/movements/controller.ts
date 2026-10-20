import { Request, Response } from "express";
import { movementSchema } from "./schema";
import { registerMovement, getMovementsByPart, getMovements } from "./service";

export async function createMovement(req: Request, res: Response) {
  const data = movementSchema.parse(req.body);
  const authReq = req as any;
  const operatorId = authReq.user?.userId;
  if (!operatorId) {
    res.status(401).json({ error: "Usuario no autenticado" });
    return;
  }

  const movement = await registerMovement({
    ...data,
    operatorId,
  });
  res.status(201).json(movement);
}

export async function getMovementsForPart(req: Request, res: Response) {
  const movements = await getMovementsByPart(req.params.partId);
  res.json(movements);
}

export async function listMovements(req: Request, res: Response) {
  const filters = {
    partId: req.query.partId as string,
    stationId: req.query.stationId as string,
    operatorId: req.query.operatorId as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  };
  const movements = await getMovements(filters);
  res.json(movements);
}