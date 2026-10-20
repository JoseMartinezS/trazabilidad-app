export type UserRole = "admin" | "supervisor" | "operator";

export type PartStatus = "in_process" | "completed" | "rejected" | "scrap";

export type MovementType =
  | "entry"
  | "exit"
  | "transfer"
  | "quality_reject"
  | "quality_approve";

export type QualityResult = "approved" | "rejected";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  processOrder: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Part {
  id: string;
  serialNumber: string;
  currentStationId?: string;
  status: PartStatus;
  createdAt: Date;
}

export interface Movement {
  id: string;
  partId: string;
  fromStationId?: string | null;
  toStationId?: string | null;
  operatorId: string;
  movementType: MovementType;
  timestamp: Date;
  observations?: string;
}

export interface QualityEvent {
  id: string;
  partId: string;
  movementId: string;
  result: QualityResult;
  rejectionReason?: string;
  evidenceUrl?: string;
  operatorId: string;
  createdAt: Date;
}