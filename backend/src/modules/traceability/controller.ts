import { Request, Response } from "express";
import { getPart, getHistory, getQuality, getStationTimes } from "./service";

export async function getPartTraceability(req: Request, res: Response) {
  const partId = req.params.partId;
  const part = await getPart(partId);
  const history = await getHistory(partId);
  const qualityEvents = await getQuality(partId);
  const times = await getStationTimes(partId);
  res.json({ part, history, qualityEvents, stationTimes: times });
}
