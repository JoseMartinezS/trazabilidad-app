import bcrypt from "bcryptjs";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  userExists,
} from "./repository";
import { AppError } from "../../middleware/errorHandler";

export async function getAllUsers() {
  return listUsers();
}

export async function getUser(id: string) {
  const user = await getUserById(id);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return user;
}

export async function createNewUser(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  if (await userExists(data.username, data.email)) {
    throw new AppError("Usuario o email ya existen", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  return createUser({
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role,
  });
}

export async function editUser(
  id: string,
  data: Parameters<typeof updateUser>[1]
) {
  const user = await updateUser(id, data);
  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return user;
}

export async function removeUser(id: string) {
  const deleted = await deleteUser(id);
  if (!deleted) {
    throw new AppError("Usuario no encontrado", 404);
  }
}