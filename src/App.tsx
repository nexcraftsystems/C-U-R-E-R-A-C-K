import { useState, useEffect } from "react";
import { 
  Activity, 
  User, 
  LogOut, 
  Grid, 
  Layers, 
  PlusCircle, 
  ShoppingBag, 
  TrendingUp, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Building,
  History,
  Lock,
  ChevronDown,
  Menu,
  X
} from "lucide-react";

// Types & Seed Data
import { 
  UserOperator, 
  HospitalNode, 
  DepartmentNode, 
  InventoryItem, 
  PurchaseOrder, 
  MarketRate, 
  AuditLog, 
  PurchaseOrderItem, 
  AccessRole 
} from "./types";
import { 
  INITIAL_OPERATORS, 
  INITIAL_HOSPITALS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_INVENTORY, 
  INITIAL_ORDERS, 
  INITIAL_MARKET_RATES, 
  INITIAL_AUDIT_LOGS 
} from "./data/initialData";

// Core Components
import AuthPage from "./components/AuthPage";
import CommandDashboard from "./components/CommandDashboard";
import InventoryLedger from "./components/InventoryLedger";
import StockRouter from "./components/StockRouter";
import ProcurementPortal from "./components/ProcurementPortal";
import MarketAnalyzer from "./components/MarketAnalyzer";
import OrganisationPortal from "./components/OrganisationPortal";
import AuditInspector from "./components/AuditInspector";
import CureRackWebPortal from "./components/CureRackWebPortal";
import NetworkBackground from "./components/NetworkBackground";
import { BookOpen, Monitor, Printer, Receipt } from "lucide-react";

