"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nftClient } from "@/lib/nft-service";
import { generatePassportPDF } from "@/lib/pdf-utils";
import { icpService } from "@/lib/icp-service";
import { Download, Award } from "lucide-react";

function PassportPage() {
  const router = useRouter();
  const [tokenParamRaw, setTokenParamRaw] = useState<string | null>(null);
  const [jsonStr, setJsonStr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState(false);
  const [esgScore, setEsgScore] = useState<number | null>(null);
  const [esgStatus, setEsgStatus] = useState<'sustainable' | 'needs-improvement' | null>(null);
  const [esgData, setEsgData] = useState<any>(null);

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
        
        console.log(`🔍 Looking for NFT/Passport with ID: ${id}`);
        
        // First try to get passport entry
        let res = await nftClient.getPassport(id);
        console.log(`📋 Passport result for ID ${id}:`, res ? 'Found' : 'Not found');
        
        // If no passport found, try simple NFT metadata
        if (!res) {
          try {
            console.log(`🎫 Trying simple NFT for ID ${id}...`);
            const metadata = await nftClient.getMetadataSimple(id);
            console.log(`🎫 Simple NFT result for ID ${id}:`, metadata ? 'Found' : 'Not found');
            if (metadata) {
              // Convert simple NFT metadata to passport format
              res = JSON.stringify(metadata);
              console.log(`✅ Converted simple NFT to passport format for ID ${id}`);
            }
          } catch (e) {
            console.log(`❌ No simple NFT found for ID ${id}:`, e);
          }
        }
        
        if (!res) {
          console.log(`❌ No NFT or passport found for ID ${id}`);
          // For debugging: let's check what NFTs actually exist
          try {
            const allNfts = await nftClient.getAllNftsSimple();
            console.log('📊 All existing NFTs:', allNfts.map(([id, meta]) => ({ id: id.toString(), product: meta.product_name })));
          } catch (e) {
            console.log('Failed to get all NFTs:', e);
          }
          setJsonStr(null);
        } else {
          console.log(`✅ Found data for ID ${id}`);
          setJsonStr(res);
          // Get real ESG score from ICP backend
          try {
            const parsedData = JSON.parse(res);
            if (parsedData.product_name) {
              await icpService.connect();
              const esgResult = await icpService.calculateESGScore(parsedData.product_name);
              if (esgResult) {
                setEsgScore(esgResult.sustainability_score);
                setEsgStatus(esgResult.sustainability_score >= 70 ? 'sustainable' : 'needs-improvement');
                setEsgData(esgResult);
              }
            }
          } catch (esgError) {
            console.error('Failed to fetch ESG score:', esgError);
          }
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

  const handleDownloadPDF = () => {
    generatePassportPDF({
      tokenId: tokenParamRaw,
      product_name: data?.product_name,
      batch_id: data?.batch_id,
      manufacturer: data?.manufacturer,
      esgScore: esgScore || undefined,
      esgStatus: esgStatus || undefined,
      esgData: esgData
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-cyan-300">Digital Passport #{tokenParamRaw}</h1>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            <Download className="w-5 h-5" />
            <span>Download Certificate</span>
          </button>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 space-y-4">
          <div className="space-y-2">
            <p><span className="text-gray-400">Product:</span> {data?.product_name || '-'}</p>
            <p><span className="text-gray-400">Batch:</span> {data?.batch_id || '-'}</p>
            <p><span className="text-gray-400">Manufacturer:</span> {data?.manufacturer || '-'}</p>
          </div>
          
          {/* ESG Badge */}
          {esgScore !== null && esgData && (
            <div className="border-t border-purple-500/30 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">ESG Sustainability Score</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        esgStatus === 'sustainable' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {esgStatus === 'sustainable' ? '✓ Sustainable' : '⚠ Needs Improvement'}
                      </div>
                      <span className="text-white font-bold text-lg">{esgScore}/100</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                      <p>Carbon Footprint: {esgData.carbon_footprint_kg.toFixed(2)} kg CO₂</p>
                      <p>Distance: {esgData.total_distance_km.toFixed(0)} km</p>
                      <p>CO₂ Saved: {esgData.co2_saved_vs_traditional.toFixed(2)} kg vs traditional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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


