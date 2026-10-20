import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../config/auth";
import {
  findUserByUsername,
  findUserById,
  createUser,
  userExists,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";
import { toPublicUser } from "../../utils/serializer";

export async function register(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  if (await userExists(data.username, data.email)) {
    throw new AppError("Usuario o email ya existen", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role,
  });

  return toPublicUser(user);
}

export async function login(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  if (!user.passwordHash) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Credenciales inválidas", 401);
  }

  if (!user.isActive) {
    throw new AppError("Usuario desactivado", 403);
  }

  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError("Refresh token inválido", 401);
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    throw new AppError("Refresh token inválido", 401);
  }

  if (!user.isActive) {
    throw new AppError("Usuario desactivado", 403);
  }

  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
}
