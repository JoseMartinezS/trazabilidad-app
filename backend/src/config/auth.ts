import jwt from "jsonwebtoken";
import { env } from "./env";

export type TokenPayload = {
  userId: string;
  username: string;
  role: string;
};

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
  } catch {
    return null;
  }
}

const DURATION_UNITS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  return Number(match[1]) * DURATION_UNITS[match[2].toLowerCase()];
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
  } catch {
    return null;
  }
}