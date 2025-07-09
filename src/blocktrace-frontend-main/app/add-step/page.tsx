"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { icpService } from "@/lib/icp-service";

interface FormData {
  productId: string;
  actorName: string;
  actorRole: string;
  action: string;
  location: string;
  notes: string;
  acceptTerms: boolean;
}

interface ConnectionStatus {
  isConnected: boolean;
  canisterId?: string;
  host?: string;
}

export default function AddStepPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    productId: "",
    actorName: "",
    actorRole: "",
    action: "",
    location: "",
    notes: "",
    acceptTerms: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);

  const actorRoles = [
    "Manufacturer",
    "Distributor",
    "Retailer",
    "Warehouse",
    "Logistics Provider",
    "Quality Controller",
  ];
  const actions = [
    "Manufactured",
    "Shipped",
    "Received",
    "Sold",
    "Quality Checked",
    "Stored",
    "Dispatched",
  ];

  // — ICP connect on mount —
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

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
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
      const { productId, actorName, actorRole, action, location, notes } = formData;
      const res = await icpService.addStep({
        product_id: productId.trim(),
        actor_name: actorName.trim(),
        role: actorRole,
        action,
        location: location.trim(),
        notes: notes.trim() || null,
      });
      if ("Ok" in res) {
        setSuccessMessage(res.Ok || "Step added!");
        setFormData({
          productId: "",
          actorName: "",
          actorRole: "",
          action: "",
          location: "",
          notes: "",
          acceptTerms: false,
        });
      } else {
        setErrorMessage(res.Err || "Failed to add step");
      }
    } catch (e: any) {
      setErrorMessage(`🚨 Submit Error: ${e.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // auto-dismiss
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* — Gradient backdrop + moving particles + grid pattern — */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 animate-gradient-x"></div>
      {/* particles */}
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
      {/* grid */}
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

      {/* — Toasts — */}
      {successMessage && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-green-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(0,255,0,0.5)] z-50">
          <CheckCircle className="w-6 h-6" /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-red-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] z-50">
          {errorMessage}
        </div>
      )}

      {/* — Header / Back button — */}
      <div className="relative z-10 flex items-center px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Home
        </button>
      </div>

      {/* — Glass‑frame form card — */}
      <main className="relative z-10 flex justify-center px-6 py-16">
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(128,0,255,0.6)] max-w-xl w-full">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-10 space-y-8">
            {/* Title */}
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300 text-center">
              Add a Supply Chain Step
            </h2>

            {/* Connection pill */}
            <div className="flex justify-center items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30 mx-auto w-max">
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
                  ? "Connected"
                  : "Disconnected"}
              </span>
              <span className="ml-4 text-xs text-gray-400">
                {connectionStatus?.canisterId || "Canister: —"}
              </span>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/** Product ID **/}
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

              {/** Actor Name **/}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <User className="w-5 h-5 text-purple-300" />
                  Actor Name<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.actorName}
                  onChange={(e) => update("actorName", e.target.value)}
                  placeholder="Who’s handling it?"
                  className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
                />
              </div>

              {/** Role **/}
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

              {/** Action **/}
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

              {/** Location **/}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <MapPin className="w-5 h-5 text-purple-300" />
                  Location<span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="City, facility, etc."
                  className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
                />
              </div>

              {/** Notes full-width **/}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <FileText className="w-5 h-5 text-purple-300" />
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Optional details..."
                  className="w-full bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition resize-none"
                />
              </div>
            </div>

            {/** Terms + Submit **/}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => update("acceptTerms", e.target.checked)}
                  className="h-5 w-5 text-purple-300 rounded border-gray-600 focus:ring-purple-300"
                />
                I accept the blockchain terms & conditions<span className="text-red-400">*</span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isConnected}
                className={`
                  w-full py-3 rounded-2xl font-bold text-black
                  ${isSubmitting || !isConnected
                    ? "bg-gray-800 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-400 to-cyan-300 hover:scale-105"}
                  transition shadow-[0_0_15px_rgba(128,0,255,0.6)]
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" /> Submitting…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Submit to Blockchain
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* — keyframes — */}
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
