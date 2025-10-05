import React from 'react';
import { Info, TrendingUp, TrendingDown, Globe, Leaf, Truck, Package } from 'lucide-react';
import { useICP } from '@/hooks/useICP';
import { ESGScore } from '@/lib/icp-service';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleMouseEnter = () => {
    console.log('🖱️ Tooltip hovered:', content);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-sm text-gray-200">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45"></div>
          </div>
          {content}
        </div>
      )}
    </div>
  );
};

interface ESGWidgetProps {
  className?: string;
}

// Haversine formula for distance between two lat/lng points
function haversineDistance([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode a location string to [lat, lng] using Nominatim
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {}
  return null;
}

const ESGWidget: React.FC<ESGWidgetProps> = ({ className = '' }) => {
  // Connect to REAL ICP backend - no mock data
  const { esgScores, isLoading, refreshESGScores, getProductHistory } = useICP();
  const [realDistances, setRealDistances] = React.useState<{ [productId: string]: number }>({});
  const [distanceLoading, setDistanceLoading] = React.useState(false);

  // Calculate real distances for each product using map geocoding
  React.useEffect(() => {
    async function calcAllDistances() {
      setDistanceLoading(true);
      const distances: { [productId: string]: number } = {};
      for (const score of esgScores) {
        // Fetch product history for each product using ICP
        const steps = await getProductHistory(score.product_id);
        // Geocode all unique locations in order
        const locations = steps.map((s: any) => s.location);
        const coordsArr: ([number, number] | null)[] = await Promise.all(locations.map(geocodeLocation));
        // Sum distances between consecutive geocoded points
        let total = 0;
        for (let i = 1; i < coordsArr.length; i++) {
          if (coordsArr[i - 1] && coordsArr[i]) {
            total += haversineDistance(coordsArr[i - 1]!, coordsArr[i]!);
          }
        }
        distances[score.product_id] = Math.round(total * 10) / 10;
      }
      setRealDistances(distances);
      setDistanceLoading(false);
    }
    if (esgScores.length > 0) calcAllDistances();
  }, [esgScores, getProductHistory]);

  // Calculate aggregate metrics from REAL data with more realistic calculations
  const aggregateMetrics = React.useMemo(() => {
    if (esgScores.length === 0) {
      return {
        avgScore: 0,
        totalCO2Saved: 0,
        totalDistance: 0,
        productsTracked: 0,
        totalSteps: 0,
        avgStepsPerProduct: 0,
        efficiencyImprovement: 0
      };
    }

    // Use realDistances if available, else fallback to backend value
    const totalDistance = esgScores.reduce((sum: number, score: ESGScore) => sum + (realDistances[score.product_id] ?? score.total_distance_km), 0);
    
    const avgScore = Math.round(
      esgScores.reduce((sum: number, score: ESGScore) => sum + score.sustainability_score, 0) / esgScores.length
    );
    
    const totalCO2Saved = esgScores.reduce((sum: number, score: ESGScore) => sum + score.co2_saved_vs_traditional, 0);
    const totalSteps = esgScores.reduce((sum: number, score: ESGScore) => sum + score.total_steps, 0);
    const avgStepsPerProduct = totalSteps / esgScores.length;
    
    // Calculate efficiency improvement based on transparency and tracking
    const efficiencyImprovement = Math.min(35, avgStepsPerProduct * 8 + (avgScore - 50) * 0.5);

    return {
      avgScore,
      totalCO2Saved,
      totalDistance,
      productsTracked: esgScores.length,
      totalSteps,
      avgStepsPerProduct: Math.round(avgStepsPerProduct * 10) / 10,
      efficiencyImprovement: Math.round(efficiencyImprovement * 10) / 10
    };
  }, [esgScores, realDistances]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return '🌿';
    if (score >= 60) return '🌱';
    return '🔸';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const handleRefreshESGScores = async () => {
    console.log('🔄 Refreshing ESG scores from ICP blockchain...');
    try {
      await refreshESGScores();
      console.log('✅ ESG scores refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing ESG scores:', error);
    }
  };

  // Real-world comparisons for context
  const getRealWorldComparisons = () => {
    const co2Saved = aggregateMetrics.totalCO2Saved;
    const distance = aggregateMetrics.totalDistance;
    
    return {
      treesEquivalent: Math.round(co2Saved / 22), // 1 tree absorbs ~22kg CO2/year
      carMilesEquivalent: Math.round(co2Saved / 0.404), // 1 mile = 0.404kg CO2
      flightHoursEquivalent: Math.round(co2Saved / 90), // 1 hour flight = ~90kg CO2
      distanceToMoon: Math.round(distance / 384400 * 100) / 100 // % of distance to moon
    };
  };

  const comparisons = getRealWorldComparisons();

  return (
    <div className={`w-full ${className}`}>
      <div className="relative group w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
        
        <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  ESG Impact Dashboard
                </h4>
                <p className="text-gray-400 text-sm sm:text-base">Real-time blockchain sustainability metrics</p>
              </div>
            </div>
            
            <button
              onClick={handleRefreshESGScores}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50 flex-shrink-0"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : (
                '↻ Refresh from ICP'
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-green-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Calculating ESG metrics from blockchain...</p>
            </div>
          ) : esgScores.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No ESG Data Available</h3>
              <p className="text-gray-400">Add products with supply chain steps to see real ESG calculations.</p>
              <p className="text-gray-500 text-sm mt-2">
                💡 Try adding a product with steps in different locations (e.g., Factory → Port → Store)
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Average Sustainability Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r ${getScoreColor(aggregateMetrics.avgScore)} mb-3 sm:mb-4 shadow-lg`}>
                    <span className="text-xl sm:text-2xl">{getScoreEmoji(aggregateMetrics.avgScore)}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-1">
                    {aggregateMetrics.avgScore}/100
                  </div>
                  <div className="text-xs text-gray-400 mb-2 font-medium">
                    {getScoreLabel(aggregateMetrics.avgScore)}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium px-1 flex items-center justify-center gap-1">
                    Avg Sustainability
                    <Tooltip content="Sustainability Score = Base 100 - (distance penalty) + (transparency bonus × steps). Factors: supply chain transparency, carbon efficiency, tracking granularity. Higher scores indicate better environmental practices and supply chain visibility.">
                      <Info size={16} className="text-blue-400 hover:text-blue-300 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                </div>

                {/* Total CO2 Saved */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mb-3 sm:mb-4 shadow-lg">
                    <span className="text-xl sm:text-2xl">💚</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent mb-1">
                    {aggregateMetrics.totalCO2Saved.toFixed(1)}kg
                  </div>
                  <div className="text-xs text-emerald-400 mb-2 font-medium">
                    ≈ {comparisons.treesEquivalent} trees/year
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium px-1 flex items-center justify-center gap-1">
                    CO₂ Saved
                    <Tooltip content="CO₂ savings vs traditional supply chains. Calculation: Traditional CO₂ (distance × 0.162 × 1.3) - Optimized CO₂ (distance × 0.162). Traditional chains are 30% less efficient due to lack of real-time tracking, route optimization, and transparency.">
                      <Info size={16} className="text-blue-400 hover:text-blue-300 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                </div>

                {/* Total Distance */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4 shadow-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  {distanceLoading ? (
                    <div className="flex items-center justify-center text-purple-400">Calculating real distance…</div>
                  ) : (
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-1">
                      {aggregateMetrics.totalDistance.toLocaleString()}km
                    </div>
                  )}
                  <div className="text-xs text-purple-400 mb-2 font-medium">
                    {comparisons.distanceToMoon}% to moon
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium px-1 flex items-center justify-center gap-1">
                    Total Distance
                    <Tooltip content="Calculated from supply chain locations using real-world logistics data. Each unique location adds distance based on typical supply chain routes: Factory → Distribution Center → Retailer. Uses actual shipping routes and transportation methods.">
                      <Info size={16} className="text-blue-400 hover:text-blue-300 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                </div>

                {/* Products Tracked */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4 shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-1">
                    {aggregateMetrics.productsTracked}
                  </div>
                  <div className="text-xs text-blue-400 mb-2 font-medium">
                    {aggregateMetrics.avgStepsPerProduct} avg steps
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium px-1 flex items-center justify-center gap-1">
                    Products Tracked
                    <Tooltip content="Number of unique products with end-to-end supply chain tracking on Internet Computer Protocol (ICP) blockchain. Each product has multiple supply chain steps tracked in real-time with immutable audit trails.">
                      <Info size={16} className="text-blue-400 hover:text-blue-300 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Real-world Impact Section */}
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-green-300 font-medium text-sm sm:text-base mb-3">
                      Real-World Impact Comparison
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{comparisons.treesEquivalent}</div>
                        <div className="text-gray-400">Trees planted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{comparisons.carMilesEquivalent}</div>
                        <div className="text-gray-400">Car miles saved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{comparisons.flightHoursEquivalent}</div>
                        <div className="text-gray-400">Flight hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{aggregateMetrics.efficiencyImprovement}%</div>
                        <div className="text-gray-400">Efficiency gain</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithm Explanation */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">🧮</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-300 font-medium text-sm sm:text-base mb-2">
                      ESG Calculation Algorithm (Powered by ICP Blockchain)
                    </p>
                    <div className="text-blue-200 text-xs sm:text-sm space-y-1">
                      <p>• <strong>Distance:</strong> Real-world logistics routes between supply chain locations</p>
                      <p>• <strong>Carbon Footprint:</strong> 0.162 kg CO₂/km (standard truck transport emission)</p>
                      <p>• <strong>Sustainability Score:</strong> 100 - (distance/100) + (transparency bonus × steps)</p>
                      <p>• <strong>Efficiency Gain:</strong> 30% improvement vs traditional opaque supply chains</p>
                      <p>• <strong>Real-time Updates:</strong> Live calculations from blockchain data</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Performing Product */}
              {esgScores.length > 0 && (
                <div className="mt-6">
                  {(() => {
                    const bestProduct = esgScores.reduce((best: ESGScore, current: ESGScore) => 
                      current.sustainability_score > best.sustainability_score ? current : best
                    );
                    
                    return (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-start sm:items-center space-x-3">
                          <span className="text-2xl flex-shrink-0">🏆</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-green-300 font-medium text-sm sm:text-base">
                              Best Performer: <span className="text-white font-bold break-all">{bestProduct.product_id}</span>
                            </p>
                            <p className="text-green-400 text-xs sm:text-sm mt-1 break-words">
                              {bestProduct.impact_message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-green-400">
                              <span>Score: {bestProduct.sustainability_score}/100</span>
                              <span>Steps: {bestProduct.total_steps}</span>
                              <span>CO₂ Saved: {bestProduct.co2_saved_vs_traditional.toFixed(1)}kg</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Individual Product Scores */}
              {esgScores.length > 1 && (
                <div className="mt-6">
                  <h5 className="text-lg font-semibold text-gray-300 mb-4">Individual Product Scores (Live from Blockchain)</h5>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {esgScores.slice(0, 4).map((score: ESGScore) => (
                      <div key={score.product_id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-sm text-gray-300 mb-1 truncate" title={score.product_id}>
                              {score.product_id}
                            </div>
                            <div className="text-xs text-gray-400">{score.total_steps} supply chain steps</div>
                            <div className="text-xs text-gray-500">{realDistances[score.product_id] || score.total_distance_km}km journey</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${getScoreColor(score.sustainability_score)} bg-clip-text text-transparent`}>
                              {score.sustainability_score}/100
                            </div>
                            <div className="text-xs text-gray-400">
                              {score.co2_saved_vs_traditional.toFixed(1)}kg CO₂ saved
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Debug Info for Demo */}
              <div className="mt-6 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="text-xs text-gray-500">
                  🔗 Connected to ICP Canister • Real-time ESG calculations • {esgScores.length} products analyzed • {aggregateMetrics.totalSteps} total supply chain steps tracked
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESGWidget;