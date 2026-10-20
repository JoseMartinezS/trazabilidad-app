import { useAuthStore } from "@/stores/authStore";
import { api, setAccessToken } from "@/services/api";
import { Menu, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => undefined);
    setAccessToken(null);
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-1 text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.username || "Usuario"}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || ""}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-industrial-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}