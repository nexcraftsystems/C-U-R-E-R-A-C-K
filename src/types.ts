export type AccessRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "WARD_MANAGER" | "STAFF";

export interface UserOperator {
  id: string;
  name: string;
  email: string;
  role: AccessRole;
  hospitalId: string; // Isolated tenant anchor
  departmentId?: string; // Optional ward/department anchor
  status: "ACTIVE" | "REVOKED";
  avatar: string;
}

export interface HospitalNode {
  id: string;
  name: string;
  location: string;
  storageQuota: number; // in cubic meters or total slots
  assetValueLimit: number; // Global limit
  createdAt: string;
  status: "ACTIVE" | "MAINTENANCE";
}

export interface DepartmentNode {
  id: string;
  hospitalId: string;
  name: string;
  storageRooms: string[]; // List of room codes, e.g., ["Room 302-A", "Room 105-B"]
}

export interface InventoryBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expirationDate: string;
  pricePerUnit: number;
}

export interface InventoryItem {
  id: string;
  hospitalId: string;
  category: "Vessel Dilators" | "Critical Antidotes" | "Oxygen Concentrators" | "Surgical Apparatus" | "General Pharamceuticals";
  name: string;
  sku: string;
  totalQuantity: number;
  shelvingLocation: string; // e.g. "Rack E-12"
  safetyThreshold: number; // safety stock limit
  storageZone: string; // e.g. "Zone A", "Cold Vault B"
  batches: InventoryBatch[];
  unit: string; // e.g., "Vials", "Carboys", "Units"
}

export interface PurchaseOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  estimatedUnitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  hospitalId: string;
  departmentId: string;
  items: PurchaseOrderItem[];
  totalValuation: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  draftedBy: string; // User Name
  approvedBy?: string; // Admin Name
  createdAt: string;
  manifestDownloadUrl?: string;
}

export interface MarketRate {
  id: string;
  category: string;
  name: string;
  vendorName: string;
  currentRate: number;
  previousRate: number;
  variancePercentage: number; // e.g., +12.4%
  volatilityStatus: "HIGH" | "STABLE" | "DECREASING";
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: AccessRole;
  hospitalId: string;
  action: string; // e.g., "USER_LOGIN", "ITEM_DISPENSED", "RATE_ADJUSTED", "TENANT_PROVISIONED"
  details: string; // human description
}
