import React, { useState } from "react";
import { PlusCircle, MinusCircle, FileSpreadsheet, KeyRound, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { InventoryItem, AccessRole, DepartmentNode } from "../types";

interface StockRouterProps {
  inventory: InventoryItem[];
  departments: DepartmentNode[];
  userRole: AccessRole;
  userName: string;
  onAddStock: (itemId: string, batchNo: string, qty: number, unitPrice: number, expDate: string, room: string, zone: string) => void;
  onDispenseStock: (itemId: string, batchId: string, qty: number, reason: string) => void;
}

export default function StockRouter({
  inventory,
  departments,
  userRole,
  userName,
  onAddStock,
  onDispenseStock
}: StockRouterProps) {
  const [activeTab, setActiveTab] = useState<"ADD" | "DISPENSE">("DISPENSE");

  // Dynamic storage rooms
  const allStorageRooms = ["Default Dock Station", ...departments.flatMap((dept) => dept.storageRooms)];

  // Form states - ADD STOCK
  const [addItemId, setAddItemId] = useState(inventory[0]?.id || "");
  const [addBatchNo, setAddBatchNo] = useState("");
  const [addQty, setAddQty] = useState<number>(0);
  const [addUnitPrice, setAddUnitPrice] = useState<number>(0);
  const [addExpDate, setAddExpDate] = useState("");
  const [addRoom, setAddRoom] = useState(allStorageRooms[0] || "");
  const [addZone, setAddZone] = useState("Zone A");
  const [addSuccessMsg, setAddSuccessMsg] = useState("");

  // Form states - DISPENSE STOCK
  const [dispenseItemId, setDispenseItemId] = useState(inventory[0]?.id || "");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [dispenseQty, setDispenseQty] = useState<number>(0);
  const [dispenseReason, setDispenseReason] = useState("");
  const [dispenseSuccessMsg, setDispenseSuccessMsg] = useState("");

  // Handler for item change on Dispense to trigger batch reset
  const handleDispenseItemChange = (itemId: string) => {
    setDispenseItemId(itemId);
    const item = inventory.find((it) => it.id === itemId);
    if (item && item.batches.length > 0) {
      setSelectedBatchId(item.batches[0].id);
    } else {
      setSelectedBatchId("");
    }
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItemId || !addBatchNo || addQty <= 0 || addUnitPrice <= 0 || !addExpDate) {
      alert("Please configure all batch parameters before submitting logistics manifest.");
      return;
    }
    
    onAddStock(addItemId, addBatchNo, addQty, addUnitPrice, addExpDate, addRoom, addZone);
    setAddSuccessMsg(`Logistics verified. Registered ${addQty} units under Batch ${addBatchNo}.`);
    
    // reset
    setAddBatchNo("");
    setAddQty(0);
    setAddUnitPrice(0);
    setAddExpDate("");
    
    setTimeout(() => setAddSuccessMsg(""), 5000);
  };

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispenseItemId || !selectedBatchId || dispenseQty <= 0 || !dispenseReason) {
      alert("Please specify the drug category, batch index, and bedside therapy justification.");
      return;
    }

    const item = inventory.find(it => it.id === dispenseItemId);
    const batch = item?.batches.find(b => b.id === selectedBatchId);
    if (!batch || batch.quantity < dispenseQty) {
      alert(`Critical validation error: Selected batch has only ${batch ? batch.quantity : 0} units available.`);
      return;
    }

    onDispenseStock(dispenseItemId, selectedBatchId, dispenseQty, dispenseReason);
    setDispenseSuccessMsg(`Patient bedside log complete. Deducted ${dispenseQty} units from ledger.`);
    
    // reset
    setDispenseQty(0);
    setDispenseReason("");
    
    setTimeout(() => setDispenseSuccessMsg(""), 5000);
  };

  const selectedItemForDispense = inventory.find(it => it.id === dispenseItemId);

  // Authorization checks
  const isReceiptRoutingAllowed = ["SUPER_ADMIN", "HOSPITAL_ADMIN", "WARD_MANAGER"].includes(userRole);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="stock_router_view">
      
      {/* Tab select menu side (3 columns) */}
      <div className="lg:col-span-3 space-y-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-row lg:flex-col gap-2">
          
          <button
            onClick={() => setActiveTab("DISPENSE")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold font-display transition-all justify-center lg:justify-start ${
              activeTab === "DISPENSE"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MinusCircle size={16} />
            Bedside Dispensation
          </button>

          <button
            onClick={() => setActiveTab("ADD")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-semibold font-display transition-all justify-center lg:justify-start ${
              activeTab === "ADD"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:bg-slate-50"
            }`}
          >
            <PlusCircle size={16} />
            Log Incoming Dock
          </button>

        </div>

        {/* Informative Help block */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-semibold text-xs font-display tracking-wide text-brand-400 uppercase">Cryptographic Parity Control</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            All additions and depletions are instant transaction logs signed by operator keys.
          </p>
          <div className="text-[10px] text-slate-400 border-t border-slate-700/50 pt-2.5 font-mono">
            OPERATOR: <span className="text-white">{userName}</span>
            <br />
            STATUS: <span className="text-emerald-400 font-semibold uppercase">{userRole} AUTHENTICATED</span>
          </div>
        </div>
      </div>

      {/* Primary Forms Space (9 columns) */}
      <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        
        {activeTab === "DISPENSE" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 font-display text-lg">Bedside Dispensation Logistics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Deduct substances as they are administered during surgical therapies or cardiac care.</p>
            </div>

            {dispenseSuccessMsg && (
              <div className="p-4 bg-[#34c759]/10 text-[#34c759] text-xs font-semibold rounded-xl border border-[#34c759]/20 flex items-center gap-2">
                <FileSpreadsheet size={16} />
                {dispenseSuccessMsg}
              </div>
            )}

            <form onSubmit={handleDispenseSubmit} className="space-y-4 text-xs text-slate-705">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Select Substance Item */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-600 block">Substance Name / SKU code</label>
                  <select
                    value={dispenseItemId}
                    onChange={(e) => handleDispenseItemChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs font-sans"
                  >
                    <option value="" disabled>-- Choose Substance --</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.totalQuantity} {item.unit} available)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Batch ID */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-600 block">Cryptographic Batch Trace</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs font-sans"
                  >
                    <option value="">-- Choose Batch --</option>
                    {selectedItemForDispense?.batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        Batch {batch.batchNumber} (Expires {batch.expirationDate} - {batch.quantity} units)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dispensation Quantity */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-600 block">Quantity to Deplete</label>
                  <input
                    type="number"
                    min="1"
                    value={dispenseQty === 0 ? "" : dispenseQty}
                    onChange={(e) => setDispenseQty(parseInt(e.target.value) || 0)}
                    placeholder="Enter unit counts..."
                    className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                  />
                </div>

                {/* Ward location (display only based on chosen user dept or general) */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-600 block">Target Clinical Bedside Ward</label>
                  <input
                    type="text"
                    disabled
                    value={selectedItemForDispense?.shelvingLocation || "General Floor Warehouse"}
                    className="w-full bg-slate-100 text-slate-500 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono"
                  />
                </div>

                {/* Safety stock level for context */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-600 block">Safety Target Threshold</label>
                  <div className="px-4 py-2.5 bg-slate-100 border border-slate-100 rounded-xl text-slate-500 font-semibold font-mono">
                    {selectedItemForDispense?.safetyThreshold || 0} {selectedItemForDispense?.unit}
                  </div>
                </div>
              </div>

              {/* Clinical Intervention Reason */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-600 block">Therapeutic / Clinical Justification</label>
                <input
                  type="text"
                  value={dispenseReason}
                  onChange={(e) => setDispenseReason(e.target.value)}
                  placeholder="e.g. Bedside ICU cardiac failure intervention, bypass prep code RED..."
                  className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Proceed Depletion */}
              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all text-xs font-display flex items-center justify-center gap-2"
              >
                <MinusCircle size={16} />
                Validate Shift Bedside Depletion
              </button>
            </form>
          </div>
        )}

        {activeTab === "ADD" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 font-display text-lg">Log incoming Dock Shipment (Receipt Routing)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verify and document newly arrived medication shipments to precise clinical cold rooms or vaults.</p>
            </div>

            {!isReceiptRoutingAllowed ? (
              <div className="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <KeyRound size={16} className="text-rose-600" />
                  ACCESS BOUNDARY REACHED
                </div>
                <p className="text-xs text-rose-700 leading-normal">
                  Day-to-day Staff are locked out of docking routing operations. Standard hospital safety procedures demand a <strong>Ward Manager</strong> or <strong>Clinics Admin</strong> to physically verify arriving parcels and sign the shipment manifests.
                </p>
              </div>
            ) : (
              <>
                {addSuccessMsg && (
                  <div className="p-4 bg-[#34c759]/10 text-[#34c759] text-xs font-semibold rounded-xl border border-[#34c759]/20 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {addSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddStockSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Item picker */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Substance Index Profile</label>
                      <select
                        value={addItemId}
                        onChange={(e) => setAddItemId(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs text-slate-800"
                      >
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Batch Number */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Incoming Batch Serial Reference</label>
                      <input
                        type="text"
                        value={addBatchNo}
                        onChange={(e) => setAddBatchNo(e.target.value)}
                        placeholder="e.g. B-ATR-8890"
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Quantity Received</label>
                      <input
                        type="number"
                        min="1"
                        value={addQty === 0 ? "" : addQty}
                        onChange={(e) => setAddQty(parseInt(e.target.value) || 0)}
                        placeholder="Units arrived..."
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Registered Vendor Unit Price (RM)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addUnitPrice === 0 ? "" : addUnitPrice}
                        onChange={(e) => setAddUnitPrice(parseFloat(e.target.value) || 0)}
                        placeholder="Price per vial/kit..."
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs font-mono"
                      />
                    </div>

                    {/* Expiration Date */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Batch Expiry Target Schedule</label>
                      <input
                        type="date"
                        value={addExpDate}
                        onChange={(e) => setAddExpDate(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Storage Facility Room */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Storage Room Routing Destination</label>
                      <select
                        value={addRoom}
                        onChange={(e) => setAddRoom(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                      >
                        {allStorageRooms.map((room, i) => (
                          <option key={i} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Zone Details */}
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-600 block">Storage Core Zone Code</label>
                      <input
                        type="text"
                        value={addZone}
                        onChange={(e) => setAddZone(e.target.value)}
                        placeholder="e.g. Zone-E Corridor, Bin 12"
                        className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all text-xs font-display flex items-center justify-center gap-2 mt-4"
                  >
                    <Save size={16} />
                    Register Verified Incoming Shipment Batch
                  </button>
                </form>
              </>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
