import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

export type TimelineEvent = {
  id: number;
  actor: string;
  role: string;
  action: string;
  location: string;
  date: string;
  timestamp: number;
  notes?: string;
  verified?: boolean;
  status: "verified" | "delay" | "dispute" | "pending";
  transportMode?: "truck" | "ship" | "plane" | "train";
  duration?: number;
  distance?: number;
  carbonFootprint?: number;
};

type StepMapProps = {
  steps: TimelineEvent[];
  focusKey?: number;
};

const StepMapInner: React.FC<StepMapProps> = ({ steps, focusKey }) => {
  // Import browser-only code here for SSR safety
  const { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip: LeafletTooltip } = require("react-leaflet");
  const L = require("leaflet");
  const [geoMap, setGeoMap] = useState<Record<string, [number, number]>>({});
  const [loading, setLoading] = useState(true);

  // Geocode all unique locations
  useEffect(() => {
    const uniqueLocations = Array.from(new Set(steps.map(s => s.location)));
    let cancelled = false;
    setLoading(true);
    Promise.all(
      uniqueLocations.map(async (loc) => {
        if (!loc) return [loc, null];
        // Use Nominatim API
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data[0]) {
            return [loc, [parseFloat(data[0].lat), parseFloat(data[0].lon)]];
          }
        } catch {}
        return [loc, null];
      })
    ).then(results => {
      if (!cancelled) {
        const geo: Record<string, [number, number]> = {};
        results.forEach(([loc, coords]) => {
          if (
            typeof loc === 'string' &&
            Array.isArray(coords) &&
            coords.length === 2 &&
            typeof coords[0] === 'number' &&
            typeof coords[1] === 'number'
          ) {
            geo[loc] = coords as [number, number];
          }
        });
        setGeoMap(geo);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [steps]);

  // Default center: latest geocoded location or fallback
  const allCoords = steps.map(s => geoMap[s.location]).filter(Boolean) as [number, number][];
  const latestStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const latestCoords = latestStep ? geoMap[latestStep.location] : null;
  const center = latestCoords || (allCoords.length > 0 ? allCoords[allCoords.length - 1] : [20.5937, 78.9629]); // India fallback

  // Custom red icon for latest step
  const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Default blue icon for other steps
  const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Focus/zoom to latest step when focusKey changes
  function MapFocus() {
    const map = useMap();
    useEffect(() => {
      if (latestCoords) {
        map.setView(latestCoords, 8, { animate: true });
      }
    }, [latestCoords, focusKey]);
    return null;
  }

  if (loading) return <div className="flex items-center justify-center h-64">Loading map…</div>;

  return (
    <div style={{ height: "500px", width: "100%", boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', borderRadius: '18px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={8} style={{ height: "100%", width: "100%" }}>
        <MapFocus />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* Animated Polyline connecting all steps */}
        {allCoords.length > 1 && (
          <Polyline
            positions={allCoords}
            pathOptions={{ color: '#f59e42', weight: 5, opacity: 0.7, dashArray: '10 10', lineCap: 'round' }}
          />
        )}
        {steps.map((step, idx) => {
          const coords = geoMap[step.location];
          if (!coords) return null;
          const isLatest = idx === steps.length - 1;
          return (
            <Marker key={step.id} position={coords} icon={isLatest ? redIcon : blueIcon}>
              <Popup>
                <strong>{step.action}</strong><br />
                {step.location}<br />
                {step.date}<br />
                {step.actor} ({step.role})
                {isLatest && <div style={{color:'red',fontWeight:'bold'}}>Current Location</div>}
              </Popup>
              <LeafletTooltip direction="top" offset={[0, -20]} opacity={0.9} permanent={false} className="custom-tooltip">
                <div style={{fontWeight:'bold'}}>{step.location}</div>
                <div style={{fontSize:'0.85em'}}>{step.action}</div>
                <div style={{fontSize:'0.8em', color:'#aaa'}}>{step.date}</div>
              </LeafletTooltip>
              {isLatest && (
                <div className="animate-bounce" style={{position:'absolute', left:'-12px', top:'-41px', width:'25px', height:'41px', pointerEvents:'none'}}></div>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const StepMap = dynamic(() => Promise.resolve(StepMapInner), { ssr: false });
export default StepMap;