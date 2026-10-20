import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    username: string;
    email: string;
    password?: string;
    role: "admin" | "supervisor" | "operator";
    isActive: boolean;
  }>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "operator",
      isActive: true,
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

async function loadUsers() {
  setLoading(true);
  try {
    const res = await api.get<User[]>("/users");
    setUsers(res.data);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}

  async function createOrUpdateUser(data: {
    username: string;
    email: string;
    password?: string;
    role: string;
    isActive: boolean;
  }) {
    if (editingId) {
      await api.patch(`/users/${editingId}`, data);
    } else {
      await api.post("/users", data);
    }
    setOpen(false);
    setEditingId(null);
    reset({
      username: "",
      email: "",
      password: "",
      role: "operator",
      isActive: true,
    });
    loadUsers();
  }

  async function deleteUser(id: string) {
    if (!confirm("¿Desactivar este usuario?")) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  }

  function editUser(user: User) {
    setEditingId(user.id);
    reset({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
          <p className="text-gray-600">Administra operadores, supervisores y admin</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset({
              username: "",
              email: "",
              password: "",
              role: "operator",
              isActive: true,
            });
            setOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-gray-500">Usuario</th>
                <th className="pb-3 text-gray-500">Email</th>
                <th className="pb-3 text-gray-500">Rol</th>
                <th className="pb-3 text-gray-500">Estado</th>
                <th className="pb-3 text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.username}</td>
                  <td className="py-3 text-gray-700">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-rose-100 text-rose-700"
                          : u.role === "supervisor"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1.5`}>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          u.isActive ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-gray-600">
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => editUser(u)}
                      className="text-industrial-500 hover:text-industrial-700 mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-rose-500 hover:text-rose-700"
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
              {editingId ? "Editar usuario" : "Nuevo usuario"}
            </h3>
            <form onSubmit={handleSubmit(createOrUpdateUser)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  {...register("username")}
                  className="input-field"
                  placeholder="Ej: juan.operario"
                />
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="input-field"
                  placeholder="Ej: juan@empresa.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="input-field"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select {...register("role")} className="input-field">
                  <option value="operator">Operador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
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
                  {editingId ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}