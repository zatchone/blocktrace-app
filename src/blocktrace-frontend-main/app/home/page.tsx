'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, logout, UserProfile } from '@/lib/auth';
import { icpService } from '@/lib/icp-service';
import ESGWidget from '@/components/ESGwidget';
import {
  TrendingUp,
  Shield,
  Globe,
  Zap,
  Award,
  BarChart3,
  Leaf,
  Factory,
  Truck,
  Package,
  Users,
  Clock,
  CheckCircle,
  Star,
  Target,
  Activity,
  Sparkles,
  TreePine,
  Gauge,
  Fingerprint,
  Lock,
  Satellite,
  RefreshCw,
  ArrowRight,
  Eye,
  Plus,
  Search,
  DollarSign,
  Thermometer,
  Droplets,
  Navigation,
  Hash,
  Timer,
  Coins,
  Building,
  MapPin,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface RealTimeMetrics {
  totalProducts: number;
  totalSteps: number;
  totalCarbonSaved: number;
  totalDistance: number;
  avgSustainabilityScore: number;
  verifiedSteps: number;
  uniqueActors: number;
  avgQualityScore: number;
  totalCost: number;
  avgTemperature: number;
  blockchainTransactions: number;
  realTimeUpdates: number;
}

const Home = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    totalProducts: 0,
    totalSteps: 0,
    totalCarbonSaved: 0,
    totalDistance: 0,
    avgSustainabilityScore: 0,
    verifiedSteps: 0,
    uniqueActors: 0,
    avgQualityScore: 0,
    totalCost: 0,
    avgTemperature: 0,
    blockchainTransactions: 0,
    realTimeUpdates: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (!profile.isAuthenticated) {
          router.push('/');
          return;
        }
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  // Load real-time metrics from blockchain
  useEffect(() => {
    const loadRealTimeMetrics = async () => {
      if (!userProfile) return;
      
      setMetricsLoading(true);
      setMetricsError('');
      
      try {
        console.log('🔗 Loading real-time blockchain metrics...');
        
        const [allProducts, totalSteps, esgScores] = await Promise.all([
          icpService.getAllProducts(),
          icpService.getTotalStepsCount(),
          icpService.getAllESGScores()
        ]);

        let totalCarbonSaved = 0;
        let totalDistance = 0;
        let totalSustainabilityScore = 0;
        let verifiedSteps = 0;
        let uniqueActors = new Set<string>();
        let totalQualityScore = 0;
        let qualityScoreCount = 0;
        let totalCost = 0;
        let totalTemperature = 0;
        let temperatureCount = 0;
        let blockchainTransactions = 0;

        // Process ESG scores for aggregate metrics
        for (const score of esgScores) {
          totalCarbonSaved += score.co2_saved_vs_traditional;
          totalDistance += score.total_distance_km;
          totalSustainabilityScore += score.sustainability_score;
          blockchainTransactions += score.total_steps;
        }

        // Process individual product histories for detailed metrics
        for (const productId of allProducts) {
          try {
            const steps = await icpService.getProductHistory(productId);
            for (const step of steps) {
              // Count verified steps
              if (Array.isArray(step.status) && step.status.length > 0 && step.status[0] === 'verified') {
                verifiedSteps++;
              }
              
              // Track unique actors
              uniqueActors.add(step.actor_name);
              
              // Aggregate quality scores
              if (Array.isArray(step.quality_score) && step.quality_score.length > 0 && step.quality_score[0] !== undefined) {
                totalQualityScore += step.quality_score[0];
                qualityScoreCount++;
              }
              
              // Aggregate costs
              if (Array.isArray(step.cost_usd) && step.cost_usd.length > 0 && step.cost_usd[0] !== undefined) {
                totalCost += step.cost_usd[0];
              }
              
              // Aggregate temperatures
              if (Array.isArray(step.temperature_celsius) && step.temperature_celsius.length > 0 && step.temperature_celsius[0] !== undefined) {
                totalTemperature += step.temperature_celsius[0];
                temperatureCount++;
              }
            }
          } catch (error) {
            console.error(`Error fetching history for product ${productId}:`, error);
          }
        }

        const avgSustainabilityScore = esgScores.length > 0 ? Math.round(totalSustainabilityScore / esgScores.length) : 0;
        const avgQualityScore = qualityScoreCount > 0 ? Math.round(totalQualityScore / qualityScoreCount) : 0;
        const avgTemperature = temperatureCount > 0 ? Math.round((totalTemperature / temperatureCount) * 10) / 10 : 0;

        setRealTimeMetrics({
          totalProducts: allProducts.length,
          totalSteps: Number(totalSteps),
          totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100,
          totalDistance: Math.round(totalDistance),
          avgSustainabilityScore,
          verifiedSteps,
          uniqueActors: uniqueActors.size,
          avgQualityScore,
          totalCost: Math.round(totalCost * 100) / 100,
          avgTemperature,
          blockchainTransactions,
          realTimeUpdates: allProducts.length + Number(totalSteps) + esgScores.length
        });

        setLastUpdated(new Date());
        console.log('✅ Real-time metrics loaded successfully!');
      } catch (error) {
        console.error('❌ Error loading real-time metrics:', error);
        setMetricsError('Failed to load blockchain metrics');
      } finally {
        setMetricsLoading(false);
      }
    };

    loadRealTimeMetrics();
  }, [userProfile]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (userProfile && !metricsLoading) {
        try {
          const [allProducts, totalSteps, esgScores] = await Promise.all([
            icpService.getAllProducts(),
            icpService.getTotalStepsCount(),
            icpService.getAllESGScores()
          ]);
          
          // Quick update without full recalculation
          setRealTimeMetrics(prev => ({
            ...prev,
            totalProducts: allProducts.length,
            totalSteps: Number(totalSteps),
            realTimeUpdates: prev.realTimeUpdates + 1
          }));
          
          setLastUpdated(new Date());
        } catch (error) {
          console.error('Auto-refresh error:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userProfile, metricsLoading]);

  const handleLogout = async () => {
    await logout();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.substring(0, 6)}...${principal.substring(principal.length - 6)}`;
  };

  const refreshMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError('');
    
    try {
      const [allProducts, totalSteps, esgScores] = await Promise.all([
        icpService.getAllProducts(),
        icpService.getTotalStepsCount(),
        icpService.getAllESGScores()
      ]);

      // Recalculate all metrics
      let totalCarbonSaved = 0;
      let totalDistance = 0;
      let totalSustainabilityScore = 0;
      
      for (const score of esgScores) {
        totalCarbonSaved += score.co2_saved_vs_traditional;
        totalDistance += score.total_distance_km;
        totalSustainabilityScore += score.sustainability_score;
      }

      const avgSustainabilityScore = esgScores.length > 0 ? Math.round(totalSustainabilityScore / esgScores.length) : 0;

      setRealTimeMetrics(prev => ({
        ...prev,
        totalProducts: allProducts.length,
        totalSteps: Number(totalSteps),
        totalCarbonSaved: Math.round(totalCarbonSaved * 100) / 100,
        totalDistance: Math.round(totalDistance),
        avgSustainabilityScore,
        realTimeUpdates: prev.realTimeUpdates + 1
      }));

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      setMetricsError('Failed to refresh blockchain metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-400 border-r-purple-400 mx-auto mb-6"></div>
          <p className="text-white text-lg">🔗 Connecting to Blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white relative">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 animate-gradient-x"></div>
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 100 }, (_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 6 + 2;
          const speed = Math.random() * 0.8 + 0.2;
          const opacity = Math.random() * 0.7 + 0.3;
          return (
            <div
              key={i}
              className="absolute bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animation: `float ${6 + speed}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          );
        })}
      </div>

      {/* Enhanced grid pattern */}
      <div className="fixed inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="url(#gradient)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <header className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 pt-16 pb-12">
            <div className="text-center mb-16">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 mb-8 shadow-2xl shadow-purple-500/25 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">
                  <div className="relative">
                    <Shield className="w-10 h-10 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-8xl font-black bg-gradient-to-r from-white via-purple-200 via-cyan-200 to-green-200 bg-clip-text text-transparent mb-6 tracking-tight">
                BlockTrace
              </h1>
              
              {/* Subtitle with animated elements */}
              <div className="relative inline-block mb-8">
                <p className="text-3xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
                  🔗 Professional Blockchain Supply Chain Transparency Platform
                  <br />
                  <span className="relative inline-block mt-4">
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent font-semibold text-4xl">
                      Real-Time ESG Impact Tracking
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 animate-pulse"></div>
                  </span>
                </p>
              </div>

              {/* Live Status Indicators */}
              <div className="flex justify-center items-center gap-8 mb-12">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">🔗 Blockchain Live</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-semibold">Real-Time ESG</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/30">
                  <Satellite className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-purple-400 font-semibold">IoT Connected</span>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            {userProfile && (
              <div className="max-w-6xl mx-auto px-6 mb-12">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 flex items-center justify-center shadow-lg">
                          <Users className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-cyan-300 to-green-300 bg-clip-text text-transparent">
                            Welcome Back, Supply Chain Professional!
                          </h3>
                          <p className="text-gray-400 text-xl">🚀 Ready to revolutionize transparency?</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        <span className="relative z-10">🚪 Logout</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <div className="text-purple-400 text-sm font-medium mb-2 flex items-center gap-2">
                          <Fingerprint className="w-4 h-4" />
                          Principal ID
                        </div>
                        <div className="font-mono text-xs text-gray-300 break-all">
                          {formatPrincipal(userProfile.principal)}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-colors">
                        <div className="text-cyan-400 text-sm font-medium mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Auth Method
                        </div>
                        <div className="text-gray-300 text-sm">
                          {userProfile.authMethod === 'internet-identity' ? '🔐 Internet Identity' : '🔌 Plug Wallet'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Session Start
                        </div>
                        <div className="text-gray-300 text-xs">
                          {userProfile.loginTime ? userProfile.loginTime.toLocaleString() : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/50 transition-colors">
                        <div className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Status
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2 animate-pulse"></span>
                          <span className="text-emerald-300 text-sm font-medium">🟢 Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Real-Time Blockchain Metrics Dashboard */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-cyan-300 to-green-300 bg-clip-text text-transparent mb-4">
                🔗 Live Blockchain Metrics
              </h2>
              <p className="text-gray-400 text-xl">Real-time data from Internet Computer Protocol (ICP) blockchain</p>
              <div className="flex justify-center items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                  onClick={refreshMetrics}
                  disabled={metricsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-medium text-sm hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
                  {metricsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {metricsError && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-300 flex items-center space-x-3 max-w-2xl mx-auto">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{metricsError}</span>
              </div>
            )}

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {/* Total Products */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                  
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                    {metricsLoading ? (
                      <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
                    ) : (
                      realTimeMetrics.totalProducts.toLocaleString()
                    )}
                  </div>
                  
                  <div className="text-gray-400 font-medium mb-3">Products Tracked</div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                    <span className="text-purple-400">Blockchain verified</span>
                  </div>
                </div>
              </div>

              {/* Total Steps */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl">🔄</div>
                  </div>
                  
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
                    {metricsLoading ? (
                      <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
                    ) : (
                      realTimeMetrics.totalSteps.toLocaleString()
                    )}
                  </div>
                  
                  <div className="text-gray-400 font-medium mb-3">Supply Chain Steps</div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-blue-400">Real-time tracking</span>
                  </div>
                </div>
              </div>

              {/* Carbon Saved */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl">🌿</div>
                  </div>
                  
                  <div className="text-4xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                    {metricsLoading ? (
                      <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
                    ) : (
                      `${realTimeMetrics.totalCarbonSaved}kg`
                    )}
                  </div>
                  
                  <div className="text-gray-400 font-medium mb-3">CO₂ Saved</div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400">Environmental impact</span>
                  </div>
                </div>
              </div>

              {/* Sustainability Score */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl">⭐</div>
                  </div>
                  
                  <div className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-2">
                    {metricsLoading ? (
                      <div className="animate-pulse bg-gray-700 h-10 rounded"></div>
                    ) : (
                      `${realTimeMetrics.avgSustainabilityScore}/100`
                    )}
                  </div>
                  
                  <div className="text-gray-400 font-medium mb-3">Avg ESG Score</div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-yellow-400">Sustainability rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {metricsLoading ? '...' : realTimeMetrics.verifiedSteps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Verified Steps</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {metricsLoading ? '...' : realTimeMetrics.uniqueActors.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Unique Actors</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {metricsLoading ? '...' : `${realTimeMetrics.totalDistance.toLocaleString()}km`}
                </div>
                <div className="text-xs text-gray-400">Total Distance</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {metricsLoading ? '...' : `$${realTimeMetrics.totalCost.toLocaleString()}`}
                </div>
                <div className="text-xs text-gray-400">Total Cost</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {metricsLoading ? '...' : `${realTimeMetrics.avgTemperature}°C`}
                </div>
                <div className="text-xs text-gray-400">Avg Temperature</div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {metricsLoading ? '...' : realTimeMetrics.realTimeUpdates.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Live Updates</div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Track Product Card */}
              <div
                onClick={() => router.push('/track')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
                
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-80 flex flex-col justify-between overflow-hidden group-hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-green-500/20 transform rotate-12 scale-150"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                        <Search className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-6xl group-hover:scale-110 transition-transform">🔍</div>
                    </div>
                    
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-green-300 bg-clip-text text-transparent mb-4">
                      Track Products
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      🔗 Monitor your entire supply chain with real-time blockchain updates, IoT sensor data, GPS tracking, and comprehensive ESG impact analysis
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Real-time</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>GPS tracking</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        <span>ESG metrics</span>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>

              {/* Add Step Card */}
              <div
                onClick={() => router.push('/add-step')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
                
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-80 flex flex-col justify-between overflow-hidden group-hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 transform -rotate-12 scale-150"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
                        <Plus className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-6xl group-hover:scale-110 transition-transform">➕</div>
                    </div>
                    
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 bg-clip-text text-transparent mb-4">
                      Add Supply Chain Step
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      🔬 Create professional tracking entries with IoT sensors, GPS coordinates, quality scores, certifications, and blockchain verification
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        <span>IoT sensors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>GPS tracking</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Blockchain</span>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-pink-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced ESG Widget */}
        <section className="w-full px-6 py-16">
          <ESGWidget />
        </section>

        {/* Professional Features Showcase */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-cyan-300 to-green-300 bg-clip-text text-transparent mb-4">
                🚀 Professional Features
              </h2>
              <p className="text-gray-400 text-xl">Enterprise-grade blockchain supply chain capabilities</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Thermometer, title: 'IoT Sensors', desc: 'Temperature & humidity monitoring', color: 'from-red-500 to-orange-500' },
                { icon: Navigation, title: 'GPS Tracking', desc: 'Real-time location coordinates', color: 'from-blue-500 to-cyan-500' },
                { icon: Shield, title: 'Blockchain Security', desc: 'Immutable audit trails', color: 'from-purple-500 to-pink-500' },
                { icon: BarChart3, title: 'ESG Analytics', desc: 'Sustainability impact metrics', color: 'from-green-500 to-emerald-500' },
                { icon: Star, title: 'Quality Scores', desc: 'Professional quality ratings', color: 'from-yellow-500 to-orange-500' },
                { icon: Hash, title: 'Batch Tracking', desc: 'Production batch identification', color: 'from-indigo-500 to-purple-500' },
                { icon: DollarSign, title: 'Cost Analysis', desc: 'Transportation cost tracking', color: 'from-green-500 to-teal-500' },
                { icon: Award, title: 'Certifications', desc: 'Compliance verification hashes', color: 'from-pink-500 to-rose-500' }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity`}></div>
                  <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 text-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance Stats */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-black text-cyan-400 mb-2">99.9%</div>
                <div className="text-gray-400">Blockchain Uptime</div>
              </div>
              <div>
                <div className="text-5xl font-black text-green-400 mb-2">&lt;2s</div>
                <div className="text-gray-400">Response Time</div>
              </div>
              <div>
                <div className="text-5xl font-black text-purple-400 mb-2">256-bit</div>
                <div className="text-gray-400">Encryption</div>
              </div>
              <div>
                <div className="text-5xl font-black text-orange-400 mb-2">24/7</div>
                <div className="text-gray-400">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="mt-24 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 via-green-500 to-yellow-500"></div>
          <div className="bg-black/50 backdrop-blur-xl border-t border-white/10 px-6 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">BlockTrace</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    🔗 The world's most advanced blockchain-based supply chain transparency platform with real-time ESG impact tracking.
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">🚀 Platform</h5>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">📦 Track Products</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">➕ Add Steps</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">📊 ESG Analytics</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">🔗 API Documentation</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">🛠️ Support</h5>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">❓ Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">👥 Community</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">📧 Contact Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">📈 System Status</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">🌐 Connect</h5>
                  <div className="flex space-x-3">
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <span className="text-gray-400">🐦</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <span className="text-gray-400">💼</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <span className="text-gray-400">🐙</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm">
                  © 2025 BlockTrace Professional. All rights reserved. 🔗 Powered by Internet Computer Protocol (ICP)
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">🔒 Privacy Policy</a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">📋 Terms of Service</a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">🍪 Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 20s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;