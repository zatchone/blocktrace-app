"use client";

import React, { useState, useEffect } from "react";
import { nftClient } from "@/lib/nft-service";
import { useRouter } from "next/navigation";
import {
  Package,
  User,
  Briefcase,
  Zap,
  MapPin,
  FileText,
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff,
  Thermometer,
  Droplets,
  Navigation,
  Hash,
  Shield,
  Clock,
  DollarSign,
  Truck,
  Ship,
  Plane,
  Train,
  Star,
  AlertTriangle,
  Camera,
  Scan,
  Globe,
  TrendingUp,
  Leaf,
  Award,
  Lock,
} from "lucide-react";
import { icpService } from "@/lib/icp-service";

interface EnhancedFormData {
  // Basic fields
  productId: string;
  actorName: string;
  actorRole: string;
  action: string;
  location: string;
  notes: string;
  acceptTerms: boolean;
  
  // Enhanced blockchain supply chain fields
  transportMode: string;
  temperatureCelsius: string;
  humidityPercent: string;
  gpsLatitude: string;
  gpsLongitude: string;
  batchNumber: string;
  certificationHash: string;
  estimatedArrival: string;
  qualityScore: string;
  carbonFootprintKg: string;
  distanceKm: string;
  costUsd: string;
  blockchainHash: string;
  mintNft: boolean;
  productImageFile?: File | null;
  certificateFiles?: File[];
}

interface ConnectionStatus {
  isConnected: boolean;
  canisterId?: string;
  host?: string;
}

