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
  Zap,
  Thermometer,
  Droplets,
  Navigation,
  Hash,
  Star,
  DollarSign,
  Leaf,
  Award,
  Lock,
  Activity,
  Target,
  Gauge,
  Fingerprint,
  Satellite,
  Timer,
  Coins,
  TreePine,
  Sparkles,
} from "lucide-react";
import { icpService, Step } from "@/lib/icp-service";
import StepMap from "../../components/StepMap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type EnhancedTimelineEvent = {
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
  // Enhanced professional fields
  transportMode?: 'truck' | 'ship' | 'plane' | 'train';
  temperatureCelsius?: number;
  humidityPercent?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  batchNumber?: string;
  certificationHash?: string;
  estimatedArrival?: number;
  actualArrival?: number;
  qualityScore?: number;
  carbonFootprintKg?: number;
  distanceKm?: number;
  costUsd?: number;
  blockchainHash?: string;
};

type FilterState = {
  role: string;
  status: string;
  dateRange: string;
  transportMode: string;
  qualityRange: string;
};

export default function EnhancedTrackProductPage() {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState<EnhancedTimelineEvent[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EnhancedTimelineEvent | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    role: '',
    status: '',
    dateRange: '',
    transportMode: '',
    qualityRange: ''
  });
  const [mapFocusKey, setMapFocusKey] = useState(0);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Connect to Enhanced ICP
  useEffect(() => {
    (async () => {
      setIsConnecting(true);
      try {
        const ok = await icpService.connect();
        setIsConnected(ok);
        if (!ok) setError("⚠️ Start your Enhanced ICP canister first");
      } catch (e: any) {
        setError(`⚠️ Enhanced ICP error: ${e.message}`);
      } finally {
        setIsConnecting(false);
      }
    })();
  }, []);

  // Convert enhanced backend data to timeline events
  const generateEnhancedTimeline = (steps: Step[]): EnhancedTimelineEvent[] => {
    return steps.map((s, i) => ({
      id: i,
      actor: s.actor_name,
      role: s.role,
      action: s.action,
      location: s.location,
      date: new Date(Number(s.timestamp) / 1e6).toLocaleString(),
      timestamp: Number(s.timestamp) / 1e6,
      notes: Array.isArray(s.notes) && s.notes.length > 0 ? s.notes[0] : undefined,
      verified: true,
      status: 'verified' as const,
      // Enhanced professional fields
      transportMode: Array.isArray(s.transport_mode) && s.transport_mode.length > 0 ? s.transport_mode[0] as 'truck' | 'ship' | 'plane' | 'train' : undefined,
      temperatureCelsius: Array.isArray(s.temperature_celsius) && s.temperature_celsius.length > 0 ? s.temperature_celsius[0] : undefined,
      humidityPercent: Array.isArray(s.humidity_percent) && s.humidity_percent.length > 0 ? s.humidity_percent[0] : undefined,
      gpsLatitude: Array.isArray(s.gps_latitude) && s.gps_latitude.length > 0 ? s.gps_latitude[0] : undefined,
      gpsLongitude: Array.isArray(s.gps_longitude) && s.gps_longitude.length > 0 ? s.gps_longitude[0] : undefined,
      batchNumber: Array.isArray(s.batch_number) && s.batch_number.length > 0 ? s.batch_number[0] : undefined,
      certificationHash: Array.isArray(s.certification_hash) && s.certification_hash.length > 0 ? s.certification_hash[0] : undefined,
      estimatedArrival: Array.isArray(s.estimated_arrival) && s.estimated_arrival.length > 0 ? Number(s.estimated_arrival[0]) : undefined,
      actualArrival: Array.isArray(s.actual_arrival) && s.actual_arrival.length > 0 ? Number(s.actual_arrival[0]) : undefined,
      qualityScore: Array.isArray(s.quality_score) && s.quality_score.length > 0 ? s.quality_score[0] : undefined,
      carbonFootprintKg: Array.isArray(s.carbon_footprint_kg) && s.carbon_footprint_kg.length > 0 ? s.carbon_footprint_kg[0] : undefined,
      distanceKm: Array.isArray(s.distance_km) && s.distance_km.length > 0 ? s.distance_km[0] : undefined,
      costUsd: Array.isArray(s.cost_usd) && s.cost_usd.length > 0 ? s.cost_usd[0] : undefined,
      blockchainHash: Array.isArray(s.blockchain_hash) && s.blockchain_hash.length > 0 ? s.blockchain_hash[0] : undefined,
    }));
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
        setError("🔍 No history found for this product");
      } else {
        const enhancedTimeline = generateEnhancedTimeline(steps);
        setTimeline(enhancedTimeline);
        setStatus(steps[steps.length - 1].action);
      }
    } catch (e) {
      console.error(e);
      setError("❌ Failed to fetch enhanced history");
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
      if (filters.qualityRange && event.qualityScore) {
        const [min, max] = filters.qualityRange.split('-').map(Number);
        if (event.qualityScore < min || event.qualityScore > max) return false;
      }
      return true;
    });
  }, [timeline, filters]);

  // Calculate enhanced summary statistics
  const enhancedSummaryStats = useMemo(() => {
    if (timeline.length === 0) return null;
    
    const totalDistance = timeline.reduce((sum, event) => sum + (event.distanceKm || 0), 0);
    const totalCarbon = timeline.reduce((sum, event) => sum + (event.carbonFootprintKg || 0), 0);
    const totalCost = timeline.reduce((sum, event) => sum + (event.costUsd || 0), 0);
    const avgQuality = timeline.filter(e => e.qualityScore).reduce((sum, e) => sum + (e.qualityScore || 0), 0) / timeline.filter(e => e.qualityScore).length || 0;
    const avgTemperature = timeline.filter(e => e.temperatureCelsius).reduce((sum, e) => sum + (e.temperatureCelsius || 0), 0) / timeline.filter(e => e.temperatureCelsius).length || 0;
    const verifiedCount = timeline.filter(event => event.status === 'verified').length;
    const uniqueLocations = new Set(timeline.map(e => e.location)).size;
    const transportModes = new Set(timeline.filter(e => e.transportMode).map(e => e.transportMode)).size;
    
    return {
      totalDistance: Math.round(totalDistance),
      totalCarbon: Math.round(totalCarbon * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      avgQuality: Math.round(avgQuality),
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      verifiedCount,
      uniqueLocations,
      transportModes,
      efficiency: Math.round((verifiedCount / timeline.length) * 100),
      sustainabilityScore: Math.max(100 - Math.round(totalCarbon * 2), 0), // Lower carbon = higher score
    };
  }, [timeline]);

  const handleExportEnhancedPDF = async () => {
    const doc = new jsPDF();
    
    // Header with BlockTrace branding
    doc.setFillColor(75, 0, 130);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BLOCKTRACE', 14, 25);
    doc.setFontSize(12);
    doc.text('Enhanced Blockchain Supply Chain Report', 14, 35);
    
    // Product info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPPLY CHAIN CERTIFICATE', 105, 55, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Product ID: ${productId}`, 14, 70);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 78);
    
    // Get real ESG score from ICP backend
    let realESGScore = null;
    try {
      realESGScore = await icpService.calculateESGScore(productId);
    } catch (error) {
      console.error('Failed to get ESG score for PDF:', error);
    }
    
    if (realESGScore) {
      // Real ESG Badge from ICP backend
      const esgScore = realESGScore.sustainability_score;
      const badgeColor = esgScore >= 70 ? [34, 197, 94] : [239, 68, 68];
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.roundedRect(14, 85, 70, 15, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const badgeText = esgScore >= 70 ? '✓ Sustainable' : '⚠ Needs Improvement';
      doc.text(badgeText, 49, 95, { align: 'center' });
      
      // Real ESG Metrics from ICP
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`ESG Score: ${esgScore}/100`, 90, 95);
      doc.text(`Total Distance: ${realESGScore.total_distance_km.toFixed(0)} km`, 14, 110);
      doc.text(`Carbon Footprint: ${realESGScore.carbon_footprint_kg.toFixed(2)} kg CO₂`, 14, 118);
      doc.text(`CO₂ Saved vs Traditional: ${realESGScore.co2_saved_vs_traditional.toFixed(2)} kg`, 14, 126);
      doc.text(`Supply Chain Steps: ${realESGScore.total_steps}`, 14, 134);
      
      // Impact message
      if (realESGScore.impact_message) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Impact: ${realESGScore.impact_message}`, 14, 142);
      }
    } else if (enhancedSummaryStats) {
      // Fallback to calculated stats if ESG service unavailable
      const esgScore = enhancedSummaryStats.sustainabilityScore;
      const badgeColor = esgScore >= 70 ? [34, 197, 94] : [239, 68, 68];
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.roundedRect(14, 85, 60, 15, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const badgeText = esgScore >= 70 ? '✓ Sustainable' : '⚠ Needs Improvement';
      doc.text(badgeText, 44, 95, { align: 'center' });
      
      // Fallback metrics
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`ESG Score: ${esgScore}/100`, 80, 95);
      doc.text(`Total Distance: ${enhancedSummaryStats.totalDistance} km`, 14, 110);
      doc.text(`Carbon Footprint: ${enhancedSummaryStats.totalCarbon} kg CO₂`, 14, 118);
      doc.text(`Total Cost: $${enhancedSummaryStats.totalCost}`, 14, 126);
    }
    
    autoTable(doc, {
      startY: realESGScore ? 155 : 135,
      head: [["Step", "Actor", "Role", "Action", "Location", "Transport", "Quality", "CO₂ (kg)", "Cost ($)", "Blockchain Hash"]],
      body: filteredTimeline.map((e, i) => [
        i + 1,
        e.actor,
        e.role,
        e.action,
        e.location,
        e.transportMode || "-",
        e.qualityScore || "-",
        e.carbonFootprintKg || "-",
        e.costUsd || "-",
        e.blockchainHash ? e.blockchainHash.substring(0, 10) + "..." : "-"
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [138, 92, 246] },
    });
    doc.save(`enhanced_supply_chain_report_${productId || "product"}.pdf`);
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

  // Get transport mode icon and details
  const getTransportInfo = (mode: string) => {
    switch (mode) {
      case 'truck': return { icon: Truck, label: 'Truck', color: 'text-blue-400', co2: 0.162 };
      case 'ship': return { icon: Ship, label: 'Ship', color: 'text-cyan-400', co2: 0.017 };
      case 'plane': return { icon: Plane, label: 'Plane', color: 'text-purple-400', co2: 0.255 };
      case 'train': return { icon: Truck, label: 'Train', color: 'text-green-400', co2: 0.041 };

      default: return { icon: Truck, label: 'Unknown', color: 'text-gray-400', co2: 0.162 };
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manufacturer':
      case 'raw material supplier': return Factory;
      case 'distributor':
      case 'warehouse manager': return Package;
      case 'retailer': return Store;
      case 'logistics provider': return Truck;
      case 'quality control inspector': return Shield;
      case 'environmental auditor': return Leaf;
      case 'certification body': return Award;
      default: return User;
    }
  };

  // Auto-dismiss error
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
                ? "🔗 Blockchain Connected"
                : "Offline"}
            </span>
          </div>
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className={`p-2 rounded-lg transition ${
              showAdvancedMetrics 
                ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold' 
                : 'bg-black/50 border border-gray-700 hover:border-purple-500/50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="ml-1 hidden md:inline font-semibold">
              {showAdvancedMetrics ? '🔬 Advanced' : '📊 Metrics'}
            </span>
          </button>
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
            onClick={handleExportEnhancedPDF}
            className="p-2 rounded-lg transition bg-gradient-to-r from-green-400 to-blue-500 border-2 border-green-500 text-black font-bold shadow-lg hover:scale-110 hover:shadow-xl ml-2"
            title="Export Enhanced Supply Chain Report as PDF"
          >
            📋 <span className="ml-1 hidden md:inline font-semibold">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Enhanced Form Card */}
      <main className="relative z-10 flex flex-col items-center px-6 py-8">
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(128,0,255,0.6)] max-w-lg w-full">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">
                🔗 Enhanced Blockchain Explorer
              </h1>
              <p className="text-gray-400 text-sm">Professional-grade supply chain tracking with IoT sensors & compliance</p>
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
                {isLoading ? "Tracking..." : "🔍 Track"}
              </button>
            </div>
            {status && (
              <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-lg">
                  Current Status:{" "}
                  <span className="font-semibold text-green-300">{status}</span>
                </p>
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      try {
                        const { nftClient } = await import('@/lib/nft-service');
                        await nftClient.connect();
                        
                        let foundTokenId = null;
                        
                        // Check simple NFTs one by one (avoid payload size limit)
                        // NOTE: Backend starts NFT IDs from 0, not 1
                        for (let i = 0; i <= 20; i++) {
                          try {
                            const metadata = await nftClient.getMetadataSimple(BigInt(i));
                            if (metadata && metadata.product_name === productId.trim()) {
                              foundTokenId = i;
                              break;
                            }
                          } catch (e) {
                            // NFT doesn't exist, continue
                          }
                        }
                        
                        // Check passport entries if no simple NFT found
                        if (foundTokenId === null) {
                          for (let i = 0; i <= 20; i++) {
                            try {
                              const passport = await nftClient.getPassport(BigInt(i));
                              if (passport) {
                                const data = JSON.parse(passport);
                                if (data.product_name === productId.trim()) {
                                  foundTokenId = i;
                                  break;
                                }
                              }
                            } catch (e) {
                              // Continue to next ID
                            }
                          }
                        }
                        
                        if (foundTokenId === null) {
                          alert(`No NFT found for product "${productId.trim()}". Make sure you created an NFT when adding the product step.`);
                          return;
                        }
                        
                        router.push(`/passport?tokenId=${foundTokenId}`);
                      } catch (e) {
                        console.error('Failed to find NFT:', e);
                        alert('Error finding NFT: ' + e.message);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold hover:scale-105 transition"
                  >
                    🎫 View Digital Passport
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-4">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              🔬 Advanced Supply Chain Filters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="w-full bg-black/70 px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-300"
                >
                  <option value="">All Roles</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Raw Material Supplier">Raw Material Supplier</option>
                  <option value="Quality Control Inspector">Quality Inspector</option>
                  <option value="Logistics Provider">Logistics Provider</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
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
                  <option value="truck">🚛 Truck</option>
                  <option value="ship">🚢 Ship</option>
                  <option value="plane">✈️ Plane</option>
                  <option value="train">🚂 Train</option>

                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quality Score</label>
                <select
                  value={filters.qualityRange}
                  onChange={(e) => setFilters({...filters, qualityRange: e.target.value})}
                  className="w-full bg-black/70 px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-300"
                >
                  <option value="">All Quality</option>
                  <option value="90-100">🌟 Excellent (90-100)</option>
                  <option value="80-89">⭐ Good (80-89)</option>
                  <option value="70-79">📊 Average (70-79)</option>
                  <option value="0-69">⚠️ Poor (0-69)</option>
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
                  <option value="verified">✅ Verified</option>
                  <option value="delay">⏰ Delayed</option>
                  <option value="dispute">⚠️ Dispute</option>
                  <option value="pending">🔄 Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Actions</label>
                <button
                  onClick={() => setFilters({role: '', status: '', dateRange: '', transportMode: '', qualityRange: ''})}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 px-3 py-2 rounded-lg transition"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map or Enhanced Summary Statistics */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {showMap ? (
          <StepMap steps={filteredTimeline} focusKey={mapFocusKey} />
        ) : (
          enhancedSummaryStats && (
            <div className="space-y-6">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Efficiency</p>
                      <p className="text-xl font-bold text-green-400">{enhancedSummaryStats.efficiency}%</p>
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
                      <p className="text-xl font-bold text-blue-400">{enhancedSummaryStats.totalDistance.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TreePine className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Carbon Footprint</p>
                      <p className="text-xl font-bold text-purple-400">{enhancedSummaryStats.totalCarbon} kg CO₂</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Cost</p>
                      <p className="text-xl font-bold text-yellow-400">${enhancedSummaryStats.totalCost}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics (if enabled) */}
              {showAdvancedMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Quality</p>
                        <p className="text-xl font-bold text-cyan-400">{enhancedSummaryStats.avgQuality}/100</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Temperature</p>
                        <p className="text-xl font-bold text-red-400">{enhancedSummaryStats.avgTemperature}°C</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Locations</p>
                        <p className="text-xl font-bold text-orange-400">{enhancedSummaryStats.uniqueLocations}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Sustainability</p>
                        <p className="text-xl font-bold text-emerald-400">{enhancedSummaryStats.sustainabilityScore}/100</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Enhanced Timeline */}
      {filteredTimeline.length > 0 && (
        <section className="relative z-10 max-w-5xl mx-auto space-y-6 px-6 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300 mb-2">
              🔗 Enhanced Blockchain Supply Chain Journey
            </h2>
            <p className="text-gray-400">
              {filteredTimeline.length} of {timeline.length} professional tracking events shown
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-400 opacity-30" />
            
            {filteredTimeline.map((event, index) => {
              const statusInfo = getStatusInfo(event.status);
              const transportInfo = getTransportInfo(event.transportMode || 'truck');
              const RoleIcon = getRoleIcon(event.role);
              const StatusIcon = statusInfo.icon;
              const TransportIcon = transportInfo.icon;
              
              return (
                <div 
                  key={event.id} 
                  className="relative pl-16 mb-8 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 border-white shadow-lg ${statusInfo.bg}`} />
                  
                  {/* Enhanced Event card */}
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
                          {event.gpsLatitude && event.gpsLongitude && (
                            <span className="text-xs bg-black/30 px-2 py-1 rounded">
                              📍 {event.gpsLatitude.toFixed(4)}, {event.gpsLongitude.toFixed(4)}
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {/* Enhanced Professional Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Transport */}
                        {event.transportMode && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <TransportIcon className={`w-4 h-4 ${transportInfo.color}`} />
                              <span className="text-xs text-gray-400">Transport</span>
                            </div>
                            <p className={`text-sm font-semibold ${transportInfo.color} capitalize`}>
                              {transportInfo.label}
                            </p>
                          </div>
                        )}
                        
                        {/* Distance */}
                        {event.distanceKm && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-gray-400">Distance</span>
                            </div>
                            <p className="text-sm font-semibold text-green-400">{event.distanceKm}km</p>
                          </div>
                        )}
                        
                        {/* Carbon Footprint */}
                        {event.carbonFootprintKg && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <TreePine className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-gray-400">CO₂</span>
                            </div>
                            <p className="text-sm font-semibold text-purple-400">{event.carbonFootprintKg}kg</p>
                          </div>
                        )}
                        
                        {/* Cost */}
                        {event.costUsd && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs text-gray-400">Cost</span>
                            </div>
                            <p className="text-sm font-semibold text-yellow-400">${event.costUsd}</p>
                          </div>
                        )}
                        
                        {/* Quality Score */}
                        {event.qualityScore && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs text-gray-400">Quality</span>
                            </div>
                            <p className="text-sm font-semibold text-cyan-400">{event.qualityScore}/100</p>
                          </div>
                        )}
                        
                        {/* Temperature */}
                        {event.temperatureCelsius && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer className="w-4 h-4 text-red-400" />
                              <span className="text-xs text-gray-400">Temp</span>
                            </div>
                            <p className="text-sm font-semibold text-red-400">{event.temperatureCelsius}°C</p>
                          </div>
                        )}
                        
                        {/* Humidity */}
                        {event.humidityPercent && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Droplets className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-gray-400">Humidity</span>
                            </div>
                            <p className="text-sm font-semibold text-blue-400">{event.humidityPercent}%</p>
                          </div>
                        )}
                        
                        {/* Batch Number */}
                        {event.batchNumber && (
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="w-4 h-4 text-orange-400" />
                              <span className="text-xs text-gray-400">Batch</span>
                            </div>
                            <p className="text-sm font-semibold text-orange-400">{event.batchNumber}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Blockchain Hash */}
                      {event.blockchainHash && (
                        <div className="bg-black/30 p-3 rounded-lg border-l-4 border-cyan-500">
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs text-gray-400">Blockchain Hash</span>
                          </div>
                          <p className="text-sm font-mono text-cyan-300 break-all">
                            {event.blockchainHash}
                          </p>
                        </div>
                      )}
                      
                      {/* Certification Hash */}
                      {event.certificationHash && (
                        <div className="bg-black/30 p-3 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400">Certification Hash</span>
                          </div>
                          <p className="text-sm font-mono text-green-300 break-all">
                            {event.certificationHash}
                          </p>
                        </div>
                      )}
                      
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
                          🔍 View Details
                        </button>
                        {event.gpsLatitude && event.gpsLongitude && (
                          <button
                            onClick={() => {
                              setMapFocusKey(prev => prev + 1);
                              setShowMap(true);
                            }}
                            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 px-3 py-2 rounded-lg text-sm transition"
                          >
                            📍 Show on Map
                          </button>
                        )}
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
            <h3 className="text-xl font-semibold mb-2">🔗 Ready to Explore Enhanced Blockchain</h3>
            <p className="text-gray-400 mb-4">
              Enter a Product ID to see its complete professional journey through the enhanced blockchain-powered supply chain with IoT sensors, GPS tracking, and compliance data.
            </p>
            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Try these enhanced example IDs:</p>
              <div className="space-y-1 text-xs">
                <p className="text-purple-300">• prod000 (Enhanced tracking)</p>
                <p className="text-purple-300">• prod01 (Professional metrics)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-6 max-w-4xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-purple-300">🔍 Enhanced Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Basic Info */}
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

              {/* Enhanced Professional Data */}
              {(selectedEvent.transportMode || selectedEvent.distanceKm || selectedEvent.carbonFootprintKg || selectedEvent.costUsd) && (
                <div>
                  <h4 className="text-lg font-semibold text-cyan-300 mb-3">🚛 Transport & Logistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedEvent.transportMode && (
                      <div>
                        <p className="text-sm text-gray-400">Transport Mode</p>
                        <p className="font-semibold text-blue-400 capitalize">{selectedEvent.transportMode}</p>
                      </div>
                    )}
                    {selectedEvent.distanceKm && (
                      <div>
                        <p className="text-sm text-gray-400">Distance</p>
                        <p className="font-semibold text-green-400">{selectedEvent.distanceKm} km</p>
                      </div>
                    )}
                    {selectedEvent.carbonFootprintKg && (
                      <div>
                        <p className="text-sm text-gray-400">Carbon Footprint</p>
                        <p className="font-semibold text-purple-400">{selectedEvent.carbonFootprintKg} kg CO₂</p>
                      </div>
                    )}
                    {selectedEvent.costUsd && (
                      <div>
                        <p className="text-sm text-gray-400">Cost</p>
                        <p className="font-semibold text-yellow-400">${selectedEvent.costUsd}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* IoT Sensor Data */}
              {(selectedEvent.temperatureCelsius || selectedEvent.humidityPercent || selectedEvent.qualityScore) && (
                <div>
                  <h4 className="text-lg font-semibold text-red-300 mb-3">🌡️ IoT Sensor Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.temperatureCelsius && (
                      <div>
                        <p className="text-sm text-gray-400">Temperature</p>
                        <p className="font-semibold text-red-400">{selectedEvent.temperatureCelsius}°C</p>
                      </div>
                    )}
                    {selectedEvent.humidityPercent && (
                      <div>
                        <p className="text-sm text-gray-400">Humidity</p>
                        <p className="font-semibold text-blue-400">{selectedEvent.humidityPercent}%</p>
                      </div>
                    )}
                    {selectedEvent.qualityScore && (
                      <div>
                        <p className="text-sm text-gray-400">Quality Score</p>
                        <p className="font-semibold text-cyan-400">{selectedEvent.qualityScore}/100</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GPS & Location */}
              {(selectedEvent.gpsLatitude || selectedEvent.gpsLongitude) && (
                <div>
                  <h4 className="text-lg font-semibold text-green-300 mb-3">📍 GPS Tracking</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvent.gpsLatitude && (
                      <div>
                        <p className="text-sm text-gray-400">Latitude</p>
                        <p className="font-semibold text-green-400">{selectedEvent.gpsLatitude.toFixed(6)}</p>
                      </div>
                    )}
                    {selectedEvent.gpsLongitude && (
                      <div>
                        <p className="text-sm text-gray-400">Longitude</p>
                        <p className="font-semibold text-green-400">{selectedEvent.gpsLongitude.toFixed(6)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compliance & Certification */}
              {(selectedEvent.batchNumber || selectedEvent.certificationHash || selectedEvent.blockchainHash) && (
                <div>
                  <h4 className="text-lg font-semibold text-orange-300 mb-3">🛡️ Compliance & Security</h4>
                  <div className="space-y-3">
                    {selectedEvent.batchNumber && (
                      <div>
                        <p className="text-sm text-gray-400">Batch Number</p>
                        <p className="font-semibold text-orange-400">{selectedEvent.batchNumber}</p>
                      </div>
                    )}
                    {selectedEvent.certificationHash && (
                      <div>
                        <p className="text-sm text-gray-400">Certification Hash</p>
                        <p className="font-mono text-sm text-green-300 bg-black/30 p-2 rounded break-all">
                          {selectedEvent.certificationHash}
                        </p>
                      </div>
                    )}
                    {selectedEvent.blockchainHash && (
                      <div>
                        <p className="text-sm text-gray-400">Blockchain Hash</p>
                        <p className="font-mono text-sm text-cyan-300 bg-black/30 p-2 rounded break-all">
                          {selectedEvent.blockchainHash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Additional Notes</p>
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