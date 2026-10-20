import { query } from "../../config/db";
import { QualityEvent, QualityResult } from "../../types";

export type QualityEventRow = QualityEvent & {
  stationName: string | null;
  operatorName: string | null;
};

const SELECT_QUALITY = `
  SELECT q.id, q.part_id, q.movement_id, q.result, q.rejection_reason,
         q.evidence_url, q.operator_id, q.created_at,
         s.name AS station_name,
         u.username AS operator_name
  FROM quality_events q
  LEFT JOIN movements m ON q.movement_id = m.id
  LEFT JOIN stations s ON m.to_station_id = s.id
  LEFT JOIN users u ON q.operator_id = u.id
`;

function mapQualityEvent(q: Record<string, unknown>): QualityEventRow {
  return {
    id: q.id as string,
    partId: q.part_id as string,
    movementId: q.movement_id as string,
    result: q.result as QualityResult,
    rejectionReason: (q.rejection_reason as string) ?? undefined,
    evidenceUrl: (q.evidence_url as string) ?? undefined,
    operatorId: q.operator_id as string,
    createdAt: q.created_at as Date,
    stationName: (q.station_name as string) ?? null,
    operatorName: (q.operator_name as string) ?? null,
  };
}

export async function createQualityEvent(data: {
  partId: string;
  movementId: string;
  result: string;
  rejectionReason?: string | null;
  evidenceUrl?: string | null;
  operatorId: string;
}): Promise<QualityEventRow> {
  const result = await query(
    `INSERT INTO quality_events (part_id, movement_id, result, rejection_reason, evidence_url, operator_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.partId,
      data.movementId,
      data.result,
      data.rejectionReason ?? null,
      data.evidenceUrl ?? null,
      data.operatorId,
    ]
  );
  const id = result.rows[0].id as string;
  const created = await query(`${SELECT_QUALITY} WHERE q.id = $1`, [id]);
  return mapQualityEvent(created.rows[0]);
}

export async function getQualityByPart(partId: string): Promise<QualityEventRow[]> {
  const result = await query(
    `${SELECT_QUALITY} WHERE q.part_id = $1 ORDER BY q.created_at ASC`,
    [partId]
  );
  return result.rows.map(mapQualityEvent);
}

export async function getMovementPartId(
  movementId: string
): Promise<string | null> {
  const result = await query("SELECT part_id FROM movements WHERE id = $1", [movementId]);
  if (result.rows.length === 0) return null;
  return result.rows[0].part_id as string;
}
