import { query } from "../../config/db";
import { Part, PartStatus } from "../../types";

type PartRow = Part & { currentStationName: string | null };

function mapPart(p: Record<string, unknown>): PartRow {
  return {
    id: p.id as string,
    serialNumber: p.serial_number as string,
    currentStationId: (p.current_station_id as string) ?? undefined,
    status: p.status as PartStatus,
    createdAt: p.created_at as Date,
    currentStationName: (p.current_station_name as string) ?? null,
  };
}

export async function listParts(): Promise<PartRow[]> {
  const result = await query(
    `SELECT p.id, p.serial_number, p.current_station_id, p.status, p.created_at,
            s.name AS current_station_name
     FROM parts p
     LEFT JOIN stations s ON p.current_station_id = s.id AND s.deleted_at IS NULL
     WHERE p.deleted_at IS NULL
     ORDER BY p.created_at DESC`
  );
  return result.rows.map(mapPart);
}

export async function getPartById(id: string): Promise<PartRow | null> {
  const result = await query(
    `SELECT p.id, p.serial_number, p.current_station_id, p.status, p.created_at,
            s.name AS current_station_name
     FROM parts p
     LEFT JOIN stations s ON p.current_station_id = s.id AND s.deleted_at IS NULL
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapPart(result.rows[0]);
}

export async function getPartBySerial(serialNumber: string): Promise<PartRow | null> {
  const result = await query(
    `SELECT p.id, p.serial_number, p.current_station_id, p.status, p.created_at,
            s.name AS current_station_name
     FROM parts p
     LEFT JOIN stations s ON p.current_station_id = s.id AND s.deleted_at IS NULL
     WHERE p.serial_number = $1 AND p.deleted_at IS NULL`,
    [serialNumber]
  );
  if (result.rows.length === 0) return null;
  return mapPart(result.rows[0]);
}

export async function createPart(data: {
  serialNumber: string;
  currentStationId?: string;
}): Promise<PartRow> {
  const result = await query(
    `INSERT INTO parts (serial_number, current_station_id)
     VALUES ($1, $2)
     RETURNING id, serial_number, current_station_id, status, created_at`,
    [data.serialNumber, data.currentStationId ?? null]
  );
  const created = result.rows[0];
  return getPartById(created.id as string) as Promise<PartRow>;
}

export async function updatePart(
  id: string,
  data: Partial<{ currentStationId: string; status: PartStatus }>
): Promise<PartRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.currentStationId !== undefined) {
    fields.push(`current_station_id = $${idx++}`);
    values.push(data.currentStationId ?? null);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  if (fields.length === 0) return getPartById(id);

  values.push(id);
  const result = await query(
    `UPDATE parts SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx} AND deleted_at IS NULL RETURNING id`,
    values
  );
  if (result.rows.length === 0) return null;
  return getPartById(id);
}

export async function deletePart(id: string): Promise<boolean> {
  const result = await query(
    "UPDATE parts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
