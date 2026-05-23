import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, AlertTriangle, CheckCircle, Package2, ShieldAlert, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { InventoryItem, AccessRole, InventoryBatch } from "../types";

interface InventoryLedgerProps {
  inventory: InventoryItem[];
  userRole: AccessRole;
  onUpdateSafetyThreshold: (itemId: string, newThreshold: number) => void;
}

export default function InventoryLedger({
  inventory,
  userRole,
  onUpdateSafetyThreshold
}: InventoryLedgerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DEPLETED" | "GOOD">("ALL");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Categories list
  const categories = ["All", "Vessel Dilators", "Critical Antidotes", "Oxygen Concentrators", "Surgical Apparatus", "General Pharamceuticals"];

  // Filtered Inventory
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.shelvingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.storageZone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    
    const isDepleted = item.totalQuantity <= item.safetyThreshold;
    const matchesStatus = statusFilter === "ALL" || 
                          (statusFilter === "DEPLETED" && isDepleted) ||
                          (statusFilter === "GOOD" && !isDepleted);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort by nearest expiring batch first (expiring on top as priority)
  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    const getEarliestExpiry = (item: InventoryItem) => {
      if (!item.batches || item.batches.length === 0) return Infinity;
      return Math.min(...item.batches.map(batch => new Date(batch.expirationDate).getTime()));
    };
    return getEarliestExpiry(a) - getEarliestExpiry(b);
  });

  const handleStartEditThreshold = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditValue(item.safetyThreshold);
  };

  const handleSaveThreshold = (itemId: string) => {
    if (editValue < 0 || isNaN(editValue)) return;
    onUpdateSafetyThreshold(itemId, editValue);
    setEditingItemId(null);
  };

  const isTuningAllowed = userRole === "SUPER_ADMIN" || userRole === "HOSPITAL_ADMIN";

  const stableDateStr = "2026-05-22";

  return (
    <div className="space-y-6" id="inventory_ledger_view">
      {/* Search and filter controls bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by substance name, SKU code, or shelf coordinate (e.g. Rack E-12)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white text-slate-800 transition-all font-sans"
            />
          </div>
          {/* Quick status selector */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs font-medium shrink-0 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === "ALL" ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Assets ({inventory.length})
            </button>
            <button
              onClick={() => setStatusFilter("DEPLETED")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                statusFilter === "DEPLETED" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-rose-500"
              }`}
            >
              <AlertTriangle size={12} className="shrink-0" />
              Depleted ({inventory.filter(i => i.totalQuantity <= i.safetyThreshold).length})
            </button>
            <button
              onClick={() => setStatusFilter("GOOD")}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === "GOOD" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-emerald-500"
              }`}
            >
              Good Holding
            </button>
          </div>
        </div>

        {/* Category selector slider */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                (selectedCategory === cat)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white hover:bg-slate-50 border-slate-100 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 font-display">In-Stock Clinical Ledger</h3>
            <p className="text-xs text-slate-500">Decentralised hospital substance indices detailing batch coordinates</p>
          </div>
          {isTuningAllowed && (
            <span className="text-xs font-medium text-brand-600 bg-brand-50/80 px-3 py-1.5 rounded-xl border border-brand-100">
              ⚡ Admin Tuning Mode Active
            </span>
          )}
        </div>

        {sortedFilteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Package2 size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium">No substances matched the search parameters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or clearing search fields.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider select-none">
                <tr>
                  <th className="px-5 py-3 font-semibold">Substance / SKU</th>
                  <th className="px-5 py-3 font-semibold">Coordinates</th>
                  <th className="px-5 py-3 font-semibold text-right">Available Volume</th>
                  <th className="px-5 py-3 font-semibold text-right">Threshold Buffer</th>
                  <th className="px-5 py-3 font-semibold text-center">Urgency / Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {sortedFilteredItems.map((item) => {
                  const isBelowThreshold = item.totalQuantity <= item.safetyThreshold;
                  
                  // Track early expiration for display
                  const earlyExpiryBatch = [...item.batches].sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())[0];
                  const hasBatches = item.batches && item.batches.length > 0;
                  const isExpiringSoon = hasBatches && earlyExpiryBatch &&
                    (new Date(earlyExpiryBatch.expirationDate).getTime() - new Date(stableDateStr).getTime()) <= 30 * 24 * 60 * 60 * 1000;

                  return (
                    <Fragment key={item.id}>
                      {/* Parent Item details row */}
                      <tr className="hover:bg-slate-50/10 transition-colors">
                        <td 
                          className="px-5 py-4 font-sans align-top cursor-pointer select-none hover:bg-slate-50/40 transition-colors group/substance"
                          onClick={() => toggleExpand(item.id)}
                          title="Click to toggle batch storage ledger details"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                                {item.category.replace("General ", "")}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.sku}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-800 text-sm sm:text-base tracking-tight font-display group-hover/substance:text-brand-600 transition-colors flex items-center gap-1">
                              {item.name}
                              {expandedItemIds[item.id] ? (
                                <ChevronDown size={14} className="text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight size={14} className="text-slate-400 shrink-0" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top font-sans text-xs">
                          <div className="flex flex-col gap-1 pt-0.5">
                            <span className="flex items-center gap-1">
                              Shelf: <strong className="text-[#ff9500] bg-[#ff9500]/10 px-1.5 py-0.5 rounded border border-[#ff9500]/15 font-mono font-medium">{item.shelvingLocation}</strong>
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Route Unit: <strong className="text-slate-650 font-semibold">{item.storageZone}</strong>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-right font-sans">
                          <div className="flex flex-col gap-1 items-end pt-0.5">
                            <span className={`text-sm sm:text-base font-bold font-display ${isBelowThreshold ? "text-[#ff3b30]" : "text-brand-600"}`}>
                              {item.totalQuantity} <span className="text-xs font-normal text-slate-550 font-sans">{item.unit}</span>
                            </span>
                            {isBelowThreshold && (
                              <span className="bg-[#ff3b30]/10 border border-[#ff3b30]/15 text-[#ff3b30] text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-wide uppercase">
                                <ShieldAlert size={10} className="shrink-0 animate-bounce" />
                                Critical Hold
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-right font-sans text-xs">
                          <div className="flex flex-col gap-1 items-end pt-0.5">
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                  className="w-14 px-1 py-0.5 text-center bg-white border border-brand-500 rounded text-xs focus:ring-1 focus:ring-brand-500 outline-none text-slate-800 font-bold"
                                />
                                <button
                                  onClick={() => handleSaveThreshold(item.id)}
                                  className="px-1.5 py-0.5 bg-brand-600 text-white rounded font-medium hover:bg-brand-700 text-[9px] cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium hover:bg-slate-200 text-[9px] cursor-pointer"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-bold text-slate-600">{item.safetyThreshold}</span>
                                <span className="text-[10px] text-slate-400">{item.unit}</span>
                                {isTuningAllowed && (
                                  <button
                                    onClick={() => handleStartEditThreshold(item)}
                                    className="text-slate-400 hover:text-brand-600 transition-colors ml-0.5 p-0.5 hover:bg-slate-50 rounded cursor-pointer"
                                    title="Adjust safety threshold"
                                  >
                                    <Edit size={11} />
                                  </button>
                                )}
                              </div>
                            )}
                            <span className="text-[9px] text-slate-400 select-none">Minimum Safe Trigger</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-center font-sans text-xs">
                          <div className="flex flex-col items-center gap-1">
                            {hasBatches ? (
                              <>
                                <div className="flex items-center gap-1 flex-wrap justify-center">
                                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase ${
                                    isExpiringSoon ? "bg-rose-50 border border-rose-100 text-rose-600 animate-pulse" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                                  }`}>
                                    {isExpiringSoon ? "Soon Expiry" : "Stable Batch"}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">({item.batches.length} active)</span>
                                </div>
                                <span className={`text-[11px] font-semibold font-mono ${isExpiringSoon ? "text-rose-600 font-bold" : "text-slate-650"}`}>
                                  Primary: {earlyExpiryBatch.expirationDate}
                                </span>
                                
                                <button
                                  onClick={() => toggleExpand(item.id)}
                                  className={`mt-1.5 flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold transition-all shadow-xs cursor-pointer select-none ${
                                    expandedItemIds[item.id]
                                      ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                                      : "bg-brand-50 border-brand-100/50 text-brand-700 hover:bg-brand-100"
                                  }`}
                                >
                                  {expandedItemIds[item.id] ? "Hide Batches" : "Show Batches"}
                                  {expandedItemIds[item.id] ? <ChevronDown size={10} className="shrink-0" /> : <ChevronRight size={10} className="shrink-0" />}
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400 italic text-[11px] select-none">No active batches</span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Nested Batches Table Row instead of Cards */}
                      <AnimatePresence initial={false}>
                        {hasBatches && expandedItemIds[item.id] && (
                          <motion.tr 
                            key={`batches-row-${item.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-50/20"
                          >
                            <td colSpan={5} className="px-5 pb-4 pt-1">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white/70 shadow-xs max-w-4xl my-1">
                                  <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                                    <thead className="bg-slate-50/50 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider select-none">
                                      <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Active Batch Number</th>
                                        <th className="px-4 py-2 text-left font-semibold">Expiration Date</th>
                                        <th className="px-4 py-2 text-center font-semibold">Vigilance Status</th>
                                        <th className="px-4 py-2 text-right font-semibold">Batch Volume Stored</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-650">
                                      {item.batches.map((batch) => {
                                        const batchExpirySoon = (new Date(batch.expirationDate).getTime() - new Date(stableDateStr).getTime()) <= 30 * 24 * 60 * 60 * 1000;
                                        return (
                                          <tr key={batch.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-4 py-2 font-mono font-medium text-slate-550">
                                              No. {batch.batchNumber}
                                            </td>
                                            <td className="px-4 py-2 font-mono font-semibold">
                                              <span className={batchExpirySoon ? "text-rose-650" : "text-slate-600"}>
                                                {batch.expirationDate}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                batchExpirySoon ? "bg-rose-50 border border-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500"
                                              }`}>
                                                {batchExpirySoon ? "EXPIRING" : "STABLE"}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-700">
                                              {batch.quantity} {item.unit}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
