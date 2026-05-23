import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, KeyRound, Cpu, Terminal, ArrowRight, Activity } from "lucide-react";
import { UserOperator } from "../types";

interface AuthPageProps {
  operators: UserOperator[];
  onLogin: (op: UserOperator) => void;
}

export default function AuthPage({ operators, onLogin }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Mock password
  const [errorMsg, setErrorMsg] = useState("");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please provide your medical node key identifier or email.");
      return;
    }

    const matchedOp = operators.find((op) => op.email.toLowerCase() === email.trim().toLowerCase());
    
    if (matchedOp) {
      if (matchedOp.status === "REVOKED") {
        setErrorMsg("Safety Warning: This operator status is REVOKED. Access signature denied.");
        return;
      }
      onLogin(matchedOp);
    } else {
      setErrorMsg("Security signature mismatch: Operator node not registered.");
    }
  };

  const handleQuickLogin = (op: UserOperator) => {
    if (op.status === "REVOKED") {
      setErrorMsg(`Access denied: Operator ${op.name} is currently flagged as REVOKED.`);
      return;
    }
    onLogin(op);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" id="cuerack_login_page">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative">
        
        {/* Left Side: Brand presentation (5 Columns) */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-700 via-brand-600 to-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle design matrix background accent */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="flex items-center gap-2 relative z-10">
            <Activity className="text-white animate-pulse" size={24} />
            <span className="font-semibold text-lg font-display tracking-tight">CureRack.my</span>
          </div>

          <div className="space-y-4 relative z-10 py-10 md:py-0">
            <h1 className="text-2xl font-bold font-display leading-tight">
              Clinical Logistics & Ledger Sync
            </h1>
            <p className="text-xs text-brand-100 leading-relaxed font-normal">
              A sophisticated, multi-tenant inventory platform designing safety thresholds, decentralized logistics routing, and medical transaction parity.
            </p>
          </div>

          <div className="text-[10px] text-brand-200/80 font-mono relative z-10 border-t border-brand-500/30 pt-3">
            VER: CORE v4.12
            <br />
            INFRASTRUCTURE STATUS: SYNCED
          </div>
        </div>

        {/* Right Side: Logins (7 Columns) */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 font-display">Cryptographic Gatekeeper</h2>
            <p className="text-slate-400 text-xs">Verify your operator key signatures to mount ledger workspaces.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-shake">
              <ShieldAlert size={16} className="text-rose-600" />
              {errorMsg}
            </div>
          )}

          {/* Core Credentials Login Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5 text-xs text-slate-650">
              <label htmlFor="login_email" className="font-semibold">Operator Email Address</label>
              <input
                id="login_email"
                type="email"
                placeholder="e.g. root@cuerack.my"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white text-xs text-slate-800 transition-all text-sans"
              />
            </div>

            <div className="space-y-1.5 text-xs text-slate-650">
              <label htmlFor="login_pass" className="font-semibold">Simulated Password Key</label>
              <input
                id="login_pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white text-xs transition-all text-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm transition-all text-xs font-display flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Mount System Workspace <ArrowRight size={14} />
            </button>
          </form>

          {/* Fast Switchers/Quick Entry Points matrix */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider uppercase block">
              Emergency Clinical Handshake Roles
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              {operators.map((op) => {
                let badgeText = "";
                let style = "";
                if (op.role === "SUPER_ADMIN") {
                  badgeText = "🛡️ SUPER_ADMIN";
                  style = "hover:border-slate-800 hover:bg-slate-900 hover:text-white";
                } else if (op.role === "HOSPITAL_ADMIN") {
                  badgeText = "🏥 HOSPITAL_ADMIN";
                  style = "hover:border-slate-400 hover:bg-slate-50";
                } else if (op.role === "WARD_MANAGER") {
                  badgeText = "📋 WARD_MANAGER";
                  style = "hover:border-slate-400 hover:bg-slate-50";
                } else {
                  badgeText = "🧑⚕️ STAFF";
                  style = "hover:border-slate-400 hover:bg-slate-50";
                }

                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleQuickLogin(op)}
                    className={`p-3 border border-slate-100 rounded-xl text-left bg-white transition-all text-xs flex flex-col justify-between gap-1.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-xs group ${style}`}
                  >
                    <div>
                      <span className="text-[9px] font-bold font-mono text-brand-600 group-hover:text-amber-500 transition-colors uppercase block">
                        {badgeText}
                      </span>
                      <strong className="text-slate-800 font-semibold group-hover:text-inherit block line-clamp-1 mt-0.5">
                        {op.name}
                      </strong>
                    </div>
                    <span className="text-[9px] text-slate-400 group-hover:text-inherit/80 block font-mono truncate">
                      {op.email}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
