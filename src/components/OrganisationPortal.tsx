import React, { useState, useMemo } from "react";
import { 
  Building, 
  Database, 
  ShieldAlert, 
  Cpu, 
  Check, 
  Trash2, 
  KeyRound, 
  Radio, 
  UserPlus, 
  Edit3, 
  ShieldCheck, 
  Save, 
  X,
  User,
  UserCheck,
  Mail,
  Sliders,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Users,
  ChevronRight,
  Info,
  Archive,
  ArrowRight,
  Plus,
  Compass,
  AlertCircle,
  Settings,
  Activity
} from "lucide-react";
import { HospitalNode, DepartmentNode, UserOperator, AccessRole } from "../types";

interface OrganisationPortalProps {
  hospitals: HospitalNode[];
  departments: DepartmentNode[];
  operators: UserOperator[];
  activeHospitalId: string;
  onAddHospital: (hospital: HospitalNode) => void;
  onAddDepartment: (dept: DepartmentNode) => void;
  onUpdateOperatorStatus: (opId: string, status: "ACTIVE" | "REVOKED") => void;
  onResetOperatorCreds: (opId: string) => void;
  onSwitchHospital: (hospId: string) => void;
  onAddOperator: (op: UserOperator) => void;
  onUpdateOperator: (op: UserOperator) => void;
}

