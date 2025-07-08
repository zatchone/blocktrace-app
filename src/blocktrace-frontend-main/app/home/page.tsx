'use client';

import React, { useEffect, useState } from 'react';
import Footer from '@/components/footer';
import Hero from '@/components/Hero';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { EvervaultCard } from '@/components/ui/evervault-card';
import { useRouter } from 'next/navigation';
import { getUserProfile, logout, UserProfile } from '@/lib/auth';

const Home = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    await logout();
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.substring(0, 6)}...${principal.substring(principal.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background Beams Layer */}
      <div className="fixed top-0 left-0 w-full h-screen z-5 pointer-events-none">
        <BackgroundBeamsWithCollision className="h-screen w-full bg-transparent">
          <div className="w-full h-full" />
        </BackgroundBeamsWithCollision>
      </div>

      {/* Main Content */}
      <div 
        className="min-h-screen flex flex-col text-white relative z-0 bg-cover bg-center bg-no-repeat"
      
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

        {/* Header with User Profile */}
        <header className="flex flex-col items-center py-6 relative z-10">
          <div className="bg-black bg-opacity-70 px-8 py-4 rounded-lg mb-4">
            <Hero />
            <p className="text-lg text-center mb-4">
              Track your product from origin to consumer transparently
            </p>
            
            {/* User Profile Section */}
            {userProfile && (
              <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4 mt-4 border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-emerald-400">Welcome Back!</h3>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Principal ID:</span>
                    <span className="font-mono text-emerald-300">
                      {formatPrincipal(userProfile.principal)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Auth Method:</span>
                    <span className="capitalize text-blue-300">
                      {userProfile.authMethod === 'internet-identity' ? 'Internet Identity' : 'Plug Wallet'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Login Time:</span>
                    <span className="text-gray-300">
                      {userProfile.loginTime ? userProfile.loginTime.toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Action Buttons */}
        <main className="flex flex-col items-center my-16 flex-grow relative z-10">
          <div className="flex space-x-8 bg-black bg-opacity-70 px-8 py-4 rounded-lg relative z-10">
            {/* Track a Product */}
            <div
              onClick={() => router.push('/track')}
              className="w-64 h-20 cursor-pointer transition-transform hover:scale-105"
            >
              <EvervaultCard text="Track a Product" className="" />
            </div>

            {/* Add a Step */}
            <div
              onClick={() => router.push('/add-step')}
              className="w-64 h-20 cursor-pointer transition-transform hover:scale-105"
            >
              <EvervaultCard text="Add a Step" />
            </div>
          </div>
          
          {/* Additional User Stats */}
          <div className="mt-8 bg-black bg-opacity-70 px-8 py-4 rounded-lg">
            <div className="flex space-x-8 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-400">0</span>
                <span className="text-sm text-gray-400">Products Tracked</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-400">0</span>
                <span className="text-sm text-gray-400">Steps Added</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-purple-400">0</span>
                <span className="text-sm text-gray-400">Verifications</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="relative z-10 bg-gray-900 bg-opacity-90">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;