import { Request, Response } from "express";
import { env } from "../../config/env";
import { parseDurationMs } from "../../config/auth";

export const REFRESH_COOKIE_NAME = "refresh_token";

function baseOptions() {
  return {
    httpOnly: true,
    path: "/api/auth",
    secure: env.nodeEnv === "production",
    sameSite: env.cookieSameSite,
  };
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions(),
    maxAge: parseDurationMs(env.jwtRefreshExpiresIn),
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions());
}

export function getRefreshCookie(req: Request): string | null {
  const value = req.cookies?.[REFRESH_COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : null;
}
