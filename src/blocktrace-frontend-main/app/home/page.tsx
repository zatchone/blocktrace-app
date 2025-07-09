'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, logout, UserProfile } from '@/lib/auth';
import { icpService } from '@/lib/icp-service'; // Update this path to match your file structure

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const Home = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [dashboardStats, setDashboardStats] = useState({
    productsTracked: 0,
    stepsAdded: 0,
    verifications: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const hasValidNotes = (notes: [] | [string]): boolean => {
    return Array.isArray(notes) && notes.length > 0 && typeof notes[0] === 'string' && notes[0].trim() !== '';
  };

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

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!userProfile) return;
      
      setStatsLoading(true);
      setStatsError('');
      
      try {
        console.log('Loading dashboard stats...');
        
        const [allProducts, totalSteps] = await Promise.all([
          icpService.getAllProducts(),
          icpService.getTotalStepsCount()
        ]);

        let verificationCount = 0;
        for (const productId of allProducts) {
          try {
            const steps = await icpService.getProductHistory(productId);
            verificationCount += steps.filter(step => hasValidNotes(step.notes)).length;
          } catch (error) {
            console.error(`Error fetching history for product ${productId}:`, error);
          }
        }

        setDashboardStats({
          productsTracked: allProducts.length,
          stepsAdded: Number(totalSteps),
          verifications: verificationCount
        });

        console.log('Dashboard stats loaded:', {
          productsTracked: allProducts.length,
          stepsAdded: Number(totalSteps),
          verifications: verificationCount
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStatsError('Failed to load dashboard data');
      } finally {
        setStatsLoading(false);
      }
    };

    loadDashboardStats();
  }, [userProfile]);

  const handleLogout = async () => {
    await logout();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.substring(0, 6)}...${principal.substring(principal.length - 6)}`;
  };

  const refreshStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    
    try {
      const [allProducts, totalSteps] = await Promise.all([
        icpService.getAllProducts(),
        icpService.getTotalStepsCount()
      ]);

      let verificationCount = 0;
      for (const productId of allProducts) {
        try {
          const steps = await icpService.getProductHistory(productId);
          verificationCount += steps.filter(step => hasValidNotes(step.notes)).length;
        } catch (error) {
          console.error(`Error fetching history for product ${productId}:`, error);
        }
      }

      setDashboardStats({
        productsTracked: allProducts.length,
        stepsAdded: Number(totalSteps),
        verifications: verificationCount
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
      setStatsError('Failed to refresh dashboard data');
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-400 border-r-purple-400 mx-auto mb-6"></div>
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white relative">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 animate-gradient-x"></div>
      
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 4 + 2;
          const speed = Math.random() * 0.5 + 0.1;
          const opacity = Math.random() * 0.5 + 0.2;
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animation: `float ${6 + speed}s ease-in-out infinite`,
              }}
            />
          );
        })}
      </div>

      <div className="fixed inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="url(#gradient)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <header className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 pt-16 pb-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 mb-6 shadow-2xl shadow-purple-500/25">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.9 5.16-1.16 9-5.35 9-10.9V7l-10-5z"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h1 className="text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4 tracking-tight">
                BlockTrace
              </h1>
              
              <div className="relative inline-block">
                <p className="text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
                  Track your product from origin to consumer with
                  <span className="relative inline-block ml-2">
                    <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                      absolute transparency
                    </span>
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse"></div>
                  </span>
                </p>
              </div>
            </div>

            {userProfile && (
              <div className="max-w-4xl mx-auto px-6 mb-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                            Welcome Back!
                          </h3>
                          <p className="text-gray-400 text-lg">Ready to track your supply chain?</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        <span className="relative z-10">Logout</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <div className="text-purple-400 text-sm font-medium mb-2">Principal ID</div>
                        <div className="font-mono text-xs text-gray-300 break-all">
                          {formatPrincipal(userProfile.principal)}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-colors">
                        <div className="text-cyan-400 text-sm font-medium mb-2">Auth Method</div>
                        <div className="text-gray-300 text-sm">
                          {userProfile.authMethod === 'internet-identity' ? 'Internet Identity' : 'Plug Wallet'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-green-500/50 transition-colors">
                        <div className="text-green-400 text-sm font-medium mb-2">Login Time</div>
                        <div className="text-gray-300 text-xs">
                          {userProfile.loginTime ? userProfile.loginTime.toLocaleString() : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/50 transition-colors">
                        <div className="text-emerald-400 text-sm font-medium mb-2">Status</div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2 animate-pulse"></span>
                          <span className="text-emerald-300 text-sm font-medium">Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              <div
                onClick={() => router.push('/track')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
                
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-64 flex flex-col justify-between overflow-hidden group-hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 transform rotate-12 scale-150"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform">📦</div>
                    </div>
                    
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-3">
                      Track a Product
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Monitor your entire supply chain with real-time updates and comprehensive tracking
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>

              <div
                onClick={() => router.push('/add-step')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition-all duration-500"></div>
                
                <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-64 flex flex-col justify-between overflow-hidden group-hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 transform -rotate-12 scale-150"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform">➕</div>
                    </div>
                    
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
                      Add a Step
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Create new tracking entries and build your transparent supply chain
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h4>
                      <p className="text-gray-400 text-lg">Real-time insights into your supply chain</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={refreshStats}
                    disabled={statsLoading}
                    className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <svg className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                      </svg>
                      <span>{statsLoading ? 'Refreshing...' : 'Refresh'}</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
                
                {statsError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-300 flex items-center space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>{statsError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-6xl">📊</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-5xl font-black bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent mb-2">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-700 h-12 rounded"></div>
                        ) : (
                          dashboardStats.productsTracked.toLocaleString()
                        )}
                      </div>
                      
                      <div className="text-gray-400 font-medium mb-3">Products Tracked</div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-emerald-400">Active monitoring</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-6xl">🔄</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-5xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-700 h-12 rounded"></div>
                        ) : (
                          dashboardStats.stepsAdded.toLocaleString()
                        )}
                      </div>
                      
                      <div className="text-gray-400 font-medium mb-3">Steps Added</div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                        <span className="text-blue-400">Chain building</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-6xl">✅</div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-5xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-700 h-12 rounded"></div>
                        ) : (
                          dashboardStats.verifications.toLocaleString()
                        )}
                      </div>
                      
                      <div className="text-gray-400 font-medium mb-3">Verifications</div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                        <span className="text-purple-400">Trust verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              
            </div>

          
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-cyan-400 mb-2">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-400 mb-2">2s</div>
                <div className="text-gray-400 text-sm">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-400 mb-2">256-bit</div>
                <div className="text-gray-400 text-sm">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-orange-400 mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Support</div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-24 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500"></div>
          <div className="bg-black/50 backdrop-blur-xl border-t border-white/10 px-6 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.9 5.16-1.16 9-5.35 9-10.9V7l-10-5z"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-white">BlockTrace</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The world's most advanced blockchain-based supply chain tracking platform.
                  </p>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">Platform</h5>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">Track Products</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Add Steps</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">Support</h5>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-white font-semibold mb-3">Connect</h5>
                  <div className="flex space-x-3">
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm">
                  © 2025 BlockTrace. All rights reserved.
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white text-sm transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white text-sm transition-colors">Cookie Policy</a>
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
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;