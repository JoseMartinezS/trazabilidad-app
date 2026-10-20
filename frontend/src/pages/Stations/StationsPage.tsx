import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { Station } from "@/types";

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    name: string;
    code: string;
    processOrder: number;
    description?: string;
  }>({
    defaultValues: { name: "", code: "", processOrder: 1, description: "" },
  });

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    setLoading(true);
    try {
      const res = await api.get<Station[]>("/stations");
      setStations(res.data.sort((a, b) => a.processOrder - b.processOrder));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createOrUpdateStation(data: {
    name: string;
    code: string;
    processOrder: number;
    description?: string;
  }) {
    if (editingId) {
      await api.patch(`/stations/${editingId}`, data);
    } else {
      await api.post("/stations", data);
    }
    setOpen(false);
    setEditingId(null);
    reset({ name: "", code: "", processOrder: 1, description: "" });
    loadStations();
  }

  async function deleteStation(id: string) {
    if (!confirm("¿Eliminar esta estación?")) return;
    await api.delete(`/stations/${id}`);
    loadStations();
  }

  function editStation(station: Station) {
    setEditingId(station.id);
    reset({
      name: station.name,
      code: station.code,
      processOrder: station.processOrder,
      description: station.description ?? "",
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estaciones de Trabajo</h2>
          <p className="text-gray-600">
            Define el orden del proceso productivo
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset({ name: "", code: "", processOrder: 1, description: "" });
            setOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva estación
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-gray-500">Orden</th>
                <th className="pb-3 text-gray-500">Nombre</th>
                <th className="pb-3 text-gray-500">Código</th>
                <th className="pb-3 text-gray-500">Descripción</th>
                <th className="pb-3 text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{s.processOrder}</td>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-gray-700">{s.code}</td>
                  <td className="py-3 text-gray-600">
                    {s.description || "-"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => editStation(s)}
                      className="text-industrial-500 hover:text-industrial-700 mr-2"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStation(s.id)}
                      className="text-rose-500 hover:text-rose-700"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "Editar estación" : "Nueva estación"}
            </h3>
            <form onSubmit={handleSubmit(createOrUpdateStation)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  {...register("name")}
                  className="input-field"
                  placeholder="Ej: Corte"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  {...register("code")}
                  className="input-field"
                  placeholder="Ej: ST-01"
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Orden en el proceso</label>
                <input
                  type="number"
                  {...register("processOrder")}
                  className="input-field"
                  placeholder="1"
                />
                {errors.processOrder && (
                  <p className="text-xs text-red-500 mt-1">{errors.processOrder.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input
                  {...register("description")}
                  className="input-field"
                  placeholder="Descripción opcional"
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
                  {editingId ? "Guardar cambios" : "Crear estación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}