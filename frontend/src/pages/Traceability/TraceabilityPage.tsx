import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { Barcode, User, MapPin, ArrowRight } from "lucide-react";
import type { Part } from "@/types";

interface MovementRow {
  id: string;
  part_id: string;
  from_station_id?: string | null;
  to_station_id?: string | null;
  operator_id: string;
  movement_type: string;
  timestamp: string;
  observations?: string | null;
  fromStationName?: string | null;
  toStationName?: string | null;
  operatorName?: string | null;
}

interface StationTimeRow {
  to_station_id: string;
  station_name?: string | null;
  entry_time?: string | null;
  exit_time?: string | null;
  total_seconds: number;
  toStationId: string;
  stationName?: string | null;
  entryTime?: string | null;
  exitTime?: string | null;
  totalSeconds: number;
}

interface TraceabilityResponse {
  part: Part;
  history: MovementRow[];
  stationTimes: StationTimeRow[];
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function TraceabilityPage() {
  const [searchParams] = useSearchParams();
  const [serial, setSerial] = useState("");
  const [part, setPart] = useState<Part | null>(null);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [stationTimes, setStationTimes] = useState<StationTimeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScan(sn?: string) {
    const s = (sn ?? serial).trim();
    if (!s) return;
    setLoading(true);
    setError("");
    try {
      const partRes = await api.get<Part>(`/parts/serial/${encodeURIComponent(s)}`);
      const traceRes = await api.get<TraceabilityResponse>(
        `/traceability/part/${partRes.data.id}`
      );
      setPart(traceRes.data.part);
      setMovements(traceRes.data.history);
      setStationTimes(traceRes.data.stationTimes);
      setSerial(s);
    } catch {
      setPart(null);
      setMovements([]);
      setStationTimes([]);
      setError("No se pudo cargar la trazabilidad de la pieza");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const s = searchParams.get("serial");
    if (s) {
      handleScan(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trazabilidad de Pieza</h2>
          <p className="text-gray-600">Historial completo de movimientos</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="input-field w-64"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Escanear número de serie..."
          />
            <button
              onClick={() => handleScan()}
              className="btn-primary flex items-center gap-2 px-4"
            >
            <Barcode className="w-4 h-4" /> Buscar
          </button>
        </div>
      </div>

      {loading && <div className="py-4 text-center text-gray-500">Cargando historial...</div>}
      {error && !loading && <div className="py-2 text-center text-red-500">{error}</div>}

      {part && (
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold">{part.serialNumber}</h3>
              <p className="text-gray-600">
                Estado:{" "}
                <span
                  className={`font-medium capitalize ${
                    part.status === "in_process"
                      ? "text-amber-600"
                      : part.status === "completed"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {part.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  part.currentStationId
                    ? "bg-industrial-50 text-industrial-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Estación actual:{" "}
                {part.currentStationName || part.currentStationId || "Sin asignar"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Historial de movimientos
            </h4>
            <div className="border-l-2 border-industrial-200 pl-6 space-y-4">
              {movements.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  Sin movimientos registrados
                </div>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="relative">
                    <div className="absolute -left-[9px] top-2 w-3 h-3 rounded-full bg-industrial-500 border-2 border-white" />
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium text-industrial-600">
                        {new Date(m.timestamp).toLocaleString("es-ES")}
                      </span>
                      <span className="ml-auto text-xs text-gray-500 capitalize">
                        {m.movement_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {m.toStationName ?? m.to_station_id ?? "Salida"}
                      </span>
                      {(m.fromStationName ?? m.from_station_id) && (
                        <>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <span className="text-gray-500 text-xs">
                            desde {m.fromStationName ?? m.from_station_id}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <User className="w-3 h-3" />
                      <span>Operador: {m.operatorName ?? m.operator_id}</span>
                      {m.observations && (
                        <>
                          <span className="mx-1">|</span>
                          <span className="italic">{m.observations}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {stationTimes.length > 0 && (
            <div className="space-y-3 mt-8">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Tiempo por estación
              </h4>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-gray-500">Estación</th>
                    <th className="pb-3 text-gray-500">Entrada</th>
                    <th className="pb-3 text-gray-500">Salida</th>
                    <th className="pb-3 text-gray-500 text-right">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {stationTimes.map((st) => (
                    <tr
                      key={st.toStationId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 font-medium text-gray-700">
                        {st.stationName ?? st.to_station_id}
                      </td>
                      <td className="py-3 text-gray-500">
                        {st.entryTime ? new Date(st.entryTime).toLocaleString("es-ES") : "-"}
                      </td>
                      <td className="py-3 text-gray-500">
                        {st.exitTime ? new Date(st.exitTime).toLocaleString("es-ES") : "En curso"}
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {formatDuration(st.totalSeconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!part && !loading && serial && !error && (
        <div className="py-8 text-center text-red-500">
          Pieza no encontrada
        </div>
      )}
    </div>
  );
}
