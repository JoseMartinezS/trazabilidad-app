import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import type { Part } from "@/types";

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [serial, setSerial] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ serialNumber: string; currentStationId?: string }>();

  useEffect(() => {
    loadParts();
  }, []);

  async function loadParts() {
    setLoading(true);
    try {
      const res = await api.get<Part[]>("/parts");
      setParts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createPart(data: { serialNumber: string; currentStationId?: string }) {
    await api.post("/parts", data);
    setOpen(false);
    setSerial("");
    loadParts();
  }

  const filteredParts = parts.filter((p) =>
    p.serialNumber.toLowerCase().includes(serial.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Piezas</h2>
          <p className="text-gray-600">Registra y rastrea cada pieza en producción</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="input-field w-64"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Buscar por número de serie..."
          />
          <button
            onClick={() => setOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva pieza
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-3 text-gray-500">Número de serie</th>
              <th className="pb-3 text-gray-500">Estado</th>
              <th className="pb-3 text-gray-500">Estación actual</th>
              <th className="pb-3 text-gray-500 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredParts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No hay piezas registradas
                </td>
              </tr>
            ) : (
              filteredParts.map((part) => (
                <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{part.serialNumber}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        part.status === "in_process"
                          ? "bg-amber-100 text-amber-700"
                          : part.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : part.status === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {part.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-700">{part.currentStationName || "-"}</td>
                  <td className="py-3 text-gray-500 text-right">
                    {new Date(part.createdAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear pieza */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">Nueva pieza</h3>
            <form
              onSubmit={handleSubmit(createPart)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Número de serie</label>
                <input
                  {...register("serialNumber")}
                  className="input-field"
                  placeholder="Ej: SN-000123"
                />
                {errors.serialNumber && (
                  <p className="text-xs text-red-500 mt-1">{errors.serialNumber.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estación inicial (opcional)</label>
                <input
                  {...register("currentStationId")}
                  className="input-field"
                  placeholder="ID de estación"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear pieza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}