export default function OrganisationPortal({
  hospitals,
  departments,
  operators,
  activeHospitalId,
  onAddHospital,
  onAddDepartment,
  onUpdateOperatorStatus,
  onResetOperatorCreds,
  onSwitchHospital,
  onAddOperator,
  onUpdateOperator
}: OrganisationPortalProps) {
  const [activeTab, setActiveTab] = useState<"ORGANIZATIONS" | "DEPARTMENTS" | "OPERATORS">("ORGANIZATIONS");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>(activeHospitalId || "");

  // Panel View States
  const [rightPanelMode, setRightPanelMode] = useState<"STATS" | "CREATE_ORGANIZATION">("STATS");

  // State: NEW ORGANIZATION (replaces Hospital Node)
  const [newHospName, setNewHospName] = useState("");
  const [newHospLoc, setNewHospLoc] = useState("");
  const [newHospQuota, setNewHospQuota] = useState<number>(3000);
  const [newHospLimit, setNewHospLimit] = useState<number>(100000);
  const [hospSuccess, setHospSuccess] = useState("");

  // State: NEW DEPARTMENT
  const [deptHospId, setDeptHospId] = useState(hospitals[0]?.id || "");
  const [deptName, setDeptName] = useState("");
  const [roomCodes, setRoomCodes] = useState("");
  const [deptSuccess, setDeptSuccess] = useState("");

  // State: NEW OPERATOR (Admin / Staff)
  const [newOpName, setNewOpName] = useState("");
  const [newOpEmail, setNewOpEmail] = useState("");
  const [newOpRole, setNewOpRole] = useState<AccessRole>("STAFF");
  const [newOpHospId, setNewOpHospId] = useState(hospitals[0]?.id || "");
  const [opSuccess, setOpSuccess] = useState("");

  // State: EDIT/RENAME OPERATOR
  const [editingOp, setEditingOp] = useState<UserOperator | null>(null);
  const [editOpName, setEditOpName] = useState("");
  const [editOpEmail, setEditOpEmail] = useState("");
  const [editOpRole, setEditOpRole] = useState<AccessRole>("STAFF");
  const [editOpHospId, setEditOpHospId] = useState("");

  const [authFeedback, setAuthFeedback] = useState("");

  // Room Codes preview block helper
  const parsedRoomPills = useMemo(() => {
    if (!roomCodes) return [];
    return roomCodes
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }, [roomCodes]);

  // Statistics compilation map
  const statsMap = useMemo(() => {
    const map: Record<string, { admins: number; staff: number; wards: number; rooms: number }> = {};
    
    hospitals.forEach((h) => {
      const orgOps = operators.filter((o) => o.hospitalId === h.id);
      const admins = orgOps.filter((o) => o.role === "HOSPITAL_ADMIN").length;
      const staff = orgOps.filter((o) => o.role === "STAFF" || o.role === "WARD_MANAGER").length;
      const orgWards = departments.filter((d) => d.hospitalId === h.id);
      const rooms = orgWards.reduce((acc, d) => acc + d.storageRooms.length, 0);

      map[h.id] = { admins, staff, wards: orgWards.length, rooms };
    });

    return map;
  }, [hospitals, operators, departments]);

  // Handle Organization clicks (acts as both SWITCH and FILTER trigger)
  const handleSelectOrganization = (hospId: string) => {
    onSwitchHospital(hospId);
    setSelectedOrgFilter(hospId);
    setRightPanelMode("STATS");
  };

  const handleAddHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName || !newHospLoc) return;

    const newHosp: HospitalNode = {
      id: `hosp-0${hospitals.length + 1}`,
      name: newHospName,
      location: newHospLoc,
      storageQuota: newHospQuota,
      assetValueLimit: newHospLimit,
      createdAt: new Date().toISOString(),
      status: "ACTIVE"
    };

    onAddHospital(newHosp);
    setNewHospName("");
    setNewHospLoc("");
    setHospSuccess(`New Organization '${newHospName}' successfully provisioned to root register.`);
    
    // Automatically switch to the newly created organization and view its stats
    handleSelectOrganization(newHosp.id);
    
    setTimeout(() => {
      setHospSuccess("");
    }, 4000);
  };

  const handleAddDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetHospId = deptHospId || hospitals[0]?.id;
    if (!targetHospId || !deptName) return;

    const rooms = parsedRoomPills.length > 0 ? parsedRoomPills : ["General storage room A"];

    const newDept: DepartmentNode = {
      id: `dept-${deptName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      hospitalId: targetHospId,
      name: deptName,
      storageRooms: rooms
    };

    onAddDepartment(newDept);
    setDeptName("");
    setRoomCodes("");
    setDeptSuccess(`Department '${deptName}' provisioned with ${rooms.length} room codes.`);
    setTimeout(() => setDeptSuccess(""), 4000);
  };

  const handleAddOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetHospId = newOpHospId || hospitals[0]?.id;
    if (!newOpName || !newOpEmail || !targetHospId) return;

    const newOp: UserOperator = {
      id: `op-${Date.now()}`,
      name: newOpName,
      email: newOpEmail,
      role: newOpRole,
      hospitalId: targetHospId,
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
    };

    onAddOperator(newOp);
    setNewOpName("");
    setNewOpEmail("");
    setOpSuccess(`Authorized user profile created for ${newOpName}.`);
    setTimeout(() => setOpSuccess(""), 4000);
  };

  const handleStartEditOperator = (op: UserOperator) => {
    setEditingOp(op);
    setEditOpName(op.name);
    setEditOpEmail(op.email);
    setEditOpRole(op.role);
    setEditOpHospId(op.hospitalId);
  };

  const handleSaveEditOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOp) return;

    const updatedOp: UserOperator = {
      ...editingOp,
      name: editOpName,
      email: editOpEmail,
      role: editOpRole,
      hospitalId: editOpHospId
    };

    onUpdateOperator(updatedOp);
    setEditingOp(null);
    setAuthFeedback(`Renamed Operator parameters: updated settings for '${editOpName}'`);
    setTimeout(() => setAuthFeedback(""), 4000);
  };

  const handleResetCreds = (opId: string, name: string) => {
    onResetOperatorCreds(opId);
    setAuthFeedback(`Rotated master security access keys for Operator: ${name}.`);
    setTimeout(() => setAuthFeedback(""), 5000);
  };

  const handleRevoke = (opId: string, name: string, currentStatus: "ACTIVE" | "REVOKED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "REVOKED" : "ACTIVE";
    onUpdateOperatorStatus(opId, nextStatus);
    setAuthFeedback(`Security signature updated: ${name} access status: ${nextStatus}.`);
    setTimeout(() => setAuthFeedback(""), 5000);
  };

  // Searching Organizations
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const nameMatch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = h.location.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = h.id.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || locationMatch || idMatch;
    });
  }, [hospitals, searchTerm]);

  // Filtering Ward Nodes and Operator users by clicked/selected Org filter
  const filteredDepartments = useMemo(() => {
    if (!selectedOrgFilter) return departments;
    return departments.filter((d) => d.hospitalId === selectedOrgFilter);
  }, [departments, selectedOrgFilter]);

  const filteredOperators = useMemo(() => {
    if (!selectedOrgFilter) return operators;
    return operators.filter((o) => o.hospitalId === selectedOrgFilter);
  }, [operators, selectedOrgFilter]);

  // Retrieve details for the detail stats panel
  const currentFilteredOrgObj = useMemo(() => {
    return hospitals.find((h) => h.id === selectedOrgFilter) || hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];
  }, [hospitals, selectedOrgFilter, activeHospitalId]);

  const currentOrgStats = useMemo(() => {
    if (!currentFilteredOrgObj) return { admins: 0, staff: 0, wards: 0, rooms: 0 };
    return statsMap[currentFilteredOrgObj.id] || { admins: 0, staff: 0, wards: 0, rooms: 0 };
  }, [currentFilteredOrgObj, statsMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="organisation_portal_view">
      
      {/* Super Admin Status Header Panel */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-850 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
              <Cpu className="text-brand-400 animate-pulse" size={18} />
            </div>
            <h3 className="font-bold font-display text-base tracking-wide text-brand-300">Decentralized Organization Portal</h3>
          </div>
          <p className="text-xs text-slate-300 leading-normal max-w-2xl">
            Provision clinical workspaces, coordinate medical ward warehouses, and authorize cryptographical access credentials for decentralized medical network operators.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-[10px] bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 font-mono tracking-wider shrink-0 w-full md:w-auto">
          <div className="flex justify-between md:justify-start gap-4 items-center">
            <span className="text-slate-400 uppercase">SYSTEMS PRIVILEGE:</span>
            <span className="text-white font-extrabold bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-900">SUPER_ADMIN</span>
          </div>
          <div className="flex justify-between md:justify-start gap-4 items-center mt-1">
            <span className="text-slate-400 uppercase">LEDGER STATE:</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              MALAYSIA_NODE_OK
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized Filter & Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs font-semibold w-full md:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab("ORGANIZATIONS")}
            className={`flex-1 md:flex-initial py-2 px-4 whitespace-nowrap text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "ORGANIZATIONS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building size={14} />
            Organizations ({hospitals.length})
          </button>
          
          <button
            onClick={() => setActiveTab("DEPARTMENTS")}
            className={`flex-1 md:flex-initial py-2 px-4 whitespace-nowrap text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "DEPARTMENTS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={14} />
            Wards &amp; Warehouses ({departments.length})
          </button>
          
          <button
            onClick={() => setActiveTab("OPERATORS")}
            className={`flex-1 md:flex-initial py-2 px-4 whitespace-nowrap text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "OPERATORS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={14} />
            Operators ({operators.length})
          </button>
        </div>

        {/* Global Filter Indicator / Multi-tab Filter controller */}
        <div className="flex items-center gap-2 w-full md:w-auto text-xs shrink-0 bg-slate-50 border border-slate-100 p-2 rounded-xl">
          <Filter size={13} className="text-slate-500 shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium">Filter target:</span>
          <select
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-slate-450 focus:ring-1 focus:ring-slate-200"
          >
            <option value="">-- All Organizations --</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.id.toUpperCase()})
              </option>
            ))}
          </select>
          {selectedOrgFilter && (
            <button
              onClick={() => setSelectedOrgFilter("")}
              className="px-2 py-1 text-[10px] font-mono font-extrabold uppercase bg-slate-250 hover:bg-slate-300 text-slate-700 rounded-md border border-slate-300 shadow-xs cursor-pointer transition-colors"
              title="Clear organization context filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Success Notifications */}
      {authFeedback && (
        <div className="p-4 bg-emerald-50 text-emerald-950 text-xs font-semibold rounded-2xl border border-emerald-150 flex items-center gap-2.5 animate-in slide-in-from-top-1 duration-200">
          <div className="bg-emerald-500 p-1 rounded-lg text-white">
            <CheckCircle2 size={14} />
          </div>
          {authFeedback}
        </div>
      )}

      {/* ORGANIZATIONS MAIN SUBSECTION */}
      {activeTab === "ORGANIZATIONS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: List and search filter of Organization Nodes */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-950 font-display text-sm">Provisioned Organization Nodes</h4>
                <p className="text-[11px] text-slate-500">Click any card to filter sub-modules and load deep-dive statistics.</p>
              </div>
              
              {/* Organized Search Bar */}
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search by name, location or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-450 focus:ring-1 focus:ring-slate-300 rounded-xl pl-9 pr-8 py-2 outline-none text-xs text-slate-900 font-medium transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHospitals.map((hosp) => {
                const isActiveContext = hosp.id === activeHospitalId;
                const isFilterTarget = hosp.id === selectedOrgFilter;
                const counts = statsMap[hosp.id] || { admins: 0, staff: 0, wards: 0, rooms: 0 };

                return (
                  <div 
                    key={hosp.id} 
                    onClick={() => handleSelectOrganization(hosp.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-56 group ${
                      isFilterTarget 
                        ? "bg-white border-brand-500 shadow-md ring-2 ring-brand-500/85" 
                        : isActiveContext 
                        ? "bg-white border-brand-350 shadow-sm ring-1 ring-brand-200"
                        : "bg-white border-slate-200 shadow-xs hover:border-slate-350 hover:shadow-sm"
                    }`}
                  >
                    {/* Visual glowing aura for active items on hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-slate-400 font-bold uppercase text-[10px] tracking-wide">{hosp.id}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {isFilterTarget && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              FILTERED
                            </span>
                          )}
                          {isActiveContext ? (
                            <span className="bg-brand-50 text-brand-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-brand-200">
                              <Radio size={9} className="animate-pulse text-brand-600" />
                              ACTIVE CTX
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md text-slate-500 font-bold group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                              SELECT
                            </span>
                          )}
                        </div>
                      </div>

                      <h5 className="font-bold text-slate-900 text-[13px] font-display mt-2 line-clamp-1 group-hover:text-slate-950 transition-colors">{hosp.name}</h5>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{hosp.location}</p>
                    </div>

                    {/* Breakdown of admins, staff, wards directly on each card */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-dashed border-slate-100 my-2 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Users size={11} className="text-slate-400 shrink-0" />
                        <span>Admins: <strong>{counts.admins}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="text-slate-400 shrink-0" />
                        <span>Staff: <strong>{counts.staff}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers size={11} className="text-slate-400 shrink-0" />
                        <span>Wards: <strong>{counts.wards}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Archive size={11} className="text-slate-400 shrink-0" />
                        <span>Rooms: <strong>{counts.rooms}</strong></span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono space-y-1 relative z-10 pt-1">
                      <div className="flex justify-between">
                        <span>CAPACITY CAP:</span>
                        <strong className="text-slate-800">{hosp.storageQuota} m³</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>BUDGET APPRASIAL:</span>
                        <strong className="text-slate-800">RM {hosp.assetValueLimit.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredHospitals.length === 0 && (
                <div className="col-span-full bg-slate-50 p-12 rounded-3xl border border-slate-200 border-dashed text-center flex flex-col items-center justify-center space-y-2">
                  <Building size={32} className="text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No organizations matched current query</p>
                  <p className="text-xs text-slate-400">Clear search input or compile different terms.</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-xs font-bold text-slate-900 underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Tabbed Bento Deep-Dive stats & Creation Portal (5 columns) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            
            {/* Toggle state selector of right bento panel */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold shadow-xs">
              <button
                onClick={() => setRightPanelMode("STATS")}
                className={`flex-1 py-1.5 px-3 text-center rounded-lg cursor-pointer transition-all ${
                  rightPanelMode === "STATS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Deep-Dive Metrics
              </button>
              <button
                onClick={() => setRightPanelMode("CREATE_ORGANIZATION")}
                className={`flex-1 py-1.5 px-3 text-center rounded-lg cursor-pointer transition-all ${
                  rightPanelMode === "CREATE_ORGANIZATION" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                id="super_admin_create_hosp_toggle_btn"
              >
                + Define Organization
              </button>
            </div>

            {/* STATE 1: DEEP-DIVE SUMMARY STATS CARD FOR THE SELECTED ORG */}
            {rightPanelMode === "STATS" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 relative overflow-hidden">
                {!currentFilteredOrgObj ? (
                  <div className="text-center py-10 space-y-2">
                    <Info size={24} className="text-slate-350 mx-auto" />
                    <p className="text-xs text-slate-500">Please select an organization node to populate detailed operational records.</p>
                  </div>
                ) : (
                  <>
                    {/* Header line */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-655 font-mono font-bold uppercase tracking-wider">
                        <Activity size={12} className="text-brand-500 animate-pulse" />
                        Live Cluster Diagnostics ({currentFilteredOrgObj.id.toUpperCase()})
                      </div>
                      <h4 className="font-bold text-slate-900 font-display text-sm mt-1">{currentFilteredOrgObj.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{currentFilteredOrgObj.location}</p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center gap-2.5">
                        <div className="bg-slate-200/60 p-2 rounded-xl text-slate-700">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-mono">STAFF OPERATORS</div>
                          <div className="text-xs font-extrabold text-slate-800">{currentOrgStats.staff} Operators</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center gap-2.5">
                        <div className="bg-slate-200/60 p-2 rounded-xl text-slate-700">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-mono">ADMINISTRATORS</div>
                          <div className="text-xs font-extrabold text-slate-800">{currentOrgStats.admins} Active</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center gap-2.5">
                        <div className="bg-amber-50 p-2 rounded-xl text-amber-700">
                          <Layers size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-500 uppercase font-mono">WARD MAPPINGS</div>
                          <div className="text-xs font-extrabold text-slate-800">{currentOrgStats.wards} Divisions</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-center gap-2.5">
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-700">
                          <Archive size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] text-indigo-500 uppercase font-mono">DEPOTS / ROOMS</div>
                          <div className="text-xs font-extrabold text-slate-800">{currentOrgStats.rooms} Coordinates</div>
                        </div>
                      </div>

                    </div>

                    {/* Capacity Visual Progress Bar meters */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      
                      {/* Quota limit bar */}
                      <div className="text-xs font-semibold space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Warehouse Space Quota Usage</span>
                          <strong className="text-slate-800">Available Cap: {currentFilteredOrgObj.storageQuota} m³</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          {/* We simulate visual allocation bar length */}
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(25, (currentOrgStats.rooms * 14)))}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">Physical occupancy safe threshold</p>
                      </div>

                      {/* Budget scale bar */}
                      <div className="text-xs font-semibold space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Appraised Valuation Limit (Budget Limit)</span>
                          <strong className="text-slate-800">RM {currentFilteredOrgObj.assetValueLimit.toLocaleString()}</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-850 rounded-full" style={{ width: "65%" }} />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>USED ALLOCATION: 65%</span>
                          <span>STABLE SUPPLY PARITY</span>
                        </div>
                      </div>

                    </div>

                    {/* Quick navigation link triggers */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-[11px] leading-relaxed text-slate-500 space-y-2">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Compass size={13} className="text-brand-655" />
                        Quick Navigation Shortcuts:
                      </div>
                      <p>You can quickly view, deploy, or configure assets for this selected organization by visiting the other panels.</p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedOrgFilter(currentFilteredOrgObj.id);
                            setActiveTab("DEPARTMENTS");
                          }}
                          className="py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-lg flex items-center justify-between text-[10px] cursor-pointer"
                        >
                          Show Ward Nodes
                          <ArrowRight size={11} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrgFilter(currentFilteredOrgObj.id);
                            setActiveTab("OPERATORS");
                          }}
                          className="py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-lg flex items-center justify-between text-[10px] cursor-pointer"
                        >
                          Show Operators
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Creation Stamp */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                      <span>Live since: {new Date(currentFilteredOrgObj.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-150 uppercase text-[9px]">
                        ● Verified live
                      </span>
                    </div>

                  </>
                )}
              </div>
            )}

            {/* STATE 2: NEW ORGANIZATION FORM */}
            {rightPanelMode === "CREATE_ORGANIZATION" && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in zoom-in-95 duration-155">
                <div>
                  <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
                    <Building className="text-brand-600" size={16} />
                    Provision New Organization Node
                  </h4>
                  <p className="text-[11px] text-slate-500">Adds an isolated medical workspace (such as Hospital Kuala Lumpur, Clinic Rahman Putra) with individual limit boundaries and safety controls.</p>
                </div>

                {hospSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-805 rounded-xl text-xs font-semibold border border-emerald-100">
                    {hospSuccess}
                  </div>
                )}

                <form onSubmit={handleAddHospitalSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1.5 text-left">
                    <label className="text-slate-700 block text-[11px]">Organization name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hospital Kajang"
                      value={newHospName}
                      onChange={(e) => setNewHospName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-slate-700 block text-[11px]">Physical Address Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kajang, Selangor"
                      value={newHospLoc}
                      onChange={(e) => setNewHospLoc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block text-[11px]">Storage Limit (m³)</label>
                      <input
                        type="number"
                        min="100"
                        value={newHospQuota}
                        onChange={(e) => setNewHospQuota(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none font-mono text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 block text-[11px]">Budget Valuation Limit (RM)</label>
                      <input
                        type="number"
                        min="1000"
                        value={newHospLimit}
                        onChange={(e) => setNewHospLimit(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-xs font-display flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Database size={14} /> Provision Isolated Cluster Workspace
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

      {/* CLINICAL WARDS & DEPARTMENTS SUBSECTION */}
      {activeTab === "DEPARTMENTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: List of clinical departments linked to selected/active Filters */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-950 font-display text-sm">Clinical Wards &amp; Warehouses Mapping</h4>
                <p className="text-[11px] text-slate-500">
                  {selectedOrgFilter 
                    ? `Showing ward subdivisions anchored to: ${hospitals.find(h => h.id === selectedOrgFilter)?.name}`
                    : "Showing active sub-ward storage registries mapped to all centralized organizations."}
                </p>
              </div>
              
              {selectedOrgFilter && (
                <button
                  onClick={() => setSelectedOrgFilter("")}
                  className="text-[10px] font-bold text-brand-655 hover:underline cursor-pointer font-mono uppercase"
                >
                  Show All ({departments.length})
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-mono tracking-wider font-extrabold uppercase flex justify-between">
                <span>WARD SUBDIVISION</span>
                <span>REGISTERED STORAGE DEPOTS</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => {
                  const targetHospName = hospitals.find((h) => h.id === dept.hospitalId)?.name || "Central Core";
                  return (
                    <div key={dept.id} className="p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/55 transition-colors">
                      <div className="text-left font-semibold">
                        <h5 className="font-bold text-slate-900 text-[13px] font-display">{dept.name}</h5>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                          Linked Cluster: <strong className="text-slate-700 font-semibold">{targetHospName} ({dept.hospitalId.toUpperCase()})</strong>
                        </p>
                      </div>

                      <div className="flex gap-1.5 flex-wrap">
                        {dept.storageRooms.map((room, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono font-bold tracking-tight">
                            {room}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredDepartments.length === 0 && (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <Layers size={28} className="mx-auto text-slate-300" />
                    <p className="font-medium text-xs text-slate-600">No wards provisioned under this filter context.</p>
                    <p className="text-[11px] text-slate-400">Use the deploy panel rightward to register clinical coordinate points.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Beautiful Polished Deploy New Ward Form (5 columns) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit text-xs font-semibold text-left">
            <div>
              <h4 className="font-bold text-slate-900 font-display text-sm">Deploy Specialty Clinical Ward</h4>
              <p className="text-[11px] text-slate-500">Configure a specialty clinical ward (Oncology, Radiology, Emergency) and align physical storage rooms.</p>
            </div>

            {deptSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-805 rounded-xl font-bold border border-emerald-100 flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check size={14} className="text-emerald-700" />
                {deptSuccess}
              </div>
            )}

            <form onSubmit={handleAddDeptSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 block text-[11px]">Select Target Organization</label>
                <select
                  value={deptHospId}
                  onChange={(e) => setDeptHospId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none font-sans text-slate-850"
                >
                  {hospitals.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} ({hosp.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 block text-[11px]">Specialty Ward / Division name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU Division B"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none text-xs text-slate-950 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 block text-[11px]">Storage Room Codes (Comma Separated)</label>
                  <span className="text-[9px] text-slate-400 uppercase font-mono">Real-time preview</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Room 402, Cold Vault C, Safety Depot"
                  value={roomCodes}
                  onChange={(e) => setRoomCodes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-xl px-3 py-2.5 outline-none text-xs text-slate-950 font-medium"
                />

                {/* Real-time elegant interactive rooms preview */}
                <div className="mt-2 min-h-[36px] bg-slate-50/50 rounded-xl p-2.5 border border-dashed border-slate-200 flex flex-wrap gap-1.5 items-center">
                  {parsedRoomPills.length > 0 ? (
                    parsedRoomPills.map((pill, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-250 animate-in zoom-in-95 duration-100 flex items-center gap-0.5">
                        <Radio size={8} className="animate-pulse" />
                        {pill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium italic">Pending room input tokens...</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-xs font-display flex items-center justify-center gap-1.5 cursor-pointer leading-none"
              >
                <Plus size={14} /> Deploy Centralized Coordinates Node
              </button>
            </form>
          </div>

        </div>
      )}

      {/* AUTHORIZED OPERATORS SUBSECTION */}
      {activeTab === "OPERATORS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: List of custom operators (7 columns) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-950 font-display text-sm">Authorized Network Operators</h4>
                <p className="text-[11px] text-slate-500">
                  {selectedOrgFilter 
                    ? `Showing verified user profiles aligned with: ${hospitals.find(h => h.id === selectedOrgFilter)?.name}`
                    : "Displaying all active and suspended clinical network operators."}
                </p>
              </div>

              {selectedOrgFilter && (
                <button
                  onClick={() => setSelectedOrgFilter("")}
                  className="text-[10px] font-bold text-brand-655 hover:underline cursor-pointer font-mono uppercase"
                >
                  Show All ({operators.length})
                </button>
              )}
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-mono tracking-wider font-extrabold uppercase text-left">
                VERIFIED CRYPTOGRAPHIC SIGNATURE DATABASE
              </div>

              <div className="divide-y divide-slate-100">
                {filteredOperators.map((op) => {
                  const associatedHosp = hospitals.find(h => h.id === op.hospitalId)?.name || "All Central Contexts (Root)";
                  const isRevoked = op.status === "REVOKED";

                  return (
                    <div key={op.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/40">
                      
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img 
                            referrerPolicy="no-referrer"
                            src={op.avatar} 
                            alt={op.name}
                            className={`w-11 h-11 rounded-full border shadow-xs object-cover mt-0.5 ${
                              isRevoked ? "border-rose-300 filter grayscale" : "border-slate-250"
                            }`} 
                          />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isRevoked ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                          }`} />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs font-display flex items-center gap-2 flex-wrap">
                            {op.name}
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wider uppercase ${
                              isRevoked ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {op.status}
                            </span>
                          </h5>
                          <p className="text-slate-500 text-[10px] mt-0.5 font-medium">{op.email}</p>
                          <p className="text-slate-400 text-[10px] font-mono mt-0.5">Assigned Facility: <strong className="text-slate-700 font-semibold">{associatedHosp} ({op.hospitalId.toUpperCase()})</strong></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <div className="px-2 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-[9px] font-extrabold font-mono uppercase tracking-wide">
                          {op.role.replace("_", " ")}
                        </div>

                        {/* Edit metadata action */}
                        <button
                          onClick={() => handleStartEditOperator(op)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Rename or update operator context settings"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => handleResetCreds(op.id, op.name)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-655 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Rotate active security key tokens"
                        >
                          <KeyRound size={13} />
                        </button>

                        <button
                          onClick={() => handleRevoke(op.id, op.name, op.status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            isRevoked 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" 
                              : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isRevoked ? "Reinstate" : "Suspend"}
                        </button>
                      </div>

                    </div>
                  );
                })}

                {filteredOperators.length === 0 && (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <UserPlus size={28} className="mx-auto text-slate-300" />
                    <p className="font-semibold text-xs text-slate-600">No operators matching selected target.</p>
                    <p className="text-[11px] text-slate-400">Generate additional operator credentials using the sign-on panel.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Polished design for Operator controls & new creation (5 columns) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            
            {/* Operator update form */}
            {editingOp ? (
              <div className="bg-slate-50 p-5 rounded-3xl border border-amber-300 shadow-md space-y-4 animate-in slide-in-from-right-1 duration-150">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders size={16} className="text-amber-600" />
                    <h4 className="font-bold text-slate-900 font-display text-sm">Update Operator Settings</h4>
                  </div>
                  <button 
                    onClick={() => setEditingOp(null)}
                    className="p-1 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveEditOperatorSubmit} className="space-y-4 text-xs font-semibold text-left">
                  <div className="space-y-1">
                    <label className="text-slate-700 block text-[10px]">Operator Full Name</label>
                    <input
                      type="text"
                      required
                      value={editOpName}
                      onChange={(e) => setEditOpName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs text-slate-950 font-medium text-left focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 block text-[10px]">Active Email Address</label>
                    <input
                      type="email"
                      required
                      value={editOpEmail}
                      onChange={(e) => setEditOpEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs text-slate-950 font-medium text-left focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 block text-[10px]">Assigned Role Level Scope</label>
                    <select
                      value={editOpRole}
                      onChange={(e) => setEditOpRole(e.target.value as AccessRole)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 font-semibold"
                    >
                      <option value="STAFF">Clinical Staff: local check-in & dispatch</option>
                      <option value="HOSPITAL_ADMIN">Hospital Administrator: release approvals</option>
                      <option value="SUPER_ADMIN">Systems Super Admin: cluster master settings</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 block text-[10px]">Assign Linked Organization Node</label>
                    <select
                      value={editOpHospId}
                      onChange={(e) => setEditOpHospId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 font-semibold"
                    >
                      {hospitals.map((hosp) => (
                        <option key={hosp.id} value={hosp.id}>
                          {hosp.name} ({hosp.id.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs font-sans"
                    >
                      <Save size={13} /> Save Modifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingOp(null)}
                      className="bg-slate-200 hover:bg-slate-250 text-slate-800 px-3.5 py-2 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Operator Creation Panel Card (Beautiful responsive card for creating Admins/Staff) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
              <div>
                <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
                  <UserPlus className="text-brand-655" size={17} />
                  Authorize Digital Identity
                </h4>
                <p className="text-[11px] text-slate-500">Super Admin system keyholder triggers authorization generation codes for new clinical operators.</p>
              </div>

              {opSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-805 rounded-xl text-xs font-bold border border-emerald-110 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-150">
                  <Check size={14} className="text-emerald-700" />
                  {opSuccess}
                </div>
              )}

              <form onSubmit={handleAddOperatorSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1 text-left">
                  <label className="text-slate-700 block text-[11px]">Operator Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rayhan Kamal"
                      value={newOpName}
                      onChange={(e) => setNewOpName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-450 focus:ring-1 focus:ring-slate-350 rounded-xl pl-8.5 pr-3 py-2.5 outline-none text-xs text-slate-950 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 block text-[11px]">Email Address Coordinate</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. kamal@serdang.gov.my"
                      value={newOpEmail}
                      onChange={(e) => setNewOpEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-450 focus:ring-1 focus:ring-slate-350 rounded-xl pl-8.5 pr-3 py-2.5 outline-none text-xs text-slate-950 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 block text-[11px]">Assign Target Facility Hub</label>
                  <select
                    value={newOpHospId}
                    onChange={(e) => setNewOpHospId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 focus:border-slate-400 focus:ring-1 focus:ring-slate-350 rounded-xl px-2.5 py-2.5 outline-none text-slate-800 font-bold"
                  >
                    {hospitals.map((hosp) => (
                      <option key={hosp.id} value={hosp.id}>
                        {hosp.name} ({hosp.id.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* VISUAL CHOICE FOR ROLE ACCESS PRIVILEGE LEVEL (Instead of static dropdown) */}
                <div className="space-y-2">
                  <label className="text-slate-700 block text-[11px]">Access Privilege Role Level</label>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    
                    {/* OPTION 1: STAFF */}
                    <div 
                      onClick={() => setNewOpRole("STAFF")}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 relative ${
                        newOpRole === "STAFF" 
                          ? "bg-brand-50/40 border-brand-500 shadow-xs" 
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          newOpRole === "STAFF" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                        }`}>
                          {newOpRole === "STAFF" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          STAFF OPERATOR
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-mono">DOCK LEVEL</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5">Authorize incoming stock reception and register clinical bedside item use.</p>
                      </div>
                    </div>

                    {/* OPTION 2: HOSPITAL_ADMIN */}
                    <div 
                      onClick={() => setNewOpRole("HOSPITAL_ADMIN")}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 relative ${
                        newOpRole === "HOSPITAL_ADMIN" 
                          ? "bg-brand-50/40 border-brand-500 shadow-xs" 
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          newOpRole === "HOSPITAL_ADMIN" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                        }`}>
                          {newOpRole === "HOSPITAL_ADMIN" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          HOSPITAL ADMINISTRATOR
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-mono">VERIFIED KEYS</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5">Authorize release orders, manage supplier rates, and adjust safety margins.</p>
                      </div>
                    </div>

                    {/* OPTION 3: SUPER_ADMIN */}
                    <div 
                      onClick={() => setNewOpRole("SUPER_ADMIN")}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 relative ${
                        newOpRole === "SUPER_ADMIN" 
                          ? "bg-brand-50/40 border-brand-500 shadow-xs" 
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          newOpRole === "SUPER_ADMIN" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
                        }`}>
                          {newOpRole === "SUPER_ADMIN" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          ROOT SUPER ADMIN
                          <span className="text-[9px] bg-red-105 text-red-750 px-1 py-0.5 rounded font-mono">ROOT VERIFIED</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal leading-normal mt-0.5">Oversee all multi-organizational nodes, configure schemas, and rotative keys.</p>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-xs font-display flex items-center justify-center gap-1.5 cursor-pointer leading-none"
                >
                  <KeyRound size={13} className="text-brand-300 animate-pulse" />
                  Issue Cryptographic Identity credentials
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
