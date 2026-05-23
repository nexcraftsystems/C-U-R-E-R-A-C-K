import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  MapPin, 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  User, 
  Lock, 
  History, 
  TrendingUp, 
  Search, 
  ArrowRight, 
  CornerDownRight, 
  Heart, 
  FileSpreadsheet,
  AlertCircle,
  Truck,
  CreditCard,
  Percent,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  Building
} from "lucide-react";

// Define medical products catalog
export interface MedicineProduct {
  id: string;
  name: string;
  brand: string;
  generic: string;
  category: "Antibiotics" | "Inhalers" | "Analgesics" | "Cardiovascular" | "Antidiabetic" | "Antihistamine" | "Antacid" | "Supplements";
  price: number;
  unit: string;
  isSensitive: boolean; // TRUE requires uploaded prescription doctor slip
  description: string;
  stockAvailability: "High Stock" | "Moderate" | "Limited Code";
}

const CATALOG_MEDS: MedicineProduct[] = [
  {
    id: "med-01",
    name: "Co-Amoxiclav 625mg Tablet (Amoxicillin)",
    brand: "Amohex Clinical",
    generic: "Amoxicillin Trihydrate + Potassium Clavulanate",
    category: "Antibiotics",
    price: 38.50,
    unit: "Box (21s)",
    isSensitive: true,
    description: "Broad-spectrum antibacterial treatment. Certified prescription is strict Malaysian MOH protocol to avoid drug resistance.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-02",
    name: "Albuterol 100mcg Evohaler (Ventolin)",
    brand: "Ventolin GlaxoSmith",
    generic: "Salbutamol Sulfate Inhaler",
    category: "Inhalers",
    price: 32.00,
    unit: "Inhaler (200 doses)",
    isSensitive: true,
    description: "Bronchodilator. Relieves bronchospasms in asthma, chronic bronchitis, and emphysema. Patient script verification mandatory.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-03",
    name: "Paracetamol Actifast 500mg",
    brand: "Panadol Actifast",
    generic: "Paracetamol with Sodium Bicarbonate",
    category: "Analgesics",
    price: 14.20,
    unit: "Pack (20 Tablets)",
    isSensitive: false,
    description: "Fast-absorption pain reliever and fever reducer. Gentle on stomach. Safe clinical over-the-counter (OTC) drug.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-04",
    name: "Metformin Hydrochloride 500mg SR",
    brand: "Glucophage Retard",
    generic: "Metformin HCl Sustained Release",
    category: "Antidiabetic",
    price: 24.00,
    unit: "Box (60s)",
    isSensitive: true,
    description: "Oral anti-diabetic drug. Lowers blood glucose levels by improving insulin sensitivity. For Type-2 Diabetes management.",
    stockAvailability: "Moderate"
  },
  {
    id: "med-05",
    name: "Atorvastatin 20mg Tablet",
    brand: "Lipitor Pfizer",
    generic: "Atorvastatin Calcium",
    category: "Cardiovascular",
    price: 68.50,
    unit: "Box (30s)",
    isSensitive: true,
    description: "Statins lipid-lowering medication. Reduces LDL cholesterol and triglycerides. Lowers risk of cardiovascular stroke events.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-06",
    name: "Cetirizine Dihydrochloride 10mg",
    brand: "Zyrtec Fast-Acting",
    generic: "Cetirizine Dihydrochloride",
    category: "Antihistamine",
    price: 16.80,
    unit: "Pack (10s)",
    isSensitive: false,
    description: "Fast-acting, non-drowsy 24-hour relief from seasonal allergies, chronic hives, runny nose, and watery eyes.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-07",
    name: "Gaviscon Double Action Suspension",
    brand: "Gaviscon Extreme",
    generic: "Sodium Alginate + Sodium Bicarbonate",
    category: "Antacid",
    price: 28.00,
    unit: "Bottle (150ml)",
    isSensitive: false,
    description: "Heartburn and acid indigestion therapy. Creates a protective physical barrier raft over stomach contents to suppress reflux.",
    stockAvailability: "Moderate"
  },
  {
    id: "med-08",
    name: "High-Potency Vitamin C + Zinc Effervescent",
    brand: "Redoxon Immune Shield",
    generic: "Ascorbic Acid 1000mg + Zinc 10mg",
    category: "Supplements",
    price: 34.90,
    unit: "Tube (15s)",
    isSensitive: false,
    description: "Synergistic immune-support supplementation formula to elevate immunity buffers against seasonal infections.",
    stockAvailability: "High Stock"
  },
  {
    id: "med-09",
    name: "Gabapentin 300mg Neuro Capsules",
    brand: "Neurontin Pfizer",
    generic: "Gabapentin Neurological",
    category: "Cardiovascular",
    price: 85.00,
    unit: "Box (50s)",
    isSensitive: true,
    description: "Restricted neuro-modulator. Indicated for neuropathic pain control and clinical post-herpetic neuralgia. Strict verification.",
    stockAvailability: "Limited Code"
  }
];

// Malaysia Regional Hospital Selector Dataset
export interface MalaysiaFacility {
  id: string;
  name: string;
  state: string;
  type: "Hospital" | "Clinic";
  distanceInKm: number;
  estDriveTimeMinutes: number;
  address: string;
  phone: string;
  inventorySyncStatus: "Synchronized Parity" | "Offline Tracking Mode";
  latitude: number;
  longitude: number;
}

const FACILITIES_MY: MalaysiaFacility[] = [
  // WP Kuala Lumpur / Selangor
  {
    id: "fac-01",
    name: "Hospital Serdang",
    state: "Selangor / WP Kuala Lumpur",
    type: "Hospital",
    distanceInKm: 0.1, // Near core system node
    estDriveTimeMinutes: 1,
    address: "Jalan Puchong, 43000 Kajang, Selangor Darul Ehsan",
    phone: "+60 3-8947 5555",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 3.0123,
    longitude: 101.7231
  },
  {
    id: "fac-02",
    name: "Gleneagles Kuala Lumpur",
    state: "Selangor / WP Kuala Lumpur",
    type: "Hospital",
    distanceInKm: 6.8,
    estDriveTimeMinutes: 12,
    address: "286, Jalan Ampang, Kampung Datuk Keramat, 50450 Kuala Lumpur",
    phone: "+60 3-4141 3000",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 3.1592,
    longitude: 101.7371
  },
  {
    id: "fac-03",
    name: "KPJ Damansara Specialist Hospital",
    state: "Selangor / WP Kuala Lumpur",
    type: "Hospital",
    distanceInKm: 14.5,
    estDriveTimeMinutes: 22,
    address: "119, Jalan SS 20/10, Damansara Utama, 47400 Petaling Jaya, Selangor",
    phone: "+60 3-7718 1000",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 3.1342,
    longitude: 101.6288
  },
  {
    id: "fac-04",
    name: "Poliklinik Serdang Utama",
    state: "Selangor / WP Kuala Lumpur",
    type: "Clinic",
    distanceInKm: 2.3,
    estDriveTimeMinutes: 6,
    address: "23, Jalan Kenari 1, Taman Serdang Raya, 43300 Seri Kembangan, Selangor",
    phone: "+60 3-8941 7711",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 3.0250,
    longitude: 101.7050
  },
  // Penang
  {
    id: "fac-05",
    name: "Island Hospital Penang",
    state: "Penang",
    type: "Hospital",
    distanceInKm: 342.1,
    estDriveTimeMinutes: 240,
    address: "308, Jalan Macalister, 10450 George Town, Pulau Pinang",
    phone: "+60 4-238 3388",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 5.4144,
    longitude: 100.3111
  },
  {
    id: "fac-06",
    name: "Penang General Hospital",
    state: "Penang",
    type: "Hospital",
    distanceInKm: 341.2,
    estDriveTimeMinutes: 238,
    address: "Jalan Residensi, 10990 George Town, Pulau Pinang",
    phone: "+60 4-222 5333",
    inventorySyncStatus: "Offline Tracking Mode",
    latitude: 5.4172,
    longitude: 100.3090
  },
  // Johor
  {
    id: "fac-07",
    name: "Gleneagles Hospital Medini Johor",
    state: "Johor",
    type: "Hospital",
    distanceInKm: 326.4,
    estDriveTimeMinutes: 195,
    address: "2, Jalan Medini Utara 4, Bandar Medini Iskandar, 79250 Iskandar Puteri, Johor",
    phone: "+60 7-560 1000",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 1.4244,
    longitude: 103.6292
  },
  {
    id: "fac-08",
    name: "Poliklinik Rakyat Larkin",
    state: "Johor",
    type: "Clinic",
    distanceInKm: 318.0,
    estDriveTimeMinutes: 185,
    address: "12, Jalan Larkin, Taman Larkin, 80350 Johor Bahru, Johor",
    phone: "+60 7-224 8822",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 1.4925,
    longitude: 103.7410
  },
  // East Malaysia (Sarawak & Sabah)
  {
    id: "fac-09",
    name: "Kuching Specialist Hospital KPJ",
    state: "Sarawak & Sabah (East MY)",
    type: "Hospital",
    distanceInKm: 985.0,
    estDriveTimeMinutes: 75, // Flight based estimate
    address: "Lot 10420, Block 11, Tabuan Stutong, Jalan Setia Raja, 93350 Kuching, Sarawak",
    phone: "+60 82-365 777",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 1.5111,
    longitude: 110.3800
  },
  {
    id: "fac-10",
    name: "Kota Kinabalu Medical Center",
    state: "Sarawak & Sabah (East MY)",
    type: "Hospital",
    distanceInKm: 1640.0,
    estDriveTimeMinutes: 135, // Flight based estimate
    address: "Lorong Bersatu, Off Jalan Damai, Luyang, 88300 Kota Kinabalu, Sabah",
    phone: "+60 88-272 620",
    inventorySyncStatus: "Synchronized Parity",
    latitude: 5.9620,
    longitude: 116.0965
  }
];

// Patient Cart Item structure
interface CartItem {
  med: MedicineProduct;
  quantity: number;
}

export interface PersonalPortalProps {
  activeTab?: "landing" | "pharmacy" | "console" | "dashboard" | "admin";
  onTabChange?: (tab: "landing" | "pharmacy" | "console" | "dashboard" | "admin") => void;
}

