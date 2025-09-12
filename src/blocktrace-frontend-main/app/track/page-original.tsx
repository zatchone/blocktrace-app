"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  User,
  Filter,
  Search,
  Globe,
  Truck,
  Factory,
  Store,
  Ship,
  Plane,
  AlertTriangle,
  X,
  Calendar,
  BarChart3,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { icpService } from "@/lib/icp-service";
import StepMap from "../../components/StepMap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TimelineEvent = {
  id: number;
  actor: string;
  role: string;
  action: string;
  location: string;
  date: string;
  timestamp: number;
  notes?: string;
  verified?: boolean;
  status: 'verified' | 'delay' | 'dispute' | 'pending';
  transportMode?: 'truck' | 'ship' | 'plane' | 'train';
  duration?: number;
  distance?: number;
  carbonFootprint?: number;
};

type FilterState = {
  role: string;
  status: string;
  dateRange: string;
  transportMode: string;
};

export default function TrackProductPage() {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    role: '',
    status: '',
    dateRange: '',
    transportMode: ''
  });
  const [mapFocusKey, setMapFocusKey] = useState(0);

  // Connect to ICP
  useEffect(() => {
    (async () => {
      setIsConnecting(true);
      try {
        const ok = await icpService.connect();
        setIsConnected(ok);
        if (!ok) setError("⚠️ Start your ICP canister first");
      } catch (e: any) {
        setError(`⚠️ ICP error: ${e.message}`);
      } finally {
        setIsConnecting(false);
      }
    })();
  }, []);

  // Generate realistic supply chain data with enhanced details
  const generateEnhancedTimeline = (steps: any[]): TimelineEvent[] => {
    const transportModes = ['truck', 'ship', 'plane', 'train'];
    return steps.map((s, i) => {
      const transportMode = transportModes[Math.floor(Math.random() * transportModes.length)];
      const duration = Math.floor(Math.random() * 48) + 2;
      const distance = Math.floor(Math.random() * 800) + 100;
      const carbonFootprint = distance * (transportMode === 'plane' ? 0.255 : transportMode === 'ship' ? 0.017 : 0.162);
      return {
        id: i,
        actor: s.actor_name,
        role: s.role,
        action: s.action,
        location: s.location,
        date: new Date(Number(s.timestamp) / 1e6).toLocaleString(),
        timestamp: Number(s.timestamp) / 1e6,
        notes: Array.isArray(s.notes) && s.notes.length > 0 ? s.notes[0] : undefined,
        verified: s.status === 'verified',
        status: s.status || 'verified', // Use backend status, fallback to 'verified'
        transportMode: transportMode as 'truck' | 'ship' | 'plane' | 'train',
        duration,
        distance,
        carbonFootprint: Math.round(carbonFootprint * 100) / 100
      };
    });
  };

  const handleTrack = async () => {
    if (!productId.trim()) {
      setError("❗ Enter a Product ID");
      return;
    }
    setError("");
    setStatus("");
    setTimeline([]);
    setIsLoading(true);

    try {
      const steps = await icpService.getProductHistory(productId.trim());
      if (steps.length === 0) {
        setError("🔍 No history found");
      } else {
        const enhancedTimeline = generateEnhancedTimeline(steps);
        setTimeline(enhancedTimeline);
        setStatus(steps[steps.length - 1].action);
      }
    } catch (e) {
      console.error(e);
      setError("❌ Failed to fetch history");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter timeline based on current filters
  const filteredTimeline = useMemo(() => {
    return timeline.filter(event => {
      if (filters.role && event.role !== filters.role) return false;
      if (filters.status && event.status !== filters.status) return false;
      if (filters.transportMode && event.transportMode !== filters.transportMode) return false;
      return true;
    });
  }, [timeline, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (timeline.length === 0) return null;
    
    const totalDistance = timeline.reduce((sum, event) => sum + (event.distance || 0), 0);
    const totalCarbon = timeline.reduce((sum, event) => sum + (event.carbonFootprint || 0), 0);
    const totalDuration = timeline.reduce((sum, event) => sum + (event.duration || 0), 0);
    const verifiedCount = timeline.filter(event => event.status === 'verified').length;
    
    return {
      totalDistance,
      totalCarbon,
      totalDuration,
      verifiedCount,
      efficiency: Math.round((verifiedCount / timeline.length) * 100)
    };
  }, [timeline]);

  // ESG score calculation (example: average of carbonFootprint, can be replaced with real logic)
  const esgScore = useMemo(() => {
    if (!timeline.length) return null;
    const total = timeline.reduce((sum, e) => sum + (e.carbonFootprint || 0), 0);
    return Math.max(100 - Math.round(total / timeline.length), 0); // Example: higher carbon = lower score
  }, [timeline]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Supply Chain Report", 14, 18);
    doc.setFontSize(12);
    doc.text(`Product ID: ${productId}`, 14, 28);
    if (esgScore !== null) {
      doc.text(`ESG Score: ${esgScore}/100`, 14, 36);
    }
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);
    autoTable(doc, {
      startY: 50,
      head: [["Step", "Actor", "Role", "Action", "Location", "Timestamp", "Status", "CO₂ (kg)"]],
      body: filteredTimeline.map((e, i) => [
        i + 1,
        e.actor,
        e.role,
        e.action,
        e.location,
        e.date,
        e.status,
        e.carbonFootprint ?? "-"
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 165, 0] },
    });
    doc.save(`supply_chain_report_${productId || "product"}.pdf`);
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle, label: 'Verified' };
      case 'delay':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock, label: 'Delayed' };
      case 'dispute':
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle, label: 'Dispute' };
      case 'pending':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Clock, label: 'Pending' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Clock, label: 'Unknown' };
    }
  };

  // Get transport mode icon
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'truck': return Truck;
      case 'ship': return Ship;
      case 'plane': return Plane;
      case 'train': return Truck; // Using Truck icon for train
      default: return Truck;
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manufacturer':
      case 'factory': return Factory;
      case 'distributor':
      case 'warehouse': return Package;
      case 'retailer':
      case 'store': return Store;
      case 'shipper':
      case 'logistics': return Truck;
      default: return User;
    }
  };

  // auto‑dismiss error
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 bg-fixed text-white">
      {/* Enhanced Grid + particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const s = Math.random() * 4 + 2;
          const o = Math.random() * 0.5 + 0.2;
          return (
            <div
              key={i}
              className="absolute bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-float"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${s}px`,
                height: `${s}px`,
                opacity: o,
                animationDuration: `${6 + Math.random()}s`,
              }}
            />
          );
        })}
      </div>
      <div className="fixed inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M100 0 L0 0 0 100"
                fill="none"
                stroke="url(#grid-grad)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="grid-grad">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Enhanced Toasts */}
      {error && (
        <div className="fixed top-8 right-8 bg-red-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] z-50 animate-fade-in flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
          <button onClick={() => setError("")} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-gray-300 hover:text-white transition flex items-center gap-2"
        >
          ← Back to Home
        </button>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-500/30">
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
            ) : isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span
              className={`text-sm ${
                isConnecting
                  ? "text-yellow-300"
                  : isConnected
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {isConnecting
                ? "Connecting…"
                : isConnected
                ? "Connected"
                : "Offline"}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition ${
              showFilters 
                ? 'bg-purple-500/20 border border-purple-500/50' 
                : 'bg-black/50 border border-gray-700 hover:border-purple-500/50'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className={`p-2 rounded-lg transition bg-gradient-to-r from-orange-400 to-yellow-500 border-2 border-orange-500 text-black font-bold shadow-lg hover:scale-110 hover:shadow-xl ${showMap ? 'ring-4 ring-orange-300/40' : ''}`}
            title={showMap ? "Hide Map" : "Show Map (Track Location)"}
          >
            {showMap ? <EyeOff className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            <span className="ml-1 hidden md:inline font-semibold">{showMap ? 'Hide Map' : 'Track Location'}</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="p-2 rounded-lg transition bg-gradient-to-r from-green-400 to-blue-500 border-2 border-green-500 text-black font-bold shadow-lg hover:scale-110 hover:shadow-xl ml-2"
            title="Export Supply Chain Report as PDF"
          >
            🧾 <span className="ml-1 hidden md:inline font-semibold">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Enhanced Form Card */}
      <main className="relative z-10 flex flex-col items-center px-6 py-8">
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(128,0,255,0.6)] max-w-lg w-full">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">
                Supply Chain Explorer
              </h1>
              <p className="text-gray-400 text-sm">Track products through the blockchain-powered supply chain</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                  placeholder="Enter Product ID (e.g., prod000, prod01)..."
                  className="w-full bg-black/70 pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={isLoading || !isConnected}
                className={`
                  px-6 py-3 rounded-lg font-semibold text-black flex items-center gap-2
                  ${
                    isLoading || !isConnected
                      ? "bg-gray-800 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-400 to-cyan-300 hover:scale-105"
                  }
                  transition shadow-[0_0_15px_rgba(128,0,255,0.6)]
                `}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isLoading ? "Tracking..." : "Track"}
              </button>
            </div>
            {status && (
              <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-lg">
                  Current Status:{" "}
                  <span className="font-semibold text-green-300">{status}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-4">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Supply Chain Events
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="w-full bg-black/70 px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-300"
                >
                  <option value="">All Roles</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Shipper">Shipper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-black/70 px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-300"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="delay">Delayed</option>
                  <option value="dispute">Dispute</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Transport</label>
                <select
                  value={filters.transportMode}
                  onChange={(e) => setFilters({...filters, transportMode: e.target.value})}
                  className="w-full bg-black/70 px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-300"
                >
                  <option value="">All Modes</option>
                  <option value="truck">Truck</option>
                  <option value="ship">Ship</option>
                  <option value="plane">Plane</option>
                  <option value="train">Train</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Actions</label>
                <button
                  onClick={() => setFilters({role: '', status: '', dateRange: '', transportMode: ''})}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 px-3 py-2 rounded-lg transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map or Timeline View */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {showMap ? (
          <StepMap steps={filteredTimeline} focusKey={mapFocusKey} />
        ) : (
          // Enhanced Summary Statistics
          summaryStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Efficiency</p>
                    <p className="text-xl font-bold text-green-400">{summaryStats.efficiency}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Distance</p>
                    <p className="text-xl font-bold text-blue-400">{summaryStats.totalDistance.toLocaleString()} km</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Carbon Footprint</p>
                    <p className="text-xl font-bold text-purple-400">{summaryStats.totalCarbon.toFixed(1)} kg CO₂</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Duration</p>
                    <p className="text-xl font-bold text-yellow-400">{summaryStats.totalDuration}h</p>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Enhanced Timeline */}
      {filteredTimeline.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto space-y-6 px-6 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300 mb-2">
              Supply Chain Journey
            </h2>
            <p className="text-gray-400">
              {filteredTimeline.length} of {timeline.length} events shown
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-400 opacity-30" />
            
            {filteredTimeline.map((event, index) => {
              const statusInfo = getStatusInfo(event.status);
              const TransportIcon = getTransportIcon(event.transportMode || 'truck');
              const RoleIcon = getRoleIcon(event.role);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={event.id} 
                  className="relative pl-16 mb-8 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 border-white shadow-lg ${statusInfo.bg}`} />
                  
                  {/* Event card */}
                  <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(128,0,255,0.6)] hover:shadow-[0_0_30px_rgba(128,0,255,0.8)] transition-all duration-300">
                    <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <RoleIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{event.actor}</p>
                            <p className="text-sm text-gray-400">{event.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{event.date}</p>
                          <div className={`mt-1 flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm">{statusInfo.label}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-3 rounded-lg">
                        <p className="font-bold text-purple-300 text-lg">{event.action}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </p>
                      </div>
                      
                      {/* Transport and Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-black/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TransportIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400">Transport</span>
                          </div>
                          <p className="text-sm font-semibold text-blue-400 capitalize">{event.transportMode}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-gray-400">Duration</span>
                          </div>
                          <p className="text-sm font-semibold text-yellow-400">{event.duration}h</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400">Distance</span>
                          </div>
                          <p className="text-sm font-semibold text-green-400">{event.distance}km</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-400">CO₂</span>
                          </div>
                          <p className="text-sm font-semibold text-purple-400">{event.carbonFootprint}kg</p>
                        </div>
                      </div>
                      
                      {/* Notes */}
                      {event.notes && (
                        <div className="bg-black/30 p-3 rounded-lg border-l-4 border-purple-500">
                          <p className="text-sm italic text-gray-200">
                            💬 {event.notes}
                          </p>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 px-3 py-2 rounded-lg text-sm transition"
                        >
                          View Details
                        </button>
                      
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Enhanced Placeholder */}
      {!isLoading && timeline.length === 0 && !error && (
        <div className="relative z-10 text-center text-gray-300 px-6 mb-16">
          <div className="max-w-md mx-auto">
            <Package className="mx-auto mb-6 text-gray-500" size={80} />
            <h3 className="text-xl font-semibold mb-2">Ready to Explore</h3>
            <p className="text-gray-400 mb-4">
              Enter a Product ID to see its complete journey through the blockchain-powered supply chain.
            </p>
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Try these example IDs:</p>
              <div className="space-y-1 text-xs">
                <p className="text-purple-300">• prod000 (2 steps)</p>
                <p className="text-purple-300">• prod01 (3 steps)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-purple-300">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Actor</p>
                  <p className="font-semibold">{selectedEvent.actor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-semibold">{selectedEvent.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Action</p>
                  <p className="font-semibold text-purple-300">{selectedEvent.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-semibold">{selectedEvent.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-semibold">{selectedEvent.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="font-semibold">{getStatusInfo(selectedEvent.status).label}</p>
                </div>
              </div>
              {selectedEvent.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-200 bg-black/30 p-3 rounded-lg">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
