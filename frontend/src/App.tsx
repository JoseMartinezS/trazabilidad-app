import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { refreshSession, setAccessToken, getAccessToken } from "@/services/api";
import Login from "@/pages/Auth/Login";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import PartsPage from "@/pages/Parts/PartsPage";
import StationsPage from "@/pages/Stations/StationsPage";
import UsersPage from "@/pages/Users/UsersPage";
import QualityPage from "@/pages/Quality/QualityPage";
import TraceabilityPage from "@/pages/Traceability/TraceabilityPage";
import PartScanner from "@/components/parts/PartScanner";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

type SessionStatus = "loading" | "ready";

function PrivateRoute({
  children,
  status,
  roles,
}: {
  children: React.ReactNode;
  status: SessionStatus;
  roles?: string[];
}) {
  const { user } = useAuthStore();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Cargando sesión...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        No tienes permiso para acceder a esta sección.
      </div>
    );
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (!getAccessToken()) {
          const session = await refreshSession();
          if (!cancelled) {
            setUser(session.user);
          }
        }
      } catch {
        setAccessToken(null);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setStatus("ready");
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute status={status}>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route
          path="stations"
          element={
            <PrivateRoute status={status} roles={["admin", "supervisor"]}>
              <StationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="users"
          element={
            <PrivateRoute status={status} roles={["admin", "supervisor"]}>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route path="quality" element={<QualityPage />} />
        <Route path="traceability" element={<TraceabilityPage />} />
        <Route path="scanner" element={<PartScanner />} />
      </Route>
    </Routes>
  );
}