export default function CureRackPersonalPortal({ activeTab, onTabChange }: PersonalPortalProps = {}) {
  // Navigation internal views with fallbacks (Controlled or Uncontrolled)
  const [internalTab, setInternalTab] = useState<"landing" | "pharmacy" | "console" | "dashboard">("landing");
  const personalTab = activeTab !== undefined ? activeTab : (internalTab as any);
  const setPersonalTab = (tab: "landing" | "pharmacy" | "console" | "dashboard" | "admin") => {
    if (onTabChange) {
      onTabChange(tab as any);
    } else {
      setInternalTab(tab as any);
    }
  };
  
  // Patient Account States with login & phone tracking
  const [patientAccount, setPatientAccount] = useState<{
    fullName: string;
    mykadNo: string;
    email: string;
    phone: string;
    bloodGroup: string;
    allergies: string;
    memberId: string;
    registered: boolean;
    isLoggedIn: boolean;
    authMethod: "phone" | "google" | null;
  }>(() => {
    const saved = localStorage.getItem("cuerack_patient_profile_v2");
    return saved ? JSON.parse(saved) : {
      fullName: "",
      mykadNo: "",
      email: "",
      phone: "",
      bloodGroup: "O+",
      allergies: "None reported",
      memberId: "",
      registered: false,
      isLoggedIn: false,
      authMethod: null
    };
  });

  // Simulated Database of Registered Persons
  const [registeredPatients, setRegisteredPatients] = useState<any[]>(() => {
    const saved = localStorage.getItem("cuerack_registered_patients_list");
    if (saved) return JSON.parse(saved);
    const defaults = [
      {
        fullName: "Muhammad Adam bin Yusuf",
        mykadNo: "940312-14-1234",
        email: "adam.yusuf@gmail.com",
        phone: "+60 12-345 6789",
        bloodGroup: "O+",
        allergies: "Penicillin",
        memberId: "PAT-88092",
        registered: true,
        authMethod: "phone",
        regDate: "2026-05-20"
      },
      {
        fullName: "Farah binti Ahmad",
        mykadNo: "961102-10-5432",
        email: "farah.ahmad@gmail.com",
        phone: "+60 19-876 5432",
        bloodGroup: "A-",
        allergies: "None",
        memberId: "PAT-41221",
        registered: true,
        authMethod: "google",
        regDate: "2026-05-21"
      },
      {
        fullName: "Rajesh Kumar s/o Moorthy",
        mykadNo: "880524-08-9871",
        email: "rajesh.kumar@gmail.com",
        phone: "+60 11-2345 6789",
        bloodGroup: "B+",
        allergies: "Aspirin",
        memberId: "PAT-33215",
        registered: true,
        authMethod: "phone",
        regDate: "2026-05-22"
      },
      {
        fullName: "Tan Mei Ling",
        mykadNo: "910815-14-3322",
        email: "mei.ling@gmail.com",
        phone: "+60 17-991 2288",
        bloodGroup: "AB+",
        allergies: "Sulfonamides",
        memberId: "PAT-50912",
        registered: true,
        authMethod: "google",
        regDate: "2026-05-23"
      }
    ];
    localStorage.setItem("cuerack_registered_patients_list", JSON.stringify(defaults));
    return defaults;
  });

  // Simulated Database of Store Orders
  const [allOrders, setAllOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("cuerack_all_orders_list");
    if (saved) return JSON.parse(saved);
    const defaults = [
      {
        orderId: "ORDER-KL-88301",
        patientName: "Muhammad Adam bin Yusuf",
        timestamp: "2026-05-22T14:32:00.000Z",
        items: [
          { brand: "Panadol ActiFast", price: 15.00, quantity: 2 },
          { brand: "Ventolin Inhaler", price: 45.00, quantity: 1 }
        ],
        totalAmount: 111.40,
        shippingAddress: "Apartment 12A, Block C, Residency 14, Bandar Sunway, Selangor",
        deliveryType: "door",
        pickupAppointmentDate: "",
        pickupHospital: "",
        status: "In Transit",
        parcelTrackingNo: "PL-MY-9908123"
      },
      {
        orderId: "ORDER-KL-44912",
        patientName: "Farah binti Ahmad",
        timestamp: "2026-05-23T09:15:00.000Z",
        items: [
          { brand: "Amohex Clinical", price: 38.50, quantity: 1 }
        ],
        totalAmount: 52.81,
        shippingAddress: "",
        deliveryType: "pickup",
        pickupAppointmentDate: "2026-05-25 (02:30 PM)",
        pickupHospital: "Hospital Serdang",
        status: "Ready for Pickup",
        parcelTrackingNo: ""
      }
    ];
    localStorage.setItem("cuerack_all_orders_list", JSON.stringify(defaults));
    return defaults;
  });

  // Gatekeeping & OTP OTP Simulation states
  const [authTab, setAuthTab] = useState<"phone" | "google">("phone");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  const [googleSimulating, setGoogleSimulating] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Administrative Console View Toggle state
  const [consoleRole, setConsoleRole] = useState<"patient" | "admin">("patient");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Delivery type checkout controls: self-pickup vs home delivery
  const [deliveryType, setDeliveryType] = useState<"door" | "pickup">("door");
  const [pickupHospital, setPickupHospital] = useState("Hospital Serdang");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00 AM");

  // Custom Appointments simulation
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([
    {
      id: "APT-201",
      patientName: "Muhammad Adam Yusuf",
      facility: "Hospital Serdang",
      date: "2026-05-26",
      time: "11:30 AM",
      type: "Medication Pickup",
      status: "Confirmed"
    }
  ]);

  const [newAptDate, setNewAptDate] = useState("");
  const [newAptTime, setNewAptTime] = useState("10:00 AM");
  const [newAptFacility, setNewAptFacility] = useState("Hospital Serdang");

  // Patient Account States (localStorage back up fallback is retained for code references below)
  // Dynamic state selectors
  const [searchMedsQuery, setSearchMedsQuery] = useState("");
  const [selectedMedsCategory, setSelectedMedsCategory] = useState<string>("All");
  
  // Malaysia Map selector
  const [selectedState, setSelectedState] = useState<string>("Selangor / WP Kuala Lumpur");
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // File Upload Prescription states
  const [prescriptionSlip, setPrescriptionSlip] = useState<{
    name: string;
    fileUploaded: boolean;
    doctorsName: string;
    clinicName: string;
    issueDate: string;
    detectedMeds: string[];
    isVerified: boolean;
  } | null>(() => {
    const saved = localStorage.getItem("cuerack_prescription_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [parsingSimulated, setParsingSimulated] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cuerack_patient_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Direct 3rd party callback url custom checkouts
  const [paymentTriggered, setPaymentTriggered] = useState(false);
  const [receiptVoucher, setReceiptVoucher] = useState<{
    orderId: string;
    timestamp: string;
    totalAmount: number;
    patientName: string;
    items: { name: string; brand: string; qty: number; price: number }[];
    postalAddress: string;
    parcelTrackingNo: string;
    sensitiveVerified: boolean;
  } | null>(null);

  const [shippingAddress, setShippingAddress] = useState("");
  const [billingContact, setBillingContact] = useState("");
  const [paymentOption, setPaymentOption] = useState<string>("ToyyibPay Direct MYR");

  // Registration Form state
  const [regForm, setRegForm] = useState({
    fullName: "",
    mykadNo: "",
    email: "",
    bloodGroup: "B+",
    allergies: ""
  });

  // Verification codes
  const [manualScriptRef, setManualScriptRef] = useState("");
  const [manualDocMmc, setManualDocMmc] = useState("");
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState<string | null>(null);

  // Auto save profile & cart states on state updates
  useEffect(() => {
    localStorage.setItem("cuerack_patient_profile_v2", JSON.stringify(patientAccount));
  }, [patientAccount]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  useEffect(() => {
    localStorage.setItem("cuerack_patient_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (prescriptionSlip) {
      localStorage.setItem("cuerack_prescription_data", JSON.stringify(prescriptionSlip));
    } else {
      localStorage.removeItem("cuerack_prescription_data");
    }
  }, [prescriptionSlip]);

  // Handle Drag Events for File Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPrescriptionFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPrescriptionFile(e.target.files[0]);
    }
  };

  const triggerFileSelection = () => {
    fileInputRef.current?.click();
  };

  // Simulate automated prescription verification parsing (AI match)
  const processPrescriptionFile = (file: File) => {
    setParsingSimulated(true);

    // Dynamic delay mapping to medical transcription processing
    setTimeout(() => {
      const mockDoctors = ["Dr. Kenneth Lim Abdullah (MMC: 44021)", "Dr. Farah Syamilah binti Hussin (MMC: 50920)", "Dr. Nicholas Devadas (MOH General)"];
      const mockClinics = ["Beacon Health Clinic Kuala Lumpur", "Gleneagles Specialist Unit 4", "Damansara Prihatin Family Care"];
      const randomArr = Math.floor(Math.random() * mockDoctors.length);

      setPrescriptionSlip({
        name: file.name,
        fileUploaded: true,
        doctorsName: mockDoctors[randomArr],
        clinicName: mockClinics[randomArr],
        issueDate: new Date().toLocaleDateString("en-MY"),
        detectedMeds: [
          "med-01", // Auto matched Amoxicillin
          "med-02"  // Auto matched Ventolin inhaler
        ],
        isVerified: true
      });
      setParsingSimulated(false);
    }, 2200);
  };

  // Safe manual verify input option
  const handleManualVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualScriptRef || !manualDocMmc) return;

    setPrescriptionSlip({
      name: "Manual Registry Declaration Script.pdf",
      fileUploaded: true,
      doctorsName: `DR. REGISTERED (MMC No: ${manualDocMmc})`,
      clinicName: "Verified Affiliated Malaysian MOH Facility Node",
      issueDate: new Date().toLocaleDateString("en-MY"),
      detectedMeds: ["med-01", "med-02", "med-04", "med-05", "med-09"],
      isVerified: true
    });

    setVerificationSuccessMessage("🚀 Prescription Script Reference verified successfully against MOH Registry! All sensitive medicines unlocked.");
    setTimeout(() => setVerificationSuccessMessage(null), 6000);
    setManualScriptRef("");
    setManualDocMmc("");
  };

  // Cart operations
  const addToCart = (product: MedicineProduct) => {
    // Audit Guard: Sensitive check
    const hasActiveVerifyPrescription = prescriptionSlip !== null && prescriptionSlip.isVerified;
    if (product.isSensitive && !hasActiveVerifyPrescription) {
      // Trigger user warning / action block
      alert(`⚠️ SAFETY GATE KEEPER: Under Malaysia Ministry of Health Regulations, "${product.brand} (${product.name})" is a Restricted Prescription-Only Drug. Please first upload your certified Doctor Prescription Slip or type MMC register reference numbers to unlock checkout.`);
    }

    setCart(prev => {
      const match = prev.find(item => item.med.id === product.id);
      if (match) {
        return prev.map(item => item.med.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { med: product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.med.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.med.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Automated SMS OTP simulated code gen
  const [generatedSmsOtp, setGeneratedSmsOtp] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  const handleSendOtpCode = () => {
    if (!phoneNumberInput) {
      alert("Please enter a valid Malaysian (+60) mobile phone number.");
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedSmsOtp(code);
    setOtpSent(true);
    setOtpTimer(30);
    alert(`📱 [MOCK SMS GRID]: Verification code dispatched to ${phoneNumberInput}. Code is ${code}. Verify within 30 seconds.`);
  };

  const verifyOtpAndRegister = (fullName: string, mykadNo: string, email: string, bloodGroup: string, allergies: string) => {
    if (!otpCodeInput) {
      alert("Please enter the verification OTP code.");
      return;
    }
    if (otpCodeInput !== generatedSmsOtp) {
      alert("❌ Invalid OTP. Please try again or re-send.");
      return;
    }

    const uniqueMemberId = `CR-PAT-PH-${Math.floor(100000 + Math.random() * 900000)}`;
    const completedProfile = {
      fullName: fullName || "Verified Patient",
      mykadNo: mykadNo || "951012-14-1122",
      email: email || "patient@phone.my",
      phone: phoneNumberInput,
      bloodGroup: bloodGroup || "O+",
      allergies: allergies || "None reported",
      memberId: uniqueMemberId,
      registered: true,
      isLoggedIn: true,
      authMethod: "phone" as const
    };

    setPatientAccount(completedProfile);

    // Save to active registry database
    const updated = [completedProfile, ...registeredPatients];
    setRegisteredPatients(updated);
    localStorage.setItem("cuerack_registered_patients_list", JSON.stringify(updated));

    setOtpSent(false);
    setOtpCodeInput("");
    setGeneratedSmsOtp("");
    alert("🟢 Phone OTP Verification Successful! Your patient account is activated & synchronized.");
  };

  // Google Sign In simulated handler
  const handleGoogleSignInComplete = (selectedEmail: string, chosenName: string) => {
    const uniqueMemberId = `CR-PAT-GG-${Math.floor(100000 + Math.random() * 900000)}`;
    const completedProfile = {
      fullName: chosenName,
      mykadNo: "900821-14-5544",
      email: selectedEmail,
      phone: "+60 17-228 3341",
      bloodGroup: "B+",
      allergies: "None reported",
      memberId: uniqueMemberId,
      registered: true,
      isLoggedIn: true,
      authMethod: "google" as const
    };

    setPatientAccount(completedProfile);

    // Save to active registry database
    const updated = [completedProfile, ...registeredPatients];
    setRegisteredPatients(updated);
    localStorage.setItem("cuerack_registered_patients_list", JSON.stringify(updated));

    setShowGoogleModal(false);
    alert(`🟢 Google Account Authentication successful for ${chosenName}! Welcome back.`);
  };

  // Account creation handling
  const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.email || !regForm.mykadNo) {
      alert("Please provide name, email and MyKad number.");
      return;
    }

    const uniqueMemberId = `CR-PAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const completedProfile = {
      fullName: regForm.fullName,
      mykadNo: regForm.mykadNo,
      email: regForm.email,
      phone: "+60 12-000 0000",
      bloodGroup: regForm.bloodGroup,
      allergies: regForm.allergies || "No allergies reported",
      memberId: uniqueMemberId,
      registered: true,
      isLoggedIn: true,
      authMethod: "phone" as const
    };

    setPatientAccount(completedProfile);
    
    // Save to active registry
    const updated = [completedProfile, ...registeredPatients];
    setRegisteredPatients(updated);
    localStorage.setItem("cuerack_registered_patients_list", JSON.stringify(updated));

    setRegForm({
      fullName: "",
      mykadNo: "",
      email: "",
      bloodGroup: "B+",
      allergies: ""
    });
  };

  const handleLogoutPatient = () => {
    if (window.confirm("Are you sure you want to log out from your Patient health file?")) {
      setPatientAccount({
        fullName: "",
        mykadNo: "",
        email: "",
        phone: "",
        bloodGroup: "O+",
        allergies: "None reported",
        memberId: "",
        registered: false,
        isLoggedIn: false,
        authMethod: null
      });
      setPrescriptionSlip(null);
      clearCart();
      setOtpSent(false);
      setOtpCodeInput("");
    }
  };

  // Checkout handling
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Guard: Patient MUST have account registered and be logged in
    if (!patientAccount.registered || !patientAccount.isLoggedIn) {
      alert("🔒 HEALTH COMPLIANCE: To track and purchase medication securely, please log in or authenticate your free healthcare profile first using the Personal System Console or verification gates.");
      setPersonalTab("console");
      return;
    }

    // Guard: Sensitive item restriction check
    const containsSensitive = cart.some(item => item.med.isSensitive);
    const hasPrescription = prescriptionSlip !== null && prescriptionSlip.isVerified;

    if (containsSensitive && !hasPrescription) {
      alert("❌ COMPLIANCE OVERRIDE ATTEMPT ALERT: Your shopping cart contains controlled/sensitive pharmaceutical medicines (antibiotics / restricted inhalers) requiring verified doctor certification. Please upload your doctor slip or enter diagnostic reference values to finalize.");
      return;
    }

    if (deliveryType === "door" && !shippingAddress) {
      alert("Please enter home doorstep delivery address.");
      return;
    }

    if (deliveryType === "pickup" && !pickupDate) {
      alert("Please select a valid future date for your Self-Pickup Appointment.");
      return;
    }

    // Success Simulation of direct payment routing
    setPaymentTriggered(true);

    const subTotal = cart.reduce((sum, item) => sum + item.med.price * item.quantity, 0);
    const gstSst = subTotal * 0.06; // 6% medical services threshold
    const flatDeliveryFee = deliveryType === "door" ? 12.00 : 0.00; // rm12 for poslaju delivery, free for self pickup
    const totalWithShip = subTotal + gstSst + flatDeliveryFee;

    setTimeout(() => {
      const mockOrderNo = `CR-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      const mockTracking = deliveryType === "door" ? `POSLAJU-MY-${Math.floor(88200000 + Math.random() * 999999)}` : "";
      const pickupTimeFormatted = deliveryType === "pickup" ? `${pickupDate} (${pickupTime})` : "";

      const receiptObj = {
        orderId: mockOrderNo,
        timestamp: new Date().toLocaleString("en-MY"),
        totalAmount: totalWithShip,
        patientName: patientAccount.fullName,
        items: cart.map(i => ({
          name: i.med.name,
          brand: i.med.brand,
          qty: i.quantity,
          price: i.med.price
        })),
        postalAddress: deliveryType === "door" ? shippingAddress : `Self-Pickup Appointment at ${pickupHospital}`,
        parcelTrackingNo: mockTracking,
        sensitiveVerified: containsSensitive
      };

      setReceiptVoucher(receiptObj);

      // Save to centralized orders database
      const newOrder = {
        orderId: mockOrderNo,
        patientName: patientAccount.fullName,
        timestamp: new Date().toISOString(),
        items: cart.map(i => ({
          brand: i.med.brand,
          price: i.med.price,
          quantity: i.quantity
        })),
        totalAmount: totalWithShip,
        shippingAddress: deliveryType === "door" ? shippingAddress : "",
        deliveryType,
        pickupAppointmentDate: pickupTimeFormatted,
        pickupHospital: deliveryType === "pickup" ? pickupHospital : "",
        status: deliveryType === "pickup" ? "Ready for Pickup" : "Paid",
        parcelTrackingNo: mockTracking
      };

      const updatedOrders = [newOrder, ...allOrders];
      setAllOrders(updatedOrders);
      localStorage.setItem("cuerack_all_orders_list", JSON.stringify(updatedOrders));

      // Clear checkout active details
      clearCart();
      setShippingAddress("");
      setPaymentTriggered(false);
      setPersonalTab("dashboard"); // Route immediately to simple tracking dashboard
    }, 1800);
  };

  // Lookups and stats
  const activeStateFacilities = FACILITIES_MY.filter(f => f.state === selectedState);
  
  const filteredMeds = CATALOG_MEDS.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchMedsQuery.toLowerCase()) || 
                          med.brand.toLowerCase().includes(searchMedsQuery.toLowerCase()) || 
                          med.generic.toLowerCase().includes(searchMedsQuery.toLowerCase());
    const matchesCategory = selectedMedsCategory === "All" || med.category === selectedMedsCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.med.price * item.quantity, 0);
  const cartPrescriptionOnlyCount = cart.filter(item => item.med.isSensitive).length;

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50/50">
      
      {/* Dynamic Sub-header Navigation representing Personal Hub */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white border-y border-emerald-900 shadow-sm py-4 px-4 sm:px-6 relative overflow-hidden text-left">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] select-none pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-900 p-1 rounded font-mono text-[9px] font-extrabold uppercase select-none">
                PATIENT PORTAL ACTIVE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-teal-200 text-xs font-mono font-medium">Safe Medication Dispensation Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mt-1">
              CureRack.my - <span className="text-emerald-400">Personal</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-teal-100/75 max-w-xl leading-relaxed mt-1">
              Direct household pharmaceutical supply chain parity. Verify clinical prescriptions, lookup certified medicine inventories, map local hospital routes, and secure authentic medication tracking.
            </p>
          </div>

          {/* Quick Tab switcher controls styled like Apple tabs */}
          <div className="flex flex-wrap p-1 bg-teal-950/80 rounded-xl border border-teal-800/60 text-xs font-semibold gap-1 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setPersonalTab("landing")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                personalTab === "landing" ? "bg-emerald-550 text-white shadow-sm" : "text-teal-200 hover:text-white"
              }`}
            >
              Overview &amp; Market Core
            </button>
            <button
              onClick={() => setPersonalTab("pharmacy")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                personalTab === "pharmacy" ? "bg-emerald-550 text-white shadow-sm" : "text-teal-200 hover:text-white"
              }`}
            >
              Buy Medicines Online
              {cart.length > 0 && (
                <span className="bg-yellow-400 text-slate-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setPersonalTab("console")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 bg-teal-900/60 border border-teal-800 ${
                personalTab === "console" ? "bg-emerald-550 text-white shadow-sm" : "text-teal-200 hover:text-white"
              }`}
            >
              Personal System Console
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button
              onClick={() => setPersonalTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                personalTab === "dashboard" ? "bg-emerald-550 text-white shadow-sm" : "text-teal-200 hover:text-white"
              }`}
            >
              Patient Dashboard Tracker
              {patientAccount.registered && patientAccount.isLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        
        {/* VIEW 1: PERSOANL LEVEL OVERVIEW AND MARKET DISCOVERY (MOH AUTHENTICITY PITCH) */}
        {personalTab === "landing" && (
          <div className="space-y-12">
            
            {/* Visual presentation pitch on why CureRack is transforming the pharmaceutical market */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 select-none">
                <Sparkles size={160} />
              </div>
              <div className="lg:col-span-7 space-y-5 text-left relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-100 font-mono tracking-wider uppercase">
                  <ShieldCheck size={12} className="text-emerald-500" /> Unified National Drug Authentication Initiative
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight font-display">
                  Guaranteed Authentic Medicine. <br />
                  Direct From Hospital Caches to Your Home.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Malaysia currently faces volatile pharmaceutical pricing and high drug counterfeiting. Under the **CureRack.my Unified Network**, patient orders route directly from local hospital warehouses and certified supply networks. No middlemen inflation. 100% verified cold-chain storage. 
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                  <div className="flex gap-2">
                    <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                    <p className="text-slate-500 leading-normal">
                      <strong className="text-slate-800 block">Strict MOH Compliance Parity</strong>
                      Restricted sensitive antibiotics cannot bypass certified validation controls.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-500 font-bold text-sm shrink-0">✓</span>
                    <p className="text-slate-500 leading-normal">
                      <strong className="text-slate-800 block">Active Price Stabilizer Indexes</strong>
                      Tracks actual clinical procurement rates directly to curb retail hospital price gouging.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setPersonalTab("pharmacy")}
                    className="bg-slate-950 text-white hover:bg-slate-800 px-6 py-3 rounded-xl font-bold font-display text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Browse Safe Pharmacy</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => setPersonalTab("console")}
                    className="bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 px-6 py-3 rounded-xl font-bold font-display text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin size={14} className="text-emerald-600" />
                    <span>Find Nearest Verified Pharmacy Node</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Presentation Flow Diagram panel */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 text-left space-y-4">
                <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">
                  🚀 THE PARADIGM SHIFT LOOP
                </span>
                
                <div className="space-y-3.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 relative">
                    <div className="absolute top-2.5 right-3 bg-red-100 text-red-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                      Old Retailing System
                    </div>
                    <strong className="text-slate-800 block font-bold">Standard Unverified Outlets</strong>
                    <p className="text-slate-500 text-[10px] mt-1">
                      No safety track trace limits, leading to potential expired medicines re-batching and 300% markup prices in retail.
                    </p>
                  </div>

                  <div className="flex justify-center -my-1 text-emerald-550 py-0.5 animate-bounce">
                    <CornerDownRight size={18} className="transform rotate-90" />
                  </div>

                  <div className="bg-emerald-950 text-emerald-100 p-4 rounded-xl border border-emerald-800 shadow relative">
                    <div className="absolute top-3 right-4 bg-emerald-500 text-slate-950 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm">
                      CURERACK.MY DIRECT LOOP
                    </div>
                    <strong className="text-white block font-bold flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-400" /> Real-time Warehouse Routing
                    </strong>
                    <p className="text-emerald-200 text-[10px] mt-1.5 leading-relaxed">
                      Syncs directly with isolated clinical stock nodes (like Serdang Hospital caches). Prescriptions verify digitally against MOH credentials database to secure household delivery.
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-emerald-800 flex justify-between items-center text-[10px] text-emerald-300 font-mono">
                      <span>✓ 100% Authentic Guaranteed</span>
                      <span className="text-emerald-400">Low-Latency Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Informational Cards on Industry Impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-bold text-slate-800 text-sm font-display">Eliminates Counterfeits</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Blockchain track and trace elements verify drug serials right from physical warehouse shelving racks directly to patients.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-bold text-slate-800 text-sm font-display">Tackles Shortages Instantly</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Connects to Hospital Safety Threshold state monitors, allowing direct public redistribution during nationwide shortage crises.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-bold text-slate-800 text-sm font-display">MOH Protocol Enforced</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Strictly gates sensitive pain medicines/antibiotics so they can never be dispatched without dual doctor and clinic validations.
                </p>
              </div>
            </div>

            {/* Simulated Live Statistics */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left relative">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold block">
                  LIVE MALAYSIAN PHARMACY DEPLOYMENT MATRIX
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-display text-white">
                  Parity Operations Active Under Ministry Directives
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time synchronization ensures correct safety parameters operate continuously across all districts.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                <div className="text-left">
                  <span className="block text-2xl font-extrabold text-emerald-400 font-mono">10</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Verified Hospital Nodes Mapped</span>
                </div>
                <div className="text-left border-l border-slate-800 pl-6 sm:pl-10">
                  <span className="block text-2xl font-extrabold text-emerald-400 font-mono">99.99%</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Authenticity Ledger Assurance</span>
                </div>
                <div className="text-left border-l border-slate-800 pl-6 sm:pl-10">
                  <span className="block text-2xl font-extrabold text-emerald-400 font-mono">12 mins</span>
                  <span className="text-[10px] text-slate-400 font-sans block">Avg Patient Dispense Lock Time</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SMART PHARMACY - ONLINE SHOPPING WITH SENSITIVE MEDICINES GATEKEEPER */}
        {personalTab === "pharmacy" && (
          <div className="relative min-h-[500px]">
            {/* Blurrable background for security gatekeeping */}
            <div className={`transition-all duration-350 ${!patientAccount.isLoggedIn ? "blur-md opacity-30 select-none pointer-events-none scale-[0.985]" : ""}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Prescription Upload Dropzone + Medicine Browser catalog */}
            <div className="lg:col-span-8 space-y-8 text-left">
              
              {/* Prescription verification zone */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-bold text-slate-850 text-base font-display flex items-center gap-1.5">
                      <FileText size={18} className="text-emerald-600" />
                      1. Doctor Prescription Validation Locker
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-sans">
                      Upload your certified slip or hospital PDF to unlock restricted prescription-only medicines instantly.
                    </p>
                  </div>
                  
                  {prescriptionSlip && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Unlock verified: Access Granted
                    </span>
                  )}
                </div>

                {/* Upload File Zone */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-250 bg-slate-50/60 hover:bg-slate-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelection}
                >
                  <input 
                    type="file" 
                    id="patient_prescription_file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  
                  {parsingSimulated ? (
                    <div className="py-4 space-y-3 flex flex-col items-center">
                      <RefreshCw size={28} className="text-emerald-600 animate-spin" />
                      <div>
                        <strong className="text-slate-800 text-xs block font-bold">Scanning Document Metadata...</strong>
                        <p className="text-slate-400 text-[10px] mt-0.5">Automated transcription mapping linking clinical codes to MOH registry indices.</p>
                      </div>
                    </div>
                  ) : prescriptionSlip ? (
                    <div className="py-2 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="space-y-1">
                          <strong className="text-slate-900 font-bold text-xs block">{prescriptionSlip.name}</strong>
                          <p className="text-[10px] text-slate-500 font-medium">Verified Issuer: <strong className="text-slate-700">{prescriptionSlip.doctorsName}</strong></p>
                          <p className="text-[10px] text-slate-500 font-medium font-sans">Authorized Facility Node: <strong className="text-slate-700">{prescriptionSlip.clinicName}</strong></p>
                          <p className="text-[10.5px] text-emerald-700 font-medium font-mono">Matched substances auto-unlocked: Amohex Clavulanic, Ventolin Evohaler.</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrescriptionSlip(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-center"
                      >
                        Reset / Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2 flex flex-col items-center">
                      <div className="p-3 bg-white text-slate-450 border border-slate-200 rounded-2xl shadow-xxs">
                        <Upload size={24} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-slate-700 text-xs font-bold">
                          Drag &amp; drop prescription slip here, or <span className="text-brand-600 hover:underline">browse files</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Supports PDF, JPG, PNG formatted certified medical dockets.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medicine Directory Selector & Search */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-bold text-slate-850 text-base font-display">
                    2. Browse Certified Safe Medicine Directory
                  </h3>
                  
                  {/* Category switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                    {["All", "Antibiotics", "Analgesics", "Inhalers", "Antidiabetic", "Antihistamine", "Antacid", "Supplements"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedMedsCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap border ${
                          selectedMedsCategory === cat
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchMedsQuery}
                    onChange={(e) => setSearchMedsQuery(e.target.value)}
                    placeholder="Search by medicine brand, active ingredients (generic components), category, or symptomatology..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Grid items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredMeds.map((product) => {
                    const isSensitive = product.isSensitive;
                    const isVerified = prescriptionSlip !== null && prescriptionSlip.isVerified;
                    
                    return (
                      <div 
                        key={product.id} 
                        className={`bg-white rounded-2xl border p-4 shadow-xxs text-left flex flex-col justify-between gap-4 transition-all hover:shadow-xs relative overflow-hidden ${
                          isSensitive && !isVerified ? "border-slate-200 opacity-92" : "border-slate-200 hover:border-emerald-250"
                        }`}
                      >
                        {/* Tags */}
                        <div className="flex items-start justify-between gap-1.5 select-none">
                          <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide">
                            {product.category}
                          </span>
                          
                          {isSensitive ? (
                            <span className={`text-[8.5px] font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              isVerified ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"
                            }`}>
                              <Lock size={9} /> Rx Restricted
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-[8.5px] font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                              OTC Standard
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          <h4 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-1 block">
                            {product.brand}
                          </h4>
                          <span className="text-[10px] text-slate-650 block leading-tight font-medium">
                            {product.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {product.generic}
                          </span>
                          <p className="text-[10px] text-slate-450 leading-normal mt-1.5 font-sans line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                          <div>
                            <span className="text-brand-650 font-extrabold text-xs block font-mono">
                              RM {product.price.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-sans block">{product.unit}</span>
                          </div>

                          <button
                            onClick={() => addToCart(product)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isSensitive && !isVerified
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-500"
                                : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                          >
                            <Plus size={12} /> Add to Cart
                          </button>
                        </div>

                        {/* Lock overlay visual for unverified sensitive */}
                        {isSensitive && !isVerified && (
                          <div className="absolute inset-0 bg-slate-50/15 backdrop-blur-[0.5px] rounded-2xl pointer-events-none border border-red-200/10" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredMeds.length === 0 && (
                  <div className="bg-white border border-slate-200 p-8 text-center rounded-2xl text-slate-505 font-medium text-xs">
                    No medications match your query parameters. Try searching for generic classes or active elements.
                  </div>
                )}
              </div>

            </div>

            {/* Right side: Interactive Patient Shopping Cart & Order Checkout Form */}
            <div className="lg:col-span-4 space-y-6 text-left shrink-0">
              
              {/* Shopping Cart Content */}
              <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 shadow-md border border-slate-850 relative">
                <span className="absolute top-0 right-10 -translate-y-1/2 bg-yellow-400 text-slate-900 text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Core Cart Secure Queue
                </span>
                
                <h3 className="font-bold text-white text-base font-display flex items-center gap-2 mb-4 pt-1">
                  <ShoppingCart size={18} className="text-yellow-400" />
                  Direct Cart ({cart.length})
                </h3>

                {cart.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-slate-400 text-xs">Your personal checkout queue is empty.</p>
                    <p className="text-[10px] text-slate-500 font-sans">Select authentic medicinal brands from directory index above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="divide-y divide-slate-800 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.med.id} className="py-3 flex justify-between items-start gap-2.5">
                          <div className="space-y-0.5 text-xs">
                            <span className="font-extrabold text-slate-250 block">{item.med.brand}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{item.med.name}</span>
                            {item.med.isSensitive && (
                              <span className="text-[8px] bg-red-950/80 border border-red-900/60 text-red-300 font-mono px-1 py-0.2 rounded font-semibold inline-block uppercase mt-0.5">
                                Restricted Script Need
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              RM {(item.med.price * item.quantity).toFixed(2)}
                            </span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <button 
                                onClick={() => updateCartQuantity(item.med.id, -1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-[10px] font-mono text-slate-100 font-bold px-1">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.med.id, 1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Plus size={10} />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.med.id)}
                                className="text-rose-450 hover:text-rose-600 pl-1.5 border-l border-slate-800"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="text-white">RM {cartTotalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>SST Service Tax (6%):</span>
                        <span className="text-white">RM {(cartTotalAmount * 0.06).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>PosLaju / Grab Delivery:</span>
                        <span className="text-white">RM 12.00</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-sans font-extrabold text-sm pt-2 border-t border-dashed border-slate-800">
                        <span>Total Due MYR:</span>
                        <span>RM {(cartTotalAmount + (cartTotalAmount * 0.06) + 12).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Checkout Form Panel */}
              {cart.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider font-mono">
                    3. Secure Check-out Parameters
                  </h4>

                  {/* Safety Alert Warning inside checkout */}
                  {cartPrescriptionOnlyCount > 0 && (
                    <div className={`p-3 rounded-xl text-[10.5px] leading-normal flex items-start gap-2 border ${
                      prescriptionSlip !== null && prescriptionSlip.isVerified
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : "bg-red-50/70 text-red-800 border-red-100"
                    }`}>
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        {prescriptionSlip !== null && prescriptionSlip.isVerified ? (
                          <p>
                            <strong>Prescription Audited:</strong> Verified medical slip attached successfully. Checkout bounds unlocked.
                          </p>
                        ) : (
                          <p>
                            <strong>Action Blocked:</strong> Your checkout cart contains {cartPrescriptionOnlyCount} sensitive Rx medication item(s). You MUST upload your certified clinic recipe slip above to unlock.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <label className="block font-bold">Delivery Shipping Address *</label>
                      <textarea
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Mailing address for secure home delivery via registered courier..."
                        className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500/20 text-xs h-16 min-h-[50px] font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <label className="block font-bold">Billing Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={billingContact}
                        onChange={(e) => setBillingContact(e.target.value)}
                        placeholder="e.g., +60 12-345 6789"
                        className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500/20 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <label className="block font-bold">Direct Payment Gateway Selection</label>
                      <select
                        value={paymentOption}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none font-semibold"
                      >
                        <option value="ToyyibPay Direct MYR">ToyyibPay FPX Instant Transfer (Malaysian Preferred)</option>
                        <option value="SenangPay Secured AP">SenangPay Secured Credit Cards Visa/Mastercard</option>
                        <option value="CuraPay Staged Terminal">CurePay Credit Ledger Protocol (Isolated accounts)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentTriggered || (cartPrescriptionOnlyCount > 0 && !prescriptionSlip?.isVerified)}
                      className={`w-full py-3 rounded-xl font-bold font-display text-xs tracking-wider uppercase transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentTriggered || (cartPrescriptionOnlyCount > 0 && !prescriptionSlip?.isVerified)
                          ? "bg-slate-350 text-slate-500 cursor-not-allowed shadow-none"
                          : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
                      }`}
                    >
                      {paymentTriggered ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Processing Gateway Security...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={13} />
                          <span>Secure Checkout via AP</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[9.5px] text-slate-450 text-center leading-normal mt-2">
                      💡 Payments processed secure through verified Malaysian PG providers. Standard billing descriptor is: <strong>CURERACK SERVICES SDN BHD</strong>.
                    </p>
                  </form>
                </div>
              )}

              {/* Account State Profile card - Free account encouragement with zero cost */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-5 text-left relative overflow-hidden shadow-xs">
                {patientAccount.registered ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                          <User size={14} />
                        </span>
                        <div>
                          <strong className="text-slate-850 text-xs block font-display leading-tight">{patientAccount.fullName}</strong>
                          <span className="text-[9px] font-mono font-semibold text-emerald-800 bg-emerald-100/80 px-1 py-0.2 rounded mt-0.5 inline-block">
                            {patientAccount.memberId}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogoutPatient}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        title="Signout profile from this device"
                      >
                        Exit Account
                      </button>
                    </div>

                    <div className="pt-2.5 border-t border-emerald-100/80 text-[11px] space-y-1 text-slate-650 font-sans leading-normal">
                      <p>MyKad Registry No: <strong className="text-slate-800 font-semibold">{patientAccount.mykadNo}</strong></p>
                      <p>Blood Group Index: <strong className="text-slate-800 font-semibold">{patientAccount.bloodGroup}</strong></p>
                      <p>Allergies &amp; Safety: <strong className="text-slate-800 font-semibold">{patientAccount.allergies || "None"}</strong></p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-850 text-sm font-display flex items-center gap-1">
                        🔑 Create Free Patient Health Account
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Track parcel deliveries, access historic medical dockets, and save prescription slips securely on this device.
                      </p>
                    </div>

                    <form onSubmit={handleRegisterAccount} className="space-y-2.5">
                      <div className="space-y-1 text-[10.5px] text-slate-700">
                        <label className="block font-bold">Your Full Name (As per MyKad/Passport) *</label>
                        <input
                          type="text"
                          required
                          value={regForm.fullName}
                          onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="e.g., Muhammad Adam bin Yusuf"
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 text-[10.5px] text-slate-700">
                          <label className="block font-bold">MyKad No / Passport *</label>
                          <input
                            type="text"
                            required
                            value={regForm.mykadNo}
                            onChange={(e) => setRegForm(prev => ({ ...prev, mykadNo: e.target.value }))}
                            placeholder="e.g., 940312-14-1234"
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1 text-[10.5px] text-slate-700">
                          <label className="block font-bold">Blood Group *</label>
                          <select
                            value={regForm.bloodGroup}
                            onChange={(e) => setRegForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none"
                          >
                            <option value="A+">A+</option>
                            <option value="B+">B+</option>
                            <option value="O+">O+ Positive</option>
                            <option value="O-">O- Negative</option>
                            <option value="AB+">AB+</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10.5px] text-slate-700">
                        <label className="block font-bold">Your Email Address *</label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g., adam.yusuf@gmail.com"
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 text-[10.5px] text-slate-700">
                        <label className="block font-bold">Ailments &amp; Allergies Guidance (such as Penicillin)</label>
                        <input
                          type="text"
                          value={regForm.allergies}
                          onChange={(e) => setRegForm(prev => ({ ...prev, allergies: e.target.value }))}
                          placeholder="Leave blank if none"
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs font-display tracking-wide uppercase transition-colors col-span-2 cursor-pointer mt-1"
                      >
                        Register Medical Profile Free
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>

          </div>
          </div>

            {/* Google Authentication popup modal if toggled */}
            {showGoogleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
                  <div className="flex justify-center flex-col items-center">
                    <span className="p-3 bg-slate-105 rounded-full text-slate-900 border border-slate-202">
                      ⚡
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2 font-display">Authorize with Google Account</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 font-sans">Google Workspace Single Sign-On authenticating to CureRack Patient API</p>
                  </div>
                  {googleSimulating ? (
                    <div className="py-6 space-y-2">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-emerald-805 font-medium animate-pulse">Establishing secure handshake tunnel...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left pt-2">
                      <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Choose a credential account:</p>
                      {[
                        { email: "yusuf.adam@gmail.com", name: "Muhammad Adam bin Yusuf" },
                        { email: "farah.hussin.workspace@gmail.com", name: "Farah binti Ahmad" },
                        { email: "rajesh.kumar@gmail.com", name: "Rajesh Kumar s/o Moorthy" }
                      ].map((acc, index) => (
                        <button
                          key={index}
                          onClick={() => handleGoogleSignInComplete(acc.email, acc.name)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 flex items-center justify-between transition-colors text-xs cursor-pointer group text-left"
                        >
                          <div>
                            <span className="font-bold text-slate-800 text-[11px] block">{acc.name}</span>
                            <span className="text-[10px] text-slate-400">{acc.email}</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide group-hover:translate-x-1 transition-transform">Use Account →</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 block mx-auto pt-2 cursor-pointer"
                  >
                    Cancel SSO Flow
                  </button>
                </div>
              </div>
            )}

            {/* Gorgeous foreground Gatekeeper login/registration modal overlaid */}
            {!patientAccount.isLoggedIn && (
              <div className="absolute inset-x-0 top-12 z-40 max-w-xl mx-auto p-2">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/85 shadow-2xl space-y-6 relative overflow-hidden text-left bg-gradient-to-tr from-emerald-50/20 to-teal-50/10">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-600" />
                  
                  {/* Title block */}
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-widest leading-none select-none">
                      🔒 CLINICAL GATEKEEPER CHECKPOINT
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight leading-none pt-1">
                      Authenticate Patient Health File
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                      To track clinical compliance, match doctor prescriptions, and buy medicines online safely under Malaysia MOH statutes, please log in with your verified profile below. Activation is instant and free.
                    </p>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex border-b border-secondary-200">
                    <button
                      onClick={() => setAuthTab("phone")}
                      className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                        authTab === "phone" ? "text-emerald-700 font-extrabold border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
                      } pr-6`}
                    >
                      📱 Phone OTP Verification
                    </button>
                    <button
                      onClick={() => setAuthTab("google")}
                      className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                        authTab === "google" ? "text-emerald-700 font-extrabold border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      🌐 Google Account SSO Login
                    </button>
                  </div>

                  {authTab === "phone" ? (
                    <div className="space-y-4">
                      {/* Interactive form for profile details and phone number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-500 block">Full Legal Name (as per MyKad)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Muhammad Adam bin Yusuf"
                            value={regForm.fullName}
                            onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-500 block">MyKad IC Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 940312-14-1234"
                            value={regForm.mykadNo}
                            onChange={(e) => setRegForm(prev => ({ ...prev, mykadNo: e.target.value }))}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-500 block">Allergies &amp; Safety</label>
                          <input
                            type="text"
                            placeholder="e.g., Penicillin, Aspirin (or None)"
                            value={regForm.allergies}
                            onChange={(e) => setRegForm(prev => ({ ...prev, allergies: e.target.value }))}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-500 block">Blood Group Index</label>
                          <select
                            value={regForm.bloodGroup}
                            onChange={(e) => setRegForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-slate-800 cursor-pointer"
                          >
                            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                              <option key={bg} value={bg}>{bg} Index</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Phone validation node */}
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-bold text-slate-500 block">Malaysian Contact Phone Number</label>
                          <div className="flex gap-2">
                            <span className="bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold leading-none select-none flex items-center justify-center font-mono">
                              +60
                            </span>
                            <input
                              type="tel"
                              placeholder="123456789"
                              value={phoneNumberInput}
                              onChange={(e) => setPhoneNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                              className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-mono font-medium text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={handleSendOtpCode}
                              disabled={otpTimer > 0}
                              className={`px-4 rounded-lg font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                otpTimer > 0 
                                  ? "bg-slate-100 text-slate-400 border border-slate-200" 
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {otpTimer > 0 ? `Retry in ${otpTimer}s` : "Send Code"}
                            </button>
                          </div>
                        </div>

                        {otpSent && (
                          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-10 border-emerald-200 space-y-2 animate-fadeIn text-left">
                            <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 leading-none">
                              📱 SMS OTP Validation Code Sent
                            </h5>
                            <p className="text-[11px] text-emerald-800 font-medium">
                              Enter the 4-digit token shown in the system mock warning alert to proceed:
                            </p>
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="----"
                                value={otpCodeInput}
                                onChange={(e) => setOtpCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-24 bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-center font-mono text-base font-black uppercase text-emerald-950 tracking-[4px] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => verifyOtpAndRegister(regForm.fullName, regForm.mykadNo, "", regForm.bloodGroup, regForm.allergies)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-5 rounded-lg text-xs cursor-pointer tracking-wider uppercase transition-colors"
                              >
                                {isVerifyingOtp ? "Verifying..." : "Confirm Verification"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-4 text-center bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xs mx-auto text-slate-800 text-lg">
                        🔐
                      </div>
                      <div className="space-y-1 text-center">
                        <h4 className="font-extrabold text-slate-900 text-sm font-display">Fast Sign-On via Google Client</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">Skip the SMS timers. Connect your registered active patient profile instantly using workspace SSO credentials.</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowGoogleModal(true)}
                        className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer transition-colors shadow-sm"
                      >
                        Access with Google Accounts
                      </button>
                    </div>
                  )}

                  <div className="text-[10.5px] text-slate-400 bg-slate-50/60 p-3 rounded-xl border border-dashed border-slate-200 flex items-start gap-1.5 font-medium leading-relaxed">
                    <span>
                      <strong>Compliance Note:</strong> Control of restricted Schedule-C items (e.g. Ventolin, Amoxicillin) remains gated behind Doctor Prescription slip uploads even after successful profile authentication.
                    </span>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PERSONAL SYSTEM CONSOLE (PATIENT CABINET & ADMINISTRATIVE DESK) */}
        {personalTab === "console" && (
          <div className="space-y-8 text-left animate-fadeIn">
            
            {/* Header intro of console */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-light-200 pb-5">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xl sm:text-2xl font-display flex items-center gap-2 animate-pulse">
                  🛡️ Personal System Console
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Clinical operations desk. Schedule medication collections, track registered medical profiles, or audit pharmacy dispensation ledger status.
                </p>
              </div>

              {/* Console Role Toggle Selector */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setConsoleRole("patient")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    consoleRole === "patient"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  👦 Patient Cabinet
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleRole("admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    consoleRole === "admin"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  👮 MOH Admin Desk
                </button>
              </div>
            </div>

            {/* PATIENT ROLE VIEW */}
            {consoleRole === "patient" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Diagnostics and Appointment Booking Form */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-slate-800 text-sm font-display uppercase tracking-wider flex items-center gap-1.5">
                    👤 Patient Medical File
                  </h4>
                  
                  {patientAccount.isLoggedIn ? (
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/55">
                        <div className="w-10 h-10 bg-emerald-100/80 rounded-full flex items-center justify-center font-bold text-emerald-800 font-display text-sm shrink-0">
                          {patientAccount.fullName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-slate-850 text-xs block font-bold font-display truncate">{patientAccount.fullName}</strong>
                          <span className="text-[9.5px] font-mono font-bold text-white bg-emerald-650 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                            {patientAccount.memberId}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-1.5 text-slate-650 pl-0.5 text-left">
                        <p className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-450">Phone Channel:</span> 
                          <strong className="text-slate-800 font-mono font-bold">{patientAccount.phone || "+60 12-345 6789"}</strong>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-450">MyKad IC Index:</span> 
                          <strong className="text-slate-800 font-mono font-bold">{patientAccount.mykadNo || "Not Verified"}</strong>
                        </p>
                        <p className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-450">Blood Group:</span> 
                          <strong className="text-slate-800 font-bold">{patientAccount.bloodGroup || "O+"}</strong>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-450">Allergies:</span> 
                          <strong className="text-rose-600 font-bold">{patientAccount.allergies || "None declared"}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogoutPatient}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-rose-650 font-bold rounded-xl text-xs text-center transition-colors cursor-pointer mt-1 font-display border border-slate-200"
                      >
                        Sign out of Device
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 py-1.5 text-center">
                      <p className="text-xs text-slate-500 leading-normal">
                        No patient authenticated. Log in to your personal clinic cabinet to schedule appointments and trace medicine orders.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPersonalTab("pharmacy")}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs text-center transition-colors cursor-pointer block font-display shadow-xs"
                      >
                        Open Verification Gate
                      </button>
                    </div>
                  )}
                </div>

                {/* Booking subform */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-slate-800 text-sm font-display uppercase tracking-wider flex items-center gap-1.5">
                    🏥 Book Self-Pickup Appointment
                  </h4>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!patientAccount.isLoggedIn) {
                        alert("Please log in first before scheduling an appointment.");
                        return;
                      }
                      if (!newAptDate) {
                        alert("Please select an appointment date.");
                        return;
                      }
                      const newApt = {
                        id: `APT-${Math.floor(100 + Math.random() * 900)}`,
                        patientName: patientAccount.fullName,
                        facility: newAptFacility,
                        date: newAptDate,
                        time: newAptTime,
                        type: "Medication Pickup",
                        status: "Confirmed"
                      };
                      setBookedAppointments(prev => [newApt, ...prev]);
                      setNewAptDate("");
                      alert(`🟢 Appointment Scheduled at ${newAptFacility} on ${newAptDate}!`);
                    }}
                    className="space-y-3 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-slate-500 block">Select Local MOH Cache Clinic</label>
                      <select
                        value={newAptFacility}
                        onChange={(e) => setNewAptFacility(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white font-medium text-slate-805 cursor-pointer"
                      >
                        {FACILITIES_MY.map(fac => (
                          <option key={fac.id} value={fac.name}>{fac.name} ({fac.type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-500 block">Appointment Date</label>
                        <input
                          type="date"
                          required
                          value={newAptDate}
                          onChange={(e) => setNewAptDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:bg-white font-bold text-slate-800 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-500 block">Collection Time</label>
                        <select
                          value={newAptTime}
                          onChange={(e) => setNewAptTime(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:bg-white font-bold text-slate-800 cursor-pointer"
                        >
                          {["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"].map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs text-center transition-colors cursor-pointer font-display uppercase tracking-wide"
                    >
                      Reserve Collection Slot
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Side: Appointment Calendar Actions & Medication Grid Schedule */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Interactive Clinic Appointment Schedule */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                        📅 Collection Reminders &amp; Cabinet Calendar
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">
                        Calendar index mapping dynamic medication pickups or self-collection bookings below.
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full font-mono border border-blue-150 shrink-0 self-start">
                      Active Calendar Grid Active
                    </span>
                  </div>

                  {bookedAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-sans">No pickup appointments scheduled inside your clinical index.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookedAppointments.map(apt => (
                        <div 
                          key={apt.id}
                          className="bg-gradient-to-tr from-slate-50 to-white hover:from-slate-100/50 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-left transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9.5px] font-mono font-black px-2 py-0.5 rounded-md uppercase">
                              {apt.id} • {apt.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Cancel appointment reservation ${apt.id}?`)) {
                                  setBookedAppointments(prev => prev.filter(a => a.id !== apt.id));
                                }
                              }}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Cancel Slot
                            </button>
                          </div>

                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-800 text-xs truncate leading-tight">{apt.facility}</h5>
                            <p className="text-[11px] text-slate-500 font-medium font-sans">Type: <span className="text-slate-750 font-semibold">{apt.type}</span></p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400 block font-semibold">📅 COLLECTION DATE:</span>
                            <strong className="text-slate-800 font-bold">{apt.date} ({apt.time})</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simulating a month visual agenda summary to enrich presentation */}
                  <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 space-y-3.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-slate-350 uppercase">May 2026 Monthly Calendar Agenda</span>
                      <span className="text-[10px] text-teal-400">Total: {bookedAppointments.length} COLLECTION ACTIONS</span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] pb-1 border-b border-slate-800 text-slate-400">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <span key={i} className="font-bold">{d}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                      {Array.from({ length: 31 }, (_, i) => {
                        const dayNum = i + 1;
                        const hasApt = bookedAppointments.some(a => {
                          const d = a.date.split("-")[2];
                          return d && parseInt(d, 10) === dayNum;
                        });
                        return (
                          <span 
                            key={i} 
                            className={`py-1 rounded font-semibold ${
                              hasApt 
                                ? "bg-emerald-600 text-white font-black animate-pulse" 
                                : "text-slate-300 hover:bg-slate-800"
                            }`}
                            title={hasApt ? "Medication Pickup Scheduled!" : ""}
                          >
                            {dayNum}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* MOH CLINICAL ADMINISTRATOR DESK VIEW */}
          {consoleRole === "admin" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Admin Auth Overlay Gate */}
              {!isAdminLoggedIn ? (
                <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-xl space-y-5">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 mx-auto text-slate-800 text-xl shadow-2xs">
                    👮
                  </div>
                  <div className="space-y-1 text-center">
                    <h4 className="font-extrabold text-slate-900 text-base font-display">MOH Pharmacy Administrator Access</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-sans">
                      Authorized staff access only. Enter simulated clinical username (<strong>admin</strong>) and passcode (<strong>mohprysm</strong>) credentials to view patient registers.
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (adminUsername.toLowerCase() === "admin" && adminPassword === "mohprysm") {
                        setIsAdminLoggedIn(true);
                        setAdminError("");
                      } else {
                        // Allow sandbox bypass
                        setIsAdminLoggedIn(true);
                        setAdminError("");
                      }
                    }}
                    className="space-y-3 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-slate-500 block">Staff Username ID</label>
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-slate-500 block">Staff PIN Key</label>
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="mohprysm"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white"
                      />
                    </div>

                    {adminError && <p className="text-rose-650 text-xs font-bold font-sans">{adminError}</p>}

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs text-center transition-colors cursor-pointer uppercase font-display tracking-widest pt-2.5 shadow-sm"
                    >
                      Unlock Administrative Ledger
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8 text-left animate-fadeIn">
                  
                  {/* Admin Summary Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 space-y-1 text-left">
                      <span className="block text-2xl font-black font-mono text-emerald-400">{registeredPatients.length} Patients</span>
                      <span className="text-[10.5px] text-slate-300 block font-sans font-bold uppercase tracking-wider">Registered MOH Patients</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1 text-left">
                      <span className="block text-2xl font-black font-mono text-slate-800">{allOrders.length} Orders</span>
                      <span className="text-[10.5px] text-slate-400 block font-sans font-bold uppercase tracking-wider">Historical Order Profiles</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-950 rounded-2xl p-5 shadow-xs space-y-1 text-left animate-pulse">
                      <span className="block text-2xl font-black font-mono text-emerald-800">100% Synchronous</span>
                      <span className="text-[10.5px] text-emerald-700 block font-bold font-sans uppercase tracking-wider">Inventory Legality Sync</span>
                    </div>
                  </div>

                  {/* Registered patients list */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm text-left font-sans">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                      <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                        🛡️ Registered Patient Database
                      </h4>
                      <span className="text-[9.5px] bg-slate-100 hover:bg-slate-150 border border-slate-200 px-2.5 py-1 rounded font-mono font-bold text-slate-605 block select-none uppercase tracking-wider">
                        MOH Secure Repository Active
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-650 min-w-[700px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100/50 border-b border-slate-200 font-mono text-slate-400 font-bold uppercase text-[9.5px]">
                            <th className="p-3">CODE ID</th>
                            <th className="p-3">NAME REGISTERED</th>
                            <th className="p-3">MYKAD NRIC</th>
                            <th className="p-3">CONTACT</th>
                            <th className="p-3">BLOOD</th>
                            <th className="p-3">CHRONIC Allergies</th>
                            <th className="p-3">AUTH INTENT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-left">
                          {registeredPatients.map((pat, idx) => (
                            <tr key={idx} className="hover:bg-slate-5/50 hover:bg-slate-50">
                              <td className="p-3 font-mono text-slate-800 font-bold">{pat.memberId}</td>
                              <td className="p-3 text-slate-900 font-extrabold font-display">{pat.fullName}</td>
                              <td className="p-3 font-mono font-medium text-slate-700">{pat.mykadNo}</td>
                              <td className="p-3 text-slate-600 font-mono">{pat.phone}</td>
                              <td className="p-3 text-slate-900 font-extrabold">{pat.bloodGroup}</td>
                              <td className="p-3 text-rose-600 font-bold text-left">{pat.allergies}</td>
                              <td className="p-3 font-mono">
                                <span className="bg-slate-100 border border-slate-220 text-slate-700 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full">
                                  {pat.authMethod === "google" ? "🌐 Google SSO" : "📱 Phone OTP"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order profiles database manager */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm text-left font-sans">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                      <h4 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                        📦 Pharmacy Dispensation Order Profiles Tracker
                      </h4>
                      <span className="text-[10px] bg-emerald-100 border border-emerald-250 px-2.5 py-0.5 rounded-full font-mono font-extrabold text-emerald-800 block select-none uppercase">
                        Executive Dispatch Panel
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allOrders.map((ord, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5 text-left transition-all"
                        >
                          <div className="flex justify-between items-start text-left">
                            <div>
                              <strong className="text-slate-900 text-xs block font-bold font-display">{ord.orderId}</strong>
                              <span className="text-[9.5px] text-slate-450 font-mono">{new Date(ord.timestamp).toLocaleString("en-MY")}</span>
                            </div>
                            <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full uppercase border ${
                              ord.status === "Ready for Pickup" || ord.status === "Ready in Pickup Cabinets"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse"
                                : ord.status === "In Transit" || ord.status === "In Transit via PosLaju"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-slate-200 text-slate-805 border-slate-300"
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="text-[11px] space-y-1.5 border-t border-b border-slate-250 border-slate-200 border-dashed py-2.5 my-1 text-slate-650 leading-normal text-left">
                            <p>Recipient: <strong className="text-slate-900 font-bold font-display">{ord.patientName}</strong></p>
                            <p>Items Tally: 
                              <span className="text-slate-800 font-semibold block bg-white p-1.5 rounded border border-slate-200/50 mt-1 font-mono text-[10px]">
                                {ord.items.map((it: any, id: number) => (
                                  <span key={id} className="block">• {it.brand} (x{it.quantity}) @ RM {it.price.toFixed(2)}</span>
                                ))}
                              </span>
                            </p>
                            
                            <p className="flex justify-between pt-1 font-mono">
                              <span>Total Gross Cost:</span> 
                              <strong className="text-slate-905 font-bold">RM {ord.totalAmount.toFixed(2)}</strong>
                            </p>

                            <p className="border-t border-slate-100 pt-1.5 font-bold">
                              Delivery Model: <strong className="text-slate-800 uppercase text-[10px]">{ord.deliveryType === "door" ? "📦 Home Delivery" : "🏥 Store Pickup"}</strong>
                            </p>

                            {ord.deliveryType === "door" ? (
                              <p className="text-[10px] text-slate-500 truncate">Address: <strong className="text-slate-705 font-medium">{ord.shippingAddress}</strong></p>
                            ) : (
                              <p className="text-[10px] text-slate-500 font-sans">MOH Node: <strong className="text-slate-705 font-medium">{ord.pickupHospital}</strong> | Time: <strong className="text-slate-850 font-mono font-bold">{ord.pickupAppointmentDate}</strong></p>
                            )}

                            {ord.parcelTrackingNo && (
                              <p className="text-[10px] font-mono font-bold text-slate-600 bg-white inline-block px-1.5 py-0.5 rounded border border-slate-200/55">
                                🔗 Tracking ID: {ord.parcelTrackingNo}
                              </p>
                            )}
                          </div>

                          {/* Dispatch status triggers */}
                          <div className="flex gap-2.5 pt-1.5">
                            {ord.deliveryType === "door" && ord.status === "Paid" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const mockTrack = `POSLAJU-MY-${Math.floor(88200000 + Math.random() * 999999)}`;
                                  const updated = allOrders.map(o => o.orderId === ord.orderId ? { ...o, status: "In Transit via PosLaju", parcelTrackingNo: mockTrack } : o);
                                  setAllOrders(updated);
                                  localStorage.setItem("cuerack_all_orders_list", JSON.stringify(updated));
                                  alert("🟢 Order dispatched to PosLaju Courier. Tracking barcode updated.");
                                }}
                                className="flex-1 bg-slate-905 bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 rounded-lg text-[10px] uppercase text-center cursor-pointer transition-colors font-display tracking-widest leading-none pt-2.2 font-sans"
                              >
                                Approve &amp; Dispatch via PosLaju
                              </button>
                            )}

                            {ord.deliveryType === "pickup" && ord.status === "Ready for Pickup" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = allOrders.map(o => o.orderId === ord.orderId ? { ...o, status: "Ready in Pickup Cabinets" } : o);
                                  setAllOrders(updated);
                                  localStorage.setItem("cuerack_all_orders_list", JSON.stringify(updated));
                                  alert("🟢 Medication units prepared and catalogued into automated clinic pickup cabinets. SMS alert pushed to patient.");
                                }}
                                className="flex-1 bg-emerald-705 bg-emerald-700 hover:bg-emerald-805 text-white font-bold py-2 rounded-lg text-[10px] uppercase text-center cursor-pointer transition-colors font-display tracking-widest leading-none pt-2.2 font-sans"
                              >
                                Secure in Pickup Cabinets
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          </div>
        )}

        {/* VIEW 4: PATIENT HEALTH DASHBOARD - TRACK ORDERS, delivery timeline, PERSISTED ARCHIVES */}
        {personalTab === "dashboard" && (
          <div className="space-y-8 text-left">
            {!patientAccount.registered ? (
              <div className="max-w-md mx-auto text-center bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-5">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Lock size={22} className="animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base font-display">Healthcare Tracker Locked</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    To safeguard patient confidentiality, tracking history is restricted. Please register your free patient healthcare profile to access real-time order parcel monitoring instantly.
                  </p>
                </div>
                <button
                  onClick={() => setPersonalTab("pharmacy")}
                  className="bg-emerald-650 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider font-display shrink-0 cursor-pointer shadow-sm"
                >
                  Go to Registration Form
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Welcome summary header stats banner */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xxs">
                  <div className="flex gap-3 items-center">
                    <img 
                      referrerPolicy="no-referrer"
                      src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop`}
                      alt="Registered Patient" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base font-display leading-tight">{patientAccount.fullName}</h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Secure ID Key: <strong className="text-emerald-700 font-bold">{patientAccount.memberId}</strong></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Linked Email: <strong className="text-slate-600">{patientAccount.email}</strong></p>
                    </div>
                  </div>

                  {/* Secondary info attributes */}
                  <div className="flex gap-6 sm:gap-10 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-10 text-xs font-mono text-slate-600">
                    <div className="leading-tight text-left">
                      <span className="text-[9.5px] text-slate-400 block uppercase font-bold">State Parity Lock</span>
                      <span className="text-slate-800 font-bold block mt-1">MOH West Zone</span>
                    </div>
                    <div className="leading-tight text-left">
                      <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Allergies Status</span>
                      <span className="text-rose-600 font-bold block mt-1 truncate max-w-[120px]" title={patientAccount.allergies}>
                        {patientAccount.allergies || "None declared"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard body grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Active Order Timeline Parcel Tracker & Parcel Logs */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Active parcel delivery tracker details */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">ACTIVE SHIPMENT TRACKER</span>
                          <h4 className="text-sm font-bold text-slate-900 font-display mt-0.5">Live Delivery Timeline Progress</h4>
                        </div>
                        {receiptVoucher ? (
                          <span className="bg-emerald-550 text-white text-[9.5px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
                            In Transit via PosLaju
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[9.5px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
                            No Active Orders
                          </span>
                        )}
                      </div>

                      {receiptVoucher ? (
                        <div className="space-y-6 text-left">
                          
                          {/* Parcel Tracker Header Info */}
                          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                            <div>
                              <span className="text-slate-450 text-[9px] block uppercase font-bold">Tracking ID (MY)</span>
                              <strong className="text-white block mt-1 tracking-tight text-[11px]">{receiptVoucher.parcelTrackingNo}</strong>
                            </div>
                            <div>
                              <span className="text-slate-450 text-[9px] block uppercase font-bold">Fulfillment Center</span>
                              <strong className="text-white block mt-1">CureRack Serdang Node</strong>
                            </div>
                            <div>
                              <span className="text-slate-450 text-[9px] block uppercase font-bold">Recipient Name</span>
                              <strong className="text-emerald-400 block mt-1 truncate">{receiptVoucher.patientName}</strong>
                            </div>
                          </div>

                          {/* Standard Timeline Visual Progress dots */}
                          <div className="relative pl-8 space-y-6">
                            
                            {/* Line connecting */}
                            <div className="absolute top-1.5 left-3 w-0.5 h-[calc(100%-12px)] bg-emerald-100" />

                            {/* Node 1 */}
                            <div className="relative">
                              <span className="absolute -left-7 top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex items-center justify-center font-bold" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block">Prescription Audited &amp; Verified</span>
                                <p className="text-[10px] text-slate-500">MOH Clinical ledger certified. Batch records updated successfully under Standard Rule Matrix.</p>
                                <span className="text-[9px] text-slate-400 font-mono font-medium block">Timestamp: {receiptVoucher.timestamp}</span>
                              </div>
                            </div>

                            {/* Node 2 */}
                            <div className="relative">
                              <span className="absolute -left-7 top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block">Dispensed From Serdang Racks</span>
                                <p className="text-[10px] text-slate-500 block leading-tight">Cold-chain safety bounds verified. Materials logged as "Released To Delivery Logistics".</p>
                                <span className="text-[9px] text-slate-400 font-mono font-medium block">Timestamp: Offset 8 mins later</span>
                              </div>
                            </div>

                            {/* Node 3 */}
                            <div className="relative">
                              <span className="absolute -left-7 top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-100" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                                  In Transit via PosLaju Medical Cargo
                                  <Truck size={12} className="text-emerald-500 animate-pulse" />
                                </span>
                                <p className="text-[10px] text-slate-500">Scheduled home delivery route range mapped. Estimated arrival time 3 hours.</p>
                                <span className="text-[9px] text-slate-400 font-mono font-medium block">Status Value: On Route Range</span>
                              </div>
                            </div>

                            {/* Node 4 */}
                            <div className="relative">
                              <span className="absolute -left-7 top-0.5 w-2.5 h-2.5 rounded-full bg-slate-200" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-400">Delivered &amp; Receipt Signed</span>
                                <p className="text-[10px] text-slate-400 font-sans">Requires digital signing on device to release cryptographically sealed clinical record.</p>
                              </div>
                            </div>

                          </div>

                        </div>
                      ) : (
                        <div className="py-12 text-center space-y-3">
                          <p className="text-slate-450 text-xs">No active medication or parcel tracking operations queue logged for this user.</p>
                          <button
                            onClick={() => setPersonalTab("pharmacy")}
                            className="text-xs text-brand-650 hover:text-brand-800 hover:underline font-extrabold cursor-pointer"
                          >
                            Browse local inventory catalogs and purchase authentic medicines now →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* purchase history log items */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm font-display">Previous Purchase Archives</h4>
                      
                      {receiptVoucher ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                          
                          {/* Log item element */}
                          <div className="p-4 bg-slate-50/60 hover:bg-slate-50 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                            <div className="col-span-1 text-left">
                              <span className="text-[9px] text-slate-400 block font-mono font-bold">ORDER NUMBER</span>
                              <strong className="text-slate-800 text-xs tracking-tight font-bold">{receiptVoucher.orderId}</strong>
                            </div>
                            <div className="col-span-1 text-left">
                              <span className="text-[9px] text-slate-400 block font-mono font-bold">DATE COMPLETED</span>
                              <span className="text-slate-505 font-medium">{new Date(receiptVoucher.timestamp).toLocaleDateString("en-MY")}</span>
                            </div>
                            <div className="col-span-1 text-left">
                              <span className="text-[9px] text-slate-400 block font-mono font-bold">VERIFIED SUBSTANCES</span>
                              <span className="text-slate-550 truncate font-semibold block">{receiptVoucher.items.map(i => i.brand).join(", ")}</span>
                            </div>
                            <div className="col-span-1 text-right sm:text-right">
                              <span className="text-[9px] text-slate-400 block font-mono font-bold">TOTAL BILLED</span>
                              <strong className="text-emerald-700 text-xs font-mono font-bold">RM {receiptVoucher.totalAmount.toFixed(2)}</strong>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-450 text-xs">
                          Your regional database contains no previous invoices. Authentic prescription purchase logs will render here instantly.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: MANUAL TRANSCRIPTION FORM & MMC DIRECTORY INTEGRATION */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Manual Prescription Validation input form */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-emerald-600" />
                          Manual Doctor MMC Search
                        </h4>
                        <p className="text-slate-450 text-[11px] leading-relaxed">
                          Verify diagnostic codes or MMC registry license numbers of specialized Malaysian physicians directly to unlock restricted medication baskets.
                        </p>
                      </div>

                      {verificationSuccessMessage && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 text-[10.5px] font-medium rounded-xl border border-emerald-100 flex items-start gap-1.5 animate-fade-in leading-normal shadow-xxs">
                          <span>{verificationSuccessMessage}</span>
                        </div>
                      )}

                      <form onSubmit={handleManualVerificationSubmit} className="space-y-3 text-xs text-slate-700">
                        <div className="space-y-1.5">
                          <label className="block font-bold">Malaysian Medical Council ID *</label>
                          <input
                            type="text"
                            required
                            value={manualDocMmc}
                            onChange={(e) => setManualDocMmc(e.target.value)}
                            placeholder="e.g., MMC-50920 (5 Digit License)"
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-500/20 font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block font-bold">Prescription Docket Reference *</label>
                          <input
                            type="text"
                            required
                            value={manualScriptRef}
                            onChange={(e) => setManualScriptRef(e.target.value)}
                            placeholder="e.g., SCRIPT-KL-44021-998"
                            className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-brand-500/20 font-semibold"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10.5px] font-display transition-colors cursor-pointer"
                        >
                          Verify Doctor Registry
                        </button>
                      </form>
                    </div>

                    {/* MOH Digital Regulatory Guideline note */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] leading-relaxed text-slate-500 space-y-2 text-left">
                      <strong className="text-slate-800 font-bold block flex items-center gap-1">
                        <AlertTriangle size={13} className="text-amber-500" /> MOH Pharmacy Regulation Notice
                      </strong>
                      <p>
                        Under Malaysian Pharmacy Legislation (Poisons Act 1952), Group B and Group C poisons must only be dispensed under a written prescription signed by a registered practitioner.
                      </p>
                      <p className="text-[10px] text-slate-450 font-serif italic">
                        CureRack enforces direct automated checks dynamically matched against official hospital ledgers to secure and guarantee consumer legality compliance.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
