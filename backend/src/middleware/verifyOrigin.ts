import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function verifyOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  if (!origin) {
    next();
    return;
  }

  const ownOrigin = `${req.protocol}://${req.get("host")}`;

  if (
    origin.toLowerCase() === env.corsOrigin.toLowerCase() ||
    origin.toLowerCase() === ownOrigin.toLowerCase()
  ) {
    next();
    return;
  }

  res.status(403).json({ error: "Origen no permitido" });
}
