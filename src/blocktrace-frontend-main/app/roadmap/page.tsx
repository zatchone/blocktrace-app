'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Zap, Globe, Shield, Smartphone, BarChart3, Users, Rocket } from 'lucide-react';

const RoadmapPage = () => {
  const router = useRouter();

  const roadmapItems = [
    {
      phase: "Q1 2025",
      title: "Foundation & Launch",
      status: "completed",
      items: [
        { text: "Core supply chain tracking platform", completed: true },
        { text: "HTTP Outcalls integration", completed: true },
        { text: "Advanced Timers implementation", completed: true },
        { text: "t-ECDSA cross-chain verification", completed: true },
        { text: "Digital NFT passports", completed: true },
        { text: "Real-time ESG scoring", completed: true }
      ],
      icon: <CheckCircle className="w-8 h-8" />,
      gradient: "from-emerald-500 to-green-500"
    },
    {
      phase: "Q2 2025",
      title: "Enterprise Features",
      status: "in-progress",
      items: [
        { text: "Multi-signature enterprise workflows", completed: false },
        { text: "Advanced analytics dashboard", completed: false },
        { text: "Custom branding & white-label solutions", completed: false },
        { text: "API rate limiting & enterprise SLAs", completed: false },
        { text: "Bulk import/export capabilities", completed: false },
        { text: "Role-based access control", completed: false }
      ],
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      phase: "Q3 2025",
      title: "IoT & Real-World Integration",
      status: "planned",
      items: [
        { text: "IoT sensor integration via HTTP outcalls", completed: false },
        { text: "GPS tracking & geolocation services", completed: false },
        { text: "Temperature & humidity monitoring", completed: false },
        { text: "RFID & barcode scanning support", completed: false },
        { text: "Mobile app for field workers", completed: false },
        { text: "Offline-first data synchronization", completed: false }
      ],
      icon: <Smartphone className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      phase: "Q4 2025",
      title: "AI & Machine Learning",
      status: "planned",
      items: [
        { text: "AI-powered fraud detection", completed: false },
        { text: "Predictive supply chain analytics", completed: false },
        { text: "Automated compliance monitoring", completed: false },
        { text: "Smart contract automation", completed: false },
        { text: "Natural language processing for reports", completed: false },
        { text: "Anomaly detection algorithms", completed: false }
      ],
      icon: <BarChart3 className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500"
    },
    {
      phase: "Q1 2026",
      title: "Global Expansion",
      status: "planned",
      items: [
        { text: "Multi-language support (10+ languages)", completed: false },
        { text: "Regional compliance modules (EU, APAC, Americas)", completed: false },
        { text: "Local currency support", completed: false },
        { text: "Regional data centers", completed: false },
        { text: "Partnership integrations (SAP, Oracle)", completed: false },
        { text: "Government & regulatory body integrations", completed: false }
      ],
      icon: <Globe className="w-8 h-8" />,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      phase: "Q2 2026",
      title: "Carbon Credit Marketplace",
      status: "planned",
      items: [
        { text: "Tokenized carbon credits trading", completed: false },
        { text: "Verified carbon offset marketplace", completed: false },
        { text: "Automated ESG reporting for investors", completed: false },
        { text: "Sustainability scoring algorithms", completed: false },
        { text: "Carbon footprint optimization AI", completed: false },
        { text: "Green supply chain incentives", completed: false }
      ],
      icon: <Rocket className="w-8 h-8" />,
      gradient: "from-teal-500 to-emerald-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'in-progress': return 'text-blue-400';
      case 'planned': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

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
              Product Roadmap
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Our journey to revolutionize global supply chain transparency with cutting-edge blockchain technology
          </p>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline Line */}
                {index < roadmapItems.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-32 bg-gradient-to-b from-white/20 to-transparent"></div>
                )}
                
                <div className="flex items-start space-x-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                          <p className={`text-lg font-semibold ${getStatusColor(item.status)}`}>{item.phase}</p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {item.items.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            {feature.completed ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${feature.completed ? 'text-white' : 'text-gray-400'}`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our 2026 Vision</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              By 2026, BlockTrace will be the global standard for supply chain transparency, 
              processing millions of products daily across 50+ countries, with AI-powered 
              insights and a thriving carbon credit marketplace that incentivizes sustainable practices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">1M+</div>
                <div className="text-sm text-gray-400">Products tracked daily</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
                <div className="text-sm text-gray-400">Countries supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">$100M+</div>
                <div className="text-sm text-gray-400">Carbon credits traded</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Journey</h2>
            <p className="text-xl text-gray-300 mb-8">
              Be part of the supply chain transparency revolution. Early adopters get exclusive access 
              to new features and preferential pricing as we scale globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                Partner With Us
              </button>
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

export default RoadmapPage;