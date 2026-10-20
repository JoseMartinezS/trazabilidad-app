import { query } from "../../config/db";

function mapHistory(m: Record<string, unknown>) {
  return {
    id: m.id as string,
    part_id: m.part_id as string,
    from_station_id: (m.from_station_id as string) ?? null,
    to_station_id: (m.to_station_id as string) ?? null,
    operator_id: m.operator_id as string,
    movement_type: m.movement_type as string,
    timestamp: m.timestamp as Date,
    observations: (m.observations as string) ?? null,
    from_station_name: (m.from_station_name as string) ?? null,
    to_station_name: (m.to_station_name as string) ?? null,
    operator_name: (m.operator_name as string) ?? null,
    fromStationName: (m.from_station_name as string) ?? null,
    toStationName: (m.to_station_name as string) ?? null,
    operatorName: (m.operator_name as string) ?? null,
  };
}

export async function getPartById(partId: string) {
  const result = await query(
    `SELECT p.id, p.serial_number, p.current_station_id, p.status, p.created_at,
            s.name AS current_station_name
     FROM parts p
     LEFT JOIN stations s ON p.current_station_id = s.id AND s.deleted_at IS NULL
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [partId]
  );
  if (result.rows.length === 0) return null;
  const p = result.rows[0];
  return {
    id: p.id as string,
    serialNumber: p.serial_number as string,
    serial_number: p.serial_number as string,
    currentStationId: (p.current_station_id as string) ?? null,
    current_station_id: (p.current_station_id as string) ?? null,
    currentStationName: (p.current_station_name as string) ?? null,
    status: p.status as string,
    createdAt: p.created_at as Date,
  };
}

export async function getPartHistory(partId: string) {
  const result = await query(
    `SELECT m.id, m.part_id, m.from_station_id, m.to_station_id, m.operator_id,
            m.movement_type, m.timestamp, m.observations,
            fs.name AS from_station_name,
            ts.name AS to_station_name,
            u.username AS operator_name
     FROM movements m
     LEFT JOIN stations fs ON m.from_station_id = fs.id
     LEFT JOIN stations ts ON m.to_station_id = ts.id
     LEFT JOIN users u ON m.operator_id = u.id
     WHERE m.part_id = $1
     ORDER BY m.timestamp ASC, m.created_at ASC`,
    [partId]
  );
  return result.rows.map(mapHistory);
}

export async function getQualityEvents(partId: string) {
  const result = await query(
    `SELECT q.id, q.part_id, q.movement_id, q.result, q.rejection_reason,
            q.evidence_url, q.operator_id, q.created_at,
            u.username AS operator_name,
            s.name AS station_name
     FROM quality_events q
     LEFT JOIN movements m ON q.movement_id = m.id
     LEFT JOIN stations s ON m.to_station_id = s.id
     LEFT JOIN users u ON q.operator_id = u.id
     WHERE q.part_id = $1
     ORDER BY q.created_at ASC`,
    [partId]
  );
  return result.rows.map((q) => ({
    id: q.id as string,
    partId: q.part_id as string,
    movementId: q.movement_id as string,
    result: q.result as string,
    rejectionReason: (q.rejection_reason as string) ?? null,
    evidenceUrl: (q.evidence_url as string) ?? null,
    operatorId: q.operator_id as string,
    operatorName: (q.operator_name as string) ?? null,
    stationName: (q.station_name as string) ?? null,
    createdAt: q.created_at as Date,
  }));
}

export async function getTimeByStation(partId: string) {
  const result = await query(
    `SELECT m.from_station_id, m.to_station_id, m.timestamp,
            ts.name AS to_station_name
     FROM movements m
     LEFT JOIN stations ts ON m.to_station_id = ts.id
     WHERE m.part_id = $1
     ORDER BY m.timestamp ASC, m.created_at ASC`,
    [partId]
  );

  type Visit = {
    stationId: string;
    stationName: string | null;
    entryTime: Date | null;
    exitTime: Date | null;
    totalSeconds: number;
  };

  const visits = new Map<string, Visit>();
  const openEntry = new Map<string, number>();

  for (const row of result.rows) {
    const time = new Date(row.timestamp as string).getTime();
    const toId = row.to_station_id as string | null;
    const fromId = row.from_station_id as string | null;

    if (fromId && openEntry.has(fromId)) {
      const entry = openEntry.get(fromId) as number;
      openEntry.delete(fromId);
      const visit = visits.get(fromId);
      if (visit) {
        visit.exitTime = new Date(time);
        visit.totalSeconds += Math.max(0, Math.round((time - entry) / 1000));
      }
    }

    if (toId) {
      openEntry.set(toId, time);
      const existing = visits.get(toId);
      if (existing) {
        if (!existing.entryTime) existing.entryTime = new Date(time);
      } else {
        visits.set(toId, {
          stationId: toId,
          stationName: (row.to_station_name as string) ?? null,
          entryTime: new Date(time),
          exitTime: null,
          totalSeconds: 0,
        });
      }
    }
  }

  return Array.from(visits.values()).map((v) => ({
    to_station_id: v.stationId,
    station_name: v.stationName,
    entry_time: v.entryTime,
    exit_time: v.exitTime,
    total_seconds: v.totalSeconds,
    toStationId: v.stationId,
    stationName: v.stationName,
    entryTime: v.entryTime,
    exitTime: v.exitTime,
    totalSeconds: v.totalSeconds,
  }));
}
