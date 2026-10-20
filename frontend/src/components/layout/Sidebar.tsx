import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Barcode,
  Package,
  ShieldAlert,
  Users,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api, setAccessToken } from "@/services/api";

type MenuItem = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
};

const menuItems: MenuItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/parts", label: "Piezas", icon: Package },
  {
    path: "/stations",
    label: "Estaciones",
    icon: Barcode,
    roles: ["admin", "supervisor"],
  },
  {
    path: "/users",
    label: "Usuarios",
    icon: Users,
    roles: ["admin", "supervisor"],
  },
  { path: "/quality", label: "Calidad", icon: ShieldAlert },
  { path: "/traceability", label: "Trazabilidad", icon: ClipboardList },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => undefined);
    setAccessToken(null);
    logout();
    navigate("/login");
  };

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? "")
  );

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-industrial-900">Trazabilidad</h1>
        <p className="text-xs text-gray-500 mt-1">Sistema de Manufactura</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-industrial-50 text-industrial-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
