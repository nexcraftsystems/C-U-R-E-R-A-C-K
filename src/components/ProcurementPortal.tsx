import React, { useState } from "react";
import { Copy, Plus, FileText, CheckCircle2, XCircle, Download, ShoppingBag, Trash2 } from "lucide-react";
import { PurchaseOrder, InventoryItem, AccessRole, PurchaseOrderItem } from "../types";

interface ProcurementPortalProps {
  orders: PurchaseOrder[];
  inventory: InventoryItem[];
  userRole: AccessRole;
  userName: string;
  onApprovePO: (poId: string, approverName: string) => void;
  onRejectPO: (poId: string) => void;
  onCreatePO: (items: PurchaseOrderItem[]) => void;
}

export default function ProcurementPortal({
  orders,
  inventory,
  userRole,
  userName,
  onApprovePO,
  onRejectPO,
  onCreatePO
}: ProcurementPortalProps) {
  const [draftItems, setDraftItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [draftQty, setDraftQty] = useState<number>(0);
  const [poCreatedMsg, setPoCreatedMsg] = useState("");
  const [previewManifest, setPreviewManifest] = useState<PurchaseOrder | null>(null);

  // Dynamic Item cost lookup helper
  const getItemDetails = (itemId: string) => {
    return inventory.find((it) => it.id === itemId);
  };

  const handleAddDraftItem = () => {
    if (!selectedItemId || draftQty <= 0) return;
    const item = getItemDetails(selectedItemId);
    if (!item) return;

    // Check if item already exists in draft list
    const existingIndex = draftItems.findIndex((it) => it.itemId === selectedItemId);
    const unitPrice = item.batches[0]?.pricePerUnit || 10; // Default price if no batch

    if (existingIndex > -1) {
      const updated = [...draftItems];
      updated[existingIndex].quantity += draftQty;
      setDraftItems(updated);
    } else {
      setDraftItems([
        ...draftItems,
        {
          itemId: selectedItemId,
          name: item.name,
          quantity: draftQty,
          estimatedUnitPrice: unitPrice
        }
      ]);
    }

    setDraftQty(0);
  };

  const handleRemoveDraftItem = (index: number) => {
    const updated = [...draftItems];
    updated.splice(index, 1);
    setDraftItems(updated);
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftItems.length === 0) {
      alert("Demands manifest is empty! Please add at least one clinical item.");
      return;
    }

    onCreatePO(draftItems);
    setDraftItems([]);
    setPoCreatedMsg("Procurement Proposal filed successfully under review!");
    setTimeout(() => setPoCreatedMsg(""), 5000);
  };

  const calculateDraftValuation = () => {
    return draftItems.reduce((sum, item) => sum + item.quantity * item.estimatedUnitPrice, 0);
  };

  const isOversightAllowed = userRole === "SUPER_ADMIN" || userRole === "HOSPITAL_ADMIN";
  const isDraftingAllowed = userRole === "WARD_MANAGER" || userRole === "STAFF" || userRole === "SUPER_ADMIN";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="procurement_portal_view">
      
      {/* List of existing Purchase Manifests (7 Columns) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 font-display">Acquisition Logs</h3>
            <p className="text-xs text-slate-500">Track authorization and release protocols for medical asset manifolds</p>
          </div>
          <span className="text-xs font-mono bg-slate-150 text-slate-600 px-3 py-1.5 rounded-lg font-medium border border-slate-200">
            {orders.length} Manifests
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            No tracked procurement proposals registered inside this node.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((po) => {
              const dateObj = new Date(po.createdAt);
              return (
                <div key={po.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          {po.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          po.status === "PENDING"
                            ? "bg-[#ff9500]/15 text-[#ff9500] border border-[#ff9500]/20"
                            : po.status === "APPROVED"
                            ? "bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/20 font-semibold"
                            : "bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/20"
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-mono">
                        Drafted by <strong className="text-slate-600">{po.draftedBy}</strong> on {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-mono">Total Valuation</span>
                      <strong className="text-slate-800 text-base font-display">
                        RM{po.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  {/* List of sub items in purchase order */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100/50 space-y-2 text-xs">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-600">
                        <span>{it.quantity}x <strong className="text-slate-800 font-medium">{it.name}</strong></span>
                        <span className="font-mono text-[11px] text-slate-400">@ RM{it.estimatedUnitPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Operational administrative action controllers */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Release and cancel triggers available to hospital admins */}
                    {po.status === "PENDING" && isOversightAllowed ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprovePO(po.id, userName)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          Approve Release
                        </button>
                        <button
                          onClick={() => onRejectPO(po.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                          <XCircle size={13} />
                          Reject Manifest
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {po.status === "APPROVED" && po.approvedBy && (
                          <span>Authorized by <strong>{po.approvedBy}</strong></span>
                        )}
                        {po.status === "REJECTED" && (
                          <span className="text-rose-500 font-semibold uppercase">Proposal Terminated</span>
                        )}
                        {po.status === "PENDING" && !isOversightAllowed && (
                          <span className="text-amber-500 font-medium">Awaiting administrator signature...</span>
                        )}
                      </div>
                    )}

                    {/* View manifest trigger */}
                    <button
                      onClick={() => setPreviewManifest(po)}
                      className="text-[11px] text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 hover:underline cursor-pointer ml-auto"
                    >
                      <FileText size={13} />
                      Preview Manifest Protocol
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Creation form on Right Panel (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {isDraftingAllowed ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 font-display text-base">New Demands Manifest</h3>
              <p className="text-xs text-slate-500">Verify and assemble multi-item inventory stock replenishment requests to clear bottlenecks</p>
            </div>

            {poCreatedMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={15} />
                {poCreatedMsg}
              </div>
            )}

            {/* Quick assembly selector */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-3">
              <span className="font-semibold text-slate-600 block">Fast Manifest Row Assembly</span>
              <div className="space-y-2">
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none text-xs text-slate-800 font-sans"
                >
                  <option value="">-- Select Substance --</option>
                  {inventory.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (Hold: {it.totalQuantity} - Limit: {it.safetyThreshold})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={draftQty === 0 ? "" : draftQty}
                    onChange={(e) => setDraftQty(parseInt(e.target.value) || 0)}
                    placeholder="Refill Unit volume..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none text-xs font-mono"
                  />
                  <button
                    onClick={handleAddDraftItem}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 rounded-lg text-xs font-display flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>
              </div>
            </div>

            {/* Draft list display table */}
            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left bg-slate-50/50">
                  <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="p-2 font-medium">Substance</th>
                      <th className="p-2 font-medium text-center">Qty</th>
                      <th className="p-2 font-medium text-right">Value</th>
                      <th className="p-2 font-medium text-center">Det</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {draftItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          Empty manifest listing. Use quick assembly above to draft stock orders.
                        </td>
                      </tr>
                    ) : (
                      draftItems.map((it, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-2 font-medium text-slate-850 truncate max-w-[120px]" title={it.name}>
                            {it.name}
                          </td>
                          <td className="p-2 text-center text-slate-600 font-mono">
                            {it.quantity}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-700 font-semibold">
                            RM{(it.quantity * it.estimatedUnitPrice).toLocaleString()}
                          </td>
                          <td className="p-2 text-center text-rose-500 hover:text-rose-700">
                            <button type="button" onClick={() => handleRemoveDraftItem(idx)}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {draftItems.length > 0 && (
                <div className="flex justify-between items-center text-xs bg-brand-50 p-3 rounded-xl border border-brand-100">
                  <span className="font-semibold text-brand-800">Dynamic Valuation Appraisal:</span>
                  <strong className="text-brand-700 font-semibold font-mono text-sm">
                    RM{calculateDraftValuation().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={draftItems.length === 0}
                className={`w-full font-medium py-2.5 px-4 rounded-xl text-xs font-display flex items-center justify-center gap-2 transition-all ${
                  draftItems.length > 0
                    ? "bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag size={14} />
                Submit Logistics Proposal
              </button>

            </form>

          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <h3 className="font-semibold text-slate-800 font-display text-base">New Demands Manifest</h3>
            <p className="text-xs text-rose-600 font-medium px-4 py-3 bg-rose-50 rounded-xl border border-rose-150 mt-3">
              Administrators are locked out of drafting purchase orders to prevent self-approval conflicts. Switch role context to Ward Manager or Nurse Staff.
            </p>
          </div>
        )}

      </div>

      {/* Manifest modal overlay/preview */}
      {previewManifest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-600"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-850 font-display flex items-center gap-1.5 text-base">
                  <FileText className="text-brand-600" size={18} />
                  CureRack.my Logistics Manifest Protocol
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">UUID REF: {previewManifest.id}</p>
              </div>
              <button 
                onClick={() => setPreviewManifest(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-slate-50 hover:bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Manifest PDF Simulator */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 text-xs">
              <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono">
                <div>
                  <span className="block uppercase">Origin Department Node</span>
                  <strong className="text-slate-700 text-[11px] font-sans">Cardiology Wards</strong>
                </div>
                <div className="text-right">
                  <span className="block uppercase">Security Stamp</span>
                  <strong className="text-emerald-600 text-[11px] font-sans">DECENTRALIZED LOGS PARITY SYNCED</strong>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3">
                <span className="font-mono text-[10px] text-slate-400 uppercase block mb-1">Items Requested Manifest</span>
                <div className="space-y-2">
                  {previewManifest.items.map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                      <span>{it.quantity} units x <strong className="font-medium text-slate-900">{it.name}</strong></span>
                      <span className="font-mono text-slate-600">RM{(it.quantity * it.estimatedUnitPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center bg-brand-50/50 p-2.5 rounded-lg border border-brand-100/50">
                <span className="font-semibold text-slate-700">Consolidated Valuation:</span>
                <strong className="text-brand-700 text-sm font-semibold font-mono">RM{previewManifest.totalValuation.toLocaleString()}</strong>
              </div>

              <div className="grid grid-cols-2 text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-mono">
                <div>
                  <span className="block uppercase">Verified Operator</span>
                  <span className="text-slate-700 font-sans">{previewManifest.draftedBy}</span>
                </div>
                <div className="text-right">
                  <span className="block uppercase">Approval Key Signature</span>
                  <span className="text-slate-700 font-sans">{previewManifest.approvedBy || "Awaiting Release Authority"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 justify-end text-xs">
              <button
                onClick={() => {
                  alert("Executing secure PDF print stream to hospitals physical terminal: SUCCESS.");
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-display"
              >
                <Download size={14} /> Download PDF Manifest Protocol
              </button>
              <button
                onClick={() => setPreviewManifest(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 px-4 rounded-xl transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
