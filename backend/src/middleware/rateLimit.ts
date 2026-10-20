import { rateLimit } from "express-rate-limit";

function buildAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    handler: (_req, res) => {
      res.status(429).json({
        error: "Demasiados intentos. Probá de nuevo en unos minutos.",
      });
    },
  });
}

export const loginLimiter = buildAuthLimiter();

export const registerLimiter = buildAuthLimiter();
