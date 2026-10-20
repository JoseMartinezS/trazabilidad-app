import { query } from "../../config/db";

export async function getDashboardMetrics() {
  const [
    totalPartsResult,
    inProcessResult,
    completedResult,
    rejectedResult,
    todayProductionResult,
    partsByStationResult,
  ] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM parts WHERE deleted_at IS NULL"),
    query("SELECT COUNT(*) AS total FROM parts WHERE status = 'in_process' AND deleted_at IS NULL"),
    query("SELECT COUNT(*) AS total FROM parts WHERE status = 'completed' AND deleted_at IS NULL"),
    query("SELECT COUNT(*) AS total FROM parts WHERE status = 'rejected' AND deleted_at IS NULL"),
    query("SELECT COUNT(*) AS total FROM parts WHERE created_at >= CURRENT_DATE AND deleted_at IS NULL"),
    query(`
      SELECT COALESCE(s.name, 'Sin estación') AS station, COUNT(p.id) AS count
      FROM parts p
      LEFT JOIN stations s ON p.current_station_id = s.id
      WHERE p.deleted_at IS NULL
      GROUP BY s.name
      ORDER BY count DESC
    `),
  ]);

  const totalParts = parseInt(totalPartsResult.rows[0]?.total ?? '0', 10);
  const rejected = parseInt(rejectedResult.rows[0]?.total ?? '0', 10);
  const rejectionRate = totalParts > 0 ? Math.round((rejected / totalParts) * 100) : 0;

  return {
    totalParts,
    inProcess: parseInt(inProcessResult.rows[0]?.total ?? '0', 10),
    completed: parseInt(completedResult.rows[0]?.total ?? '0', 10),
    rejected,
    todayProduction: parseInt(todayProductionResult.rows[0]?.total ?? '0', 10),
    rejectionRate,
    partsByStation: (partsByStationResult.rows || []).map((r: any) => ({
      station: r.station,
      count: parseInt(r.count, 10),
    })),
  };
}