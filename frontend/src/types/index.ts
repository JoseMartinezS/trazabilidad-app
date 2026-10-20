export type UserRole = "admin" | "supervisor" | "operator";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export interface Part {
  id: string;
  serialNumber: string;
  currentStationId?: string;
  currentStationName?: string | null;
  status: string;
  createdAt: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  processOrder: number;
  description: string | null;
}

export interface Movement {
  id: string;
  partId: string;
  fromStationId?: string;
  fromStationName?: string | null;
  toStationId?: string;
  toStationName?: string | null;
  operatorId: string;
  operatorName?: string | null;
  movementType: string;
  timestamp: string;
  observations?: string;
}

export interface DashboardMetrics {
  totalParts: number;
  inProcess: number;
  completed: number;
  rejected: number;
  todayProduction: number;
  rejectionRate: number;
  partsByStation: Array<{ station: string; count: number }>;
}