import React, { useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, RefreshCcw, Save, ShieldCheck, LineChart, FileText } from "lucide-react";
import { MarketRate, AccessRole, InventoryItem } from "../types";

interface MarketAnalyzerProps {
  rates: MarketRate[];
  inventory: InventoryItem[];
  userRole: AccessRole;
  onUpdateRate: (rateId: string, newRate: number) => void;
  onCreatePO: (items: any[]) => void;
}

export default function MarketAnalyzer({
  rates,
  inventory,
  userRole,
  onUpdateRate,
  onCreatePO
}: MarketAnalyzerProps) {
  const [selectedRateId, setSelectedRateId] = useState("");
  const [newRateValue, setNewRateValue] = useState<number>(0);
  const [rateSuccessMsg, setRateSuccessMsg] = useState("");
  const [autoPOMsg, setAutoPOMsg] = useState("");

  const handleRateSelectChange = (id: string) => {
    setSelectedRateId(id);
    const rate = rates.find((r) => r.id === id);
    if (rate) {
      setNewRateValue(rate.currentRate);
    }
  };

  const handleUpdateRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRateId || newRateValue <= 0) return;

    onUpdateRate(selectedRateId, newRateValue);
    setRateSuccessMsg("Vendor rate successfully modulated. Market index synchronized!");
    setSelectedRateId("");
    setNewRateValue(0);

    setTimeout(() => setRateSuccessMsg(""), 5000);
  };

  // Automated proposals generator based on depleted stocks mapping to lowest rate vendors
  const depletedStocks = inventory.filter((item) => item.totalQuantity <= item.safetyThreshold);
  
  const automatedProposals = depletedStocks.map((item) => {
    // Find matching rate
    const matchingRate = rates.find((r) => r.category === item.category) || rates[0];
    const recommendedQty = item.safetyThreshold * 2;
    return {
      itemId: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      recommendedQty,
      vendorName: matchingRate.vendorName,
      unitCost: matchingRate.currentRate,
      totalCost: recommendedQty * matchingRate.currentRate
    };
  });

  const handleExecuteAutoPO = (proposal: any) => {
    onCreatePO([
      {
        itemId: proposal.itemId,
        name: proposal.name,
        quantity: proposal.recommendedQty,
        estimatedUnitPrice: proposal.unitCost
      }
    ]);
    setAutoPOMsg(`Automated manifest successfully generated for ${proposal.recommendedQty}x ${proposal.name}.`);
    setTimeout(() => setAutoPOMsg(""), 5050);
  };

  const isRateAdjustmentAllowed = userRole === "SUPER_ADMIN" || userRole === "HOSPITAL_ADMIN";

  // Volatility spikes alert (+12% or higher)
  const highVarianceAlerts = rates.filter(r => r.variancePercentage >= 12.0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="market_analysis_view">
      
      {/* Top Banner Alert if high variance exists */}
      {highVarianceAlerts.length > 0 && (
        <div className="lg:col-span-12 bg-rose-50 border border-rose-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <AlertCircle size={20} />
            </span>
            <div>
              <h4 className="font-semibold text-rose-950 text-xs font-display flex items-center gap-1.5">
                CRITICAL VOLATILITY NOTICE Index Spark
              </h4>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Vendor pricing spikes identified on global distribution lines. {highVarianceAlerts.map(h => `${h.name} (+${h.variancePercentage}% variance)`).join(", ")}.
              </p>
            </div>
          </div>
          <div className="text-[10px] bg-rose-600 text-white font-semibold font-mono px-3 py-1.5 rounded-xl self-start sm:self-center">
            STRICT ACQUISITION LOCK SUGGESTED
          </div>
        </div>
      )}

      {/* Aggregated Vendor Rates Indices List (7 Columns) */}
      <div className="lg:col-span-7 space-y-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 font-display">Aggregated Global Vendor Matrix</h3>
            <p className="text-xs text-slate-500">Live vendor base rate indexing mapped from procurement agreements</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
            <RefreshCcw size={12} /> Sync complete
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-150">
                <tr>
                  <th className="p-3.5 font-medium">Substance Index / Provider</th>
                  <th className="p-3.5 font-medium text-right">Prior Base</th>
                  <th className="p-3.5 font-medium text-right">Current Index</th>
                  <th className="p-3.5 font-medium text-center">Variance Alert</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-705">
                {rates.map((rate) => {
                  const isPositive = rate.variancePercentage > 0;
                  const isHigh = rate.volatilityStatus === "HIGH";

                  return (
                    <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-medium text-slate-900">{rate.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rate.vendorName}</div>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        RM{rate.previousRate.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-semibold text-slate-800">
                        RM{rate.currentRate.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        {rate.variancePercentage === 0 ? (
                          <span className="font-mono text-slate-400 text-[11px] font-semibold">0.0%</span>
                        ) : (
                          <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-bold ${
                            isPositive ? "text-[#ff3b30] bg-[#ff3b30]/10 px-1.5 py-0.5 rounded" : "text-[#34c759] bg-[#34c759]/10 px-1.5 py-0.5 rounded"
                          }`}>
                            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {isPositive ? "+" : ""}{rate.variancePercentage.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          isHigh 
                            ? "bg-[#ff3b30]/10 text-[#ff3b30] animate-pulse border border-[#ff3b30]/20" 
                            : rate.volatilityStatus === "STABLE" 
                            ? "bg-slate-100 text-slate-600" 
                            : "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                        }`}>
                          {rate.volatilityStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fluctuations Mini Graphic Area */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-800 font-display text-xs flex items-center gap-1.5">
            <LineChart size={14} className="text-brand-600" />
            Active Index Variance (60-Day Aggregation)
          </h4>
          <p className="text-[11px] text-slate-500">Pricing volatility indices mapped on standard delivery nodes.</p>
          
          <div className="h-28 flex items-end justify-between gap-2 pt-6 border-b border-rose-50/50">
            {[45, 48, 42, 54, 49, 58, 62, 55, 66, 74].map((point, i) => {
              const max = 80;
              const heightPct = Math.round((point / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none font-mono">
                    RM{point}
                  </div>
                  <div 
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      i === 9 ? "bg-[#ff3b30] animate-pulse" : "bg-[#007aff] group-hover:bg-[#0062cc]"
                    }`}
                    style={{ height: `${heightPct * 0.8}px` }}
                  ></div>
                  <span className="text-[8px] font-mono text-slate-400 mt-1">May {10+i}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Side: Interactive proposals panel & Modifiers (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Modifiers exclusive to Hospital Admin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 font-display text-sm">Modify Vendor Contract Rates</h3>
            <p className="text-[11px] text-slate-500">Lock regional vendor agreement rates on clinical ledgers.</p>
          </div>

          {!isRateAdjustmentAllowed ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-800">
                <ShieldCheck size={14} className="text-amber-600" />
                READ-ONLY LEDGER SPECIFIED
              </div>
              <p className="text-[10px] text-amber-700 leading-normal">
                Only the hospital's chief <strong>Hospital Administrator</strong> is authorized to adjust base vendor rates to reflect regional contract pricing adjustments.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateRateSubmit} className="space-y-4 text-xs">
              {rateSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 font-medium rounded-xl border border-emerald-100">
                  {rateSuccessMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-semibold text-slate-600 block">Agreed Substance Index</label>
                <select
                  value={selectedRateId}
                  onChange={(e) => handleRateSelectChange(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-3 py-2 outline-none font-sans"
                >
                  <option value="">-- Choose Substance Rate --</option>
                  {rates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (RM{r.currentRate.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRateId && (
                <div className="space-y-2 animate-fade-in">
                  <label className="font-semibold text-slate-600 block">New Contractual Rate Value (RM)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={newRateValue}
                      onChange={(e) => setNewRateValue(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-slate-50 text-slate-850 border border-slate-100 rounded-xl px-3 py-2 outline-none font-mono font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 rounded-xl text-xs font-display flex items-center justify-center gap-1"
                    >
                      <Save size={13} /> Synchronize
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

        </div>

        {/* Dynamic Auto Procurement Proposals (Always generated based on depleted quantities) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 font-display text-sm">Automated Refill Proposals</h3>
            <p className="text-[11px] text-slate-500">Automatic acquisition recommendations targeting critically low stock buffers.</p>
          </div>

          {autoPOMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 font-medium rounded-xl border border-emerald-100 text-xs">
              {autoPOMsg}
            </div>
          )}

          <div className="space-y-3">
            {automatedProposals.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                All inventory levels remain within safe bounds. Refill protocols resting.
              </div>
            ) : (
              automatedProposals.map((prop, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors text-xs space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{prop.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Procuring via: {prop.vendorName}</p>
                    </div>
                    <span className="text-right font-mono text-slate-600 block">
                      RM{prop.unitCost.toFixed(2)}/u
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-650 bg-white/80 p-2 rounded-lg border border-slate-100/50">
                    <span>Suggested manifest units: <strong>{prop.recommendedQty} {prop.unit}</strong></span>
                    <strong className="text-brand-600 font-mono">RM{prop.totalCost.toLocaleString()}</strong>
                  </div>

                  {userRole !== "STAFF" ? (
                    <button
                      onClick={() => handleExecuteAutoPO(prop)}
                      className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-1.5 px-3 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Emit Automated PO release
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 text-center font-mono mt-1 block">
                      Awaiting Ward Manager action release...
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
