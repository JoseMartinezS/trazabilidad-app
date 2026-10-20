import { query } from "../../config/db";
import { Station } from "../../types";

function mapStation(s: Record<string, unknown>): Station {
  return {
    id: s.id as string,
    name: s.name as string,
    code: s.code as string,
    processOrder: s.process_order as number,
    description: (s.description as string) ?? undefined,
    isActive: s.is_active as boolean,
    createdAt: s.created_at as Date,
  };
}

export async function listStations(): Promise<Station[]> {
  const result = await query(
    "SELECT id, name, code, process_order, description, is_active, created_at FROM stations WHERE deleted_at IS NULL ORDER BY process_order, name"
  );
  return result.rows.map(mapStation);
}

export async function getStationById(id: string): Promise<Station | null> {
  const result = await query(
    "SELECT id, name, code, process_order, description, is_active, created_at FROM stations WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapStation(result.rows[0]);
}

export async function createStation(data: {
  name: string;
  code: string;
  processOrder: number;
  description?: string;
}): Promise<Station> {
  const result = await query(
    `INSERT INTO stations (name, code, process_order, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, code, process_order, description, is_active, created_at`,
    [data.name, data.code, data.processOrder, data.description ?? null]
  );
  return mapStation(result.rows[0]);
}

export async function updateStation(
  id: string,
  data: Partial<{ name: string; code: string; processOrder: number; description: string; isActive: boolean }>
): Promise<Station | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(data.name);
  }
  if (data.code !== undefined) {
    fields.push(`code = $${idx++}`);
    values.push(data.code);
  }
  if (data.processOrder !== undefined) {
    fields.push(`process_order = $${idx++}`);
    values.push(data.processOrder);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(data.description ?? null);
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${idx++}`);
    values.push(data.isActive);
  }

  if (fields.length === 0) return getStationById(id);

  values.push(id);
  const result = await query(
    `UPDATE stations SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} AND deleted_at IS NULL RETURNING id, name, code, process_order, description, is_active, created_at`,
    values
  );
  if (result.rows.length === 0) return null;
  return mapStation(result.rows[0]);
}

export async function deleteStation(id: string): Promise<boolean> {
  const result = await query(
    "UPDATE stations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
