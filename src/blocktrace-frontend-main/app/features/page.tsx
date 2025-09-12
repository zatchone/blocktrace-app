'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Globe, Shield, Clock, BarChart3, Smartphone } from 'lucide-react';

const FeaturesPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "HTTP Outcalls",
      subtitle: "Real-time API Integration",
      description: "Connect with external supplier verification APIs, carbon footprint calculators, and logistics providers in real-time.",
      benefits: ["Live supplier verification", "Real-time carbon data", "5-minute response caching", "Fallback mechanisms"],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Advanced Timers",
      subtitle: "Automated ESG Monitoring",
      description: "Intelligent timer system that automatically recalculates ESG scores and monitors supply chain changes.",
      benefits: ["Interval-based monitoring", "Change detection alerts", "Performance tracking", "Global monitoring"],
      gradient: "from-emerald-500 to-green-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "t-ECDSA Integration",
      subtitle: "Cross-chain Verification",
      description: "Native cryptographic signatures for Bitcoin and Ethereum without complex bridge solutions.",
      benefits: ["Multi-chain proofs", "Cryptographic security", "Native interoperability", "Signature verification"],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time ESG Scoring",
      subtitle: "Live Sustainability Metrics",
      description: "Dynamic ESG calculations with carbon footprint tracking and sustainability scoring.",
      benefits: ["Live calculations", "Carbon tracking", "Sustainability scores", "Impact visualization"],
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Digital Passports",
      subtitle: "NFT-based Certificates",
      description: "Blockchain-based product certificates with QR codes and professional PDF exports.",
      benefits: ["NFT certificates", "QR code access", "PDF exports", "Blockchain verification"],
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Zero Gas Fees",
      subtitle: "ICP Reverse Gas Model",
      description: "Cost-effective transactions enabling micro-payments for every supply chain step.",
      benefits: ["No transaction fees", "Micro-transactions", "Scalable operations", "Cost efficiency"],
      gradient: "from-yellow-500 to-orange-500"
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
          className="w-full h-full object-cover opacity-20"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/30 to-blue-900/50"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-2xl font-bold">BLOCKTRACE</span>
          </button>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all"
        >
          Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Advanced Features
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Powered by ICP's cutting-edge capabilities, BlockTrace delivers features impossible on traditional blockchains
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-emerald-400 text-sm font-semibold mb-4">{feature.subtitle}</p>
                <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Advantages */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Why ICP Makes the Difference</h2>
            <p className="text-xl text-gray-400">
              Technical advantages that set BlockTrace apart from traditional blockchain solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Traditional Blockchain Limitations</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-red-400 font-semibold">High Gas Fees:</span>
                    <span className="text-gray-300"> $2-15 per transaction makes micro-transactions impossible</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-red-400 font-semibold">No External APIs:</span>
                    <span className="text-gray-300"> Cannot connect to real-world data sources</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-red-400 font-semibold">Complex Bridges:</span>
                    <span className="text-gray-300"> Cross-chain operations require risky bridge solutions</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-red-400 font-semibold">Slow Performance:</span>
                    <span className="text-gray-300"> 3-10 second response times for API calls</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">BlockTrace on ICP Advantages</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-emerald-400 font-semibold">Zero Gas Fees:</span>
                    <span className="text-gray-300"> Reverse gas model enables unlimited micro-transactions</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-emerald-400 font-semibold">HTTP Outcalls:</span>
                    <span className="text-gray-300"> Native integration with external APIs and data sources</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-emerald-400 font-semibold">Native t-ECDSA:</span>
                    <span className="text-gray-300"> Direct Bitcoin/Ethereum integration without bridges</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <span className="text-emerald-400 font-semibold">Web Speed:</span>
                    <span className="text-gray-300"> Sub-second response times for real-time operations</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 BlockTrace. Built with ❤️ on the Internet Computer Protocol.</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;