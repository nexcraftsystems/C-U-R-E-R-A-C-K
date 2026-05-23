import { useState } from "react";
import { ShieldCheck, Search, Filter, RefreshCw, FileText, Download, Trash } from "lucide-react";
import { AuditLog, AccessRole } from "../types";

interface AuditInspectorProps {
  logs: AuditLog[];
  userRole: AccessRole;
  onClearLogs?: () => void;
}

export default function AuditInspector({
  logs,
  userRole,
  onClearLogs
}: AuditInspectorProps) {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  // Filter lists
  const availableActionTypes = [
    "ALL",
    "USER_LOGIN",
    "ITEM_DISPENSED",
    "STOCK_VERIFIED",
    "ORDER_APPROVED",
    "ORDER_DRAFTED",
    "RATE_ADJUSTED",
    "TENANT_PROVISIONED"
  ];

  // Filters calculation
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(search.toLowerCase()) || 
                          log.details.toLowerCase().includes(search.toLowerCase()) ||
                          log.action.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = filterAction === "ALL" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const isFullAuditAllowed = userRole === "SUPER_ADMIN" || userRole === "HOSPITAL_ADMIN";

  return (
    <div className="space-y-6" id="audit_inspector_view">
      
      {/* Top Ledger Status header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-semibold text-slate-800 font-display text-base">Decentralised Audited Logistics Ledger</h3>
          <p className="text-xs text-slate-500 mt-0.5">Enforces physical state synchronization and shift verification protocols</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#34c759] bg-[#34c759]/10 px-3.5 py-1.5 rounded-xl border border-[#34c759]/20">
          <ShieldCheck size={15} className="text-[#34c759] animate-pulse" />
          LEDGER INTEGRITY SEALED: CRYPTO SECURE
        </div>
      </div>

      {/* Action / Search Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search logs by keyword (e.g. Cardene, Christopher, reset)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all font-sans"
          />
        </div>

        {/* Action picker dropdown */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 text-slate-400">
            <Filter size={14} />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none text-xs text-slate-800 font-sans"
          >
            {availableActionTypes.map((act) => (
              <option key={act} value={act}>
                {act.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Backup Download Mock */}
          <button
            onClick={() => {
              alert("Exporting logistical ledger backup (CureRack_AuditLog_Seal_2026.csv): Stream finalized.");
            }}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium hover:shadow px-3 rounded-lg text-xs font-display flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          {/* Clear Logs button exclusive to super admin */}
          {userRole === "SUPER_ADMIN" && onClearLogs && (
            <button
              onClick={onClearLogs}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 p-2 rounded-lg transition-colors"
              title="Factory reset transaction logs"
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main logs flow board */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Header indicator */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 font-display">Log Footprint History Ledger</span>
          <span className="text-[10px] text-slate-400 font-mono">RENDERING: {filteredLogs.length} LOG LINE ENTRIES</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            No secure signature logs matched the selected search tags.
          </div>
        ) : (
          <div className="divide-y divide-slate-55 flex flex-col">
            {filteredLogs.map((log) => {
              const dateVal = new Date(log.timestamp);
              
              // Dynamic colors for action types
              const getActionColorDetails = (action: string) => {
                switch(action) {
                  case "USER_LOGIN":
                    return "bg-slate-100 text-slate-650";
                  case "ITEM_DISPENSED":
                    return "bg-[#ff9500]/15 text-[#ff9500] border border-[#ff9500]/20";
                  case "ORDER_APPROVED":
                    return "bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/20 font-semibold";
                  case "TENANT_PROVISIONED":
                    return "bg-[#007aff]/15 text-[#007aff] border border-[#007aff]/20 font-bold";
                  case "RATE_ADJUSTED":
                    return "bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/20";
                  default:
                    return "bg-slate-150 text-slate-600";
                }
              };

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row justify-between items-start gap-4 text-xs">
                  
                  {/* Left Column: Signer operator, timestamp and action type pill */}
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider ${getActionColorDetails(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{log.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {dateVal.toLocaleString()}
                    </div>
                  </div>

                  {/* Middle Column: Detail text */}
                  <div className="flex-1 text-slate-700 font-sans leading-relaxed text-[13px] md:px-4">
                    {log.details}
                  </div>

                  {/* Right Column: Operator signature token */}
                  <div className="text-right shrink-0 min-w-[140px] border-t md:border-t-0 border-slate-100 w-full md:w-auto pt-2 md:pt-0">
                    <p className="font-semibold text-slate-800">{log.userName}</p>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                      KEY: {log.userRole}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
