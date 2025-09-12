'use client';
import React, { useEffect, useState } from 'react';
import { loginWithInternetIdentity, loginWithPlugWallet, checkAuthStatus } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        router.push('/home');
      }
    };
    checkAuth();
  }, [router]);

  const handleInternetIdentityLogin = async () => {
    await loginWithInternetIdentity();
  };

  const handlePlugWalletLogin = async () => {
    await loginWithPlugWallet();
  };

  const steps = [
    {
      number: 1,
      title: "Connect Wallet",
      description: "Choose your preferred authentication method",
      icon: "💳",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 2,
      title: "Track Products",
      description: "Monitor your supply chain in real-time",
      icon: "📦",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: 3,
      title: "Ensure Transparency",
      description: "Verify authenticity and origin",
      icon: "🔍",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/20 to-blue-900/40"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold text-white">
            BLOCKTRACE
          </div>
          <div className="hidden md:flex space-x-8 text-gray-300">
            <button onClick={() => router.push('/about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => router.push('/features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => router.push('/pricing')} className="hover:text-white transition-colors font-semibold">Pricing</button>
            <button onClick={() => router.push('/demo')} className="hover:text-white transition-colors">Demo</button>
            <button onClick={() => router.push('/roadmap')} className="hover:text-white transition-colors">Roadmap</button>
            <button onClick={() => router.push('/contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>
        <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
          Documentation
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto">
          {/* Animated 3D-like IP text */}
          <div className="relative mb-8">
            <div className="text-[12rem] lg:text-[20rem] font-bold text-transparent bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 bg-clip-text opacity-80 leading-none">
              BT
            </div>
            <div className="absolute inset-0 text-[12rem] lg:text-[20rem] font-bold text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text opacity-60 leading-none transform translate-x-2 translate-y-2">
              BT
            </div>
          </div>

          <h1 className="text-4xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            SUPPLY CHAIN RUNS ON TRUST.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              BLOCKTRACE MAKES TRUST<br />
              PROGRAMMABLE.
            </span>
          </h1>

          <div className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            <p className="mb-4">
              Blockchain is the world's largest transparency infrastructure and
              one that supply chains can't exist without.
            </p>
            <p>
              BlockTrace lets you take control over your supply chain
              and verify authenticity wherever it's used.
            </p>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="relative z-10 py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-12 text-center">
            Get Started On BlockTrace
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.color} opacity-90 hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                onMouseEnter={() => setCurrentStep(index)}
              >
                <div className="absolute top-6 left-6">
                  <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                
                <div className="text-center pt-8">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-white/90">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Authentication Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={handleInternetIdentityLogin}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold text-lg text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              🔐 Login with Internet Identity
            </button>

            <button
              onClick={handlePlugWalletLogin}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-lg text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              🔌 Login with Plug Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Tokenize Intelligence Section */}
      <div className="relative z-10 py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-12">
            Tokenize Intelligence
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">
                BlockTrace is the World's Supply Chain Blockchain
                that transforms products into
                Programmable Transparency assets.
              </h3>
              
              <div className="space-y-4 text-lg text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Trade transparency in a global market for supply chain verification and tracking</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Enable real-time product authentication and origin verification</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Build trust through immutable blockchain records</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl flex items-center justify-center">
                <div className="text-8xl opacity-50">🔗</div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-60 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 BlockTrace. Built with ❤️ on the Internet Computer Protocol.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;