export default function AddStepPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EnhancedFormData>({
    productId: "",
    actorName: "",
    actorRole: "",
    action: "",
    location: "",
    notes: "",
    acceptTerms: false,
    transportMode: "",
    temperatureCelsius: "",
    humidityPercent: "",
    gpsLatitude: "",
    gpsLongitude: "",
    batchNumber: "",
    certificationHash: "",
    estimatedArrival: "",
    qualityScore: "",
    carbonFootprintKg: "",
    distanceKm: "",
    costUsd: "",
    blockchainHash: "",
    mintNft: false,
    productImageFile: null,
    certificateFiles: [],
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Image compression function
  const compressImage = (file: File, quality: number, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const actorRoles = [
    "Manufacturer",
    "Raw Material Supplier", 
    "Quality Control Inspector",
    "Warehouse Manager",
    "Logistics Provider",
    "Distributor",
    "Retailer",
    "Customs Officer",
    "Environmental Auditor",
    "Certification Body",
  ];

  const actions = [
    "Raw Material Sourced",
    "Manufacturing Started",
    "Quality Inspection Passed",
    "Packaging Completed",
    "Shipped from Factory",
    "In Transit",
    "Customs Cleared",
    "Arrived at Warehouse",
    "Quality Re-checked",
    "Dispatched to Retailer",
    "Delivered to Customer",
    "Environmental Audit Completed",
  ];

  const transportModes = [
    { value: "truck", label: "Truck 🚛", co2: 0.162 },
    { value: "ship", label: "Ship 🚢", co2: 0.017 },
    { value: "plane", label: "Plane ✈️", co2: 0.255 },
    { value: "train", label: "Train 🚂", co2: 0.041 },

  ];

  // Auto-calculate carbon footprint when transport mode and distance change
  useEffect(() => {
    if (formData.transportMode && formData.distanceKm) {
      const transport = transportModes.find(t => t.value === formData.transportMode);
      if (transport) {
        const distance = parseFloat(formData.distanceKm);
        if (!isNaN(distance)) {
          const carbonFootprint = (distance * transport.co2).toFixed(2);
          setFormData(prev => ({ ...prev, carbonFootprintKg: carbonFootprint }));
        }
      }
    }
  }, [formData.transportMode, formData.distanceKm]);

  // Auto-generate blockchain hash
  const generateBlockchainHash = () => {
    const data = `${formData.productId}-${formData.actorName}-${Date.now()}`;
    const hash = btoa(data).substring(0, 16).toUpperCase();
    setFormData(prev => ({ ...prev, blockchainHash: `0x${hash}` }));
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gpsLatitude: position.coords.latitude.toFixed(6),
            gpsLongitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          setErrorMessage("Could not get GPS location: " + error.message);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by this browser");
    }
  };

  // ICP connect on mount
  useEffect(() => {
    (async () => {
      setIsConnecting(true);
      try {
        const ok = await icpService.connect();
        setIsConnected(ok);
        setConnectionStatus(icpService.getConnectionStatus());
        if (!ok) setErrorMessage("🚨 Start dfx (ICP) before using this page");
      } catch (e: any) {
        setErrorMessage(`🚨 ICP Error: ${e.message || ""}`);
      } finally {
        setIsConnecting(false);
      }
    })();
  }, []);

  const update = <K extends keyof EnhancedFormData>(k: K, v: EnhancedFormData[K]) =>
    setFormData((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.acceptTerms)
      return setErrorMessage("❗ Accept terms to continue");
    if (
      !formData.productId ||
      !formData.actorName ||
      !formData.actorRole ||
      !formData.action ||
      !formData.location
    )
      return setErrorMessage("❗ Fill all required fields");
    if (!isConnected)
      return setErrorMessage("❗ Not connected — please refresh");

    setIsSubmitting(true);
    try {
      const res = await icpService.addStep({
        product_id: formData.productId.trim(),
        actor_name: formData.actorName.trim(),
        role: formData.actorRole,
        action: formData.action,
        location: formData.location.trim(),
        notes: formData.notes.trim() || null,
        // Enhanced professional blockchain fields
        transport_mode: formData.transportMode || undefined,
        temperature_celsius: formData.temperatureCelsius ? parseFloat(formData.temperatureCelsius) : undefined,
        humidity_percent: formData.humidityPercent ? parseFloat(formData.humidityPercent) : undefined,
        gps_latitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
        gps_longitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
        batch_number: formData.batchNumber || undefined,
        certification_hash: formData.certificationHash || undefined,
        estimated_arrival: formData.estimatedArrival ? new Date(formData.estimatedArrival).getTime() : undefined,
        quality_score: formData.qualityScore ? parseInt(formData.qualityScore) : undefined,
        carbon_footprint_kg: formData.carbonFootprintKg ? parseFloat(formData.carbonFootprintKg) : undefined,
        distance_km: formData.distanceKm ? parseFloat(formData.distanceKm) : undefined,
        cost_usd: formData.costUsd ? parseFloat(formData.costUsd) : undefined,
        blockchain_hash: formData.blockchainHash || undefined,
      });
      if ("Ok" in res) {
        // Optional: Mint NFT (but don't redirect)
        let successMsg = "✅ Step successfully added to blockchain!";
        if (formData.mintNft) {
          try {
            // Convert and compress image if provided
            let imageUri = "";
            if (formData.productImageFile) {
              try {
                // Compress image before converting to base64
                const compressedFile = await compressImage(formData.productImageFile, 0.7, 800, 600);
                console.log('Original size:', formData.productImageFile.size, 'Compressed size:', compressedFile.size);
                
                const reader = new FileReader();
                imageUri = await new Promise<string>((resolve, reject) => {
                  reader.onload = () => {
                    const result = reader.result as string;
                    console.log('Compressed image base64 length:', result.length);
                    resolve(result);
                  };
                  reader.onerror = () => reject(new Error('Failed to read compressed image'));
                  reader.readAsDataURL(compressedFile);
                });
              } catch (imageError) {
                console.error('Image compression failed:', imageError);
                imageUri = "https://via.placeholder.com/400x300/6366f1/ffffff?text=Product+Image";
              }
            } else {
              imageUri = "https://via.placeholder.com/400x300/6366f1/ffffff?text=Product+Image";
            }
            
            // Create NFT payload with proper structure
            const nftMetadata = {
              product_name: formData.productId.trim(), // This MUST match the product ID used in tracking
              batch_id: formData.batchNumber || "",
              manufacturer: formData.actorName || "",
              image_uri: imageUri,
              certificate_uri: formData.certificationHash || "",
              history: [`Created by ${formData.actorName} - ${formData.action}`]
            };
            
            console.log('📝 Creating NFT for product:', formData.productId.trim());
            
            // Connect to NFT service first
            await nftClient.connect();
            console.log('✅ Connected to NFT service');
            
            console.log('📝 NFT Metadata:', {
              product_name: nftMetadata.product_name,
              batch_id: nftMetadata.batch_id,
              manufacturer: nftMetadata.manufacturer,
              image_uri: nftMetadata.image_uri.startsWith('data:') 
                ? `data:image... (${nftMetadata.image_uri.length} chars)` 
                : nftMetadata.image_uri,
              certificate_uri: nftMetadata.certificate_uri
            });
            
            // First try minting with simple metadata structure
            console.log('🎯 Attempting to mint simple NFT...');
            const tokenId = await nftClient.mintSimple(nftMetadata);
            console.log('✅ Minted NFT with tokenId:', tokenId.toString());
            
            // Also create passport entry for compatibility
            console.log('🎯 Attempting to create passport entry...');
            const passportData = JSON.stringify(nftMetadata);
            const passportId = await nftClient.mintPassport(passportData);
            console.log('✅ Created passport with ID:', passportId.toString());
            
            // Verify the NFT was created successfully
            console.log('🔍 Verifying NFT creation...');
            const verifyMetadata = await nftClient.getMetadataSimple(tokenId);
            console.log('🔍 Verification result:', verifyMetadata ? 'SUCCESS' : 'FAILED');
            if (verifyMetadata) {
              console.log('🔍 Verified product name:', verifyMetadata.product_name);
            }
            
            successMsg = `✅ Step added to blockchain! NFT Digital Passport created with ID: ${tokenId.toString()}`;
          } catch (mintErr) {
            console.error("❌ NFT mint failed:", mintErr);
            console.error("❌ Full error details:", {
              message: (mintErr as Error).message,
              stack: (mintErr as Error).stack,
              name: (mintErr as Error).name
            });
            successMsg = "✅ Step successfully added to blockchain! (NFT minting failed - " + (mintErr as Error).message + ")";
          }
        }
        setSuccessMessage(successMsg);
        // Reset form
        setFormData({
          productId: "",
          actorName: "",
          actorRole: "",
          action: "",
          location: "",
          notes: "",
          acceptTerms: false,
          transportMode: "",
          temperatureCelsius: "",
          humidityPercent: "",
          gpsLatitude: "",
          gpsLongitude: "",
          batchNumber: "",
          certificationHash: "",
          estimatedArrival: "",
          qualityScore: "",
          carbonFootprintKg: "",
          distanceKm: "",
          costUsd: "",
          blockchainHash: "",
          mintNft: false,
          productImageFile: null,
          certificateFiles: [],
        });
        setCurrentStep(1);
      } else {
        setErrorMessage(res.Err || "Failed to add step");
      }
    } catch (e: any) {
      setErrorMessage(`🚨 Submit Error: ${e.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 5_000);
    return () => clearTimeout(t);
  }, [successMessage]);
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 8_000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step
                  ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-black"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${
                  currentStep > step ? "bg-gradient-to-r from-purple-500 to-cyan-400" : "bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBasicFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Package className="w-5 h-5 text-purple-300" />
            Product ID<span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.productId}
            onChange={(e) => update("productId", e.target.value)}
            placeholder="e.g. PROD-12345"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <User className="w-5 h-5 text-purple-300" />
            Actor Name<span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.actorName}
            onChange={(e) => update("actorName", e.target.value)}
            placeholder="Company/Person handling"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Briefcase className="w-5 h-5 text-purple-300" />
            Role<span className="text-red-400">*</span>
          </label>
          <select
            value={formData.actorRole}
            onChange={(e) => update("actorRole", e.target.value)}
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          >
            <option value="">Select role</option>
            {actorRoles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Zap className="w-5 h-5 text-purple-300" />
            Action<span className="text-red-400">*</span>
          </label>
          <select
            value={formData.action}
            onChange={(e) => update("action", e.target.value)}
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          >
            <option value="">Select action</option>
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <MapPin className="w-5 h-5 text-purple-300" />
            Location<span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="City, facility, warehouse address"
              className="flex-1 bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:scale-105 transition"
              title="Get GPS Location"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransportFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Truck className="w-5 h-5 text-blue-300" />
            Transport Mode
          </label>
          <select
            value={formData.transportMode}
            onChange={(e) => update("transportMode", e.target.value)}
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-300 transition"
          >
            <option value="">Select transport</option>
            {transportModes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <MapPin className="w-5 h-5 text-blue-300" />
            Distance (km)
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => update("distanceKm", e.target.value)}
            placeholder="Distance in kilometers"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Leaf className="w-5 h-5 text-green-300" />
            Carbon Footprint (kg CO₂)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.carbonFootprintKg}
            onChange={(e) => update("carbonFootprintKg", e.target.value)}
            placeholder="Auto-calculated"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-300 focus:ring-2 focus:ring-green-300 transition"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <DollarSign className="w-5 h-5 text-yellow-300" />
            Cost (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.costUsd}
            onChange={(e) => update("costUsd", e.target.value)}
            placeholder="Transportation cost"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300 transition"
          />
        </div>
      </div>
    </div>
  );

  const renderAdvancedFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Thermometer className="w-5 h-5 text-red-300" />
            Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.temperatureCelsius}
            onChange={(e) => update("temperatureCelsius", e.target.value)}
            placeholder="Storage/transport temp"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-red-300 focus:ring-2 focus:ring-red-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Droplets className="w-5 h-5 text-blue-300" />
            Humidity (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.humidityPercent}
            onChange={(e) => update("humidityPercent", e.target.value)}
            placeholder="Humidity level"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Hash className="w-5 h-5 text-purple-300" />
            Batch Number
          </label>
          <input
            type="text"
            value={formData.batchNumber}
            onChange={(e) => update("batchNumber", e.target.value)}
            placeholder="Production batch ID"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Star className="w-5 h-5 text-yellow-300" />
            Quality Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.qualityScore}
            onChange={(e) => update("qualityScore", e.target.value)}
            placeholder="Quality rating"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Globe className="w-5 h-5 text-green-300" />
            GPS Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.gpsLatitude}
            onChange={(e) => update("gpsLatitude", e.target.value)}
            placeholder="GPS coordinates"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-300 focus:ring-2 focus:ring-green-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Globe className="w-5 h-5 text-green-300" />
            GPS Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.gpsLongitude}
            onChange={(e) => update("gpsLongitude", e.target.value)}
            placeholder="GPS coordinates"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-300 focus:ring-2 focus:ring-green-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Shield className="w-5 h-5 text-cyan-300" />
            Certification Hash
          </label>
          <input
            type="text"
            value={formData.certificationHash}
            onChange={(e) => update("certificationHash", e.target.value)}
            placeholder="Quality certification hash"
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Lock className="w-5 h-5 text-orange-300" />
            Blockchain Hash
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.blockchainHash}
              onChange={(e) => update("blockchainHash", e.target.value)}
              placeholder="Auto-generated hash"
              className="flex-1 bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-300 focus:ring-2 focus:ring-orange-300 transition"
              readOnly
            />
            <button
              type="button"
              onClick={generateBlockchainHash}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:scale-105 transition"
              title="Generate Hash"
            >
              <Hash className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <Clock className="w-5 h-5 text-purple-300" />
            Estimated Arrival
          </label>
          <input
            type="datetime-local"
            value={formData.estimatedArrival}
            onChange={(e) => update("estimatedArrival", e.target.value)}
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <FileText className="w-5 h-5 text-purple-300" />
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Quality checks, special handling, compliance notes..."
            className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Enhanced background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 animate-gradient-x"></div>
      
      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 4 + 2;
          const speed = Math.random() * 0.5 + 0.1;
          const opacity = Math.random() * 0.5 + 0.2;
          return (
            <div
              key={i}
              className="absolute bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-float"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDuration: `${6 + speed}s`,
              }}
            />
          );
        })}
      </div>

      {/* Grid pattern */}
      <div className="fixed inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M100 0 L0 0 0 100" fill="none" stroke="url(#gradient)" strokeWidth="1" />
            </pattern>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-green-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(0,255,0,0.5)] z-50">
          <CheckCircle className="w-6 h-6" /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-red-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] z-50">
          <AlertTriangle className="w-6 h-6" /> {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Home
        </button>
        
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
            ) : isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span
              className={`text-sm ${
                isConnecting
                  ? "text-yellow-400"
                  : isConnected
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? "Blockchain Connected"
                : "Disconnected"}
            </span>
          </div>

          {/* Advanced mode toggle */}
          <button
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className={`px-4 py-2 rounded-lg transition ${
              isAdvancedMode
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold"
                : "bg-black/50 border border-gray-700 hover:border-purple-500/50"
            }`}
          >
            {isAdvancedMode ? "🔬 Advanced Mode" : "⚡ Basic Mode"}
          </button>
        </div>
      </div>

      {/* Main form */}
      <main className="relative z-10 flex justify-center px-6 py-8">
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(128,0,255,0.6)] max-w-4xl w-full">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-10 space-y-8">
            {/* Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">
                🔗 Blockchain Supply Chain Step
              </h2>
              <p className="text-gray-400">
                Add a new step to the immutable blockchain ledger with professional-grade tracking
              </p>
            </div>

            {/* Step indicator */}
            {renderStepIndicator()}

            {/* Form content based on current step */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-center text-purple-300">
                  📦 Basic Information
                </h3>
                {renderBasicFields()}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-center text-blue-300">
                  🚛 Transport & Environmental Data
                </h3>
                {renderTransportFields()}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-center text-green-300">
                  🔬 Advanced Tracking & Compliance
                </h3>
                {isAdvancedMode ? renderAdvancedFields() : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      Enable Advanced Mode for professional IoT sensors, GPS tracking, and compliance features
                    </p>
                    <button
                      onClick={() => setIsAdvancedMode(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold rounded-lg hover:scale-105 transition"
                    >
                      🔬 Enable Advanced Mode
                    </button>
                  </div>
                )}
                {/* NFT Mint toggle and uploads */}
                <div className="bg-black/40 p-4 rounded-xl border border-cyan-500/30">
                  <label className="flex items-center gap-3 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.mintNft}
                      onChange={(e) => update("mintNft", e.target.checked)}
                      className="h-5 w-5 text-cyan-300 rounded border-gray-600 focus:ring-cyan-300"
                    />
                    🎫 Mint NFT Digital Passport (Creates viewable product certificate)
                  </label>
                  {formData.mintNft && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Product Image (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            update("productImageFile", file);
                            if (file) {
                              console.log('Image file selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                            }
                          }}
                          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {formData.productImageFile 
                            ? `Selected: ${formData.productImageFile.name} (${(formData.productImageFile.size / 1024).toFixed(1)}KB)`
                            : 'Will use placeholder if no image selected'
                          }
                        </p>
                        {formData.productImageFile && (
                          <div className="mt-2">
                            <img 
                              src={URL.createObjectURL(formData.productImageFile)} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded border border-purple-500/30"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg transition ${
                  currentStep === 1
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                ← Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 text-black font-bold rounded-lg hover:scale-105 transition"
                >
                  Next →
                </button>
              ) : (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => update("acceptTerms", e.target.checked)}
                      className="h-5 w-5 text-purple-300 rounded border-gray-600 focus:ring-purple-300"
                    />
                    I accept blockchain immutability & data integrity terms<span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isConnected}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-black text-lg
                      ${isSubmitting || !isConnected
                        ? "bg-gray-800 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-400 to-cyan-300 hover:scale-105"
                      }
                      transition shadow-[0_0_15px_rgba(128,0,255,0.6)]
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" /> 
                        🔗 Adding to Blockchain...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" /> 
                        🚀 Submit to Blockchain
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CSS animations */}
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
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}