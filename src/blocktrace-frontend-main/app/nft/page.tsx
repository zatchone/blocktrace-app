"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nftClient, Metadata } from "@/lib/nft-service";
import { QRCodeCanvas } from "qrcode.react";

function NFTInner() {
  const router = useRouter();
  const search = useSearchParams();
  const tokenParamRaw = search.get("tokenId") || "0";
  const tokenParam = `${tokenParamRaw}`;
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let id: bigint;
        try {
          id = BigInt(tokenParam);
        } catch {
          throw new Error('Invalid tokenId');
        }
        const m = await nftClient.getMetadataSimple(id);
        setMeta(m);
      } catch (e: any) {
        setError(e?.message || "Failed to load metadata");
      } finally {
        setLoading(false);
      }
    })();
  }, [tokenParam]);

  // Use canister URL for QR codes
  const url = typeof window !== 'undefined' 
    ? window.location.href
    : `https://blocktrace.app/nft?tokenId=${tokenParam}`;

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>
  );

  if (error) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <p className="mb-2">{error}</p>
      <button onClick={() => router.push("/track")} className="underline">Back to Track</button>
    </div>
  );

  if (!meta) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <p>Digital passport not found.</p>
      <button onClick={() => router.push("/track")} className="underline">Back to Track</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">Digital Passport #{tokenParam}</h1>
          <div className="bg-black/50 border border-cyan-500/30 rounded-xl p-3">
            <QRCodeCanvas value={url} size={96} bgColor="#000000" fgColor="#67e8f9" includeMargin={false as any} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <div className="flex gap-4">
              {meta.image_uri && (
                <div className="w-40 h-40 border border-purple-500/30 rounded-lg overflow-hidden bg-black/30 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={meta.image_uri} 
                    alt={meta.product_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', meta.image_uri);
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400 text-sm text-center p-4">Image not available</div>';
                    }}
                    onLoad={() => console.log('Image loaded successfully:', meta.image_uri.substring(0, 50) + '...')}
                  />
                </div>
              )}
              <div className="space-y-2 flex-1">
                <p className="text-sm text-gray-400">Product</p>
                <p className="text-xl font-semibold">{meta.product_name}</p>
                <p className="text-sm text-gray-400">Batch</p>
                <p className="font-mono">{meta.batch_id || 'N/A'}</p>
                <p className="text-sm text-gray-400">Manufacturer</p>
                <p className="text-sm">{meta.manufacturer}</p>
              </div>
            </div>
            {meta.certificate_uri && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">Certificate</p>
                <a href={meta.certificate_uri} target="_blank" rel="noreferrer" className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 break-all">{meta.certificate_uri}</a>
              </div>
            )}
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyan-500/30">
            <p className="text-sm text-gray-400">Certificate</p>
            <p className="font-mono break-all text-sm">{meta.certificate_uri || 'No certificate provided'}</p>
            {meta.certificate_uri && (
              <a 
                href={meta.certificate_uri} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block mt-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm hover:bg-cyan-500/30 transition"
              >
                View Certificate
              </a>
            )}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <h2 className="text-xl font-bold mb-4">History</h2>
          {meta.history.length === 0 ? (
            <p className="text-gray-400">No events yet.</p>
          ) : (
            <div className="space-y-3">
              {meta.history.map((entry, i) => (
                <div key={i} className="p-3 rounded-lg bg-black/30 border border-purple-500/20">
                  <div className="font-semibold break-words">{entry}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NFTByQueryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
      <NFTInner />
    </Suspense>
  );
}