export default function App() {
  // Safe-guards reset pattern to clear out previous version's local storage if old entities exist
  if (typeof window !== "undefined") {
    try {
      const savedHosp = localStorage.getItem("cuerack_hospitals");
      if (savedHosp) {
        const parsed = JSON.parse(savedHosp);
        if (parsed.some((h: any) => h.name.includes("Beacon") || h.name.includes("St. Jude") || (h.id === "hosp-01" && h.name !== "Hospital Serdang"))) {
          localStorage.removeItem("cuerack_operators");
          localStorage.removeItem("cuerack_hospitals");
          localStorage.removeItem("cuerack_departments");
          localStorage.removeItem("cuerack_inventory");
          localStorage.removeItem("cuerack_orders");
          localStorage.removeItem("cuerack_rates");
          localStorage.removeItem("cuerack_logs");
          localStorage.removeItem("cuerack_current_user");
        }
      }
    } catch (err) {
      // safe catch
    }
  }

  // State definitions with automatic LocalStorage recovery
  const [operators, setOperators] = useState<UserOperator[]>(() => {
    const saved = localStorage.getItem("cuerack_operators");
    return saved ? JSON.parse(saved) : INITIAL_OPERATORS;
  });

  const [hospitals, setHospitals] = useState<HospitalNode[]>(() => {
    const saved = localStorage.getItem("cuerack_hospitals");
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
  });

  const [departments, setDepartments] = useState<DepartmentNode[]>(() => {
    const saved = localStorage.getItem("cuerack_departments");
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("cuerack_inventory");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("cuerack_orders");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [marketRates, setMarketRates] = useState<MarketRate[]>(() => {
    const saved = localStorage.getItem("cuerack_rates");
    return saved ? JSON.parse(saved) : INITIAL_MARKET_RATES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("cuerack_logs");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<UserOperator | null>(() => {
    const saved = localStorage.getItem("cuerack_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [showWorkspace, setShowWorkspace] = useState<boolean>(false);

  const [activeHospitalId, setActiveHospitalId] = useState<string>("hosp-01");
  const [activeTab, setActiveTab ] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Automatically adjust sidebar based on device size shifts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    // Make sure initial layout matches viewport size exactly
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    // Auto-hide the sheet menu drawer on mobile/tablet view once option clicked
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Sync state mutations to LocalStorage automatically on change
  useEffect(() => {
    localStorage.setItem("cuerack_operators", JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem("cuerack_hospitals", JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem("cuerack_departments", JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem("cuerack_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("cuerack_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("cuerack_rates", JSON.stringify(marketRates));
  }, [marketRates]);

  useEffect(() => {
    localStorage.setItem("cuerack_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("cuerack_current_user", JSON.stringify(currentUser));
      // Lock context hospital unless they are Super Admin
      if (currentUser.role !== "SUPER_ADMIN") {
        setActiveHospitalId(currentUser.hospitalId);
      }
    } else {
      localStorage.removeItem("cuerack_current_user");
    }
  }, [currentUser]);

  // Handle operations log footprint emission
  const logEvent = (action: string, details: string, specUserId?: string) => {
    const freshLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: specUserId || currentUser?.id || "system",
      userName: currentUser?.name || "System Automated Sync",
      userRole: currentUser?.role || "STAFF",
      hospitalId: activeHospitalId,
      action,
      details
    };
    setAuditLogs((prev) => [freshLog, ...prev]);
  };

  // State for Confirmation Receipt Popup
  const [currentReceipt, setCurrentReceipt] = useState<{
    id: string;
    timestamp: string;
    orgName: string;
    operatorName: string;
    operatorRole: string;
    action: string;
    details: string;
    meta?: Record<string, string | number>;
  } | null>(null);

  const triggerReceipt = (action: string, details: string, meta?: Record<string, string | number>) => {
    const targetOrg = hospitals.find(h => h.id === activeHospitalId)?.name || "All Registered Contexts (Root)";
    setCurrentReceipt({
      id: `TX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000).toString()}`,
      timestamp: new Date().toISOString(),
      orgName: targetOrg,
      operatorName: currentUser?.name || "System Automated Sync",
      operatorRole: currentUser?.role || "STAFF",
      action,
      details,
      meta
    });
  };

  // Auth mechanisms
  const handleLogin = (op: UserOperator) => {
    setCurrentUser(op);
    logEvent("USER_LOGIN", `Authenticated secure session handshake under role: ${op.role}.`, op.id);
  };

  const handleLogout = () => {
    if (currentUser) {
      logEvent("USER_LOGOUT", `De-authorized credentials session. Closed organization workspace.`, currentUser.id);
    }
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // 1. STOCKS MANAGEMENT - ADD INCOMING SHIPMENT
  const handleAddStock = (
    itemId: string,
    batchNo: string,
    qty: number,
    unitPrice: number,
    expDate: string,
    room: string,
    zone: string
  ) => {
    const targetItem = inventory.find(i => i.id === itemId);
    
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          const freshBatch = {
            id: `batch-${Date.now()}`,
            batchNumber: batchNo,
            quantity: qty,
            expirationDate: expDate,
            pricePerUnit: unitPrice
          };
          return {
            ...item,
            totalQuantity: item.totalQuantity + qty,
            shelvingLocation: room,
            storageZone: zone,
            batches: [...item.batches, freshBatch]
          };
        }
        return item;
      });
    });

    logEvent(
      "STOCK_VERIFIED",
      `Arriving dock verified: Logged incoming shipment of ${qty} ${targetItem?.unit || "units"} for item SKU: ${targetItem?.sku} to Room: ${room} (Batch: ${batchNo}).`
    );

    triggerReceipt("STOCK_VERIFIED", `Successfully processed incoming logistics stock allocation.`, {
      "Item SKU": targetItem?.sku || "N/A",
      "Item Name": targetItem?.name || "N/A",
      "Batch Number": batchNo,
      "Quantity Received": `${qty} ${targetItem?.unit || "Units"}`,
      "Appraised Unit Price": `RM ${unitPrice.toFixed(2)}`,
      "Total Inbound Value": `RM ${(qty * unitPrice).toFixed(2)}`,
      "Shelving Coordinates": `${room} / ${zone}`,
      "Authorized Operator": currentUser?.name || "N/A"
    });
  };

  // 2. STOCKS MANAGEMENT - BEDSIDE DISPENSATION DEPLETION
  const handleDispenseStock = (itemId: string, batchId: string, qty: number, reason: string) => {
    const targetItem = inventory.find(i => i.id === itemId);

    setInventory((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          const updatedBatches = item.batches.map((batch) => {
            if (batch.id === batchId) {
              return { ...batch, quantity: Math.max(0, batch.quantity - qty) };
            }
            return batch;
          }).filter(b => b.quantity > 0);

          return {
            ...item,
            // Enforce minimum of 1 custom safety baseline if needed, but standard subtraction is fine
            totalQuantity: Math.max(0, item.totalQuantity - qty),
            batches: updatedBatches
          };
        }
        return item;
      });
    });

    logEvent(
      "ITEM_DISPENSED",
      `Bedside logistics depletion: Subtracted ${qty} ${targetItem?.unit || "units"} of SKU: ${targetItem?.sku || "N/A"}. Diagnostic justification: ${reason}.`
    );

    triggerReceipt("ITEM_DISPENSED", `Bedside stock depletion checked and signed.`, {
      "Item SKU": targetItem?.sku || "N/A",
      "Item Name": targetItem?.name || "N/A",
      "Quantity Subtracted": `${qty} ${targetItem?.unit || "Units"}`,
      "Clinical Reason": reason,
      "Deducted From Batch": batchId,
      "Remaining Stock Count": `${Math.max(1, (targetItem?.totalQuantity || 1) - qty)} ${targetItem?.unit || "Units"}`,
      "Authorized Operator": currentUser?.name || "N/A"
    });
  };

  // 3. PROCUREMENT & PO ACTIONS
  const handleApprovePO = (poId: string, approverName: string) => {
    setOrders((prev) => {
      return prev.map((order) => {
        if (order.id === poId) {
          return { ...order, status: "APPROVED", approvedBy: approverName };
        }
        return order;
      });
    });

    const targetPO = orders.find(o => o.id === poId);
    if (targetPO) {
      targetPO.items.forEach((poItem) => {
        setInventory((prevInv) => {
          return prevInv.map((invItem) => {
            if (invItem.id === poItem.itemId) {
              const mockBatchNo = `B-DOCK-${Math.floor(1000 + Math.random() * 9000)}`;
              const freshBatch = {
                id: `batch-auto-${Date.now()}-${Math.random()}`,
                batchNumber: mockBatchNo,
                quantity: poItem.quantity,
                expirationDate: "2027-12-31",
                pricePerUnit: poItem.estimatedUnitPrice
              };
              return {
                ...invItem,
                totalQuantity: invItem.totalQuantity + poItem.quantity,
                batches: [...invItem.batches, freshBatch]
              };
            }
            return invItem;
          });
        });
      });
    }

    logEvent(
      "ORDER_APPROVED",
      `Valuation authorized: Release protocol initialized for purchase order ${poId} by administrator ${approverName}. Ledger quantities incremented.`
    );

    triggerReceipt("ORDER_APPROVED", `Purchase Order signature authorized and stocks released to dock.`, {
      "Purchase Order ID": poId,
      "Approved By": approverName,
      "Total Approved Value": `RM ${targetPO?.totalValuation?.toLocaleString() || "N/A"}`,
      "Status Code": "LEDGER_MUTATION_SUCCESS",
      "Fulfillment Mode": "IMMEDIATE AUTO-DOCK ALLOCATION"
    });
  };

  const handleRejectPO = (poId: string) => {
    setOrders((prev) => {
      return prev.map((order) => {
        if (order.id === poId) {
          return { ...order, status: "REJECTED" };
        }
        return order;
      });
    });
    
    logEvent("ORDER_REJECTED", `Procurement file terminated: Terminated safety manifest proposal ${poId}.`);

    triggerReceipt("ORDER_REJECTED", `Purchase order proposal rejected successfully.`, {
      "Purchase Order ID": poId,
      "Rejected By": currentUser?.name || "N/A",
      "Decision Factor": "Safety / Budget Threshold Mismatch"
    });
  };

  const handleCreatePO = (itemsSubmitted: PurchaseOrderItem[]) => {
    const valuation = itemsSubmitted.reduce((sum, i) => sum + i.quantity * i.estimatedUnitPrice, 0);
    const mockPO: PurchaseOrder = {
      id: `po-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId: activeHospitalId,
      departmentId: currentUser?.departmentId || "dept-serdang-emerg",
      items: itemsSubmitted,
      totalValuation: valuation,
      status: "PENDING",
      draftedBy: currentUser?.name || "Verified Operator",
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [mockPO, ...prev]);
    logEvent(
      "ORDER_DRAFTED",
      `Replenishment manifestation proposed. Generated pending release manifestation identifier: ${mockPO.id}. appraisal: RM ${valuation.toLocaleString()}`
    );

    triggerReceipt("ORDER_DRAFTED", `Replenishment purchase order drafted and queued.`, {
      "Purchase Order ID": mockPO.id,
      "Unique items listed": itemsSubmitted.length,
      "Estimated PO Value": `RM ${valuation.toLocaleString()}`,
      "Drafted By": mockPO.draftedBy,
      "Required Approver Level": "HOSPITAL_ADMIN / SUPER_ADMIN"
    });
  };

  // 4. MARKET VALUE ADJUSTMENTS (Exclusive to HOSPITAL_ADMIN)
  const handleUpdateMarketRate = (rateId: string, newRate: number) => {
    setMarketRates((prev) => {
      return prev.map((rate) => {
        if (rate.id === rateId) {
          const variance = ((newRate - rate.previousRate) / rate.previousRate) * 100;
          return {
            ...rate,
            currentRate: newRate,
            variancePercentage: parseFloat(variance.toFixed(2)),
            volatilityStatus: Math.abs(variance) > 10 ? "HIGH" : "STABLE",
            lastUpdated: new Date().toISOString()
          };
        }
        return rate;
      });
    });

    const targetRate = marketRates.find(r => r.id === rateId);
    logEvent(
      "RATE_ADJUSTED",
      `Procurements tuning updated: Calibrated market pricing for index drug: ${targetRate?.name}. New base quote: RM ${newRate.toFixed(2)}.`
    );

    triggerReceipt("RATE_ADJUSTED", `Index market quote calibrated and signed.`, {
      "Indexed Item": targetRate?.name || "N/A",
      "Category Class": targetRate?.category || "N/A",
      "Previous Rate": `RM ${targetRate?.previousRate?.toFixed(2) || "N/A"}`,
      "New Rate Limit": `RM ${newRate.toFixed(2)}`,
      "Variance Shift": `${((newRate - (targetRate?.previousRate || 1)) / (targetRate?.previousRate || 1) * 100).toFixed(2)}%`
    });
  };

  // 5. SAFETY STOCK THRESHOLD TUNING (Admin & Super Admin)
  const handleUpdateSafetyThreshold = (itemId: string, newThreshold: number) => {
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, safetyThreshold: newThreshold };
        }
        return item;
      });
    });

    const itemObj = inventory.find(i => i.id === itemId);
    logEvent(
      "THRESHOLD_CALIBRATED",
      `Tuning parameter altered: Safety threshold for substance '${itemObj?.name}' set to ${newThreshold} ${itemObj?.unit || "units"} to safeguard local supply.`
    );

    triggerReceipt("THRESHOLD_CALIBRATED", `Safety stock buffer calibrated on master terminal.`, {
      "Substance Item": itemObj?.name || "N/A",
      "Item SKU Code": itemObj?.sku || "N/A",
      "Adjusted Safety Threshold": `${newThreshold} ${itemObj?.unit || "Units"}`
    });
  };

  // 6. SUPER_ADMIN ORGANIZATION MODULE UTILITIES
  const handleAddHospital = (hosp: HospitalNode) => {
    setHospitals((prev) => [...prev, hosp]);
    logEvent(
      "TENANT_PROVISIONED",
      `Provisioned organization account master vertex: Registered ${hosp.name} (location: ${hosp.location}) with a storage cap of ${hosp.storageQuota} m³.`
    );

    triggerReceipt("ORGANIZATION_PROVISIONED", `Provisioned new medical organization workspace.`, {
      "Organization Name": hosp.name,
      "Location Node": hosp.location,
      "Storage Quota Limit": `${hosp.storageQuota} Cubic m³`,
      "Budget Appraisal Cap": `RM ${hosp.assetValueLimit.toLocaleString()}`,
      "Registered Timestamp": hosp.createdAt
    });
  };

  const handleAddDepartment = (dept: DepartmentNode) => {
    setDepartments((prev) => [...prev, dept]);
    logEvent(
      "DEPARTMENT_DEPLOYED",
      `Subsystem routing calibrated: Registered department '${dept.name}' mapped to organization context.`
    );

    triggerReceipt("DEPARTMENT_DEPLOYED", `Specialty sub-ward structures configured.`, {
      "Department Code": dept.id,
      "Department Name": dept.name,
      "Registered storage rooms": dept.storageRooms.join(", ")
    });
  };

  const handleUpdateOperatorStatus = (opId: string, status: "ACTIVE" | "REVOKED") => {
    setOperators((prev) => {
      return prev.map((op) => {
        if (op.id === opId) return { ...op, status };
        return op;
      });
    });

    const targetOp = operators.find(o => o.id === opId);
    logEvent(
      "OPERATOR_MUTATED",
      `Access footprint altered: Operator user credentials for ${targetOp?.name} were set parameters: ${status}.`
    );

    triggerReceipt("OPERATOR_MUTATED", `Operator cryptographic workspace credentials shifted.`, {
      "Operator Name": targetOp?.name || "N/A",
      "Email Handshake": targetOp?.email || "N/A",
      "Authorized Role": targetOp?.role || "N/A",
      "New Safety Key Match": status
    });
  };

  const handleResetOperatorCreds = (opId: string) => {
    const targetOp = operators.find(o => o.id === opId);
    logEvent(
      "SECURITY_RESET",
      `Simulated master security keys rotated and re-issued for verified operator: ${targetOp?.name}.`
    );

    triggerReceipt("SECURITY_RESET", `Cryptographic master keys rotated and re-paired.`, {
      "Operator Name": targetOp?.name || "N/A",
      "Role Permutation": targetOp?.role || "N/A",
      "Security Hash Signature": "SHA-256 PARITY VERIFIED"
    });
  };

  // 7. NEW OPERATOR ADDITIONS & RENAMING MODIFICATIONS (Super Admin exclusive)
  const handleAddOperator = (op: UserOperator) => {
    setOperators((prev) => [...prev, op]);
    logEvent("OPERATOR_CREATED", `Successfully registered new operator profile '${op.name}' in our directory.`);

    triggerReceipt("OPERATOR_CREATED", `Provisioned new workspace occupant credentials.`, {
      "Operator ID": op.id,
      "Operator Name": op.name,
      "Email Code": op.email,
      "Assigned Role": op.role,
      "Organization Core Id": op.hospitalId
    });
  };

  const handleUpdateOperator = (updatedOp: UserOperator) => {
    setOperators((prev) => prev.map((op) => op.id === updatedOp.id ? updatedOp : op));
    logEvent("OPERATOR_UPDATED", `Securely modified and renamed operator setting fields for profile: ${updatedOp.name}.`);

    triggerReceipt("OPERATOR_UPDATED", `Secure modifications saved to directory.`, {
      "Operator ID": updatedOp.id,
      "Renamed / Output Name": updatedOp.name,
      "Email Match": updatedOp.email,
      "Role Verified": updatedOp.role,
      "Linked Organization ID": updatedOp.hospitalId
    });
  };

  const handleClearLogs = () => {
    const resetMarker: AuditLog = {
      id: "log-system-reset",
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || "root",
      userName: currentUser?.name || "System Root Alpha",
      userRole: "SUPER_ADMIN",
      hospitalId: activeHospitalId,
      action: "LEDGER_RESET",
      details: "Audit history cleared. Digital securely sealed ledger logs initialized on factory standard parity parameters."
    };
    setAuditLogs([resetMarker]);
  };

  // Access constraints switchers
  const handleSwitchHospital = (hospId: string) => {
    if (currentUser?.role === "SUPER_ADMIN" || currentUser?.hospitalId === hospId) {
      setActiveHospitalId(hospId);
    }
  };

  // Active hospital details lookup helper
  const activeHospitalObj = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];

  // Filters medical items according to selected Hospital context to preserve absolute node-isolation/multi-tenancy patterns!
  const scopedInventory = inventory.filter((item) => item.hospitalId === activeHospitalId);
  const scopedOrders = orders.filter((order) => order.hospitalId === activeHospitalId);
  const scopedLogs = auditLogs.filter(
    (log) => log.hospitalId === activeHospitalId || log.hospitalId === "all"
  );

  // Check if we show the front portal presentation website/docs first
  if (!showWorkspace) {
    return (
      <CureRackWebPortal 
        onLaunchApp={() => setShowWorkspace(true)} 
        activeHospitalName={activeHospitalObj?.name || "Kuala Lumpur Medical Center"} 
      />
    );
  }

  // If no user is logged in, show the gatekeeper authentication overlay page.
  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
        {/* Connection top bar */}
        <div className="bg-slate-900 text-slate-300 px-4 py-3 text-xs flex justify-between items-center border-b border-slate-950 font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse animate-duration-1000"></span>
            <span>CureRack.my Portal Handshake Staging</span>
          </div>
          <button 
            onClick={() => setShowWorkspace(false)}
            className="text-brand-400 hover:text-brand-300 font-bold hover:underline cursor-pointer flex items-center gap-1.5 text-[11px] font-sans"
          >
            ← Back to Public Website Overview
          </button>
        </div>
        <div className="flex-1">
          <AuthPage operators={operators} onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/45 flex flex-col font-sans relative overflow-hidden" id="cuerack_main_workspace">
      <NetworkBackground />
      
      {/* Top Header layout - Apple elegant design */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Logo & Platform designation with quick collapsible navigation trigger */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 sm:p-2 hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none"
              title={isSidebarOpen ? "Maximize workspace (Hide panel to the left)" : "Restore side panel workspace"}
              aria-label="Toggle Sidebar Menu"
            >
              <Menu size={18} className="transition-transform duration-200 transform hover:scale-105" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="p-1.5 sm:p-2 bg-gradient-to-tr from-brand-700 to-brand-500 text-white rounded-xl shadow-sm transition-all animate-pulse">
                <Activity size={16} />
              </span>
              <div>
                <span className="font-bold text-slate-800 font-display tracking-tight text-xs sm:text-base">
                  CureRack.my
                </span>
                <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-50 border border-slate-100 font-mono px-1.5 py-0.5 rounded ml-1.5 font-semibold">
                  CORE MATRIX
                </span>
              </div>
            </div>
          </div>

          {/* Active Hospital switcher or designation - critical SUPER_ADMIN filter tool */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {currentUser.role === "SUPER_ADMIN" ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs">
                <Building size={12} className="text-brand-600 shrink-0" />
                <span className="text-slate-400 font-semibold uppercase text-[9px] hidden sm:inline">Organization:</span>
                <select
                  value={activeHospitalId}
                  onChange={(e) => handleSwitchHospital(e.target.value)}
                  className="bg-transparent border-none outline-none font-semibold text-slate-700 pr-1 text-[11px] sm:text-xs cursor-pointer max-w-[100px] sm:max-w-[180px] lg:max-w-none truncate"
                >
                  {hospitals.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-medium text-slate-650 max-w-[150px] sm:max-w-xs md:max-w-none min-w-0">
                <Lock size={11} className="text-slate-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline uppercase text-[9px] font-semibold tracking-wide">ORGANIZATION LOCK:</span>
                <span className="text-slate-700 font-semibold truncate max-w-[80px] sm:max-w-none">{activeHospitalObj.name}</span>
              </div>
            )}

            {/* User Profile dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2.5 border-l border-slate-100 shrink-0">
              <img 
                referrerPolicy="no-referrer"
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-100 object-cover" 
              />
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-800 font-sans leading-tight">{currentUser.name}</p>
                <span className="font-mono text-[9px] font-semibold text-slate-400 bg-slate-100 border border-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                  {currentUser.role.replace("_", " ")}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-xl transition-all ml-0.5 cursor-pointer"
                title="Disconnect Credentials session"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Sidebar Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 pointer-events-auto"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Primary Workspace container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-6 relative min-w-0">
        
        {/* Navigation Sidebar Drawer - Swiss modular approach */}
        <nav 
          className={`
            transition-all duration-300 ease-in-out shrink-0
            flex flex-col justify-between
            fixed lg:relative top-0 lg:top-auto left-0 lg:left-auto h-full lg:h-auto z-50 lg:z-auto
            bg-white lg:bg-transparent shadow-2xl lg:shadow-none
            ${
              isSidebarOpen 
                ? "w-72 lg:w-60 opacity-100 translate-x-0 p-6 lg:p-0 py-4 lg:py-1 border-r border-slate-200 lg:border-none" 
                : "w-0 lg:w-0 h-0 lg:h-auto opacity-0 -translate-x-full lg:translate-x-0 pointer-events-none lg:-mr-6 p-0 border-none overflow-hidden"
            }
          `} 
          id="workspace_navigation_pane"
          style={{ transitionDuration: "350ms" }}
        >
          <div className="space-y-4">
            
            {/* Mobile close utility header inside Sidebar panel */}
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-gradient-to-tr from-brand-700 to-brand-500 text-white rounded-xl shadow-sm">
                  <Activity size={16} />
                </span>
                <span className="font-bold text-slate-800 tracking-tight font-display text-xs">
                  CureRack.my
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close Navigation Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav section 1 */}
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase px-3 block mb-2">
                Operational Telemetry
              </span>
              <div className="space-y-1">
                
                <button
                  onClick={() => handleTabClick("dashboard")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <Grid size={15} />
                  Command Dashboard
                </button>

                <button
                  onClick={() => handleTabClick("ledger")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "ledger"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <Layers size={15} />
                  In-Stock Ledger
                </button>

                <button
                  onClick={() => handleTabClick("router")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "router"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <PlusCircle size={15} />
                  Add & Used Stock Router
                </button>

              </div>
            </div>

            {/* Nav section 2 */}
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase px-3 block mb-2">
                Acquisition Pipeline
              </span>
              <div className="space-y-1">
                
                <button
                  onClick={() => handleTabClick("procurement")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "procurement"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <ShoppingBag size={15} />
                  Procurements Portal
                </button>

                <button
                  onClick={() => handleTabClick("market")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "market"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <TrendingUp size={15} />
                  Market Analysis Index
                </button>

              </div>
            </div>

            {/* Nav section 3 */}
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase px-3 block mb-2">
                System Oversight Logs
              </span>
              <div className="space-y-1">
                
                <button
                  onClick={() => handleTabClick("audit")}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    activeTab === "audit"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 bg-transparent hover:bg-slate-100"
                  }`}
                >
                  <History size={15} />
                  Audit Asset Logs
                </button>

                {currentUser.role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => handleTabClick("organisation")}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                      activeTab === "organisation"
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-600 bg-transparent hover:bg-slate-100"
                    }`}
                  >
                    <Settings size={15} />
                    Organization Portal
                  </button>
                )}

              </div>
            </div>

          </div>

          {/* Quick instructions / Help tag (Swiss design) */}
          <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3 hidden lg:block">
            <h5 className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
              <HelpCircle size={13} className="text-brand-500" />
              Multi-Role Workspace Guide
            </h5>
            <p className="text-[10px] text-slate-500 leading-normal">
              Need to test different privileges? Hit the red disconnect icon at top right to return to our Quick Roles selection page anytime.
            </p>
            <div className="border-t border-slate-100 pt-2.5">
              <button
                onClick={() => setShowWorkspace(false)}
                className="w-full text-center py-2.5 bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-600 hover:text-brand-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                title="Return to CureRack Presentation Landing / Graphical Flow"
              >
                <Monitor size={11} className="text-brand-500 shrink-0" />
                View Platform Info &amp; Manual
              </button>
            </div>
          </div>

        </nav>

        {/* Dynamic primary content wrapper */}
        <main className="flex-1 min-w-0 flex flex-col justify-start">
          
          {activeTab === "dashboard" && (
            <CommandDashboard 
              inventory={scopedInventory} 
              orders={scopedOrders} 
              logs={scopedLogs} 
              currentHospital={activeHospitalObj}
              departments={departments.filter(d => d.hospitalId === activeHospitalId)}
            />
          )}

          {activeTab === "ledger" && (
            <InventoryLedger 
              inventory={scopedInventory} 
              userRole={currentUser.role}
              onUpdateSafetyThreshold={handleUpdateSafetyThreshold}
            />
          )}

          {activeTab === "router" && (
            <StockRouter 
              inventory={scopedInventory} 
              departments={departments.filter(d => d.hospitalId === activeHospitalId)}
              userRole={currentUser.role}
              userName={currentUser.name}
              onAddStock={handleAddStock}
              onDispenseStock={handleDispenseStock}
            />
          )}

          {activeTab === "procurement" && (
            <ProcurementPortal 
              orders={scopedOrders} 
              inventory={scopedInventory} 
              userRole={currentUser.role}
              userName={currentUser.name}
              onApprovePO={handleApprovePO}
              onRejectPO={handleRejectPO}
              onCreatePO={handleCreatePO}
            />
          )}

          {activeTab === "market" && (
            <MarketAnalyzer 
              rates={marketRates} 
              inventory={scopedInventory}
              userRole={currentUser.role}
              onUpdateRate={handleUpdateMarketRate}
              onCreatePO={handleCreatePO}
            />
          )}

          {activeTab === "audit" && (
            <AuditInspector 
              logs={scopedLogs} 
              userRole={currentUser.role}
              onClearLogs={handleClearLogs}
            />
          )}

          {activeTab === "organisation" && currentUser.role === "SUPER_ADMIN" && (
            <OrganisationPortal 
              hospitals={hospitals}
              departments={departments}
              operators={operators}
              activeHospitalId={activeHospitalId}
              onAddHospital={handleAddHospital}
              onAddDepartment={handleAddDepartment}
              onUpdateOperatorStatus={handleUpdateOperatorStatus}
              onResetOperatorCreds={handleResetOperatorCreds}
              onSwitchHospital={handleSwitchHospital}
              onAddOperator={handleAddOperator}
              onUpdateOperator={handleUpdateOperator}
            />
          )}

        </main>

      </div>

      {/* CONFIRMATION RECEIPT MODAL POPUP */}
      {currentReceipt && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="confirmation_receipt_modal">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col my-8 animate-in fade-in zoom-in duration-200 text-left">
            
            {/* Top decorative receipt color bar */}
            <div className="h-2 w-full bg-slate-900" />

            {/* Receipt body wrapper */}
            <div className="p-6 sm:p-8 flex-1 space-y-6 relative">
              
              {/* Receipt success header */}
              <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-200">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Receipt size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-display tracking-tight mt-3">Ledger Action Confirmed</h3>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">OFFICIAL SYSTEM VOUCHER</p>
              </div>

              {/* Transaction Key Details list */}
              <div className="space-y-3 font-semibold text-xs text-slate-700">
                <div className="flex justify-between font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-[11px]">
                  <span className="text-slate-400">RECEIPT ID:</span>
                  <strong className="text-slate-800">{currentReceipt.id}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">ORGANIZATION:</span>
                  <span className="text-slate-800 font-bold max-w-[200px] text-right truncate">{currentReceipt.orgName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">DOCKET OPERATOR:</span>
                  <span className="text-slate-800 font-bold">{currentReceipt.operatorName} ({currentReceipt.operatorRole.replace("_", " ")})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">TIMESTAMP:</span>
                  <span className="text-slate-800 font-mono text-[11px]">{new Date(currentReceipt.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">ACTION SPECIFICATION:</span>
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wide">
                    {currentReceipt.action}
                  </span>
                </div>
              </div>

              {/* Specific Action Text Details */}
              <div className="p-3.5 bg-slate-50/75 border border-slate-150 rounded-2xl text-xs leading-normal text-slate-650">
                <div className="font-bold text-slate-800 mb-1">Details Summary:</div>
                <p className="font-medium text-slate-700">{currentReceipt.details}</p>
              </div>

              {/* Action Metadata List */}
              {currentReceipt.meta && Object.keys(currentReceipt.meta).length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider block">METRICS PARITY</span>
                  <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-1.5 font-mono text-[10px] text-slate-600">
                    {Object.entries(currentReceipt.meta).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="uppercase text-slate-400">{key}:</span>
                        <strong className="text-slate-800">{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stamp Block (Swiss-style elegant verification) */}
              <div className="flex justify-center pt-2 select-none">
                <div className="border-2 border-emerald-600/30 text-emerald-700/80 rounded-xl px-5 py-2.5 flex flex-col items-center justify-center transform -rotate-2 scale-95 font-display">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">CURERACK LEDGER</span>
                  <strong className="text-[12px] font-bold uppercase tracking-wide">VERIFIED &amp; SECURED</strong>
                  <span className="text-[8px] font-mono text-slate-400">{new Date(currentReceipt.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

            </div>

            {/* Receipt Scissors Serrated Cut pattern (SVG) at bottom */}
            <div className="w-full h-4 bg-white select-none shrink-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpolygon points='0,0 5,5 10,0 10,6 0,6' fill='%23e2e8f0'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat-x", backgroundSize: "12px 6px" }} />

            {/* Bottom action bar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex gap-2.5 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 px-4 bg-slate-200 hover:bg-slate-350 active:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Printer size={13} /> Print Confirmation
              </button>
              <button
                onClick={() => setCurrentReceipt(null)}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer font-sans"
                id="receipt_confirmation_dismiss_btn"
              >
                Confirm &amp; Proceed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
