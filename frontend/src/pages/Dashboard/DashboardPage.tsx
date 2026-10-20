import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { DashboardMetrics } from "@/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<DashboardMetrics>("/dashboard");
      setMetrics(res.data);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las métricas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Resumen de producción</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Cargando métricas...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total piezas
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.totalParts}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                En proceso
              </div>
              <div className="text-3xl font-bold text-amber-600 mt-2">
                {metrics.inProcess}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Completadas
              </div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">
                {metrics.completed}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rechazadas
              </div>
              <div className="text-3xl font-bold text-rose-600 mt-2">
                {metrics.rejected}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Producción hoy
              </div>
              <div className="text-3xl font-bold text-industrial-600 mt-2">
                {metrics.todayProduction}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tasa de rechazo
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.rejectionRate}%
              </div>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Piezas por estación
            </h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-gray-500">Estación</th>
                  <th className="pb-3 text-gray-500 text-right">Piezas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.partsByStation.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-gray-500">
                      Sin datos
                    </td>
                  </tr>
                ) : (
                  metrics.partsByStation.map((row) => (
                    <tr
                      key={row.station}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 font-medium text-gray-700">{row.station}</td>
                      <td className="py-3 text-right text-gray-700">{row.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
