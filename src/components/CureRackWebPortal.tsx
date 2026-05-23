import React, { useState, FormEvent } from "react";
import { 
  Activity, 
  ArrowRight, 
  Building, 
  Layers, 
  PlusCircle, 
  ShoppingBag, 
  TrendingUp, 
  History, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  FileText, 
  Coins, 
  FileCheck, 
  CornerDownRight, 
  Info, 
  Plus, 
  MinusCircle, 
  ChevronRight, 
  Flame, 
  MapPin, 
  Search,
  BookOpen,
  Monitor,
  HeartPulse,
  Workflow,
  Globe,
  Mail,
  Phone,
  Check,
  Zap,
  Radio,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NetworkBackground from "./NetworkBackground";
import CureRackPersonalPortal from "./CureRackPersonalPortal";

interface CureRackWebPortalProps {
  onLaunchApp: () => void;
  activeHospitalName: string;
}

export default function CureRackWebPortal({ onLaunchApp, activeHospitalName }: CureRackWebPortalProps) {
  const [activePortalView, setActivePortalView] = useState<"presentation" | "market" | "suppliers" | "docs">("presentation");
  const [portalMode, setPortalMode] = useState<"enterprise" | "personal">("enterprise");
  // Shared state for the Personal tab so header actions can launch Personal System Console
  const [personalTab, setPersonalTab] = useState<"landing" | "pharmacy" | "console" | "dashboard">("landing");
  const [selectedFlowStep, setSelectedFlowStep] = useState<number>(1);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [marketSearchQuery, setMarketSearchQuery] = useState("");
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string>("All");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  
  // Subscription Form States
  const [subscriptionTier, setSubscriptionTier] = useState<"standard" | "professional" | "national">("professional");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    hospitalName: "",
    clusterNodes: "2",
    additionalMessage: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Pricing Calculator States according to clinical scale & setup requirements
  const [calcScale, setCalcScale] = useState<"clinic" | "hospital">("hospital");
  const [calcDepartments, setCalcDepartments] = useState<number>(8);
  const [calcUsers, setCalcUsers] = useState<number>(35);

  const handleScaleChange = (scale: "clinic" | "hospital") => {
    setCalcScale(scale);
    if (scale === "clinic") {
      setCalcDepartments(2);
      setCalcUsers(6);
      setFormData(prev => ({ ...prev, clusterNodes: "1" }));
    } else {
      setCalcDepartments(8);
      setCalcUsers(35);
      setFormData(prev => ({ ...prev, clusterNodes: "5" }));
    }
  };

  // Flow steps for the interactive visual diagram
  const flowSteps = [
    {
      step: 1,
      title: "1. Market Index Tracking",
      icon: TrendingUp,
      role: "HOSPITAL_ADMIN",
      desc: "Administrators monitor price fluctuations, mark volatility thresholds, and observe price points relative to past benchmarks.",
      outcome: "Identifies optimal stocking windows for critical substance categories.",
      highlightColor: "text-amber-500 bg-amber-50 border-amber-200",
      pillBg: "bg-amber-100 text-amber-800"
    },
    {
      step: 2,
      title: "2. Draft Proposals & POs",
      icon: FileText,
      role: "STAFF / ADMIN",
      desc: "Operators compile substance requirements based on depleted buffers and draft formal Purchase Orders specifying quantities & pricing.",
      outcome: "Places the procurement request into an isolated pending queue.",
      highlightColor: "text-blue-500 bg-blue-50 border-blue-200",
      pillBg: "bg-blue-100 text-blue-800"
    },
    {
      step: 3,
      title: "3. Procurement Signature",
      icon: FileCheck,
      role: "HOSPITAL_ADMIN / SUPER_ADMIN",
      desc: "Higher-tier authorities review the draft files, release funds protocol, and sign the PO order to authorize logistics.",
      outcome: "Approved items are automatically ingested into warehouse stocks as a fresh batch.",
      highlightColor: "text-emerald-500 bg-emerald-50 border-emerald-200",
      pillBg: "bg-emerald-100 text-emerald-800"
    },
    {
      step: 4,
      title: "4. Shelf Coordinates Ingestion",
      icon: Layers,
      role: "STAFF / ADMIN",
      desc: "Incoming dock stock batches are indexed with unique numbers, expiration metrics, shelf coordinates, and safety buffer parameters.",
      outcome: "Secures inventory status in the live physical ledger grid.",
      highlightColor: "text-indigo-500 bg-indigo-50 border-indigo-200",
      pillBg: "bg-indigo-100 text-indigo-800"
    },
    {
      step: 5,
      title: "5. Bedside Consumption",
      icon: PlusCircle,
      role: "STAFF",
      desc: "Clinical operators dispatch material directly to units or bedside patients, recording clinical rationales for diagnostic checks.",
      outcome: "Recalculates ledger quantities instantly, triggering caution states if levels drop below buffers.",
      highlightColor: "text-rose-500 bg-rose-50 border-rose-200",
      pillBg: "bg-rose-100 text-rose-800"
    }
  ];

  // Documentation sections array
  const docSections = [
    {
      id: "intro",
      title: "1. CureRack System Architecture",
      category: "Getting Started",
      content: "CureRack.my is a military-grade clinical inventory and decentralized routing ledger built to prevent medication shortages. Designed under a modular design paradigm, the platform models multi-tenancy configurations where each physical hospital acts as an isolated cluster node. Administrative keys restrict read/write boundaries, while clinical operators secure precise cold-chain shelf coordinates. This eliminates human transcription gaps and safeguards critical emergency buffer caches from uncoordinated depletion."
    },
    {
      id: "roles",
      title: "2. User Actor Roles & Authorization Matrix",
      category: "Security & Access",
      content: "The system enforces clear separation of concerns across three authenticated tiers: \n\n• SYSTEM SUPER ADMIN: Full master workspace visibility. Oversees network nodes, provisions physical hospital locations, creates custom clinical wards, and alters structural operator statuses.\n• FACILITY WORKSPACE ADMIN: Manages isolated hospital inventory buffers, approves drafted Purchase Orders, signs off procurement valuations, and updates local market rates.\n• CLINICAL STAFF OPERATOR: Performs daily bedside patient dispensations, records diagnostic justification rationales, routes incoming dock shipments to coordinates, and drafts PO requests."
    },
    {
      id: "buffers",
      title: "3. Safe Storage Ledger & Expiration Vigilance",
      category: "Ledger",
      content: "Every inventory pharmaceutical item is tracked down to custom serial batches under an isolated database. If the aggregate available volume is less than or equal to the Safety Threshold buffer, the system triggers a flashing 'DEPLETED BUFFER' warning state across the workspace. Medical personnel are immediately notified to queue up POs. Items are sorted automatically by the earliest expiring batches on top, enabling strict First-Expiry, First-Out (FEFO) warehouse compliance."
    },
    {
      id: "procurement",
      title: "4. Autonomous Acquisition Pipeline",
      category: "Procurement",
      content: "Acquisition steps follow a strict cryptographically-logged trail: first, the operator monitors the Market Analysis index for price shifts. High price volatility is flagged with status badges. Clicking 'Draft Order' prompts a smart ledger compilation where the user specifies units. Once saved, the PO enters a 'PENDING' queue. Hospital Administrators inspect the valuation proposal. Approving the proposal automatically triggers a ledger write, instantly spawning dynamic new storage batches inside the inventory without manual re-entry."
    },
    {
      id: "audit",
      title: "5. Operational Telemetry & Sealed Audit Logs",
      category: "Compliance",
      content: "Every single change, login, PO approval, and dispensation triggers a structured operations log print. These logs record timestamps, precise user profiles, facility indicators, and technical details (such as 'Release protocol initialized for procurement PO-8833'). Under regulatory cold-chain standards, these logs cannot be manipulated, though Super Admins can securely stamp a signature ledger reset to clear old cycles."
    }
  ];

  // Comprehensive Live Market Medicines & Equipment Index (MYR Currencies)
  const marketItems = [
    // Vessel Dilators
    { id: "m1", name: "Glyceryl Trinitrate (GTN) 50mg Injection", category: "Vessel Dilators", unit: "Ampoules (10s)", marketPrice: 420.00, volume: "12,400 daily", trend: "stable", prevPrice: 420.00 },
    { id: "m2", name: "Sodium Nitroprusside 50mg Injection", category: "Vessel Dilators", unit: "Vials (5s)", marketPrice: 385.00, volume: "3,110 daily", trend: "up", prevPrice: 340.00 },
    { id: "m3", name: "Hydralazine Hydrochloride 20mg/ml", category: "Vessel Dilators", unit: "Vials (10s)", marketPrice: 195.50, volume: "6,400 daily", trend: "down", prevPrice: 212.00 },
    { id: "m4", name: "Nicardipine HCl 10mg/10ml Injection", category: "Vessel Dilators", unit: "Ampoules (5s)", marketPrice: 510.00, volume: "2,200 daily", trend: "stable", prevPrice: 510.00 },

    // Critical Antidotes
    { id: "m5", name: "Naloxone Hydrochloride 0.4mg/ml Ampoules", category: "Critical Antidotes", unit: "Box of 10", marketPrice: 165.00, volume: "8,950 daily", trend: "up", prevPrice: 145.00 },
    { id: "m6", name: "Atropine Sulfate 1mg/ml Injection", category: "Critical Antidotes", unit: "Box of 20", marketPrice: 75.00, volume: "22,500 daily", trend: "stable", prevPrice: 75.00 },
    { id: "m7", name: "Acetylcysteine 200mg/ml Infusion (Parvolex)", category: "Critical Antidotes", unit: "Box of 10 vials", marketPrice: 620.00, volume: "1,450 daily", trend: "stable", prevPrice: 620.00 },
    { id: "m8", name: "Flumazenil 0.1mg/ml Injection", category: "Critical Antidotes", unit: "Ampoules (5s)", marketPrice: 315.00, volume: "980 daily", trend: "down", prevPrice: 330.00 },

    // Oxygen Concentrators
    { id: "m9", name: "Medical Grade Oxygen Concentrator (10L/min High Flow)", category: "Oxygen Concentrators", unit: "Per Unit", marketPrice: 4850.00, volume: "320 daily", trend: "up", prevPrice: 4620.00 },
    { id: "m10", name: "Portable Oxygen Concentrator (Continuous Flow 3L/min)", category: "Oxygen Concentrators", unit: "Per Unit", marketPrice: 6200.00, volume: "180 daily", trend: "stable", prevPrice: 6200.00 },
    { id: "m11", name: "Oxygen Pressure Regulator with Flowmeter", category: "Oxygen Concentrators", unit: "Per Set", marketPrice: 420.00, volume: "1,500 daily", trend: "stable", prevPrice: 420.00 },
    { id: "m12", name: "Clinical Liquid Oxygen Cryogenic Tank Cylinder", category: "Oxygen Concentrators", unit: "Per Cylinder", marketPrice: 1250.00, volume: "450 daily", trend: "up", prevPrice: 1150.00 },

    // Surgical Apparatus
    { id: "m13", name: "Premium Absorbable Suture, Vicryl 3-0 Focus Grid", category: "Surgical Apparatus", unit: "Box of 36", marketPrice: 285.00, volume: "45,000 daily", trend: "stable", prevPrice: 285.00 },
    { id: "m14", name: "Disposable Surgical Scalpel Stainless Steel Blades #11", category: "Surgical Apparatus", unit: "Box of 100", marketPrice: 110.00, volume: "85,000 daily", trend: "down", prevPrice: 125.00 },
    { id: "m15", name: "Pre-assembled Surgical Intubation Kit (Adult Pro)", category: "Surgical Apparatus", unit: "Kit", marketPrice: 185.00, volume: "15,400 daily", trend: "up", prevPrice: 165.00 },
    { id: "m16", name: "Electro-cautery Monopolar Pencil with Cord", category: "Surgical Apparatus", unit: "Box of 10", marketPrice: 320.00, volume: "3,200 daily", trend: "stable", prevPrice: 320.00 },

    // General Pharmaceuticals
    { id: "m17", name: "Amoxicillin Co-Amoxiclav 1.2g IV Injection", category: "General Pharamceuticals", unit: "Vials (10s)", marketPrice: 145.00, volume: "115,000 daily", trend: "stable", prevPrice: 145.00 },
    { id: "m18", name: "Paracetamol 10mg/ml Solution for Infusion", category: "General Pharamceuticals", unit: "Bottles (12s)", marketPrice: 98.00, volume: "240,000 daily", trend: "down", prevPrice: 104.00 },
    { id: "m19", name: "Metoclopramide HCl 10mg/2ml Injection", category: "General Pharamceuticals", unit: "Box of 100", marketPrice: 55.00, volume: "40,000 daily", trend: "stable", prevPrice: 55.00 },
    { id: "m20", name: "Pantoprazole Sodium 40mg IV Injection", category: "General Pharamceuticals", unit: "Vials (10s)", marketPrice: 420.00, volume: "18,900 daily", trend: "up", prevPrice: 395.00 },
  ];

  // Authentic Malaysian Supplier Clusters (Connected Network Topology)
  const majorSuppliers = [
    {
      id: "sup-01",
      name: "Pharmaniaga Logistics Sdn Bhd",
      location: "Shah Alam, Selangor",
      latitude: "3.0738",
      longitude: "101.5183",
      portfolio: "National primary hospital formulary standard & cold chain products",
      reliability: "99.4% SLA",
      networkStatus: "CONNECTED_PEER",
      coordinates: "Shah Alam Facility 4",
      phone: "+603-5191 8181",
      email: "procure@pharmaniaga.com"
    },
    {
      id: "sup-02",
      name: "Duopharma Biotech Berhad",
      location: "Klang, Selangor",
      latitude: "3.0449",
      longitude: "101.4456",
      portfolio: "Specialist anti-infectives, clinical vaccines, general generics & insulin",
      reliability: "98.9% SLA",
      networkStatus: "CONNECTED_PEER",
      coordinates: "Klang High-Speed Vault",
      phone: "+603-3323 2759",
      email: "hospitals@duopharmabiotech.com"
    },
    {
      id: "sup-03",
      name: "Kotra Pharma (M) Sdn Bhd",
      location: "Cheng Industrial Estate, Melaka",
      latitude: "2.2561",
      longitude: "102.2289",
      portfolio: "Appeton nutraceutical sterile liquids & Standard IV fluid hydration series",
      reliability: "97.5% SLA",
      networkStatus: "STANDBY_FEED",
      coordinates: "Cheng Distribution Complex",
      phone: "+606-336 2222",
      email: "order@kotra.com.my"
    },
    {
      id: "sup-04",
      name: "Apex Pharmacy Marketing Sdn Bhd",
      location: "Subang Jaya, Selangor",
      latitude: "3.0822",
      longitude: "101.5833",
      portfolio: "Broad spectrum critical care medicines, specialty oncology therapeutic vectors",
      reliability: "98.2% SLA",
      networkStatus: "CONNECTED_PEER",
      coordinates: "Subang Central Depot",
      phone: "+603-5629 3000",
      email: "clinical.care@apexpharmacy.com.my"
    },
    {
      id: "sup-05",
      name: "B. Braun Medical Industries Sdn Bhd",
      location: "Bayan Lepas Free Industrial Zone, Penang",
      latitude: "5.2901",
      longitude: "100.2742",
      portfolio: "Precision surgical instruments, ward accessories, sterile catheters & hardware",
      reliability: "99.8% SLA",
      networkStatus: "CONNECTED_PEER",
      coordinates: "Bayan Lepas Vault E",
      phone: "+604-630 3000",
      email: "bbraun.services@bbraun.com"
    },
    {
      id: "sup-06",
      name: "idsmed / IDS Medical Systems Malaysia",
      location: "Petaling Jaya, Selangor",
      latitude: "3.1073",
      longitude: "101.5971",
      portfolio: "High-spec ICU ventilation pumps, anesthesia platforms & bio-sensors",
      reliability: "97.8% SLA",
      networkStatus: "CONNECTED_PEER",
      coordinates: "PJ logistics center No.8",
      phone: "+603-7965 2888",
      email: "my-equipment@idsmed.com"
    }
  ];

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.hospitalName) {
      alert("Please fill in your Name, Email, and Clinical Institution.");
      return;
    }
    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      hospitalName: "",
      clusterNodes: "2",
      additionalMessage: ""
    });
    setFormSubmitted(false);
  };

  // Filtered lists for manual search
  const filteredDocs = docSections.filter(sec => 
    sec.title.toLowerCase().includes(docSearchQuery.toLowerCase()) || 
    sec.content.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
    sec.category.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  // Filtered list for Market Prices
  const filteredMarketItems = marketItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(marketSearchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(marketSearchQuery.toLowerCase());
    const matchesCategory = selectedMarketCategory === "All" || item.category === selectedMarketCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]/30 text-slate-800 font-sans flex flex-col relative overflow-hidden">
      <NetworkBackground />
      {/* Top Banner Navigation */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-100/50 shadow-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo Section - Left align on desktop, split row on mobile/tablet */}
          <div className="w-full lg:w-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-gradient-to-tr from-brand-700 to-emerald-600 text-white rounded-xl shadow-md flex items-center justify-center shrink-0">
                <Activity size={20} />
              </span>
              <div className="text-left">
                <h1 className="font-bold text-slate-900 font-display tracking-tight text-lg flex items-center gap-1.5 leading-none">
                  CureRack<span className="text-brand-500 font-medium">.my</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider block mt-0.5 uppercase">
                  {portalMode === "enterprise" ? "CLINICAL ROUTING LEDGER - Enterprise" : "HEALTHCARE & PATIENT HUB - Personal"}
                </span>
              </div>
            </div>

            {/* Launch System button ONLY visible on screen sizes below lg */}
            <button
              onClick={() => {
                if (portalMode === "personal") {
                  setPersonalTab("console");
                } else {
                  onLaunchApp();
                }
              }}
              className="lg:hidden bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-tight shadow-md flex items-center gap-1 cursor-pointer transition-all shrink-0"
            >
              <span>{portalMode === "personal" ? "Console" : "Launch"}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* DUAL MODE SELECTOR: Enterprise (B2B Providers) vs Personal (B2C Patient Hub) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-205/60 shrink-0 select-none">
            <button
              onClick={() => setPortalMode("enterprise")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                portalMode === "enterprise"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              🏢 Enterprise Portal
            </button>
            <button
              onClick={() => setPortalMode("personal")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                portalMode === "personal"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-950"
              }`}
            >
              💚 Personal Health
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          {/* Launch Workspace Portal Trigger - Left aligned and ONLY visible on Desktop screen */}
          <button
            onClick={() => {
              if (portalMode === "personal") {
                setPersonalTab("console");
              } else {
                onLaunchApp();
              }
            }}
            className="hidden lg:flex bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-tight shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all items-center gap-1.5 cursor-pointer shrink-0"
          >
            {portalMode === "personal" ? "Launch Personal System Console" : "Launch System Console"}
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* RENDER VIEW: DYNAMIC PORTAL SELECTOR */}
      {portalMode === "personal" ? (
        <CureRackPersonalPortal activeTab={personalTab} onTabChange={setPersonalTab} />
      ) : (
        <>
          {/* Dynamic Sub-header Navigation representing Enterprise Hub */}
          <div className="bg-gradient-to-r from-brand-900 to-slate-950 text-white border-y border-brand-950 shadow-sm py-4 px-4 sm:px-6 relative overflow-hidden text-left">
            {/* Subtle grid pattern background */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] select-none pointer-events-none" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-brand-500 text-white px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase select-none">
                    ENTERPRISE LEDGER ACTIVE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                  <span className="text-brand-200 text-xs font-mono font-medium">B2B Hospital Procurement &amp; Stock Sync</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mt-1">
                  CureRack.my - <span className="text-brand-400">Enterprise</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-brand-100/75 max-w-xl leading-relaxed mt-1">
                  Deploy independent environment containers. Tweak institution scale, monitor real-time procurement price lists, manage verified suppliers, and lock nationwide MOH compliance bounds instantly.
                </p>
              </div>

              {/* Quick Tab switcher controls styled like Apple tabs */}
              <div className="flex flex-wrap p-1 bg-brand-950/80 rounded-xl border border-brand-800/60 text-xs font-semibold gap-1 shrink-0 w-full sm:w-auto">
                <button
                  id="tab-ent-presentation"
                  onClick={() => setActivePortalView("presentation")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    activePortalView === "presentation"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  <Monitor size={12} className="shrink-0" />
                  <span>Platform Presentation</span>
                </button>
                <button
                  id="tab-ent-market"
                  onClick={() => setActivePortalView("market")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    activePortalView === "market"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  <Coins size={12} className="shrink-0" />
                  <span>Live Market Prices</span>
                </button>
                <button
                  id="tab-ent-suppliers"
                  onClick={() => setActivePortalView("suppliers")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    activePortalView === "suppliers"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  <Globe size={12} className="shrink-0" />
                  <span>Malaysian Suppliers</span>
                </button>
                <button
                  id="tab-ent-docs"
                  onClick={() => setActivePortalView("docs")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                    activePortalView === "docs"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-brand-200 hover:text-white"
                  }`}
                >
                  <BookOpen size={12} className="shrink-0" />
                  <span>User Manual</span>
                </button>
              </div>
            </div>
          </div>

          {/* RENDER VIEW: PRESENTATION LANDING PAGE */}
          {activePortalView === "presentation" && (
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white/30 to-slate-50/15 border-b border-slate-100/50 backdrop-blur-xxs">
            {/* Subtle graphic backgrounds */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
              <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-brand-100 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-[11px] font-semibold text-brand-700 font-mono tracking-wide uppercase">
                <ShieldCheck size={12} className="text-brand-600 animate-pulse" />
                Dual-Facility Node Isolated Parity
              </span>
              <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight font-display max-w-4xl mx-auto leading-[1.1]">
                Clinical Stock Routing &amp; Procurement <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700">Ledger</span>
              </h2>
              <p className="text-base sm:text-xl text-slate-550 max-w-2xl mx-auto leading-relaxed">
                Standardizing decentralized buffer thresholds, real-time expiration compliance vectors, and authorized procurement workflows to secure medical network inventory.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={onLaunchApp}
                  className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 px-7 py-3.5 rounded-xl font-bold font-display text-sm tracking-wide shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Enter Workspace Portal
                </button>
                <button
                  onClick={() => setActivePortalView("market")}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:text-slate-900 px-7 py-3.5 rounded-xl font-bold font-display text-sm tracking-wide shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins size={16} className="text-brand-600" />
                  View Live Prices
                </button>
              </div>

              {/* Active statistics ticker */}
              <div className="pt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { value: "02", label: "Isolated Nodes Mapped", sub: "Multi-cluster Sync" },
                  { value: "1,420+", label: "Units Stored", sub: "Standard Ledger" },
                  { value: "100%", label: "Strict FIFO Compliance", sub: "Expiration Sort" },
                  { value: "S-LEVEL", label: "Buffer Protection", sub: "Auto Shortage Alert" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-slate-100 shadow-xs text-left hover:border-brand-100 transition-colors">
                    <span className="block text-3xl font-extrabold text-slate-850 font-display tracking-tight mb-1">
                      {stat.value}
                    </span>
                    <span className="block text-xs font-bold text-slate-800 font-sans tracking-wide">
                      {stat.label}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      {stat.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Flow Diagram */}
          <section className="py-16 bg-white/20 border-b border-slate-100/40 backdrop-blur-xxs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-bold font-mono text-brand-600 tracking-widest uppercase block">
                  Interactive Substance Logistics Flowchart
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                  Click Steps to Visualize Route Streams
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  CureRack coordinates distributed stocks. See how dynamic updates propagate instantly across the warehouse grid.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-xs space-y-8">
                {/* Horizontal flowchart pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative select-none">
                  {flowSteps.map((step, idx) => {
                    const isSelected = selectedFlowStep === step.step;
                    const IconComp = step.icon;
                    return (
                      <div key={step.step} className="relative flex flex-col">
                        {/* Connecting Line (Desktop) */}
                        {idx < 4 && (
                          <div className="hidden md:block absolute top-7 left-1/2 w-full h-[2px] bg-slate-200 -z-10">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-400"></div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setSelectedFlowStep(step.step)}
                          className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-start gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-white text-slate-800 shadow-md border-brand-500 ring-2 ring-brand-100/50 scale-103"
                              : "bg-white/60 hover:bg-white text-slate-600 border-slate-100 shadow-xxs"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-brand-600 text-white shadow" : "bg-slate-100 text-slate-500"
                          }`}>
                            <IconComp size={16} />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold font-mono text-slate-400 block">PIPELINE NODE 0{step.step}</span>
                            <span className="text-xs font-bold leading-tight line-clamp-1 block tracking-tight font-display text-slate-800 mt-0.5">
                              {step.title.replace(/^[0-9]\.\s/, "")}
                            </span>
                          </div>
                          <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-slate-150 text-slate-600 mt-1 self-start select-none">
                            {step.role}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Animated Display Card showing output variables */}
                {(() => {
                  const currStep = flowSteps.find(s => s.step === selectedFlowStep) || flowSteps[0];
                  const IconComp = currStep.icon;
                  return (
                    <div className="bg-white p-5 sm:p-7 rounded-xl border border-slate-150 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                      <div className="lg:col-span-7 space-y-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${currStep.pillBg}`}>
                            {currStep.role} BOUNDED
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 font-medium">Step {currStep.step} of 5</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-850 font-display flex items-center gap-2">
                          <IconComp size={18} className="text-brand-500" />
                          {currStep.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {currStep.desc}
                        </p>
                        <div className="bg-emerald-50/55 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-100 flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <strong>Core Outcome:</strong> {currStep.outcome}
                          </div>
                        </div>
                      </div>

                      {/* Transaction Log sandbox */}
                      <div className="lg:col-span-5 bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] sm:text-[11px] space-y-3.5 border border-slate-950 flex flex-col justify-between">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-slate-500 select-none">
                          <span>LEDGER EMISSION HANDSHAKE</span>
                          <span className="animate-pulse flex items-center gap-1 text-[8px] bg-brand-900/40 text-brand-400 px-1.5 py-0.5 rounded font-mono font-medium border border-brand-800/10">🟢 SYNERGY</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-500">{"$"} run auth_sign_handshake</span> <br />
                            <span className="text-slate-400 font-semibold">Handshaking credential profile... Mapped</span>
                          </div>
                          <div>
                            <span className="text-slate-500">{"$"} trigger_live_state</span><br />
                            <span className="text-emerald-400 font-medium">✔️ SUCCESS: ledger matrix calculated</span>
                          </div>
                          <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/40 leading-normal">
                            {selectedFlowStep === 1 && (
                              <span>[Index] Updated Vessel Dilators base quote to RM 28.50. Variance calculated: -4.21% (Stable Market volatility index)</span>
                            )}
                            {selectedFlowStep === 2 && (
                              <span>[Draft] Proposed formal acquisition PO-9923 for 250 vials of Oxygen Concentrators. Drafted by Operator: Admin Core.</span>
                            )}
                            {selectedFlowStep === 3 && (
                              <span>[Procurement] Approved purchase order PO-1282. Valuation: RM 14,200 approved. Inventory auto-ingested batch status.</span>
                            )}
                            {selectedFlowStep === 4 && (
                              <span>[Ledger] Verified coordinate dock station shelf coord: B-43. Staging buffer set to 15. Real-time parity OK.</span>
                            )}
                            {selectedFlowStep === 5 && (
                              <span>[Bedside] Consumption updated. Deducted 5 vials for patient BED-1102. Emergency buffer triggers check. Status: HEALTHY.</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 text-[9px] text-slate-600 flex justify-between items-center font-mono select-none border-t border-slate-800/50">
                          <span>CureRack Core Routing Matrix v1.4</span>
                          <span>UTC 2026-05-22</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Connected Network Presentation Banner */}
          <section className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white py-12 px-6 shadow-md border-b border-indigo-950">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] tracking-widest text-brand-300 font-semibold font-mono uppercase">Malaysia-Wide Unified Network</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white leading-tight">
                  Fully Integrated Hospital Nodes &amp; Major Suppliers
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  We are all connected. Real-time pharmaceutical logistics integration between leading clinical companies in Malaysia and healthcare facility hubs.
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setActivePortalView("suppliers")}
                  className="bg-white hover:bg-slate-100 text-brand-900 px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Globe size={13} className="text-brand-600" />
                  View Connected Suppliers
                </button>
                <button
                  onClick={() => setActivePortalView("market")}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Coins size={13} />
                  Explore Market Prices
                </button>
              </div>
            </div>
          </section>

          {/* Value Proposition Grid (Swiss Style Blocks) */}
          <section className="py-16 bg-slate-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-[10px] font-bold font-mono text-brand-600 tracking-wider uppercase block bg-brand-50 border border-brand-100/50 px-3 py-1 rounded-full w-fit mx-auto">
                  Ecosystem Parity Benefits
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                  Standardizing Critical Clinical Resource Workspaces
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Discover how the CureRack clinical logistics matrix optimizes core inventories, enforces safety buffers, and streamlines procurement across all healthcare levels.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Hospitals Benefit Card */}
                <div className="bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-brand-500" />
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 uppercase">
                        Hospitals Workspace
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Sync Core Active
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl w-fit">
                        <Building size={24} className="stroke-[1.75]" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-850 font-display">
                        Multi-Ward Routing &amp; Audit Trail Sovereignty
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hospitals function as high-volume centers with independent clinical sub-wards. CureRack optimizes hospital systems through deep security boundaries and bulk dispatch ledger triggers.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-3.5">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Key Institutional Gains:
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-650">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-brand-500 shrink-0 mt-0.5" />
                          <span><strong>Isolated Room/Ward Mappings:</strong> Distribute medicine stocks to sub-locations with dedicated safe storage thresholds.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-brand-500 shrink-0 mt-0.5" />
                          <span><strong>Privilege Separation Tiers:</strong> Prevent clinical mishaps by restricting procurement signing to higher administrative authorizers.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-brand-500 shrink-0 mt-0.5" />
                          <span><strong>Sealed Cryptographic Audit Logs:</strong> Protect legal accountability with a tamper-resistant operational telemetry track.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:bg-brand-50/20 transition-colors">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Hospital Node Target</span>
                    <span className="flex items-center gap-1 text-brand-600 font-bold hover:gap-2 transition-all">
                      99.4% SLA Guaranteed <ChevronRight size={12} />
                    </span>
                  </div>
                </div>

                {/* 2. Clinics Benefit Card */}
                <div className="bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-rose-500" />
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 uppercase">
                        Clinics Workspace
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Low-Latency Live
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-fit">
                        <HeartPulse size={24} className="stroke-[1.75]" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-850 font-display">
                        Bedside Dispensation &amp; Flashing Safe-Buffer Alerts
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Clinics represent the high-frequency front lines of primary patient care. CureRack safeguards outpatient clinics from critical pharmaceutical depletion through fast bedside ledger checks.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-3.5">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Key Operational Gains:
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-650">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span><strong>Automatic Buffer Warnings:</strong> Visual warning banners trigger flashing alerts the second aggregate stock hits safety thresholds.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span><strong>Single-Click Draft POs:</strong> Enables clinicians to pre-compile requirements directly without complex manual calculations.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span><strong>Direct Bedside Delivery:</strong> Rationalize usage instantly by recording clinical justifications during discharge.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:bg-rose-50/20 transition-colors">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Community clinic target</span>
                    <span className="flex items-center gap-1 text-rose-600 font-bold hover:gap-2 transition-all">
                      Zero short-falls tracking <ChevronRight size={12} />
                    </span>
                  </div>
                </div>

                {/* 3. Pharmacy Benefit Card */}
                <div className="bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-indigo-500" />
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                        Pharmacies Workspace
                      </span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        National Peer Sync
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
                        <ShoppingBag size={24} className="stroke-[1.75]" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-850 font-display">
                        FEFO Expiries Compliance &amp; Live Market Pricing
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Pharmacies manage complex chemical shelves with finite lifespans. CureRack reduces expensive stock waste by sorting incoming medical batches automatically by expiry parameters.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-3.5">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Key Commercial Gains:
                      </h5>
                      <ul className="space-y-2.5 text-xs text-slate-650">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                          <span><strong>First-Expiry, First-Out (FEFO):</strong> The ledger ranks expiring coordinates first to completely optimize sales cycles.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                          <span><strong>Live Supplier Connectivity:</strong> Observe real-time warehouse states with leading Malaysian suppliers.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                          <span><strong>Market Price Tracking:</strong> View actual, current market cost rates to secure optimal purchasing conditions.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:bg-indigo-50/20 transition-colors">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Pharmacy outlet target</span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold hover:gap-2 transition-all">
                      Reduce stock wastage 30%+ <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Subscription Packages & Contact Us Section */}
          <section className="py-16 bg-slate-50/45 border-b border-slate-100" id="subscription">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 text-[10px] font-bold font-mono text-brand-700 tracking-wider uppercase rounded-full">
                  <Zap size={11} className="text-brand-605" /> Direct Clinical Node Pricing Model
                </span>
                <h3 className="text-2xl sm:text-4.5xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
                  Calculate Your Setup Cost &amp; Subscription Structure
                </h3>
                <p className="text-xs sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
                  CureRack.my deploys custom independent environment containers. Select your institution scale, tweak your departments, and lock down secure nationwide compliance bounds instantly.
                </p>
              </div>

              {/* Dynamic Interactive Setup & Pricing Matrix Calculator */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-8 lg:p-10 w-full mb-16 relative text-left">
                {/* Visual accent badge */}
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand-600 text-white text-[9px] font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Official MYR Tariff Form
                </div>

                {/* 1. Scale Type Segmented Presets */}
                <div className="mb-10 text-center">
                  <span className="block text-[10px] font-bold font-mono tracking-widest uppercase text-slate-400 mb-4">
                    Step 1: Select Institution Scale Model Preset
                  </span>
                  <div className="inline-flex flex-wrap p-1.5 bg-slate-100 rounded-2xl border border-slate-250/50 justify-center gap-1 max-w-full">
                    {[
                      {
                        id: "clinic",
                        title: "Small Clinic Model",
                        desc: "1-3 departments, essential staff Accounts",
                        icon: Building
                      },
                      {
                        id: "hospital",
                        title: "Hospital Enterprise Tier",
                        desc: "Comprehensive multi-ward inventory sync",
                        icon: Activity
                      }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleScaleChange(preset.id as any)}
                        className={`px-6 py-3.5 rounded-xl text-left cursor-pointer transition-all flex items-center gap-4 whitespace-nowrap min-w-[240px] ${
                          calcScale === preset.id
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-semibold"
                            : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                        }`}
                      >
                        <span className={`p-2.5 rounded-lg ${calcScale === preset.id ? "bg-brand-50 text-brand-650" : "bg-slate-200/50 text-slate-450"}`}>
                          <preset.icon size={18} />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs sm:text-sm font-bold tracking-tight">{preset.title}</span>
                          <span className="text-[10px] font-normal text-slate-450 font-sans block truncate max-w-[170px]">{preset.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Interactive specifications controls and dynamic results */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Controls column */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-slate-50/55 p-5 sm:p-7 rounded-2xl border border-slate-150">
                    <div>
                      <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest mb-4">
                        Step 2: Custom Tweak Node Specs &amp; Sizing
                      </span>

                      {/* Departments Input Control */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center">
                          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Building size={14} className="text-brand-600 shrink-0" />
                            <span>Clinical Departments / Diagnostic Wards</span>
                          </label>
                          <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-mono font-bold rounded-lg border border-brand-100">
                            {calcDepartments} {calcDepartments === 1 ? "Department" : "Departments"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={calcDepartments}
                          onChange={(e) => setCalcDepartments(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-slate-450 font-mono">
                          <span>1 Department</span>
                          <span className="text-[10px] text-brand-755 font-medium">RM 2,000 / month per Dept</span>
                          <span>40 Departments</span>
                        </div>
                      </div>

                      {/* Users Input Control */}
                      <div className="space-y-3 pt-5 border-t border-slate-200/50">
                        <div className="flex justify-between items-center">
                          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Users size={14} className="text-brand-600 shrink-0" />
                            <span>Specified Organizational Seats</span>
                          </label>
                          <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-mono font-bold rounded-lg border border-brand-100">
                            {calcUsers} Staff Users
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="250"
                          value={calcUsers}
                          onChange={(e) => setCalcUsers(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-slate-455 font-mono">
                          <span>2 User Accounts</span>
                          <span className="text-[10px] text-brand-755 font-medium">RM 100 / month per User (Standard Rate)</span>
                          <span>250 Users</span>
                        </div>
                      </div>
                    </div>

                    {/* Specified Roles breakdown block */}
                    <div className="pt-6 border-t border-slate-200/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wider">
                          Specified Roles Auto-provisioned:
                        </span>
                        <span className="text-[10px] bg-slate-200 tracking-wide text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                          Managed Hierarchy
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/40 text-left text-xs">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-850 font-semibold text-[11px] block">Master Administrator</strong>
                            <p className="text-slate-400 text-[9.5px] leading-tight font-sans">Full ledger auditing, configuration overrides, setup authorization.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/40 text-left text-xs">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-850 font-semibold text-[11px] block">
                              Ward Managers ({Math.max(1, Math.min(calcDepartments, Math.floor(calcUsers / 4)))})
                            </strong>
                            <p className="text-slate-400 text-[9.5px] leading-tight font-sans">Authorize specific ward drug buffers, draft procurement proposals.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/40 text-left text-xs">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-850 font-semibold text-[11px] block">
                              Clinical Operators ({Math.max(1, calcUsers - Math.max(1, Math.floor(calcUsers / 4)) - 1)})
                            </strong>
                            <p className="text-slate-400 text-[9.5px] leading-tight font-sans">Log active substance usage, check batch expiration dates.</p>
                          </div>
                        </div>
                        {calcUsers >= 8 && (
                          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/40 text-left text-xs">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            <div>
                              <strong className="text-slate-850 font-semibold text-[11px] block">Procurement Officers (2)</strong>
                              <p className="text-slate-400 text-[9.5px] leading-tight font-sans">Direct link with Malaysian raw materials suppliers, logistics queue.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Critical Feature and Architecture Summary Matrix */}
                    <div className="pt-6 border-t border-slate-200/50 space-y-4">
                      <span className="block text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wider">
                        Advanced Feature &amp; Integration Matrix Included:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs space-y-1">
                          <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                            <Layers size={12} className="text-brand-600" /> Real-time Stock Buffer Warning
                          </strong>
                          <p className="text-slate-500 text-[10px] leading-normal font-sans">
                            Instant visual indicators if drug boxes drops below clinical threshold bounds.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs space-y-1">
                          <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-brand-600" /> Malaysian Supplier Pricing
                          </strong>
                          <p className="text-slate-500 text-[10px] leading-normal font-sans">
                            Track pricing histories and volatility ranges directly on raw drug ingredients.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs space-y-1">
                          <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                            <FileText size={12} className="text-brand-600" /> Complete PO Lifecycle Log
                          </strong>
                          <p className="text-slate-500 text-[10px] leading-normal font-sans">
                            Create, approve, sign, and ingest inventory batches to avoid duplicate billing.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs space-y-1">
                          <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-brand-600" /> Regulatory Audit Trail
                          </strong>
                          <p className="text-slate-500 text-[10px] leading-normal font-sans">
                            Maintains high-integrity records of substance dispersal compliant with ministry codes.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Server host & Storage container isolation specifications */}
                    <div className="pt-5 border-t border-slate-200/50 space-y-3.5 bg-slate-100/40 p-4 rounded-xl">
                      <span className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                        🏥 High-Reliability Server &amp; Storage Isolation Parameters
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-[11px] leading-relaxed text-slate-650 font-sans">
                        <div className="flex gap-2">
                          <span className="text-brand-600 font-bold">▪</span>
                          <div>
                            <strong className="text-slate-800 font-bold block">Isolated Linux Node Container</strong>
                            <p className="text-slate-500 text-[10px] leading-normal mt-0.5">
                              Deploys inside private virtual instances. No cross-connection server noise, protecting patient data sovereignty entirely.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-brand-600 font-bold">▪</span>
                          <div>
                            <strong className="text-slate-800 font-bold block">Singapore / MY Low-Latency Cloud</strong>
                            <p className="text-slate-500 text-[10px] leading-normal mt-0.5">
                              Supercharged network routing with sub-50ms query ping times across clinics for maximum speed.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-brand-600 font-bold">▪</span>
                          <div>
                            <strong className="text-slate-800 font-bold block">Encrypted Document Staging</strong>
                            <p className="text-slate-500 text-[10px] leading-normal mt-0.5">
                              Dedicated digital storage buffer utilizing AES-256 formatting to lock down purchase invoices and PDF sheets securely.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-brand-600 font-bold">▪</span>
                          <div>
                            <strong className="text-slate-800 font-bold block">99.9% Uptime SLA Matrix</strong>
                            <p className="text-slate-500 text-[10px] leading-normal mt-0.5">
                              Reliable operational runtime guarantees backed by high-availability cloud cluster nodes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Dynamic Value Summary Section - "The Invoice" */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-left shadow-xl border border-slate-800 relative overflow-hidden">
                    {/* Pulsing state signal */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Direct Live calculation
                    </div>

                    <div className="space-y-6">
                      <div className="border-b border-slate-800/80 pb-4">
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                          System Node Structure
                        </span>
                        <h4 className="text-lg font-bold font-display text-white capitalize mt-1 flex items-center gap-1.5">
                          {calcScale === "clinic" ? "Community Staging Setup" : "Hospital Enterprise Matrix"}
                        </h4>
                      </div>

                      {/* Dynamic Cost break down details */}
                      <div className="space-y-4 text-xs font-mono">
                        {/* 1. One-time Setup Fee */}
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-slate-200 font-semibold block">One-time Environment Setup</span>
                            <span className="text-[10px] text-slate-550 font-sans block mt-0.5">
                              High-availability virtual deployment container setup.
                              {calcScale === "clinic" ? " (Reduced Clinic Tariff)" : " (Full scale Medical system)"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-teal-400 whitespace-nowrap">
                            RM {calcScale === "clinic" ? "10,000" : "50,000"}
                          </span>
                        </div>

                        {/* 2. Monthly Department Subscription */}
                        <div className="flex justify-between items-start gap-3 pt-3 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-200 font-semibold block">{calcDepartments} × Clinical Wards Fee</span>
                            <span className="text-[10px] text-slate-550 font-sans block mt-0.5 font-normal">RM 2,000 / department each month</span>
                          </div>
                          <span className="text-sm font-bold text-slate-100 whitespace-nowrap">RM {(calcDepartments * 2000).toLocaleString()}</span>
                        </div>

                        {/* 3. Monthly User Subscription */}
                        <div className="flex justify-between items-start gap-3 pt-3 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-200 font-semibold block">{calcUsers} × Assigned Accounts Fee</span>
                            <span className="text-[10px] text-slate-550 font-sans block mt-0.5 font-normal">RM 100 / user seat each month</span>
                          </div>
                          <span className="text-sm font-bold text-slate-100 whitespace-nowrap">RM {(calcUsers * 100).toLocaleString()}</span>
                        </div>

                        {/* Total Monthly Subscription */}
                        <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-800/60 flex justify-between items-center mt-2">
                          <div>
                            <span className="font-bold text-slate-200 text-xs block">Combined Monthly Cost</span>
                            <span className="text-[9px] text-slate-450 font-sans uppercase">Continuous service matrix</span>
                          </div>
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-extrabold text-brand-400">
                              RM {((calcDepartments * 2000) + (calcUsers * 100)).toLocaleString()}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium font-sans"> / mo</span>
                          </div>
                        </div>
                      </div>

                      {/* Core Trust Indicators (Recovery Maintenance / Support Safeguards) */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/70 text-[11px] space-y-3 pt-4">
                        <div className="flex gap-2 text-left">
                          <Clock size={15} className="text-brand-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-200 block">Nightly Parity Recovery (12:00 AM - 1:00 AM)</span>
                            <p className="text-slate-400 text-[10px] leading-normal font-sans mt-0.5">
                              Automatic database self-repair, transaction validation logs, and point-in-time snapshots run nightly to keep all ledger data secure from data-loss.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-left pt-2.5 border-t border-slate-800/60">
                          <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-200 block">Assured 24-Hours Emergency Support</span>
                            <p className="text-slate-400 text-[10px] leading-normal font-sans mt-0.5">
                              Guaranteed round-the-clock remote response hotline directly linked with system administrators for immediate incident remediation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Combined Action Row */}
                    <div className="mt-6 pt-5 border-t border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block tracking-tight">Proj. First Year Value</span>
                          <span className="text-[9px] text-slate-550 font-sans block">(Setup + 12 months subscription)</span>
                        </div>
                        <span className="text-lg font-bold text-white font-mono">
                          RM {((calcScale === "clinic" ? 10000 : 50000) + (((calcDepartments * 2000) + (calcUsers * 100)) * 12)).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const setupValue = calcScale === "clinic" ? 10000 : 50000;
                          const monthlyCost = (calcDepartments * 2000) + (calcUsers * 100);
                          const customMessage = `CUSTOM PROPOSAL GENERATED VIA CALCULATOR:\n` + 
                            `- Preset Scale: ${calcScale.toUpperCase()}\n` +
                            `- Clinical Wards: ${calcDepartments}\n` +
                            `- Required Personnel Seats: ${calcUsers}\n` +
                            `- One-time Setup Premium Environment Deployment Fee: RM ${setupValue.toLocaleString()}.\n` +
                            `- Standard Rate per User: RM 100/month/user.\n` +
                            `- Total Monthly Node Cost: RM ${monthlyCost.toLocaleString()}/month.\n` +
                            `- Projected Year 1 Deployment Value: RM ${(setupValue + (monthlyCost * 12)).toLocaleString()}.\n` +
                            `Please register this configuration and contact me to verify isolated server container setup & database migration details.`;
                          setFormData(prev => ({
                            ...prev,
                            additionalMessage: customMessage,
                            clusterNodes: calcScale === "clinic" ? "1" : "5"
                          }));
                          
                          // Smooth scroll focus directly down to the Form Container
                          document.getElementById("subscription_inquiry_form")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold text-xs tracking-wider rounded-xl cursor-pointer transition-all uppercase flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.99] hover:shadow-brand-500/10"
                      >
                        <span>Apply Proposal Details</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Form and info row */}
              <div id="subscription_inquiry_form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mx-auto items-start bg-slate-50 rounded-2xl border border-slate-100 p-6 sm:p-8">
                {/* Left Side info */}
                <div className="lg:col-span-5 space-y-4 text-left">
                  <h4 className="font-bold text-slate-850 text-base font-display flex items-center gap-2">
                    <Mail size={16} className="text-brand-600" />
                    Subscription Enquiries
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    By submitting the contact details of your medical center, our staging coordination staff will prepare a customized ledger demonstration mapped to your coordinates.
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-650">
                      <Phone size={13} className="text-brand-500 shrink-0" />
                      <span>+603-7988 4021 (Kuala Lumpur Office)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-650">
                      <Mail size={13} className="text-brand-500 shrink-0" />
                      <span>subscriptions@cuerack.my</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-650">
                      <MapPin size={13} className="text-brand-500 shrink-0" />
                      <span>Level 12, Wisma Med-Tech, Mutiara Damansara, Selangor</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Form */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-slate-150">
                  <AnimatePresence mode="wait">
                    {!formSubmitted ? (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-450 font-mono mb-1.5">
                              Enquirer Full Name *
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Dr. Amir Syarif"
                              value={formData.fullName}
                              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none rounded-lg px-3 py-2 outline-none text-slate-800 focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-450 font-mono mb-1.5">
                              Contact Email *
                            </label>
                            <input 
                              type="email" 
                              required
                              placeholder="e.g. amir.s@pantai.com.my"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none rounded-lg px-3 py-2 outline-none text-slate-800 focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-450 font-mono mb-1.5">
                              Hospital / Clinical Institution *
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Pantai Hospital Kuala Lumpur"
                              value={formData.hospitalName}
                              onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none rounded-lg px-3 py-2 outline-none text-slate-800 focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-450 font-mono mb-1.5">
                              Est. Cluster Node Terminals
                            </label>
                            <select 
                              value={formData.clusterNodes}
                              onChange={(e) => setFormData({...formData, clusterNodes: e.target.value})}
                              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="1">1 (Single Ward Clinic)</option>
                              <option value="2">2 (Dual Isolated hospital - Mapped)</option>
                              <option value="5">3 to 5 (Wards and Pharmacy Outposts)</option>
                              <option value="10">10+ (State Level Ledger Network)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-450 font-mono mb-1.5">
                            Specific Clinical Requirements / Volatilities
                          </label>
                          <textarea 
                            rows={3}
                            placeholder="State customized buffer criteria or warehouse requirements..."
                            value={formData.additionalMessage}
                            onChange={(e) => setFormData({...formData, additionalMessage: e.target.value})}
                            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none rounded-lg px-3 py-2 outline-none text-slate-800 focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div className="text-[10px] text-slate-400 leading-normal bg-slate-50 p-2.5 rounded border border-slate-100 mb-2">
                          💡 You have pre-selected the <strong className="text-brand-700 capitalize">{calcScale} scale model</strong> with <strong className="text-brand-700">{calcDepartments} departments</strong> and <strong className="text-brand-700">{calcUsers} roles</strong>. Submit to queue direct connection.
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs tracking-wide rounded-xl shadow cursor-pointer transition-all uppercase"
                        >
                          Submit Subscription Enquiry
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6 space-y-4"
                      >
                        <span className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg select-none">
                          ✓
                        </span>
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-850 text-base">Enquiry Logged Successfully!</h5>
                          <p className="text-xs text-slate-550 leading-relaxed px-4">
                            Thank you, <strong className="text-slate-800">{formData.fullName}</strong> from <strong>{formData.hospitalName}</strong>! Our logistics routing staff will contact you at <strong>{formData.email}</strong> within 12 business hours.
                          </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 text-[11px] p-3 rounded-lg max-w-sm mx-auto font-mono text-left border border-emerald-100">
                          ⚡ Handshake Protocol Active <br />
                          Scale Preset: {calcScale.toUpperCase()} ({calcDepartments} Depts, {calcUsers} Users) <br />
                          Setup Fee Status: RM {(calcScale === "clinic" ? 10000 : 50000).toLocaleString()} (Staged for environment) <br />
                          Weekly Parity Maintenance: Confirmed (12 AM - 1 AM Nightly)
                        </div>
                        <button
                          onClick={resetForm}
                          className="text-xs font-bold text-slate-500 hover:text-slate-850 underline block mx-auto cursor-pointer"
                        >
                          Send another Enquiry
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-900 text-white py-12 px-6 border-t border-slate-950 text-center space-y-5">
            <h4 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white max-w-xl mx-auto leading-normal">
              Accelerate clinical workflow synergy and safeguard medical inventory operations today.
            </h4>
            <p className="text-xs text-slate-400 font-mono tracking-wide max-w-lg mx-auto uppercase">
              Current Node Center: {activeHospitalName} // SECURED SHIELD ACTIVE
            </p>
            <div className="pt-2">
              <button
                onClick={onLaunchApp}
                className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold font-display px-8 py-3.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Launch Workspace Applet Portal
                <ArrowRight size={14} />
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* RENDER VIEW: LIVE MARKET MEDICINES & ALL EQUIPMENT PRICES */}
      {activePortalView === "market" && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] tracking-wider text-brand-600 font-mono font-bold uppercase block">Malaysia National Drug Formulary Registry</span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight">Clinical Market Price Index</h2>
                <p className="text-xs text-slate-500 mt-1">Live wholesale listings, container pack sizes, and standard reference costs in Malaysian Ringgit (RM).</p>
              </div>

              {/* General stats */}
              <div className="flex bg-slate-50 p-3 rounded-xl border border-slate-100 items-center gap-4 font-mono text-[11px] self-stretch md:self-auto">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">TOTAL INDEX ITEMS</span>
                  <span className="text-slate-800 font-bold block">{marketItems.length} Mapped</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px]">LAST PRICE UPDATE</span>
                  <span className="text-slate-800 font-bold block">2026-05-22</span>
                </div>
              </div>
            </div>

            {/* Category selection and Search query */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              {/* Search Box */}
              <div className="relative md:col-span-5">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search live medicines or equipment..."
                  value={marketSearchQuery}
                  onChange={(e) => setMarketSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-8 pr-3 py-2.5 text-xs outline-none text-slate-800 focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              {/* Quick filter tabs */}
              <div className="md:col-span-7 flex flex-wrap gap-1.5 items-center justify-start md:justify-end">
                {["All", "Vessel Dilators", "Critical Antidotes", "Oxygen Concentrators", "Surgical Apparatus", "General Pharamceuticals"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMarketCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedMarketCategory === cat
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketItems.map((item) => {
                const diff = item.marketPrice - item.prevPrice;
                const percentage = item.prevPrice > 0 ? ((diff / item.prevPrice) * 100).toFixed(1) : "0";
                
                return (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 hover:border-brand-100 bg-white shadow-xxs transition-all space-y-3 relative group">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 max-w-[140px] truncate">
                        {item.category}
                      </span>
                      
                      {/* Trend Badge */}
                      {item.trend === "up" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-1">
                          ▲ +{percentage}%
                        </span>
                      )}
                      {item.trend === "down" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-1">
                          ▼ -{percentage.replace("-", "")}%
                        </span>
                      )}
                      {item.trend === "stable" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-50 border border-slate-150 text-slate-500 font-mono">
                          STABLE
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 md:h-9 leading-tight font-sans">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono. mt-1">Pack Size: <span className="font-semibold text-slate-550">{item.unit}</span></p>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 font-mono">MARKET INDEX PRICING</span>
                        <span className="text-sm font-extrabold text-slate-900 font-display">
                          RM {item.marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] font-bold text-slate-405 font-mono">MALAYSIA STATUS</span>
                        <span className="text-[10px] font-semibold text-slate-500">{item.volume}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredMarketItems.length === 0 && (
                <div className="col-span-full bg-slate-50 text-center py-16 rounded-2xl border border-dashed border-slate-205">
                  <p className="text-sm font-semibold text-slate-500">No drug index or equipment found matching "{marketSearchQuery}"</p>
                  <button 
                    onClick={() => { setMarketSearchQuery(""); setSelectedMarketCategory("All"); }}
                    className="mt-2 text-brand-600 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {/* Quick Pricing note */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <Info size={16} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-550 leading-relaxed font-sans">
                <strong>Hospitals &amp; Clinics Integration:</strong> Dynamic market prices are updated on-chain dynamically relative to Malaysia's wholesale pharmacy indexes. The Workspace allows facility procurement managers to copy these prices or draft purchase orders directly matching current index benchmarks securely to speed up operations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: CONNECTED MALAYSIAN SUPPLIER NETWORK */}
      {activePortalView === "suppliers" && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] tracking-wider text-brand-600 font-mono font-bold uppercase block">
                  Federated Handshake Logistics Integration
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight flex items-center gap-2">
                  <Globe size={22} className="text-slate-800 shrink-0" />
                  National Malaysia Suppliers Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Every leading pharmaceutical and sterile equipment provider in Malaysia is synced directly as a verified peer on our routing matrix. 
                </p>
              </div>

              {/* Verified connectivity banner */}
              <div className="flex bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-150 items-center gap-2.5 font-mono text-[10px] self-stretch md:self-auto select-none">
                <Radio size={14} className="text-emerald-600 animate-pulse" />
                <div>
                  <strong className="block">ALL CHANNELS ACTIVE</strong>
                  <span>6 of 6 Peers Connected (99.1% Total SLA Index)</span>
                </div>
              </div>
            </div>

            {/* Conceptual Network Connectivity Visual Map */}
            <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl border border-slate-900 relative overflow-hidden">
              <div className="absolute top-2 right-4 flex items-center gap-1.5 text-[8px] font-mono text-slate-550 select-none">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>CYBER-SHIELD LINK STABLE // SSL 4096</span>
              </div>
              <h3 className="text-xs font-mono font-bold text-slate-400 mb-6 uppercase tracking-wider">
                Simulated National Routing Matrix &amp; Pings
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {majorSuppliers.map((sup, idx) => (
                  <div key={sup.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-mono select-none">
                        <span className="text-slate-500">PEER.0{idx+1}</span>
                        <span className="text-brand-400 font-bold">1ms</span>
                      </div>
                      <span className="block text-[11px] font-bold text-white tracking-tight mt-1 truncate">
                        {sup.name.split(" ")[0]}
                      </span>
                      <span className="block text-[9px] text-slate-400">{sup.location.split(",")[1] || sup.location}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[8px] font-mono block text-slate-500">PORTFOLIO</span>
                      <span className="text-[9px] line-clamp-1 text-slate-350">{sup.portfolio}</span>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded flex items-center justify-between text-[8px] font-mono">
                      <span className="text-emerald-500 font-bold">● ACTIVE</span>
                      <span className="text-slate-550">{sup.reliability}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic visual connection lines representing we are all connected */}
              <div className="mt-6 border-t border-slate-900 pt-4 text-center select-none">
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  📡 Under Malaysia Cold-Chain Safety regulatory protocols, stock coordinates are handshaked upon dispatch. Approving a Purchase Order trigger creates a structured trace linking Pantai, Gleneagles, KLMC, and sub-depots to these primary hubs instantly.
                </p>
              </div>
            </div>

            {/* List of Malaysian Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              {majorSuppliers.map((sup) => (
                <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xxs hover:shadow-xs transition-shadow space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {sup.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider bg-brand-50 text-brand-700">
                      MALAYSIA Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-slate-600 leading-relaxed font-sans mt-1">
                      {sup.portfolio}
                    </p>
                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Physical Hub:</span>
                        <strong className="text-slate-700 font-mono">{sup.location}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ledger coordinates Address:</span>
                        <strong className="text-slate-700 font-mono">{sup.coordinates}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Average SLA:</span>
                        <strong className="text-emerald-600 font-bold">{sup.reliability}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-400">
                      {sup.phone}
                    </span>
                    <a 
                      href={`mailto:${sup.email}`}
                      className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Mail size={11} />
                      Enquire Direct
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct subscribe integration promo */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl space-y-4">
              <h4 className="text-base font-bold font-display text-white">How Malaysia Suppliers Streamline Operations</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                CureRack integrates with APIs from national clinical vendors. When the facility balance drops, drafts pre-fill pricing values automatically according to the supplier records. Once approved, coordinates are loaded into cold chain vaults immediately without staff manual typing. Create an account to gain direct routing.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActivePortalView("presentation");
                    setTimeout(() => {
                      const el = document.getElementById("subscription");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Join Supplier Network &amp; Subscribe
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER VIEW: COMPLETE USER GUIDE & TECHNICAL DOCUMENTATION */}
      {activePortalView === "docs" && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Documentation Left Navigation Sidebar */}
          <aside className="lg:col-span-1 space-y-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs h-fit lg:sticky lg:top-24">
            
            {/* Mobile/Tablet Header & Collapsible Trigger */}
            <div className="flex items-center justify-between lg:block">
              <div>
                <span className="text-[9px] font-bold font-mono text-brand-600 tracking-wider uppercase block select-none">
                  Manual Navigation
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-950 font-display lg:hidden">
                  Table of Contents
                </h3>
              </div>
              <button
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="lg:hidden px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={13} className="text-brand-600" />
                <span>{mobileTocOpen ? "Hide Index" : "Show Index"}</span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {mobileTocOpen ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {/* Collapsible Area (Visible by default on desktop, toggled on mobile) */}
            <div className={`${mobileTocOpen ? "block" : "hidden lg:block"} space-y-4 pt-3 lg:pt-0 border-t border-slate-100 lg:border-t-0`}>
              {/* Search doc box */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search manual sections..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl pl-8 pr-3 py-2 text-xs outline-none text-slate-800 focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-bold font-mono text-slate-450 tracking-wider uppercase block select-none">
                  Table of Contents Sections
                </span>
                <nav className="space-y-1">
                  {docSections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#doc-sec-${sec.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                    >
                      <CornerDownRight size={11} className="text-brand-500 shrink-0" />
                      <span className="truncate">{sec.title.replace(/^[0-9]\.\s/, "")}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Permissions Reference Panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 pt-3">
                <h5 className="font-bold text-slate-950 text-[10px] uppercase font-mono tracking-wider flex items-center gap-1">
                  <ShieldCheck size={12} className="text-brand-600" />
                  Feature Role Access Matrix
                </h5>
                <div className="space-y-2 text-[10px] text-slate-950 leading-relaxed font-sans">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="font-bold text-slate-900">Dispensation Router</span>
                    <span className="text-emerald-700 font-bold font-mono">STAFF, ADMIN, SUPER</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="font-bold text-slate-900">Adjust Safety Buffers</span>
                    <span className="text-brand-700 font-bold font-mono">ADMIN, SUPER_ADMIN</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="font-bold text-slate-900">Approve / Sign POs</span>
                    <span className="text-indigo-700 font-bold font-mono">ADMIN, SUPER_ADMIN</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="font-bold text-slate-900">Manage Market Rates</span>
                    <span className="text-amber-700 font-bold font-mono">HOSPITAL_ADMIN ONLY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Provision Hospital Nodes</span>
                    <span className="text-rose-700 font-bold font-mono">SUPER_ADMIN ONLY</span>
                  </div>
                </div>
              </div>

              {/* Exit guide trigger */}
              <button
                onClick={() => {
                  setMobileTocOpen(false);
                  setActivePortalView("presentation");
                }}
                className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-900 hover:text-slate-950 cursor-pointer block select-none transition-colors"
              >
                Exit to Home Overview Page
              </button>
            </div>
          </aside>

          {/* Documentation Long-Form Content Area */}
          <main className="lg:col-span-3 space-y-8 animate-fade-in">
            {/* Quick alert bar */}
            <div className="bg-brand-50 border border-brand-100/60 p-4 rounded-2xl flex items-start gap-3 text-left">
              <Info size={16} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-brand-950 leading-relaxed font-sans font-medium">
                <strong>Read the System Instructions manual in detail.</strong> Use this helpful knowledge base to understand Cuerack system behavior, test isolated operator nodes, and leverage structural buffer warnings. Highlighted tags indicate role constraints.
              </div>
            </div>

            {/* List of sections */}
            <div className="space-y-6">
              {filteredDocs.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-450 rounded-2xl border border-slate-100">
                  <p className="font-semibold text-sm text-slate-900">No user guide sections match your search string.</p>
                  <button
                    onClick={() => setDocSearchQuery("")}
                    className="mt-2 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredDocs.map((sec) => (
                  <section 
                    key={sec.id} 
                    id={`doc-sec-${sec.id}`}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-105 shadow-xxs space-y-4 hover:border-slate-200 transition-colors content-block-anchor text-left"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-3">
                      <h4 className="text-base sm:text-lg font-bold text-slate-950 font-display tracking-tight flex items-center gap-1.5">
                        {sec.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 font-mono text-[9px] font-bold uppercase tracking-wider">
                        {sec.category}
                      </span>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-slate-950 leading-relaxed font-sans space-y-3 whitespace-pre-line font-medium">
                      {sec.content}
                    </div>

                    {/* Step guidance widget */}
                    {sec.id === "intro" && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2 space-y-2.5">
                        <span className="text-[10px] font-bold font-mono text-slate-950 uppercase block select-none">SYSTEM WORKSPACE QUICK BOOT INSTRUCTIONS</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-mono shrink-0 select-none font-bold">1</span>
                            <span className="text-slate-950">Hit the <strong>'Launch System'</strong> button above to render the Quick Operator roles selection screen.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-mono shrink-0 select-none font-bold">2</span>
                            <span className="text-slate-950">Toggle roles (Operator Staff, Hospital Admin, Super Admin) to evaluate permissions.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.id === "buffers" && (
                      <div className="border border-rose-100 bg-rose-50/15 p-4 rounded-xl space-y-2.5 mt-2 text-left">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-800 uppercase font-mono">
                          <Flame size={12} className="animate-pulse" />
                          Testing Stock Buffer warning state
                        </div>
                        <p className="text-xs text-rose-950 font-sans leading-relaxed">
                          To trigger other alerts: Navigate to active <strong>'In-Stock Ledger'</strong>. Find an item (e.g. Surgical Apparatus) and click on the pencil icon 'Adjust Safety stock level'. Enter a threshold larger than current Available volume (for example, setting Safety Threshold to <strong>500</strong> units). Hit 'Save'. The row and summary stats will immediately flash.
                        </p>
                      </div>
                    )}
                  </section>
                ))
              )}
            </div>

            {/* Quick interactive checklist widget */}
            <section className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 text-left border border-slate-800">
              <h4 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-400 animate-pulse" />
                Operational Compliance Checklist
              </h4>
              <p className="text-xs text-slate-200 font-medium">Verify logistics procedures against clinical safety protocols:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                {[
                  "Check expired batch sorting (Earliest Expiring on top)",
                  "Confirm delivery warehouseCoordinates with physical shelf markings",
                  "Verify medical buffer parameters on threshold calibrate",
                  "Keep isolated facility contexts separate via user switches"
                ].map((item, id) => (
                  <div key={id} className="flex items-start gap-2.5 text-white">
                    <span className="text-emerald-400 font-bold font-mono text-sm leading-none shrink-0">✓</span>
                    <span className="leading-normal">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}
        </>
      )}
    </div>
  );
}
