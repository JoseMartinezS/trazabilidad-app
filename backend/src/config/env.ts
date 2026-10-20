import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  dbHost: process.env.DB_HOST ?? "localhost",
  dbPort: parseInt(process.env.DB_PORT ?? "5432", 10),
  dbUser: requireEnv("DB_USER"),
  dbPassword: requireEnv("DB_PASSWORD"),
  dbDatabase: process.env.DB_DATABASE ?? "trazabilidad",
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtAccessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as StringValue,
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as StringValue,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  cookieSameSite: (process.env.COOKIE_SAMESITE ?? "strict") as
    | "strict"
    | "lax"
    | "none",
};