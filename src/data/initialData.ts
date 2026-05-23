import { UserOperator, HospitalNode, DepartmentNode, InventoryItem, PurchaseOrder, MarketRate, AuditLog } from "../types";

export const INITIAL_OPERATORS: UserOperator[] = [
  {
    id: "op-01",
    name: "Systems Root Alpha",
    email: "root@cuerack.my",
    role: "SUPER_ADMIN",
    hospitalId: "all", // Super admin can access all context
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  // Hospital Serdang (hosp-01)
  {
    id: "op-02",
    name: "Dr. Christopher Chen (Admin)",
    email: "admin.chris@serdang.gov.my",
    role: "HOSPITAL_ADMIN",
    hospitalId: "hosp-01",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "op-03",
    name: "Sarah Jenkins, RN (Staff)",
    email: "sarah.ward@serdang.gov.my",
    role: "STAFF",
    hospitalId: "hosp-01",
    departmentId: "dept-serdang-emerg",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  // Hospital Pengajar UPM (hosp-02)
  {
    id: "op-04",
    name: "Dr. Michael Tan (Admin)",
    email: "admin.michael@upm.edu.my",
    role: "HOSPITAL_ADMIN",
    hospitalId: "hosp-02",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "op-05",
    name: "Nurse Julian Rossi (Staff)",
    email: "rossi.staff@upm.edu.my",
    role: "STAFF",
    hospitalId: "hosp-02",
    departmentId: "dept-upm-emerg",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  // Clinic Rahman Putra (hosp-03)
  {
    id: "op-06",
    name: "Dr. Fauziah Awang (Admin)",
    email: "admin.fauziah@rahmanputra.my",
    role: "HOSPITAL_ADMIN",
    hospitalId: "hosp-03",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "op-07",
    name: "Kumar Subramaniam (Staff)",
    email: "kumar.staff@rahmanputra.my",
    role: "STAFF",
    hospitalId: "hosp-03",
    departmentId: "dept-rp-emerg",
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_HOSPITALS: HospitalNode[] = [
  {
    id: "hosp-01",
    name: "Hospital Serdang",
    location: "Kajang - Serdang Road, Selangor",
    storageQuota: 4500,
    assetValueLimit: 150000,
    createdAt: "2025-01-12T08:00:00Z",
    status: "ACTIVE"
  },
  {
    id: "hosp-02",
    name: "Hospital Pengajar UPM",
    location: "Persiaran Universiti, Serdang, Selangor",
    storageQuota: 3000,
    assetValueLimit: 90000,
    createdAt: "2025-02-20T10:30:00Z",
    status: "ACTIVE"
  },
  {
    id: "hosp-03",
    name: "Clinic Rahman Putra",
    location: "Bukit Rahman Putra, Sungai Buloh, Selangor",
    storageQuota: 2000,
    assetValueLimit: 50000,
    createdAt: "2025-03-05T14:15:00Z",
    status: "ACTIVE"
  }
];

export const INITIAL_DEPARTMENTS: DepartmentNode[] = [
  // Hospital Serdang
  {
    id: "dept-serdang-cario",
    hospitalId: "hosp-01",
    name: "Cardiology",
    storageRooms: ["Room 302-A", "Cardio Vault-B", "CryoStorage 1"]
  },
  {
    id: "dept-serdang-emerg",
    hospitalId: "hosp-01",
    name: "Emergency Care Unit",
    storageRooms: ["Emergency Locker A", "Trauma Station-1"]
  },
  // Hospital Pengajar UPM
  {
    id: "dept-upm-emerg",
    hospitalId: "hosp-02",
    name: "ER Trauma Node",
    storageRooms: ["Cabinet X-1", "Rapid Shelf 3"]
  },
  {
    id: "dept-upm-peds",
    hospitalId: "hosp-02",
    name: "Paediatrics Ward",
    storageRooms: ["Peds Vault-1", "Room 102-C"]
  },
  // Clinic Rahman Putra
  {
    id: "dept-rp-emerg",
    hospitalId: "hosp-03",
    name: "Outpatient Emergency",
    storageRooms: ["Cabinet RP-1", "Vault Delta", "Cold Box 1"]
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Hospital Serdang (hosp-01) Items (minimum 1 stock enforced)
  {
    id: "item-01",
    hospitalId: "hosp-01",
    category: "Vessel Dilators",
    name: "Cardene IV Infusion (Nicardipine)",
    sku: "VD-NIC-25MG",
    totalQuantity: 280,
    shelvingLocation: "Room 302-A",
    safetyThreshold: 100,
    storageZone: "Cardio Vault-B",
    unit: "Vials",
    batches: [
      { id: "batch-1a", batchNumber: "B-NCR-9092", quantity: 180, expirationDate: "2026-11-15", pricePerUnit: 45.00 },
      { id: "batch-1b", batchNumber: "B-NCR-2281", quantity: 100, expirationDate: "2027-04-18", pricePerUnit: 45.00 }
    ]
  },
  {
    id: "item-02",
    hospitalId: "hosp-01",
    category: "Critical Antidotes",
    name: "Naloxone HCl Emergency Injectable",
    sku: "AN-NAL-0.4MG",
    totalQuantity: 42,
    shelvingLocation: "Emergency Locker A",
    safetyThreshold: 50,
    storageZone: "Emergency Locker A",
    unit: "Vials",
    batches: [
      { id: "batch-2a", batchNumber: "B-NLX-4100", quantity: 42, expirationDate: "2026-06-12", pricePerUnit: 28.50 }
    ]
  },
  {
    id: "item-03",
    hospitalId: "hosp-01",
    category: "Oxygen Concentrators",
    name: "AirSep Elite Pro Bio-Ventilations",
    sku: "OC-AIR-10L",
    totalQuantity: 15,
    shelvingLocation: "Trauma Station-1",
    safetyThreshold: 5,
    storageZone: "Trauma Station-1",
    unit: "Units",
    batches: [
      { id: "batch-3a", batchNumber: "B-ASP-4882", quantity: 10, expirationDate: "2029-08-01", pricePerUnit: 1200.00 },
      { id: "batch-3b", batchNumber: "B-ASP-5991", quantity: 5, expirationDate: "2026-06-30", pricePerUnit: 1250.00 }
    ]
  },

  // Hospital Pengajar UPM (hosp-02) Items (minimum 1 stock enforced)
  {
    id: "item-04",
    hospitalId: "hosp-02",
    category: "Vessel Dilators",
    name: "Nitroglycerin Infusion (D5W)",
    sku: "VD-NTG-50MG",
    totalQuantity: 90,
    shelvingLocation: "Cabinet X-1",
    safetyThreshold: 80,
    storageZone: "Cabinet X-1",
    unit: "Vials",
    batches: [
      { id: "batch-4a", batchNumber: "B-NTG-8012", quantity: 90, expirationDate: "2027-01-05", pricePerUnit: 35.00 }
    ]
  },
  {
    id: "item-05",
    hospitalId: "hosp-02",
    category: "Critical Antidotes",
    name: "Flumazenil Resuscitation Agent",
    sku: "AN-FLU-0.5MG",
    totalQuantity: 8,
    shelvingLocation: "Rapid Shelf 3",
    safetyThreshold: 20,
    storageZone: "Rapid Shelf 3",
    unit: "Vials",
    batches: [
      { id: "batch-5a", batchNumber: "B-FLM-1122", quantity: 8, expirationDate: "2026-08-30", pricePerUnit: 48.00 }
    ]
  },

  // Clinic Rahman Putra (hosp-03) Items (minimum 1 stock enforced)
  {
    id: "item-06",
    hospitalId: "hosp-03",
    category: "General Pharamceuticals",
    name: "Paracetamol IV Infusion (10mg/mL)",
    sku: "GP-PCM-1GM",
    totalQuantity: 65,
    shelvingLocation: "Cabinet RP-1",
    safetyThreshold: 15,
    storageZone: "Cabinet RP-1",
    unit: "Bottles",
    batches: [
      { id: "batch-6a", batchNumber: "B-PCM-5521", quantity: 65, expirationDate: "2027-04-10", pricePerUnit: 8.50 }
    ]
  },
  {
    id: "item-07",
    hospitalId: "hosp-03",
    category: "Critical Antidotes",
    name: "Atropine Sulfate Multipack (0.5mg/mL)",
    sku: "GP-ATR-05P",
    totalQuantity: 30,
    shelvingLocation: "Vault Delta",
    safetyThreshold: 10,
    storageZone: "Vault Delta",
    unit: "Syringes",
    batches: [
      { id: "batch-7a", batchNumber: "B-ATR-3388", quantity: 30, expirationDate: "2026-08-25", pricePerUnit: 12.00 }
    ]
  },
  {
    id: "item-08",
    hospitalId: "hosp-03",
    category: "Surgical Apparatus",
    name: "Emergency Sterile Suture Sets",
    sku: "SA-SUT-NYLON",
    totalQuantity: 1, // Minimum 1 stock enforced
    shelvingLocation: "Cold Box 1",
    safetyThreshold: 5,
    storageZone: "Cold Box 1",
    unit: "Kits",
    batches: [
      { id: "batch-8a", batchNumber: "B-SUT-0012", quantity: 1, expirationDate: "2028-11-14", pricePerUnit: 25.00 }
    ]
  }
];

export const INITIAL_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1001",
    hospitalId: "hosp-01",
    departmentId: "dept-serdang-emerg",
    items: [
      { itemId: "item-01", name: "Cardene IV Infusion (Nicardipine)", quantity: 50, estimatedUnitPrice: 45.00 }
    ],
    totalValuation: 2250.00,
    status: "PENDING",
    draftedBy: "Sarah Jenkins, RN (Staff)",
    createdAt: "2026-05-20T11:00:00Z"
  }
];

export const INITIAL_MARKET_RATES: MarketRate[] = [
  {
    id: "rate-01",
    category: "Vessel Dilators",
    name: "Nicardipine Hydrochloride IV Solutions",
    vendorName: "MedicaCorp Supply Sdn Bhd",
    currentRate: 45.00,
    previousRate: 40.00,
    variancePercentage: 12.5,
    volatilityStatus: "HIGH",
    lastUpdated: "2026-05-21T02:00:00Z"
  },
  {
    id: "rate-02",
    category: "Critical Antidotes",
    name: "Naloxone Emergency Pre-fills",
    vendorName: "Lifeline Pharma Distributors",
    currentRate: 28.50,
    previousRate: 28.50,
    variancePercentage: 0.0,
    volatilityStatus: "STABLE",
    lastUpdated: "2026-05-20T17:45:00Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-01",
    timestamp: "2026-05-22T07:15:00Z",
    userId: "op-02",
    userName: "Dr. Christopher Chen",
    userRole: "HOSPITAL_ADMIN",
    hospitalId: "hosp-01",
    action: "USER_LOGIN",
    details: "Standard administrative credential handshakes authenticated on Organisation: Hospital Serdang."
  },
  {
    id: "log-02",
    timestamp: "2026-05-21T18:12:00Z",
    userId: "op-01",
    userName: "Systems Root Alpha",
    userRole: "SUPER_ADMIN",
    hospitalId: "all",
    action: "TENANT_PROVISIONED",
    details: "Successfully validated clinical network nodes. Provisioned automated parity systems."
  }
];
