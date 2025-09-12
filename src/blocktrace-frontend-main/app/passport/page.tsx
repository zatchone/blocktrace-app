"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nftClient } from "@/lib/nft-service";

function PassportPage() {
  const router = useRouter();
  const [tokenParamRaw, setTokenParamRaw] = useState<string | null>(null);
  const [jsonStr, setJsonStr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Get tokenId from URL on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenId = urlParams.get('tokenId');
      setTokenParamRaw(tokenId);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setJsonStr(null);
        if (!tokenParamRaw) return;
        if (!/^\d+$/.test(tokenParamRaw)) {
          setError('Invalid tokenId');
          return;
        }
        const id = BigInt(tokenParamRaw);
        const res = await nftClient.getPassport(id);
        if (!res) {
          setJsonStr(null);
        } else {
          setJsonStr(res);
        }
      } catch (e: any) {
        console.error('Passport load error:', e);
        setError(e?.message || 'Failed to load passport');
      } finally {
        setLoading(false);
      }
    })();
  }, [tokenParamRaw]);

  if (!tokenParamRaw || loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">{error}</div>
  );
  if (!jsonStr) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">Digital passport not found.</div>
  );

  let data: any = null;
  try { data = JSON.parse(jsonStr); } catch (e) {
    console.error('JSON parse error:', e, 'json:', jsonStr);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="mb-2">Invalid passport data.</p>
          <pre className="text-xs text-gray-400 max-w-xl break-all whitespace-pre-wrap">{jsonStr}</pre>
        </div>
      </div>
    );
  }

  const toGateway = (uri?: string): { url: string | null; cidPath: string | null } => {
    if (!uri || uri.trim() === '') return { url: null, cidPath: null };
    
    // Allow data URLs and http(s) URLs untouched
    if (/^data:/.test(uri) || /^https?:\/\//.test(uri)) {
      return { url: uri, cidPath: null };
    }
    
    // Handle IPFS URIs
    let s = uri.trim();
    if (s.startsWith('ipfs://ipfs/')) s = s.substring('ipfs://'.length);
    if (s.startsWith('ipfs://')) s = s.substring('ipfs://'.length);
    if (s.startsWith('/ipfs/')) s = s.substring('/ipfs/'.length);
    
    // Validate CID format (basic check)
    const cidPath = s;
    if (!cidPath || cidPath.length < 10 || !/^[a-zA-Z0-9]/.test(cidPath)) {
      return { url: null, cidPath: null };
    }
    
    // Use ipfs.io as primary gateway
    const gateway = `https://ipfs.io/ipfs/${cidPath}`;
    return { url: gateway, cidPath };
  };

  const imageGate = toGateway(data?.image_uri || undefined);
  const certGate = toGateway(data?.certificate_uri || undefined);
  const imageSrc = imageGate.url;
  const certHref = certGate.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">Digital Passport #{tokenParamRaw}</h1>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 space-y-2">
          <p><span className="text-gray-400">Product:</span> {data?.product_name || '-'}</p>
          <p><span className="text-gray-400">Batch:</span> {data?.batch_id || '-'}</p>
          <p><span className="text-gray-400">Manufacturer:</span> {data?.manufacturer || '-'}</p>
          {imageSrc && !imageError && (
            <div>
              <p className="text-gray-400">Product Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Product"
                onError={() => setImageError(true)}
                className="w-full max-w-2xl h-[24rem] object-contain rounded-lg border border-purple-500/30 bg-black/30"
              />
              {!imageSrc.startsWith('data:') && (
                <p className="text-xs text-gray-400 mt-2 break-all">Source: {imageSrc}</p>
              )}
              {imageGate.cidPath && (
                <div className="text-xs text-gray-500 mt-1">
                  Try other gateways:
                  {['https://cloudflare-ipfs.com/ipfs/', 'https://gateway.pinata.cloud/ipfs/'].map((g) => (
                    <a key={g} className="ml-2 underline" href={`${g}${imageGate.cidPath}`} target="_blank" rel="noreferrer noopener">{g}</a>
                  ))}
                </div>
              )}
            </div>
          )}
          {data?.image_uri && (!imageSrc || imageError) && (
            <div className="p-3 rounded-lg bg-black/30 border border-yellow-500/30 text-yellow-300 text-sm">
              <p className="mb-2">⚠️ Image could not be loaded</p>
              <p className="text-xs text-gray-400 break-all">Original URI: {data.image_uri}</p>
              {imageSrc && <p className="text-xs text-gray-400 break-all">Attempted: {imageSrc}</p>}
            </div>
          )}
          {certHref && (
            <div>
              <p className="text-gray-400">Certificate</p>
              <a className="underline break-all" href={certHref} target="_blank" rel="noreferrer noopener">{certHref}</a>
              {certGate.cidPath && (
                <div className="text-xs text-gray-500 mt-1">
                  Try: <a className="underline" href={`https://ipfs.io/ipfs/${certGate.cidPath}`} target="_blank" rel="noreferrer noopener">ipfs.io</a>
                  <span className="mx-1">|</span>
                  <a className="underline" href={`https://gateway.pinata.cloud/ipfs/${certGate.cidPath}`} target="_blank" rel="noreferrer noopener">pinata</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PassportPage;


