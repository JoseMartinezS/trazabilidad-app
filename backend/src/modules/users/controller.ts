import { Request, Response } from "express";
import { userCreateSchema, userUpdateSchema } from "./schema";
import { toPublicUser } from "../../utils/serializer";
import {
  getAllUsers,
  getUser,
  editUser,
  removeUser,
  createNewUser,
} from "./service";

export async function listUsers(_req: Request, res: Response) {
  const users = await getAllUsers();
  res.json(users.map(toPublicUser));
}

export async function getUserById(req: Request, res: Response) {
  const user = await getUser(req.params.id);
  res.json(toPublicUser(user));
}

export async function createUserController(req: Request, res: Response) {
  const data = userCreateSchema.parse(req.body);
  const user = await createNewUser(data);
  res.status(201).json(toPublicUser(user));
}

export async function updateUserById(req: Request, res: Response) {
  const data = userUpdateSchema.parse(req.body);
  const user = await editUser(req.params.id, data);
  res.json(toPublicUser(user));
}

export async function deleteUserById(req: Request, res: Response) {
  await removeUser(req.params.id);
  res.status(204).send();
}