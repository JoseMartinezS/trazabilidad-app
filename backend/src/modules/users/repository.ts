import { query } from "../../config/db";
import { User } from "../../types";

export async function listUsers(): Promise<User[]> {
  const result = await query(
    "SELECT id, username, email, password_hash, role, is_active, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC"
  );
  return result.rows.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    passwordHash: u.password_hash,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
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
    passwordHash: u.password_hash,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  };
}

export async function updateUser(
  id: string,
  data: Partial<{ username: string; email: string; role: string; isActive: boolean; passwordHash: string }>
): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.username !== undefined) {
    fields.push(`username = $${idx++}`);
    values.push(data.username);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${idx++}`);
    values.push(data.isActive);
  }
  if (data.passwordHash !== undefined) {
    fields.push(`password_hash = $${idx++}`);
    values.push(data.passwordHash);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  const result = await query(
    `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} AND deleted_at IS NULL RETURNING id, username, email, password_hash, role, is_active, created_at`,
    values
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

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    "UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function userExists(username: string, email: string): Promise<boolean> {
  const result = await query(
    "SELECT id FROM users WHERE (username = $1 OR email = $2) AND deleted_at IS NULL",
    [username, email]
  );
  return result.rows.length > 0;
}