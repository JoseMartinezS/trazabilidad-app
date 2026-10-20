import { Request, Response } from "express";
import { getMetrics } from "./service";

export async function getDashboard(_req: Request, res: Response) {
  const metrics = await getMetrics();
  res.json(metrics);
}