import { query } from "../../config/db";
import { Movement, MovementType } from "../../types";

export type MovementRow = Movement & {
  fromStationName: string | null;
  toStationName: string | null;
  operatorName: string | null;
};

const SELECT_MOVEMENT = `
  SELECT m.id, m.part_id, m.from_station_id, m.to_station_id, m.operator_id,
         m.movement_type, m.timestamp, m.observations,
         fs.name AS from_station_name,
         ts.name AS to_station_name,
         u.username AS operator_name
  FROM movements m
  LEFT JOIN stations fs ON m.from_station_id = fs.id
  LEFT JOIN stations ts ON m.to_station_id = ts.id
  LEFT JOIN users u ON m.operator_id = u.id
`;

function mapMovement(m: Record<string, unknown>): MovementRow {
  return {
    id: m.id as string,
    partId: m.part_id as string,
    fromStationId: (m.from_station_id as string) ?? null,
    toStationId: (m.to_station_id as string) ?? null,
    operatorId: m.operator_id as string,
    movementType: m.movement_type as MovementType,
    timestamp: m.timestamp as Date,
    observations: (m.observations as string) ?? undefined,
    fromStationName: (m.from_station_name as string) ?? null,
    toStationName: (m.to_station_name as string) ?? null,
    operatorName: (m.operator_name as string) ?? null,
  };
}

export async function createMovement(data: {
  partId: string;
  fromStationId?: string | null;
  toStationId?: string | null;
  operatorId: string;
  movementType: string;
  observations?: string;
}): Promise<MovementRow> {
  const result = await query(
    `INSERT INTO movements (part_id, from_station_id, to_station_id, operator_id, movement_type, observations)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.partId,
      data.fromStationId ?? null,
      data.toStationId ?? null,
      data.operatorId,
      data.movementType,
      data.observations ?? null,
    ]
  );
  const id = result.rows[0].id as string;
  const created = await query(`${SELECT_MOVEMENT} WHERE m.id = $1`, [id]);
  return mapMovement(created.rows[0]);
}

export async function listMovementsByPart(partId: string): Promise<MovementRow[]> {
  const result = await query(
    `${SELECT_MOVEMENT} WHERE m.part_id = $1 ORDER BY m.timestamp ASC, m.created_at ASC`,
    [partId]
  );
  return result.rows.map(mapMovement);
}

export async function listMovements({
  partId,
  stationId,
  operatorId,
  startDate,
  endDate,
}: {
  partId?: string;
  stationId?: string;
  operatorId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<MovementRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (partId) {
    conditions.push(`m.part_id = $${idx++}`);
    values.push(partId);
  }
  if (stationId) {
    conditions.push(`(m.from_station_id = $${idx} OR m.to_station_id = $${idx})`);
    values.push(stationId);
    idx++;
  }
  if (operatorId) {
    conditions.push(`m.operator_id = $${idx++}`);
    values.push(operatorId);
  }
  if (startDate) {
    conditions.push(`m.timestamp >= $${idx++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`m.timestamp <= $${idx++}`);
    values.push(endDate);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const result = await query(
    `${SELECT_MOVEMENT}${where} ORDER BY m.timestamp ASC, m.created_at ASC`,
    values
  );
  return result.rows.map(mapMovement);
}
