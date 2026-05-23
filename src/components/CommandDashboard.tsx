import { useState } from "react";
import { AlertTriangle, Clock, TrendingUp, Inbox, ShieldAlert, Archive, Layers, BarChart3, PieChart } from "lucide-react";
import { InventoryItem, PurchaseOrder, HospitalNode, AuditLog, DepartmentNode } from "../types";

interface CommandDashboardProps {
  inventory: InventoryItem[];
  orders: PurchaseOrder[];
  logs: AuditLog[];
  currentHospital: HospitalNode;
  departments: DepartmentNode[];
}

export default function CommandDashboard({
  inventory,
  orders,
  logs,
  currentHospital,
  departments
}: CommandDashboardProps) {
  // Analytical Calculations
  const depletedStocks = inventory.filter((item) => item.totalQuantity <= item.safetyThreshold);
  const totalAssetsValue = inventory.reduce((acc, item) => {
    const itemCost = item.batches.reduce((sum, b) => sum + b.quantity * b.pricePerUnit, 0);
    return acc + itemCost;
  }, 0);

  // Department-wise aggregations
  const departmentData = (departments || []).map((dept) => {
    const deptItems = inventory.filter((item) => dept.storageRooms.includes(item.storageZone));
    const totalUnitsInDept = deptItems.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalValueInDept = deptItems.reduce((sum, item) => {
      return sum + item.batches.reduce((bSum, b) => bSum + b.quantity * b.pricePerUnit, 0);
    }, 0);

    return {
      name: dept.name,
      totalUnits: totalUnitsInDept,
      totalValue: totalValueInDept,
    };
  });

  // Calculate generic unassigned / central supply items
  const assignedRooms = (departments || []).flatMap((d) => d.storageRooms);
  const unassignedItems = inventory.filter((item) => !assignedRooms.includes(item.storageZone));
  const totalUnitsUnassigned = unassignedItems.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalValueUnassigned = unassignedItems.reduce((sum, item) => {
    return sum + item.batches.reduce((bSum, b) => bSum + b.quantity * b.pricePerUnit, 0);
  }, 0);

  if (totalUnitsUnassigned > 0 || unassignedItems.length > 0) {
    departmentData.push({
      name: "Central Supply",
      totalUnits: totalUnitsUnassigned,
      totalValue: totalValueUnassigned,
    });
  }

  const maxDeptUnits = Math.max(1, ...departmentData.map((d) => d.totalUnits));

  // Expiration limits (let's detect any batch expiring within 90 days of 2026-05-22)
  const currentDate = new Date("2026-05-22");
  const upcomingExpirations = inventory.flatMap((item) => {
    return item.batches
      .filter((batch) => {
        const expDate = new Date(batch.expirationDate);
        const diffTime = expDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 120; // 4 months
      })
      .map((batch) => {
        const expDate = new Date(batch.expirationDate);
        const diffDays = Math.ceil((expDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          itemName: item.name,
          sku: item.sku,
          batchNumber: batch.batchNumber,
          expirationDate: batch.expirationDate,
          quantity: batch.quantity,
          daysRemaining: diffDays,
          category: item.category
        };
      });
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Storage utilization (mock calculation mapped to quota)
  const totalUnits = inventory.reduce((acc, item) => acc + item.totalQuantity, 0);
  const storagePercentage = Math.min(Math.round((totalUnits / currentHospital.storageQuota) * 100), 100);

  // High velocity action checks
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6" id="command_dashboard_view">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 font-display">Clinical Command Engine</h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time logistical telemetries for isolated medical node: <span className="font-semibold text-brand-600">{currentHospital.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-brand-50 px-4 py-2 rounded-xl text-brand-700 text-xs font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          NODE SYNCED: 0.003s LATENCY
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Assets Value */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 bg-[#007aff] w-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Node Appraisal</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">
                RM {totalAssetsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 bg-[#f0f7ff] rounded-xl text-[#007aff]">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Quota Limit: RM {currentHospital.assetValueLimit.toLocaleString()}</span>
            <span className="font-semibold text-emerald-600">
              {Math.min(100, Math.round((totalAssetsValue / currentHospital.assetValueLimit) * 100))}% used
            </span>
          </div>
        </div>

        {/* Depleted Stocks Counter */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 bg-[#ff3b30] w-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Depleted Stocks</p>
              <h3 className="text-2xl font-bold text-[#ff3b30] font-display mt-2">
                {depletedStocks.length} <span className="text-sm font-normal text-slate-400">items</span>
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${depletedStocks.length > 0 ? "bg-[#ff3b30]/10 text-[#ff3b30] animate-pulse" : "bg-slate-50 text-slate-400"}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4 text-xs">
            {depletedStocks.length > 0 ? (
              <span className="font-semibold text-[#ff3b30] bg-[#ff3b30]/5 px-2 py-0.5 rounded-md">Requires emergency procurement manifest</span>
            ) : (
              <span className="text-[#34c759] font-semibold bg-[#34c759]/5 px-2 py-0.5 rounded-md">All substances above safety buffer</span>
            )}
          </div>
        </div>

        {/* Upcoming Expirations */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 bg-[#ff9500] w-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Critical Expirations</p>
              <h3 className="text-2xl font-bold text-[#ff9500] font-display mt-2">
                {upcomingExpirations.length} <span className="text-sm font-normal text-slate-400">batches</span>
              </h3>
            </div>
            <div className="p-2.5 bg-[#ff9500]/10 text-[#ff9500] rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            {upcomingExpirations.length > 0 ? (
              <span>Nearest expiration: <strong className="text-[#ff9500]">{upcomingExpirations[0].daysRemaining} days</strong></span>
            ) : (
              <span className="text-[#34c759] font-medium">No batch expires within 120 days</span>
            )}
          </div>
        </div>

        {/* Storage Load Capacity */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-1 bg-[#34c759] w-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Physical Storage Load</p>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-2">
                {storagePercentage}% <span className="text-xs font-normal text-slate-400">({totalUnits} units)</span>
              </h3>
            </div>
            <div className="p-2.5 bg-[#34c759]/10 text-[#34c759] rounded-xl">
              <Archive size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500`}
                style={{ 
                  width: `${storagePercentage}%`,
                  backgroundColor: storagePercentage > 85 ? "#ff3b30" : storagePercentage > 60 ? "#ff9500" : "#34c759"
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Visual Logistics Graph & Expiries */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vector Chart Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-semibold text-slate-800 font-display text-base flex items-center gap-2">
                  <BarChart3 className="text-brand-500" size={18} />
                  Operational Logistics Allocation Index
                </h3>
                <p className="text-xs text-slate-500">Real-time consolidated logistical status mapping per category and department</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold bg-brand-50/50 px-3 py-1.5 rounded-xl border border-brand-100/30">
                <TrendingUp size={14} /> Global ledger parity verified
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-slate-100">
              
              {/* Category Graph Element */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">BY CATEGORY SPECTRUM</span>
                  <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-semibold font-mono">5 Groups Mapped</span>
                </div>
                
                {/* Visual Bar Chart for Categories */}
                <div className="h-56 flex flex-col justify-end pt-4">
                  <div className="flex-1 flex items-end justify-around gap-2 pb-2 border-b border-slate-100">
                    {["Vessel Dilators", "Critical Antidotes", "Oxygen Concentrators", "Surgical Apparatus", "General Pharamceuticals"].map((cat) => {
                      const filtered = inventory.filter((item) => item.category === cat);
                      const count = filtered.reduce((sum, item) => sum + item.totalQuantity, 0);
                      const totalVal = filtered.reduce((sum, item) => {
                        return sum + item.batches.reduce((bSum, b) => bSum + b.quantity * b.pricePerUnit, 0);
                      }, 0);
                      const maxPossible = Math.max(1, ...["Vessel Dilators", "Critical Antidotes", "Oxygen Concentrators", "Surgical Apparatus", "General Pharamceuticals"].map(c => 
                        inventory.filter(it => it.category === c).reduce((sum, it) => sum + it.totalQuantity, 0)
                      ));
                      const percentage = Math.max(8, Math.round((count / maxPossible) * 100));

                      return (
                        <div key={cat} className="flex flex-col items-center flex-1 group relative">
                          {/* Real holding inventory units count stated directly above the bar */}
                          <span className="text-[10px] font-bold font-mono text-slate-700 mb-1 animate-fade-in">
                            {count}
                          </span>
                          <div className="relative w-full flex justify-center">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none font-mono z-20 min-w-[130px] text-center">
                              <p className="font-bold border-b border-white/10 pb-1 mb-1 text-slate-100">{cat}</p>
                              <p className="text-slate-300">Volume: {count} units</p>
                              <p className="text-amber-400 font-semibold mt-0.5">RM {totalVal.toLocaleString()}</p>
                            </div>
                            <div 
                              className="w-8 sm:w-10 rounded-t bg-brand-600 group-hover:bg-brand-500 transition-all duration-300 shadow-xs"
                              style={{ height: `${percentage * 1.1}px` }}
                            ></div>
                          </div>
                          {/* Short identifier label */}
                          <span className="text-[9px] text-slate-400 mt-2 text-center line-clamp-1 w-full font-medium" title={cat}>
                            {cat.replace("General ", "")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1.5 font-mono">
                    <span>0 Units</span>
                    <span>Substance Stocking Ratio</span>
                  </div>
                </div>
              </div>

              {/* Department Graph Element */}
              <div className="space-y-4 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">BY CLINICAL DEPARTMENT</span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold font-mono">
                    {departmentData.length} Wards Active
                  </span>
                </div>

                {/* Visual Bar Chart for Departments */}
                <div className="h-56 flex flex-col justify-end pt-4">
                  <div className="flex-1 flex items-end justify-around gap-2 pb-2 border-b border-slate-100">
                    {departmentData.map((dept) => {
                      const percentage = Math.max(8, Math.round((dept.totalUnits / maxDeptUnits) * 100));

                      return (
                        <div key={dept.name} className="flex flex-col items-center flex-1 group relative">
                          {/* Real holding inventory units count stated directly above the bar */}
                          <span className="text-[10px] font-bold font-mono text-slate-700 mb-1 animate-fade-in">
                            {dept.totalUnits}
                          </span>
                          <div className="relative w-full flex justify-center">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none font-mono z-20 min-w-[130px] text-center">
                              <p className="font-bold border-b border-white/10 pb-1 mb-1 text-slate-100">{dept.name}</p>
                              <p className="text-slate-300">Volume: {dept.totalUnits} units</p>
                              <p className="text-indigo-300 font-semibold mt-0.5">RM {dept.totalValue.toLocaleString()}</p>
                            </div>
                            <div 
                              className="w-8 sm:w-10 rounded-t bg-indigo-600 group-hover:bg-indigo-50 transition-all duration-300 shadow-xs"
                              style={{ height: `${percentage * 1.1}px` }}
                            ></div>
                          </div>
                          {/* Short identifier label */}
                          <span className="text-[9px] text-slate-400 mt-2 text-center line-clamp-1 w-full font-medium" title={dept.name}>
                            {dept.name.replace(" Clinical", "").replace(" Care Unit", "").replace(" Unit", "")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1.5 font-mono">
                    <span>0 Units</span>
                    <span>Departmental Holding Ratio</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Expiration warning shelf */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 font-display mb-3 flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500 animate-pulse" />
              Deposition Expiration Alert Index
            </h3>
            <p className="text-xs text-slate-500 mb-4">Chemical batches expiring within 120 days. Immediate release or disposal recommended.</p>
            
            {upcomingExpirations.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-sm">
                No active substance batches are expiring soon. Good standing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-mono text-slate-400">
                      <th className="pb-2 font-medium">Substance Base</th>
                      <th className="pb-2 font-medium">Batch ID</th>
                      <th className="pb-2 font-medium text-right">Units</th>
                      <th className="pb-2 font-medium text-right">Countdown</th>
                      <th className="pb-2 font-medium text-right">Action Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {upcomingExpirations.map((exp, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-medium text-slate-700">
                          <div>
                            {exp.itemName}
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{exp.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 font-mono">{exp.batchNumber}</td>
                        <td className="py-3 text-right text-slate-600 font-semibold">{exp.quantity}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-mono inline-block ${
                            exp.daysRemaining <= 10 
                              ? "bg-[#ff3b30]/15 text-[#ff3b30] animate-pulse" 
                              : exp.daysRemaining <= 30 
                              ? "bg-[#ff9500]/15 text-[#ff9500] font-semibold" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {exp.daysRemaining} days left
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {exp.daysRemaining <= 30 ? (
                            <span className="text-[#ff3b30] font-semibold uppercase text-[9px] tracking-wider animate-pulse">Disposal / PO Needed</span>
                          ) : (
                            <span className="text-[#ff9500] font-medium text-[10px] bg-[#ff9500]/10 px-1.5 py-0.5 rounded">Priority Shift use</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Real-time logistics ledger log flow */}
        <div className="space-y-6">
          
          {/* Active Orders List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 font-display mb-3">Clinical Procurement Line</h3>
            <p className="text-xs text-slate-500 mb-4">Active multi-item purchase manifestations currently routed</p>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No active purchase manifestations routed.
                </div>
              ) : (
                orders.map((po) => (
                  <div key={po.id} className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-brand-600 font-semibold">{po.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider uppercase ${
                        po.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : po.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-600"
                      }`}>
                        {po.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-slate-700 font-medium">
                        {po.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                        <span>Valuation: RM{po.totalValuation.toLocaleString()}</span>
                        <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Core Recent Audited Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 font-display mb-1 text-sm">Logistics Action Footprints</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-normal">Direct decentralised logs synced to clinical node vertexes</p>

            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* Dot */}
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white shadow-sm"></span>
                  <div className="flex justify-between items-start text-slate-400 text-[10px] font-mono">
                    <span>{log.userName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="font-medium text-slate-700 mt-0.5 text-[11px]">
                    {log.action}
                  </p>
                  <p className="text-slate-500 mt-1 line-clamp-2 text-[10px]">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
