import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./schema";
import { register, login, refresh } from "./service";
import { AppError } from "../../middleware/errorHandler";
import {
  getRefreshCookie,
  setRefreshCookie,
  clearRefreshCookie,
} from "./cookie";

export async function registerUser(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const user = await register(data);
  res.status(201).json(user);
}

export async function loginUser(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await login(
    data.username,
    data.password
  );
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function refreshToken(req: Request, res: Response) {
  const cookieToken = getRefreshCookie(req);
  if (!cookieToken) {
    throw new AppError("Refresh token inválido", 401);
  }
  const { user, accessToken, refreshToken } = await refresh(cookieToken);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export function logoutUser(_req: Request, res: Response) {
  clearRefreshCookie(res);
  res.json({ ok: true });
}
