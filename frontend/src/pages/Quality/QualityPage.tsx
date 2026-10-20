import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Barcode } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import type { Part } from "@/types";

export default function QualityPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    loadParts();
  }, []);

  async function loadParts() {
    setLoading(true);
    try {
      const res = await api.get<Part[]>("/parts");
      setParts(res.data.filter((p) => p.status === "in_process"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    if (!serial) return;
    setLoading(true);
    try {
      const res = await api.get<Part>(`/parts/serial/${encodeURIComponent(serial)}`);
      setParts([res.data]);
      setSelectedPart(res.data);
    } catch (e) {
      console.error(e);
      setParts([]);
    } finally {
      setLoading(false);
    }
  }

  async function approvePart(partId: string) {
    if (!user) return;
    await api.post("/movements", {
      partId,
      movementType: "quality_approve",
      observations: "Aprobado en control de calidad",
    });
    const moveRes = await api.get(`/movements?partId=${partId}`);
    const movements = moveRes.data;
    const lastMove = movements[movements.length - 1];
    await api.post("/quality", {
      partId,
      movementId: lastMove.id,
      result: "approved",
      operatorId: user.id,
    });
    setSelectedPart(null);
    setResult(null);
    loadParts();
  }

  async function rejectPart(partId: string) {
    if (!user) return;
    await api.post("/movements", {
      partId,
      movementType: "quality_reject",
      observations: `Rechazado: ${rejectionReason}`,
    });
    const moveRes = await api.get(`/movements?partId=${partId}`);
    const movements = moveRes.data;
    const lastMove = movements[movements.length - 1];
    await api.post("/quality", {
      partId,
      movementId: lastMove.id,
      result: "rejected",
      rejectionReason,
      evidenceUrl,
      operatorId: user.id,
    });
    setSelectedPart(null);
    setResult(null);
    setRejectionReason("");
    setEvidenceUrl("");
    loadParts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Calidad</h2>
          <p className="text-gray-600">Aprueba o rechaza piezas en inspección</p>
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
            onClick={handleScan}
            className="btn-primary flex items-center gap-2 px-4"
          >
            <Barcode className="w-4 h-4" /> Buscar
          </button>
        </div>
      </div>

      {loading && <div className="py-4 text-center text-gray-500">Buscando pieza...</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-gray-500">Número de serie</th>
              <th className="pb-3 text-gray-500">Estado</th>
              <th className="pb-3 text-gray-500 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id} className="border-b border-gray-100">
                <td className="py-3 font-medium">{part.serialNumber}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      part.status === "in_process"
                        ? "bg-amber-100 text-amber-700"
                        : part.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {part.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPart(part);
                        setResult("approved");
                      }}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPart(part);
                        setResult("rejected");
                      }}
                      className="px-3 py-1.5 bg-rose-500 text-white text-xs rounded hover:bg-rose-600"
                    >
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No hay piezas en proceso para inspeccionar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal calidad */}
      {selectedPart && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {result === "approved" ? "Aprobar pieza" : "Rechazar pieza"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Serie: <span className="font-mono font-medium">{selectedPart.serialNumber}</span>
            </p>

            {result === "rejected" && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Motivo del rechazo</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-field h-24"
                    placeholder="Describe el defecto encontrado..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Evidencia / foto (URL)</label>
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setResult(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={
                  result === "approved"
                    ? () => approvePart(selectedPart!.id)
                    : () => rejectPart(selectedPart!.id)
                }
                className={`btn-primary ${
                  result === "rejected" ? "bg-rose-500 hover:bg-rose-600" : ""
                }`}
              >
                {result === "approved" ? "Confirmar aprobación" : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}