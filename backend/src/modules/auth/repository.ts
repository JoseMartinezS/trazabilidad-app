import { query } from "../../config/db";
import { User } from "../../types";

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query(
    "SELECT id, username, email, password_hash, role, is_active, created_at FROM users WHERE username = $1 AND deleted_at IS NULL",
    [username]
  );
  if (result.rows.length === 0) return null;
  const u = result.rows[0];
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    passwordHash: u.password_hash,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query(
    "SELECT id, username, email, password_hash, role, is_active, created_at FROM users WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  if (result.rows.length === 0) return null;
  const u = result.rows[0];
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    passwordHash: u.password_hash,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

export async function createUser(data: {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
}): Promise<User> {
  const result = await query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, password_hash, role, is_active, created_at`,
    [data.username, data.email, data.passwordHash, data.role]
  );
  const u = result.rows[0];
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

export async function userExists(username: string, email: string): Promise<boolean> {
  const result = await query(
    "SELECT id FROM users WHERE (username = $1 OR email = $2) AND deleted_at IS NULL",
    [username, email]
  );
  return result.rows.length > 0;
}