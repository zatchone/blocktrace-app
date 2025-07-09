"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { icpService } from "@/lib/icp-service";

type TimelineEvent = {
  id: number;
  actor: string;
  role: string;
  action: string;
  location: string;
  date: string;
  notes?: string;
  verified?: boolean;
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
        const tl = steps.map((s, i) => ({
          id: i,
          actor: s.actor_name,
          role: s.role,
          action: s.action,
          location: s.location,
          date: new Date(Number(s.timestamp) / 1e6).toLocaleString(),
          notes:
            Array.isArray(s.notes) && s.notes.length > 0 ? s.notes[0] : undefined,
          verified: true,
        }));
        setTimeline(tl);
        setStatus(steps[steps.length - 1].action);
      }
    } catch (e) {
      console.error(e);
      setError("❌ Failed to fetch history");
    } finally {
      setIsLoading(false);
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
      {/* Grid + particles */}
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

      {/* Toasts */}
      {error && (
        <div className="fixed top-8 right-8 bg-red-500 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] z-50 animate-fade-in">
          {error}
        </div>
      )}

      {/* Back & Connection */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-gray-300 hover:text-white transition"
        >
          ← Home
        </button>
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
      </div>

      {/* Form Card */}
      <main className="relative z-10 flex flex-col items-center px-6 py-16">
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(128,0,255,0.6)] max-w-lg w-full">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 space-y-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300 text-center">
              Track a Product
            </h1>
            <div className="flex gap-2">
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                placeholder="Product ID…"
                className="flex-1 bg-black/70 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-300 focus:ring-2 focus:ring-purple-300 transition"
              />
              <button
                onClick={handleTrack}
                disabled={isLoading || !isConnected}
                className={`
                  px-4 py-3 rounded-lg font-semibold text-black
                  ${
                    isLoading || !isConnected
                      ? "bg-gray-800 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-400 to-cyan-300 hover:scale-105"
                  }
                  transition shadow-[0_0_15px_rgba(128,0,255,0.6)]
                `}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Track"}
              </button>
            </div>
            {status && (
              <div className="text-center">
                <p className="text-lg">
                  Status:{" "}
                  <span className="font-semibold text-purple-300">{status}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="relative z-10 max-w-2xl mx-auto space-y-6 px-6 pb-16">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-cyan-400 opacity-30" />
          {timeline.map((evt) => (
            <div key={evt.id} className="relative pl-6 animate-fade-in-up">
              <div className="absolute left-1/2 transform -translate-x-1/2 top-6 w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 shadow-[0_0_8px_rgba(128,0,255,0.6)]" />
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(128,0,255,0.6)]">
                <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-white">{evt.actor}</p>
                      <p className="text-sm text-gray-400">{evt.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-black">{evt.date}</p>
                      {evt.verified && (
                        <p className="mt-1 text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-purple-300">{evt.action}</p>
                  <p className="text-sm text-gray-400">📍 {evt.location}</p>
                  {evt.notes && (
                    <p className="mt-2 text-sm italic text-gray-200 bg-black/30 p-2 rounded">
                      💬 {evt.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Placeholder */}
      {!isLoading && timeline.length === 0 && !error && (
        <div className="relative z-10 text-center text-gray-300 px-6 mb-16">
          <Package className="mx-auto mb-4" size={64} />
          <p>Enter a Product ID to see its journey through the chain.</p>
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
